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
    messages: []
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
    '      <div class="sfc-subtitle">Press T to chat</div>',
    '    </div>',
    '    <button class="sfc-name" type="button"></button>',
    '  </div>',
    '  <div class="sfc-status">Connecting...</div>',
    '  <div class="sfc-messages"></div>',
    '  <form class="sfc-composer" autocomplete="off">',
    '    <input class="sfc-input" maxlength="160" placeholder="Type a message and press Enter" />',
    '  </form>',
    '  <div class="sfc-footer">Press T to open chat. Press Esc to close.</div>',
    '</div>'
  ].join("");
  document.body.appendChild(root);

  const nameButton = root.querySelector(".sfc-name");
  const statusEl = root.querySelector(".sfc-status");
  const messagesEl = root.querySelector(".sfc-messages");
  const composer = root.querySelector(".sfc-composer");
  const input = root.querySelector(".sfc-input");

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

  const openComposer = () => {
    root.classList.add("is-open");
    input.focus();
    input.select();
  };

  const closeComposer = (clearValue) => {
    if (clearValue) {
      input.value = "";
    }
    root.classList.remove("is-open");
    input.blur();
  };

  nameButton.addEventListener("click", () => {
    const nextName = window.prompt("Chat name", state.userName || "Guest") || "";
    const cleanedName = sanitizeName(nextName) || state.userName;
    state.userName = cleanedName;
    localStorage.setItem(NAME_KEY, cleanedName);
    nameButton.textContent = cleanedName;
  });

  state.keyHandler = (event) => {
    const active = document.activeElement;
    const typing = active && (
      active.tagName === "INPUT" ||
      active.tagName === "TEXTAREA" ||
      active.isContentEditable
    );

    if ((event.key === "t" || event.key === "T") && !typing) {
      event.preventDefault();
      openComposer();
      return;
    }

    if (event.key === "Escape" && root.classList.contains("is-open")) {
      event.preventDefault();
      closeComposer(true);
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
      closeComposer(true);
      return;
    }

    input.disabled = true;
    try {
      await publishMessage({
        user: state.userName,
        text: text.slice(0, MAX_MESSAGE_LENGTH),
        createdAtMs: Date.now()
      });
      input.value = "";
      closeComposer(false);
    } catch (error) {
      setStatus(`Send failed: ${error.message}`, true);
    } finally {
      input.disabled = false;
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
    ingestMessages(payload.messages);
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
      ingestMessages([result.message]);
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
      ingestMessages(payload.messages);
      setStatus(`Connected to room: ${ROOM_ID}`);
    } catch (error) {
      setStatus(`Polling failed: ${error.message}`, true);
    } finally {
      state.pollInFlight = false;
    }
  }

  function ingestMessages(messages) {
    let changed = false;

    for (const rawMessage of Array.isArray(messages) ? messages : []) {
      const message = normalizeIncomingMessage(rawMessage);
      if (!message || state.seenIds.has(message.id)) {
        continue;
      }

      state.seenIds.add(message.id);
      state.latestCreatedAtMs = Math.max(state.latestCreatedAtMs, message.createdAtMs || 0);
      state.messages.push(message);
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

    return {
      id: String(rawMessage.id),
      user: sanitizeName(rawMessage.user) || "Guest",
      text,
      createdAtMs: Number(rawMessage.createdAtMs) || Date.now()
    };
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

      #${UI_ID} .sfc-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 12px 8px;
        background: rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      #${UI_ID} .sfc-title {
        font-size: 14px;
        font-weight: 700;
      }

      #${UI_ID} .sfc-subtitle,
      #${UI_ID} .sfc-footer,
      #${UI_ID} .sfc-status,
      #${UI_ID} .sfc-meta,
      #${UI_ID} .sfc-empty {
        color: rgba(245, 241, 212, 0.7);
      }

      #${UI_ID} .sfc-name {
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.08);
        color: #f5f1d4;
        border-radius: 999px;
        padding: 6px 10px;
        cursor: pointer;
      }

      #${UI_ID} .sfc-status {
        padding: 8px 12px 0;
        min-height: 24px;
      }

      #${UI_ID} .sfc-status.is-error {
        color: #ff9c9c;
      }

      #${UI_ID} .sfc-messages {
        height: 188px;
        overflow-y: auto;
        padding: 10px 12px;
      }

      #${UI_ID} .sfc-message + .sfc-message {
        margin-top: 10px;
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
        display: none;
        padding: 0 12px 10px;
      }

      #${UI_ID}.is-open .sfc-composer {
        display: block;
      }

      #${UI_ID} .sfc-input {
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

      #${UI_ID} .sfc-footer {
        padding: 0 12px 10px;
      }
    `;
    document.head.appendChild(style);
  }
})();