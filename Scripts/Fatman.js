(() => {
  const instanceKey = "__pageEaterOverlay";
  if (window[instanceKey]?.cleanup) {
    window[instanceKey].cleanup();
  }

  const root = document.createElement("div");
  const style = document.createElement("style");
  const character = document.createElement("div");
  const shadow = document.createElement("div");
  const rumble = document.createElement("div");
  const label = document.createElement("div");
  const uid = Math.random().toString(36).slice(2);
  const classPrefix = `page-eater-${uid}`;

  style.textContent = `
    .${classPrefix}-root {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      pointer-events: none;
      overflow: hidden;
    }

    .${classPrefix}-rumble {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 22% 78%, rgba(255, 185, 109, 0.16), transparent 28%),
        radial-gradient(circle at 78% 20%, rgba(255, 118, 43, 0.12), transparent 24%),
        linear-gradient(180deg, rgba(54, 24, 8, 0) 0%, rgba(54, 24, 8, 0.18) 100%);
      opacity: 0;
      transition: opacity 260ms ease;
    }

    .${classPrefix}-label {
      position: absolute;
      left: 24px;
      top: 24px;
      padding: 10px 16px;
      border-radius: 999px;
      font: 900 18px/1.1 Impact, Haettenschweiler, "Arial Black", sans-serif;
      letter-spacing: 0.08em;
      color: rgba(255, 244, 232, 0.95);
      background: rgba(75, 29, 6, 0.78);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.24);
      opacity: 0;
      transform: translateY(-16px);
      transition: opacity 320ms ease, transform 320ms ease;
    }

    .${classPrefix}-shadow {
      position: absolute;
      left: 50%;
      bottom: 24px;
      width: min(52vw, 540px);
      height: 48px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(32, 9, 1, 0.35), rgba(32, 9, 1, 0));
      transform: translateX(-50%) scale(0.4);
      opacity: 0;
      transition: transform 420ms ease, opacity 420ms ease;
      filter: blur(8px);
    }

    .${classPrefix}-character {
      position: absolute;
      left: 50%;
      bottom: -12px;
      width: min(58vw, 620px);
      aspect-ratio: 1 / 1;
      transform: translate(-50%, 120%) rotate(-2deg);
      transform-origin: 50% 100%;
      transition: transform 650ms cubic-bezier(0.2, 0.85, 0.18, 1);
      filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.28));
    }

    .${classPrefix}-character svg {
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
    }

    .${classPrefix}-root.${classPrefix}-active .${classPrefix}-character {
      transform: translate(-50%, 0) rotate(0deg);
    }

    .${classPrefix}-root.${classPrefix}-active .${classPrefix}-shadow {
      transform: translateX(-50%) scale(1);
      opacity: 1;
    }

    .${classPrefix}-root.${classPrefix}-active .${classPrefix}-label,
    .${classPrefix}-root.${classPrefix}-active .${classPrefix}-rumble {
      opacity: 1;
      transform: translateY(0);
    }
  `;

  root.className = `${classPrefix}-root`;
  shadow.className = `${classPrefix}-shadow`;
  rumble.className = `${classPrefix}-rumble`;
  label.className = `${classPrefix}-label`;
  label.textContent = "PAGE EATER";
  character.className = `${classPrefix}-character`;
  character.innerHTML = `
    <svg viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="${classPrefix}-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffcb8d"/>
          <stop offset="100%" stop-color="#df8149"/>
        </linearGradient>
        <linearGradient id="${classPrefix}-shirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ff6b38"/>
          <stop offset="100%" stop-color="#d9431e"/>
        </linearGradient>
      </defs>
      <ellipse cx="260" cy="465" rx="142" ry="28" fill="rgba(84, 29, 8, 0.18)"/>
      <g>
        <ellipse cx="260" cy="240" rx="132" ry="118" fill="url(#${classPrefix}-body)"/>
        <path d="M136 238 C148 168 196 132 260 132 C324 132 372 170 384 238 L380 330 C376 386 328 426 260 426 C192 426 144 386 140 330 Z" fill="url(#${classPrefix}-shirt)"/>
        <ellipse cx="260" cy="245" rx="112" ry="84" fill="#ffbb7b" opacity="0.38"/>
        <circle cx="208" cy="194" r="18" fill="#2d170d"/>
        <circle cx="312" cy="194" r="18" fill="#2d170d"/>
        <circle cx="202" cy="188" r="5" fill="#ffffff" opacity="0.95"/>
        <circle cx="306" cy="188" r="5" fill="#ffffff" opacity="0.95"/>
        <path d="M184 146 C210 122 238 112 260 112 C282 112 310 122 336 146" fill="none" stroke="#6f3115" stroke-width="22" stroke-linecap="round"/>
        <path d="M188 246 C210 294 310 294 332 246 C334 230 320 212 260 214 C200 212 186 230 188 246 Z" fill="#42170d"/>
        <path d="M204 242 C220 274 298 274 316 242" fill="#f07874"/>
        <path d="M140 240 C92 254 78 300 92 346" fill="none" stroke="#ffbb7b" stroke-width="26" stroke-linecap="round"/>
        <path d="M380 240 C428 254 442 300 428 346" fill="none" stroke="#ffbb7b" stroke-width="26" stroke-linecap="round"/>
        <path d="M200 420 C196 462 178 486 154 496" fill="none" stroke="#4f2814" stroke-width="28" stroke-linecap="round"/>
        <path d="M320 420 C324 462 342 486 366 496" fill="none" stroke="#4f2814" stroke-width="28" stroke-linecap="round"/>
        <ellipse cx="150" cy="498" rx="38" ry="16" fill="#2d170d"/>
        <ellipse cx="370" cy="498" rx="38" ry="16" fill="#2d170d"/>
      </g>
    </svg>
  `;

  root.append(style, rumble, shadow, character, label);
  document.documentElement.appendChild(root);

  const eaten = new Map();
  let destroyed = false;
  let animationFrame = 0;
  let activeMorsels = [];
  let lastShakeTime = 0;
  let biteCooldown = 0;
  let biteInterval = 1000;
  const totalDestructionDuration = 60000;

  function getMouthPoint() {
    const rect = character.getBoundingClientRect();
    return {
      x: rect.left + rect.width * 0.5,
      y: rect.top + rect.height * 0.47,
    };
  }

  function triggerQuake(intensity) {
    const now = performance.now();
    if (now - lastShakeTime < 110) {
      return;
    }
    lastShakeTime = now;

    const body = document.body;
    if (!body) {
      return;
    }

    body.animate(
      [
        { transform: `translate(${intensity}px, ${-intensity * 0.45}px)` },
        { transform: `translate(${-intensity * 0.8}px, ${intensity * 0.4}px)` },
        { transform: `translate(${intensity * 0.5}px, ${intensity * 0.2}px)` },
        { transform: "translate(0, 0)" },
      ],
      {
        duration: 280,
        easing: "ease-out",
      }
    );
  }

  function isConsumable(element) {
    if (!element || !(element instanceof HTMLElement)) {
      return false;
    }
    if (element === document.body || element === document.documentElement) {
      return false;
    }
    if (root.contains(element)) {
      return false;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width < 18 || rect.height < 18) {
      return false;
    }
    const styleValue = window.getComputedStyle(element);
    if (styleValue.position === "fixed") {
      return false;
    }
    if (styleValue.display === "inline" || styleValue.display === "contents") {
      return false;
    }

    const tagName = element.tagName.toLowerCase();
    const viewportArea = window.innerWidth * window.innerHeight;
    const area = rect.width * rect.height;
    const textLike = /^(h1|h2|h3|h4|h5|h6|p|span|strong|em|small|label|a|button|li|blockquote)$/i.test(tagName);
    const classOrRole = `${element.className || ""} ${element.getAttribute("role") || ""} ${element.getAttribute("data-testid") || ""}`.toLowerCase();
    const hasCardHint = /(card|tile|panel|item|post|entry|widget|chip|box)/.test(classOrRole);
    const hasVisualCardStyle =
      parseFloat(styleValue.borderRadius || "0") >= 8 ||
      styleValue.boxShadow !== "none" ||
      styleValue.borderStyle !== "none" ||
      styleValue.backgroundColor !== "rgba(0, 0, 0, 0)";
    const cardLike =
      /^(div|article|section|li|a|button|figure|aside)$/i.test(tagName) &&
      rect.width >= 70 &&
      rect.width <= 520 &&
      rect.height >= 40 &&
      rect.height <= 360 &&
      area <= viewportArea * 0.18 &&
      element.childElementCount <= 10 &&
      (hasCardHint || hasVisualCardStyle);

    if (textLike) {
      return area <= viewportArea * 0.08;
    }

    return cardLike;
  }

  function getConsumablePriority(element) {
    const rect = element.getBoundingClientRect();
    const area = rect.width * rect.height;
    const tagName = element.tagName.toLowerCase();
    const classOrRole = `${element.className || ""} ${element.getAttribute("role") || ""}`.toLowerCase();
    const isText = /^(h1|h2|h3|h4|h5|h6|p|span|strong|em|small|label|a|button|li|blockquote)$/i.test(tagName);

    let priority = Math.max(area, 1);

    if (isText) {
      priority *= 1.7;
    }

    if (/(card|tile|panel|item|post|entry|widget|chip|box)/.test(classOrRole)) {
      priority *= 2.4;
    }

    if (element.childElementCount === 0) {
      priority *= 1.3;
    }

    return priority;
  }

  function createMorsel(element) {
    const rect = element.getBoundingClientRect();
    const morsel = document.createElement("div");
    morsel.textContent = element.innerText?.trim().slice(0, 18) || element.tagName.toLowerCase();
    Object.assign(morsel.style, {
      position: "fixed",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${Math.max(24, Math.min(rect.width, 180))}px`,
      height: `${Math.max(24, Math.min(rect.height, 100))}px`,
      borderRadius: "14px",
      background: "linear-gradient(135deg, rgba(255, 232, 198, 0.96), rgba(255, 166, 98, 0.96))",
      color: "#5f2409",
      font: "700 12px/1.1 Arial, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "6px",
      textAlign: "center",
      boxShadow: "0 10px 24px rgba(0, 0, 0, 0.22)",
      transformOrigin: "50% 50%",
      pointerEvents: "none",
    });
    root.appendChild(morsel);

    eaten.set(element, {
      visibility: element.style.visibility,
      pointerEvents: element.style.pointerEvents,
    });
    element.style.visibility = "hidden";
    element.style.pointerEvents = "none";

    return {
      node: morsel,
      x: rect.left,
      y: rect.top,
      vx: (Math.random() - 0.5) * 4,
      vy: -3 - Math.random() * 2,
      scale: 1,
      spin: (Math.random() - 0.5) * 10,
      angle: 0,
    };
  }

  function countConsumableElements() {
    const elements = Array.from(document.querySelectorAll("body *"));
    let count = 0;

    for (let index = 0; index < elements.length; index += 1) {
      const element = elements[index];
      if (isConsumable(element)) {
        count += 1;
      }
    }

    return count;
  }

  function eatNearestElement() {
    const mouth = getMouthPoint();
    const elements = Array.from(document.querySelectorAll("body *"));
    let target = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let index = 0; index < elements.length; index += 1) {
      const element = elements[index];
      if (!isConsumable(element) || eaten.has(element)) {
        continue;
      }

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;
      const dx = centerX - mouth.x;
      const dy = centerY - mouth.y;
      const distanceScore = dx * dx + dy * dy;
      const priority = getConsumablePriority(element);
      const score = distanceScore / Math.max(priority, 1);

      if (score < bestScore) {
        bestScore = score;
        target = element;
      }
    }

    if (!target) {
      return;
    }

    activeMorsels.push(createMorsel(target));
    triggerQuake(12 + Math.random() * 8);
  }

  function updateMorsels() {
    const mouth = getMouthPoint();
    activeMorsels = activeMorsels.filter((morsel) => {
      const dx = mouth.x - morsel.x;
      const dy = mouth.y - morsel.y;
      morsel.vx += dx * 0.0032;
      morsel.vy += dy * 0.0032 + 0.03;
      morsel.vx *= 0.965;
      morsel.vy *= 0.965;
      morsel.x += morsel.vx;
      morsel.y += morsel.vy;
      morsel.scale *= 0.988;
      morsel.angle += morsel.spin;
      morsel.spin *= 0.982;

      morsel.node.style.transform = `translate(${morsel.x}px, ${morsel.y}px) scale(${morsel.scale}) rotate(${morsel.angle}deg)`;

      const closeEnough = Math.abs(dx) < 28 && Math.abs(dy) < 20;
      if (closeEnough || morsel.scale < 0.08) {
        morsel.node.remove();
        return false;
      }

      return true;
    });
  }

  function tick(now) {
    if (destroyed) {
      return;
    }

    if (now > biteCooldown) {
      biteCooldown = now + biteInterval;
      eatNearestElement();
    }

    updateMorsels();
    animationFrame = window.requestAnimationFrame(tick);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      cleanup();
    }
  }

  function cleanup() {
    if (destroyed) {
      return;
    }
    destroyed = true;

    window.removeEventListener("keydown", handleKeyDown, true);
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
    }

    eaten.forEach((previous, element) => {
      element.style.visibility = previous.visibility;
      element.style.pointerEvents = previous.pointerEvents;
    });
    activeMorsels.forEach((morsel) => morsel.node.remove());
    root.remove();
    delete window[instanceKey];
  }

  window.addEventListener("keydown", handleKeyDown, true);
  window[instanceKey] = { cleanup };

  biteInterval = Math.max(350, totalDestructionDuration / Math.max(countConsumableElements(), 1));

  requestAnimationFrame(() => {
    root.classList.add(`${classPrefix}-active`);
    triggerQuake(22);
    animationFrame = window.requestAnimationFrame(tick);
  });
})();