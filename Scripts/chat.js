(async function sharedChatBootstrap() {
  const INSTANCE_KEY = "__sharedCloudRunChat";
  const UI_ID = "shared-cloudrun-chat";
  const STYLE_ID = "shared-cloudrun-chat-style";
  const NAME_KEY = "shared-cloudrun-chat-name";
  const MAX_MESSAGES = 60;
  const MAX_MESSAGE_LENGTH = 160;
  const POLL_INTERVAL_MS = 2000;
  const BACKEND_URL = normalizeBaseUrl(window.__CHAT_BACKEND_URL || "https://browser-chat-backend-800720615592.us-central1.run.app");
  const ROOM_ID = window.__CHAT_ROOM_ID || "global-world-chat";

  if (window[INSTANCE_KEY] && typeof window[INSTANCE_KEY].cleanup === "function") {
    window[INSTANCE_KEY].cleanup();
  }

  const state = {
    cleanup: () => {},
    pollTimer: null,
    pollInFlight: false,
    keyHandler: null,
    userName: getSavedName(),
    seenIds: new Set(),
    latestCreatedAtMs: 0,
    messages: [],
    unreadCount: 0,
    lastPreview: "Press T to open"
  };
  window[INSTANCE_KEY] = state;

  removeExistingUi();
  injectStyles();

  const root = document.createElement("div");
  root.id = UI_ID;
  root.innerHTML = [
    '<div class="sfc-panel">',
    '  <div class="sfc-header">',
    '    <div>',
    '      <div class="sfc-title">World Chat</div>',
    '      <div class="sfc-subtitle">Press T to toggle chat</div>',
    '    </div>',
    '    <div class="sfc-actions">',
    '      <button class="sfc-name" type="button"></button>',
    '      <button class="sfc-hide" type="button" aria-label="Hide chat">Hide</button>',
    '    </div>',
    '  </div>',
    '  <div class="sfc-status">Connecting...</div>',
    '  <div class="sfc-messages"></div>',
    '  <form class="sfc-composer" autocomplete="off">',
    '    <div class="sfc-compose-row">',
    '      <input class="sfc-input" maxlength="160" placeholder="Type a message" />',
    '      <button class="sfc-send" type="submit">Send</button>',
    '    </div>',
    '    <div class="sfc-compose-meta">',
    '      <span class="sfc-helper">Enter sends. Esc hides.</span>',
    '      <span class="sfc-counter">0/160</span>',
    '    </div>',
    '  </form>',
    '</div>',
    '<button class="sfc-dock" type="button">',
    '  <span class="sfc-dock-label">World Chat</span>',
    '  <span class="sfc-dock-preview">Press T to open</span>',
    '  <span class="sfc-dock-badge" hidden></span>',
    '</button>'
  ].join("");
  document.body.appendChild(root);

  const nameButton = root.querySelector(".sfc-name");
  const hideButton = root.querySelector(".sfc-hide");
  const statusEl = root.querySelector(".sfc-status");
  const messagesEl = root.querySelector(".sfc-messages");
  const composer = root.querySelector(".sfc-composer");
  const input = root.querySelector(".sfc-input");
  const sendButton = root.querySelector(".sfc-send");
  const counterEl = root.querySelector(".sfc-counter");
  const dockButton = root.querySelector(".sfc-dock");
  const dockPreviewEl = root.querySelector(".sfc-dock-preview");
  const dockBadgeEl = root.querySelector(".sfc-dock-badge");

  nameButton.textContent = state.userName;

  const setStatus = (text, isError) => {
    statusEl.textContent = text;
    statusEl.classList.toggle("is-error", Boolean(isError));
  };

  const renderMessages = () => {
    messagesEl.textContent = "";

    if (!state.messages.length) {
      const empty = document.createElement("div");
      empty.className = "sfc-empty";
      empty.textContent = "No messages yet.";
      messagesEl.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const message of state.messages) {
      const row = document.createElement("div");
      row.className = "sfc-message";
      row.classList.toggle("is-self", Boolean(message.isSelf));

      const meta = document.createElement("div");
      meta.className = "sfc-meta";
      meta.textContent = `${message.user || "Guest"}  ${formatTime(message.createdAtMs)}`;

      const body = document.createElement("div");
      body.className = "sfc-body";
      body.textContent = message.text || "";

      row.append(meta, body);
      fragment.appendChild(row);
    }

    messagesEl.appendChild(fragment);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  const updateCounter = () => {
    counterEl.textContent = `${input.value.length}/${MAX_MESSAGE_LENGTH}`;
  };

  const updateDock = () => {
    dockPreviewEl.textContent = state.lastPreview || "Press T to open";
    dockBadgeEl.hidden = state.unreadCount < 1;
    dockBadgeEl.textContent = state.unreadCount > 99 ? "99+" : String(state.unreadCount || "");
  };

  const showPanel = (focusInput) => {
    root.classList.remove("is-hidden");
    state.unreadCount = 0;
    updateDock();

    if (focusInput) {
      window.requestAnimationFrame(() => {
        input.focus();
        input.select();
      });
    }
  };

  const hidePanel = (clearValue) => {
    if (clearValue) {
      input.value = "";
      updateCounter();
    }

    root.classList.add("is-hidden");
    input.blur();
    updateDock();
  };

  nameButton.addEventListener("click", () => {
    const nextName = window.prompt("Chat name", state.userName || "Guest") || "";
    const cleanedName = sanitizeName(nextName) || state.userName;
    state.userName = cleanedName;
    localStorage.setItem(NAME_KEY, cleanedName);
    nameButton.textContent = cleanedName;
    renderMessages();
  });

  hideButton.addEventListener("click", () => {
    hidePanel(true);
  });

  dockButton.addEventListener("click", () => {
    showPanel(true);
  });

  input.addEventListener("input", updateCounter);

  state.keyHandler = (event) => {
    const active = document.activeElement;
    const typing = active && (
      active.tagName === "INPUT" ||
      active.tagName === "TEXTAREA" ||
      active.isContentEditable
    );

    if ((event.key === "t" || event.key === "T") && !typing) {
      event.preventDefault();
      if (root.classList.contains("is-hidden")) {
        showPanel(true);
      } else {
        hidePanel(true);
      }
      return;
    }

    if (event.key === "Escape" && !root.classList.contains("is-hidden")) {
      event.preventDefault();
      hidePanel(true);
    }
  };
  window.addEventListener("keydown", state.keyHandler, true);

  composer.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!hasUsableBackendUrl(BACKEND_URL)) {
      setStatus("Set window.__CHAT_BACKEND_URL to your Cloud Run URL, then rerun chat.js.", true);
      return;
    }

    const text = input.value.trim();
    if (!text) {
      hidePanel(true);
      return;
    }

    input.disabled = true;
    sendButton.disabled = true;
    try {
      await publishMessage({
        user: state.userName,
        text: text.slice(0, MAX_MESSAGE_LENGTH),
        createdAtMs: Date.now()
      });
      input.value = "";
      updateCounter();
      hidePanel(false);
    } catch (error) {
      setStatus(`Send failed: ${error.message}`, true);
    } finally {
      input.disabled = false;
      sendButton.disabled = false;
    }
  });

  state.cleanup = () => {
    if (state.pollTimer) {
      window.clearTimeout(state.pollTimer);
      state.pollTimer = null;
    }
    if (state.keyHandler) {
      window.removeEventListener("keydown", state.keyHandler, true);
      state.keyHandler = null;
    }
    removeExistingUi();
    delete window[INSTANCE_KEY];
  };

  renderMessages();
  updateCounter();
  updateDock();
  hidePanel(false);

  if (!hasUsableBackendUrl(BACKEND_URL)) {
    setStatus("Set window.__CHAT_BACKEND_URL to your Cloud Run URL, then rerun chat.js.", true);
    return;
  }

  try {
    setStatus(`Connecting to room: ${ROOM_ID}`);
    await loadRecentMessages();
    schedulePoll();
  } catch (error) {
    setStatus(`Startup failed: ${error.message}`, true);
  }

  function getSavedName() {
    const existing = localStorage.getItem(NAME_KEY);
    if (existing) {
      return sanitizeName(existing) || randomGuestName();
    }

    const generated = randomGuestName();
    localStorage.setItem(NAME_KEY, generated);
    return generated;
  }

  function sanitizeName(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 20);
  }

  function randomGuestName() {
    return `Guest${Math.floor(1000 + Math.random() * 9000)}`;
  }

  function formatTime(timestamp) {
    if (!timestamp) {
      return "";
    }

    return new Date(timestamp).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  async function loadRecentMessages() {
    const payload = await requestJson(apiUrl(`?limit=${MAX_MESSAGES}`), {
      method: "GET",
      cache: "no-store"
    });
    ingestMessages(payload.messages, { trackUnread: false });
    setStatus(`Connected to room: ${ROOM_ID}`);
  }

  function schedulePoll() {
    if (state.pollTimer) {
      window.clearTimeout(state.pollTimer);
    }

    state.pollTimer = window.setTimeout(async () => {
      await pollForMessages();
      schedulePoll();
    }, POLL_INTERVAL_MS);
  }

  async function publishMessage(payload) {
    const response = await fetch(apiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user: payload.user,
        text: payload.text,
        clientCreatedAtMs: payload.createdAtMs,
        site: window.location.hostname || ""
      })
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(detail || `Publish failed (${response.status})`);
    }

    const result = await response.json().catch(() => null);
    if (result && result.message) {
      ingestMessages([result.message], { trackUnread: false });
    }
  }

  async function pollForMessages() {
    if (state.pollInFlight) {
      return;
    }

    state.pollInFlight = true;
    try {
      const query = `?after=${encodeURIComponent(state.latestCreatedAtMs || 0)}&limit=${MAX_MESSAGES}`;
      const payload = await requestJson(apiUrl(query), {
        method: "GET",
        cache: "no-store"
      });
      ingestMessages(payload.messages, { trackUnread: true });
      setStatus(`Connected to room: ${ROOM_ID}`);
    } catch (error) {
      setStatus(`Polling failed: ${error.message}`, true);
    } finally {
      state.pollInFlight = false;
    }
  }

  function ingestMessages(messages, options) {
    const trackUnread = Boolean(options && options.trackUnread);
    let changed = false;
    let newRemoteCount = 0;

    for (const rawMessage of Array.isArray(messages) ? messages : []) {
      const message = normalizeIncomingMessage(rawMessage);
      if (!message || state.seenIds.has(message.id)) {
        continue;
      }

      state.seenIds.add(message.id);
      state.latestCreatedAtMs = Math.max(state.latestCreatedAtMs, message.createdAtMs || 0);
      state.messages.push(message);
      if (trackUnread && !message.isSelf) {
        newRemoteCount += 1;
      }
      changed = true;
    }

    if (!changed) {
      return;
    }

    state.messages.sort((left, right) => {
      if (left.createdAtMs !== right.createdAtMs) {
        return left.createdAtMs - right.createdAtMs;
      }
      return String(left.id).localeCompare(String(right.id));
    });

    if (state.messages.length > MAX_MESSAGES) {
      state.messages = state.messages.slice(-MAX_MESSAGES);
    }

    const latestMessage = state.messages[state.messages.length - 1];
    if (latestMessage) {
      state.lastPreview = buildPreview(latestMessage);
    }

    if (root.classList.contains("is-hidden") && trackUnread && newRemoteCount > 0) {
      state.unreadCount += newRemoteCount;
    } else if (!root.classList.contains("is-hidden")) {
      state.unreadCount = 0;
    }

    updateDock();
    renderMessages();
  }

  function normalizeIncomingMessage(rawMessage) {
    if (!rawMessage || !rawMessage.id) {
      return null;
    }

    const text = String(rawMessage.text || "").trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!text) {
      return null;
    }

    const user = sanitizeName(rawMessage.user) || "Guest";

    return {
      id: String(rawMessage.id),
      user,
      text,
      createdAtMs: Number(rawMessage.createdAtMs) || Date.now(),
      isSelf: user === state.userName
    };
  }

  function buildPreview(message) {
    if (!message) {
      return "Press T to open";
    }

    const preview = `${message.user}: ${message.text}`;
    return preview.length > 42 ? `${preview.slice(0, 39)}...` : preview;
  }

  async function requestJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(detail || `Request failed (${response.status})`);
    }

    return response.json();
  }

  function apiUrl(queryString) {
    return `${BACKEND_URL}/rooms/${encodeURIComponent(ROOM_ID)}/messages${queryString || ""}`;
  }

  function normalizeBaseUrl(value) {
    return String(value || "").trim().replace(/\/+$/, "");
  }

  function hasUsableBackendUrl(value) {
    return Boolean(value) && !/REPLACE_WITH_CLOUD_RUN_URL/i.test(value);
  }

  function removeExistingUi() {
    const existingUi = document.getElementById(UI_ID);
    if (existingUi) {
      existingUi.remove();
    }
    const existingStyle = document.getElementById(STYLE_ID);
    if (existingStyle) {
      existingStyle.remove();
    }
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${UI_ID} {
        position: fixed;
        left: 16px;
        bottom: 16px;
        z-index: 2147483647;
        font: 12px/1.4 Verdana, sans-serif;
        color: #f5f1d4;
      }

      #${UI_ID},
      #${UI_ID} * {
        box-sizing: border-box;
      }

      #${UI_ID} .sfc-panel {
        width: 320px;
        background: rgba(16, 18, 22, 0.92);
        border: 2px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(8px);
      }

      #${UI_ID}.is-hidden .sfc-panel {
        display: none;
      }

      #${UI_ID} .sfc-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 12px 8px;
        background: rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      #${UI_ID} .sfc-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      #${UI_ID} .sfc-title {
        font-size: 14px;
        font-weight: 700;
      }

      #${UI_ID} .sfc-subtitle,
      #${UI_ID} .sfc-status,
      #${UI_ID} .sfc-meta,
      #${UI_ID} .sfc-empty,
      #${UI_ID} .sfc-helper,
      #${UI_ID} .sfc-counter,
      #${UI_ID} .sfc-dock-preview {
        color: rgba(245, 241, 212, 0.7);
      }

      #${UI_ID} .sfc-name,
      #${UI_ID} .sfc-hide,
      #${UI_ID} .sfc-send {
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.08);
        color: #f5f1d4;
        border-radius: 999px;
        padding: 6px 10px;
        cursor: pointer;
      }

      #${UI_ID} .sfc-hide,
      #${UI_ID} .sfc-send {
        padding-inline: 12px;
      }

      #${UI_ID} .sfc-hide:hover,
      #${UI_ID} .sfc-name:hover,
      #${UI_ID} .sfc-send:hover,
      #${UI_ID} .sfc-dock:hover {
        background: rgba(255, 255, 255, 0.14);
      }

      #${UI_ID} .sfc-send:disabled {
        opacity: 0.6;
        cursor: wait;
      }

      #${UI_ID} .sfc-status {
        padding: 8px 12px 0;
        min-height: 24px;
      }

      #${UI_ID} .sfc-status.is-error {
        color: #ff9c9c;
      }

      #${UI_ID} .sfc-messages {
        height: 180px;
        overflow-y: auto;
        padding: 10px 12px;
      }

      #${UI_ID} .sfc-message {
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.04);
      }

      #${UI_ID} .sfc-message + .sfc-message {
        margin-top: 8px;
      }

      #${UI_ID} .sfc-message.is-self {
        background: rgba(126, 218, 141, 0.14);
        border: 1px solid rgba(126, 218, 141, 0.22);
      }

      #${UI_ID} .sfc-meta {
        font-size: 11px;
        margin-bottom: 2px;
      }

      #${UI_ID} .sfc-body {
        font-size: 13px;
        color: #ffffff;
        word-break: break-word;
      }

      #${UI_ID} .sfc-composer {
        padding: 0 12px 10px;
      }

      #${UI_ID} .sfc-compose-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      #${UI_ID} .sfc-input {
        flex: 1 1 auto;
        width: 100%;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(0, 0, 0, 0.24);
        color: #ffffff;
        border-radius: 8px;
        padding: 10px 12px;
        outline: none;
      }

      #${UI_ID} .sfc-input:focus {
        border-color: rgba(126, 218, 141, 0.9);
      }

      #${UI_ID} .sfc-compose-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding-top: 6px;
        font-size: 11px;
      }

      #${UI_ID} .sfc-dock {
        display: none;
        align-items: center;
        gap: 10px;
        width: 320px;
        padding: 9px 12px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 999px;
        background: rgba(16, 18, 22, 0.94);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
        color: #f5f1d4;
        cursor: pointer;
      }

      #${UI_ID}.is-hidden .sfc-dock {
        display: flex;
      }

      #${UI_ID} .sfc-dock-label {
        font-weight: 700;
        white-space: nowrap;
      }

      #${UI_ID} .sfc-dock-preview {
        min-width: 0;
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: left;
      }

      #${UI_ID} .sfc-dock-badge {
        min-width: 22px;
        height: 22px;
        padding: 0 6px;
        border-radius: 999px;
        background: #7eda8d;
        color: #162016;
        font-size: 11px;
        font-weight: 700;
        line-height: 22px;
      }
    `;
    document.head.appendChild(style);
  }
})();