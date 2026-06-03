(() => {
  const instanceKey = "__chaosModeScript";
  if (window[instanceKey]?.cleanup) {
    window[instanceKey].cleanup();
  }

  const prefix = `chaos-${Math.random().toString(36).slice(2)}`;
  const cycleDuration = 5000;

  const root = document.createElement("div");
  const overlay = document.createElement("div");
  const style = document.createElement("style");

  root.style.position = "fixed";
  root.style.inset = "0";
  root.style.zIndex = "2147483647";
  root.style.pointerEvents = "none";
  root.style.overflow = "hidden";

  overlay.className = `${prefix}-overlay`;

  style.textContent = `
    .${prefix}-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0;
      transition: opacity 220ms ease;
      mix-blend-mode: screen;
      background: transparent;
    }

    .${prefix}-html-perspective {
      perspective: 1600px;
      perspective-origin: 50% 50%;
      overflow-x: hidden;
    }

    .${prefix}-body-rainbow { animation: ${prefix}-hue 5.5s linear infinite; }
    .${prefix}-body-flip { animation: ${prefix}-flip 6.4s ease-in-out infinite; transform-style: preserve-3d; }
    .${prefix}-body-upside { animation: ${prefix}-upside 6.8s ease-in-out infinite; }
    .${prefix}-body-mirror { animation: ${prefix}-mirror 4.8s ease-in-out infinite; }
    .${prefix}-body-skew { animation: ${prefix}-skew 3.8s ease-in-out infinite alternate; }
    .${prefix}-body-zoom { animation: ${prefix}-zoom 5.2s ease-in-out infinite; }
    .${prefix}-body-jelly { animation: ${prefix}-jelly 4.6s ease-in-out infinite; }
    .${prefix}-body-wobble { animation: ${prefix}-wobble 2.9s ease-in-out infinite; }
    .${prefix}-body-invert { animation: ${prefix}-invert 3.7s linear infinite; }
    .${prefix}-body-contrast { animation: ${prefix}-contrast 3.9s ease-in-out infinite; }
    .${prefix}-body-blur { animation: ${prefix}-blur 4.9s ease-in-out infinite; }
    .${prefix}-body-sepia { filter: sepia(0.9) saturate(1.7) contrast(1.08); animation: ${prefix}-hue 14s linear infinite; }
    .${prefix}-body-neon { animation: ${prefix}-neon 2.8s ease-in-out infinite alternate; }
    .${prefix}-body-gray { animation: ${prefix}-gray 4.4s ease-in-out infinite; }
    .${prefix}-body-hue-tunnel { animation: ${prefix}-hueTunnel 2.5s linear infinite; }
    .${prefix}-body-breathe { animation: ${prefix}-breathe 5.1s ease-in-out infinite; }
    .${prefix}-body-shake { animation: ${prefix}-shake 0.22s linear infinite; }
    .${prefix}-body-crush { animation: ${prefix}-crush 5.4s ease-in-out infinite; }
    .${prefix}-body-shear { animation: ${prefix}-shear 5.6s ease-in-out infinite; }
    .${prefix}-body-roll { animation: ${prefix}-roll 7.2s ease-in-out infinite; transform-style: preserve-3d; }

    .${prefix}-el-scatter { animation: ${prefix}-scatter var(--chaos-dur, 6s) ease-in-out infinite alternate; }
    .${prefix}-el-drift { animation: ${prefix}-drift var(--chaos-dur, 7s) ease-in-out infinite alternate; }
    .${prefix}-el-bounce { animation: ${prefix}-bounce var(--chaos-dur, 4s) ease-in-out infinite; }
    .${prefix}-el-tilt { animation: ${prefix}-tilt var(--chaos-dur, 5s) ease-in-out infinite alternate; transform-style: preserve-3d; }
    .${prefix}-el-pulse { animation: ${prefix}-pulse var(--chaos-dur, 4.6s) ease-in-out infinite; }
    .${prefix}-el-wave { animation: ${prefix}-wave var(--chaos-dur, 3.4s) ease-in-out infinite; }
    .${prefix}-el-spacing { animation: ${prefix}-spacing var(--chaos-dur, 4.7s) ease-in-out infinite alternate; }
    .${prefix}-el-textflip { animation: ${prefix}-textflip var(--chaos-dur, 4.4s) ease-in-out infinite; transform-style: preserve-3d; }
    .${prefix}-el-slinky { animation: ${prefix}-slinky var(--chaos-dur, 4.9s) ease-in-out infinite; }
    .${prefix}-el-jitter { animation: ${prefix}-jitter 0.18s steps(2) infinite; }
    .${prefix}-el-glow { animation: ${prefix}-glow var(--chaos-dur, 2.6s) ease-in-out infinite alternate; }
    .${prefix}-el-sink { animation: ${prefix}-sink var(--chaos-dur, 6.2s) ease-in-out infinite alternate; }
    .${prefix}-el-rise { animation: ${prefix}-rise var(--chaos-dur, 6.2s) ease-in-out infinite alternate; }
    .${prefix}-el-swirl { animation: ${prefix}-swirl var(--chaos-dur, 6.1s) linear infinite; transform-origin: center center; }
    .${prefix}-el-lean { animation: ${prefix}-lean var(--chaos-dur, 5.1s) ease-in-out infinite alternate; }
    .${prefix}-el-split { animation: ${prefix}-split var(--chaos-dur, 4.1s) ease-in-out infinite alternate; }
    .${prefix}-el-stack { animation: ${prefix}-stack var(--chaos-dur, 5.6s) ease-in-out infinite alternate; }
    .${prefix}-el-orbit { animation: ${prefix}-orbit var(--chaos-dur, 6.6s) linear infinite; transform-origin: center center; }
    .${prefix}-el-colorwash { animation: ${prefix}-colorwash var(--chaos-dur, 5s) linear infinite; }

    .${prefix}-overlay-scanlines,
    .${prefix}-overlay-spotlight,
    .${prefix}-overlay-vignette,
    .${prefix}-overlay-sunset,
    .${prefix}-overlay-grid,
    .${prefix}-overlay-glitch,
    .${prefix}-overlay-aurora,
    .${prefix}-overlay-bloom {
      opacity: 1;
    }

    .${prefix}-overlay-scanlines {
      background: repeating-linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.16) 0px,
        rgba(255, 255, 255, 0.16) 2px,
        rgba(0, 0, 0, 0) 2px,
        rgba(0, 0, 0, 0) 8px
      );
      animation: ${prefix}-scanlines 1.6s linear infinite;
      mix-blend-mode: screen;
    }

    .${prefix}-overlay-spotlight {
      background: radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.24), rgba(0, 0, 0, 0.18) 28%, rgba(0, 0, 0, 0.72) 62%);
      animation: ${prefix}-spotlight 7s ease-in-out infinite alternate;
      mix-blend-mode: multiply;
    }

    .${prefix}-overlay-vignette {
      background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0) 34%, rgba(12, 0, 26, 0.28) 58%, rgba(0, 0, 0, 0.72) 100%);
      animation: ${prefix}-fadePulse 4.4s ease-in-out infinite;
      mix-blend-mode: multiply;
    }

    .${prefix}-overlay-sunset {
      background:
        radial-gradient(circle at 18% 24%, rgba(255, 212, 102, 0.3), transparent 26%),
        radial-gradient(circle at 82% 68%, rgba(255, 88, 56, 0.25), transparent 30%),
        linear-gradient(135deg, rgba(255, 64, 129, 0.24), rgba(255, 162, 0, 0.12), rgba(0, 195, 255, 0.16));
      animation: ${prefix}-fadePulse 5.8s ease-in-out infinite;
    }

    .${prefix}-overlay-grid {
      background:
        linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px);
      background-size: 42px 42px;
      animation: ${prefix}-gridDrift 5.2s linear infinite;
    }

    .${prefix}-overlay-glitch {
      background:
        repeating-linear-gradient(0deg, rgba(255,0,80,0.12) 0 6px, transparent 6px 12px),
        repeating-linear-gradient(180deg, rgba(0,220,255,0.12) 0 4px, transparent 4px 10px);
      animation: ${prefix}-glitchLines 0.8s steps(2) infinite;
    }

    .${prefix}-overlay-aurora {
      background:
        radial-gradient(circle at 20% 30%, rgba(0, 255, 214, 0.18), transparent 30%),
        radial-gradient(circle at 70% 20%, rgba(174, 0, 255, 0.2), transparent 28%),
        radial-gradient(circle at 60% 70%, rgba(255, 0, 144, 0.18), transparent 32%);
      animation: ${prefix}-aurora 8s ease-in-out infinite alternate;
    }

    .${prefix}-overlay-bloom {
      background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.28), rgba(255,255,255,0) 44%);
      animation: ${prefix}-bloom 3.7s ease-in-out infinite;
    }

    @keyframes ${prefix}-hue { to { filter: hue-rotate(360deg) saturate(1.9); } }
    @keyframes ${prefix}-flip { 0%,100% { transform: rotateY(0deg) scale(1); } 50% { transform: rotateY(180deg) scale(0.94); } }
    @keyframes ${prefix}-upside { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(180deg) scale(0.97); } }
    @keyframes ${prefix}-mirror { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(-1); } }
    @keyframes ${prefix}-skew { from { transform: skew(0deg, 0deg); } to { transform: skew(-10deg, 5deg) translateX(2vw); } }
    @keyframes ${prefix}-zoom { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
    @keyframes ${prefix}-jelly { 0%,100% { transform: scale(1,1); } 25% { transform: scale(1.05,0.93); } 55% { transform: scale(0.96,1.06); } }
    @keyframes ${prefix}-wobble { 0%,100% { transform: translate(0,0) rotate(0deg); } 25% { transform: translate(1vw,-0.5vh) rotate(-1deg); } 50% { transform: translate(-1vw,0.8vh) rotate(1.2deg); } 75% { transform: translate(0.6vw,-0.3vh) rotate(-0.8deg); } }
    @keyframes ${prefix}-invert { 0%,100% { filter: invert(0) hue-rotate(0deg); } 50% { filter: invert(1) hue-rotate(180deg); } }
    @keyframes ${prefix}-contrast { 0%,100% { filter: contrast(1) saturate(1); } 50% { filter: contrast(1.8) saturate(2.2) brightness(1.08); } }
    @keyframes ${prefix}-blur { 0%,100% { filter: blur(0px) saturate(1); } 50% { filter: blur(5px) saturate(1.7); } }
    @keyframes ${prefix}-neon { from { filter: drop-shadow(0 0 0 rgba(0,0,0,0)); } to { filter: drop-shadow(0 0 10px rgba(255,0,132,0.55)) drop-shadow(0 0 16px rgba(0,255,255,0.4)); } }
    @keyframes ${prefix}-gray { 0%,100% { filter: grayscale(0); } 50% { filter: grayscale(1) contrast(1.3); } }
    @keyframes ${prefix}-hueTunnel { 0% { filter: hue-rotate(0deg) contrast(1); } 50% { filter: hue-rotate(180deg) contrast(1.5) saturate(2); } 100% { filter: hue-rotate(360deg) contrast(1); } }
    @keyframes ${prefix}-breathe { 0%,100% { filter: saturate(1); transform: scale(1); } 50% { filter: saturate(1.5) brightness(1.06); transform: scale(1.03); } }
    @keyframes ${prefix}-shake { 0% { transform: translate(0,0); } 25% { transform: translate(0.35vw,-0.3vh); } 50% { transform: translate(-0.45vw,0.35vh); } 75% { transform: translate(0.2vw,0.15vh); } 100% { transform: translate(0,0); } }
    @keyframes ${prefix}-crush { 0%,100% { transform: scale(1,1); } 50% { transform: scale(1.12,0.88); } }
    @keyframes ${prefix}-shear { 0%,100% { transform: skewY(0deg) scale(1); } 50% { transform: skewY(-8deg) scaleX(1.03); } }
    @keyframes ${prefix}-roll { 0%,100% { transform: rotateX(0deg) rotateZ(0deg); } 50% { transform: rotateX(8deg) rotateZ(-2deg); } }

    @keyframes ${prefix}-scatter { from { transform: translate(0,0) rotate(0deg) scale(1); } to { transform: translate(var(--tx, 0px), var(--ty, 0px)) rotate(var(--rot, 0deg)) scale(var(--scale, 1)); } }
    @keyframes ${prefix}-drift { from { transform: translate(0,0) rotate(0deg); } to { transform: translate(var(--tx, 0px), var(--ty, 0px)) rotate(var(--rot, 0deg)); } }
    @keyframes ${prefix}-bounce { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(calc(var(--ty, -20px))) rotate(var(--rot, 0deg)); } }
    @keyframes ${prefix}-tilt { from { transform: rotateX(0deg) rotateY(0deg) rotate(0deg); } to { transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) rotate(var(--rot, 0deg)); } }
    @keyframes ${prefix}-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(var(--scale, 1.12)); } }
    @keyframes ${prefix}-wave { 0%,100% { transform: translateY(0); } 50% { transform: translateY(var(--ty, -14px)); } }
    @keyframes ${prefix}-spacing { 0%,100% { letter-spacing: normal; transform: translateX(0); } 50% { letter-spacing: var(--ls, 0.2em); transform: translateX(var(--tx, 0px)); } }
    @keyframes ${prefix}-textflip { 0%,100% { transform: rotateY(0deg); } 50% { transform: rotateY(180deg) rotateX(10deg); } }
    @keyframes ${prefix}-slinky { 0%,100% { transform: translateY(0) skewX(0deg); } 50% { transform: translateY(var(--ty, 14px)) skewX(var(--skew, -12deg)); } }
    @keyframes ${prefix}-jitter { 0% { transform: translate(0,0); } 25% { transform: translate(2px,-1px); } 50% { transform: translate(-2px,1px); } 75% { transform: translate(1px,2px); } 100% { transform: translate(0,0); } }
    @keyframes ${prefix}-glow { from { text-shadow: 0 0 0 rgba(0,0,0,0); filter: brightness(1); } to { text-shadow: 0 0 12px var(--glow, rgba(255,255,255,0.85)); filter: brightness(1.2); } }
    @keyframes ${prefix}-sink { from { transform: translateY(0) rotate(0deg); opacity: 1; } to { transform: translateY(var(--ty, 32px)) rotate(var(--rot, 6deg)); opacity: 0.72; } }
    @keyframes ${prefix}-rise { from { transform: translateY(0) rotate(0deg); opacity: 1; } to { transform: translateY(var(--ty, -36px)) rotate(var(--rot, -6deg)); opacity: 0.78; } }
    @keyframes ${prefix}-swirl { from { transform: rotate(0deg) translateX(var(--radius, 26px)) rotate(0deg); } to { transform: rotate(360deg) translateX(var(--radius, 26px)) rotate(-360deg); } }
    @keyframes ${prefix}-lean { from { transform: skewX(0deg) rotate(0deg); } to { transform: skewX(var(--skew, 10deg)) rotate(var(--rot, 4deg)); } }
    @keyframes ${prefix}-split { from { text-shadow: 0 0 0 rgba(0,0,0,0); filter: none; } to { text-shadow: -3px 0 rgba(255,0,90,0.7), 3px 0 rgba(0,220,255,0.7); filter: saturate(1.4); } }
    @keyframes ${prefix}-stack { from { transform: translate(0,0) rotate(0deg) scale(1); } to { transform: translate(var(--tx, 0px), var(--ty, 0px)) rotate(var(--rot, 0deg)) scale(var(--scale, 0.92)); } }
    @keyframes ${prefix}-orbit { from { transform: rotate(0deg) translateX(var(--radius, 24px)) rotate(0deg); } to { transform: rotate(360deg) translateX(var(--radius, 24px)) rotate(-360deg); } }
    @keyframes ${prefix}-colorwash { from { filter: hue-rotate(0deg) saturate(1.2); } to { filter: hue-rotate(360deg) saturate(1.9); } }

    @keyframes ${prefix}-scanlines { from { transform: translateY(0); } to { transform: translateY(8px); } }
    @keyframes ${prefix}-spotlight { from { background-position: 20% 30%; } to { background-position: 78% 68%; } }
    @keyframes ${prefix}-fadePulse { 0%,100% { opacity: 0.62; } 50% { opacity: 1; } }
    @keyframes ${prefix}-gridDrift { from { background-position: 0 0, 0 0; } to { background-position: 42px 42px, -42px 42px; } }
    @keyframes ${prefix}-glitchLines { 0% { transform: translate(0,0); } 50% { transform: translate(4px,-2px); } 100% { transform: translate(-4px,2px); } }
    @keyframes ${prefix}-aurora { from { transform: translate(-3%, -2%) scale(1); } to { transform: translate(3%, 2%) scale(1.08); } }
    @keyframes ${prefix}-bloom { 0%,100% { opacity: 0.25; transform: scale(0.9); } 50% { opacity: 0.8; transform: scale(1.2); } }
  `;

  root.append(style, overlay);
  document.documentElement.appendChild(root);

  let destroyed = false;
  let currentScope = null;
  let cycleTimer = 0;
  let lastEffectIndex = -1;

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function shuffle(items) {
    const clone = items.slice();
    for (let index = clone.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const temp = clone[index];
      clone[index] = clone[swapIndex];
      clone[swapIndex] = temp;
    }
    return clone;
  }

  function sample(items, limit) {
    return shuffle(items).slice(0, Math.min(limit, items.length));
  }

  function isVisible(element) {
    if (!element || !(element instanceof HTMLElement) || root.contains(element)) {
      return false;
    }
    const styleValue = window.getComputedStyle(element);
    if (styleValue.display === "none" || styleValue.visibility === "hidden" || Number(styleValue.opacity) === 0) {
      return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom >= 0 && rect.right >= 0 && rect.top <= window.innerHeight && rect.left <= window.innerWidth;
  }

  function getAllElements() {
    return Array.from(document.body?.querySelectorAll("*") || []).filter((element) => {
      if (!isVisible(element)) {
        return false;
      }
      const tagName = element.tagName.toLowerCase();
      return !/^(script|style|link|meta|noscript|svg|path|html|body)$/i.test(tagName);
    });
  }

  function getTextElements() {
    const viewportArea = window.innerWidth * window.innerHeight;
    return getAllElements().filter((element) => {
      const tagName = element.tagName.toLowerCase();
      if (!/^(h1|h2|h3|h4|h5|h6|p|span|strong|em|small|label|a|button|li|blockquote|code)$/i.test(tagName)) {
        return false;
      }
      if (!element.innerText || !element.innerText.trim()) {
        return false;
      }
      const rect = element.getBoundingClientRect();
      return rect.width * rect.height <= viewportArea * 0.12;
    });
  }

  function getCardElements() {
    const viewportArea = window.innerWidth * window.innerHeight;
    return getAllElements().filter((element) => {
      const tagName = element.tagName.toLowerCase();
      if (!/^(div|article|section|li|a|button|figure|aside|form)$/i.test(tagName)) {
        return false;
      }
      const rect = element.getBoundingClientRect();
      if (rect.width < 70 || rect.height < 36 || rect.width > 520 || rect.height > 380) {
        return false;
      }
      if (rect.width * rect.height > viewportArea * 0.18) {
        return false;
      }
      const styleValue = window.getComputedStyle(element);
      const hints = `${element.className || ""} ${element.getAttribute("role") || ""}`.toLowerCase();
      const looksCardLike = /(card|tile|panel|chip|post|entry|item|widget|box)/.test(hints) || styleValue.boxShadow !== "none" || parseFloat(styleValue.borderRadius || "0") >= 8 || styleValue.backgroundColor !== "rgba(0, 0, 0, 0)" || styleValue.borderStyle !== "none";
      return looksCardLike;
    });
  }

  function createScope() {
    const cleanups = [];
    const propertyState = new Map();

    function recordProperty(element, propertyName) {
      let elementState = propertyState.get(element);
      if (!elementState) {
        elementState = new Map();
        propertyState.set(element, elementState);
      }
      if (!elementState.has(propertyName)) {
        elementState.set(propertyName, {
          value: element.style.getPropertyValue(propertyName),
          priority: element.style.getPropertyPriority(propertyName),
        });
      }
    }

    return {
      addCleanup(cleanup) {
        cleanups.push(cleanup);
      },
      addClass(element, className) {
        element.classList.add(className);
        cleanups.push(() => element.classList.remove(className));
      },
      setVar(element, variableName, value) {
        recordProperty(element, variableName);
        element.style.setProperty(variableName, value);
      },
      setStyle(element, propertyName, value) {
        recordProperty(element, propertyName);
        element.style.setProperty(propertyName, value);
      },
      setOverlayClass(className) {
        overlay.className = `${prefix}-overlay ${className}`;
        cleanups.push(() => {
          overlay.className = `${prefix}-overlay`;
          overlay.removeAttribute("style");
        });
      },
      clear() {
        for (const [element, states] of propertyState.entries()) {
          for (const [propertyName, previous] of states.entries()) {
            if (previous.value) {
              element.style.setProperty(propertyName, previous.value, previous.priority);
            } else {
              element.style.removeProperty(propertyName);
            }
          }
        }
        for (let index = cleanups.length - 1; index >= 0; index -= 1) {
          try {
            cleanups[index]();
          } catch (error) {
            console.warn("Chaos mode cleanup issue:", error);
          }
        }
      },
    };
  }

  function applyToElements(scope, elements, className, configure) {
    for (let index = 0; index < elements.length; index += 1) {
      const element = elements[index];
      scope.addClass(element, className);
      scope.setVar(element, "--chaos-dur", `${randomBetween(3.2, 7.8).toFixed(2)}s`);
      if (configure) {
        configure(element, index);
      }
    }
  }

  function bodyEffect(bodyClass, needsPerspective) {
    return (scope) => {
      if (document.body) {
        scope.addClass(document.body, bodyClass);
      }
      if (needsPerspective) {
        scope.addClass(document.documentElement, `${prefix}-html-perspective`);
      }
    };
  }

  function overlayEffect(className) {
    return (scope) => {
      scope.setOverlayClass(className);
    };
  }

  const effects = [
    bodyEffect(`${prefix}-body-rainbow`, false),
    bodyEffect(`${prefix}-body-flip`, true),
    bodyEffect(`${prefix}-body-upside`, false),
    bodyEffect(`${prefix}-body-mirror`, false),
    bodyEffect(`${prefix}-body-skew`, false),
    bodyEffect(`${prefix}-body-zoom`, false),
    bodyEffect(`${prefix}-body-jelly`, false),
    bodyEffect(`${prefix}-body-wobble`, false),
    bodyEffect(`${prefix}-body-invert`, false),
    bodyEffect(`${prefix}-body-contrast`, false),
    bodyEffect(`${prefix}-body-blur`, false),
    bodyEffect(`${prefix}-body-sepia`, false),
    bodyEffect(`${prefix}-body-neon`, false),
    bodyEffect(`${prefix}-body-gray`, false),
    bodyEffect(`${prefix}-body-hue-tunnel`, false),
    bodyEffect(`${prefix}-body-breathe`, false),
    bodyEffect(`${prefix}-body-shake`, false),
    bodyEffect(`${prefix}-body-crush`, false),
    bodyEffect(`${prefix}-body-shear`, false),
    bodyEffect(`${prefix}-body-roll`, true),
    overlayEffect(`${prefix}-overlay-scanlines`),
    overlayEffect(`${prefix}-overlay-spotlight`),
    overlayEffect(`${prefix}-overlay-vignette`),
    overlayEffect(`${prefix}-overlay-sunset`),
    overlayEffect(`${prefix}-overlay-grid`),
    overlayEffect(`${prefix}-overlay-glitch`),
    overlayEffect(`${prefix}-overlay-aurora`),
    overlayEffect(`${prefix}-overlay-bloom`),
    (scope) => {
      applyToElements(scope, sample(getCardElements(), 26), `${prefix}-el-scatter`, (element) => {
        scope.setVar(element, "--tx", `${randomBetween(-120, 120).toFixed(0)}px`);
        scope.setVar(element, "--ty", `${randomBetween(-80, 90).toFixed(0)}px`);
        scope.setVar(element, "--rot", `${randomBetween(-18, 18).toFixed(1)}deg`);
        scope.setVar(element, "--scale", `${randomBetween(0.9, 1.18).toFixed(2)}`);
      });
    },
    (scope) => {
      applyToElements(scope, sample(getCardElements(), 22), `${prefix}-el-drift`, (element) => {
        scope.setVar(element, "--tx", `${randomBetween(-70, 70).toFixed(0)}px`);
        scope.setVar(element, "--ty", `${randomBetween(-20, 24).toFixed(0)}px`);
        scope.setVar(element, "--rot", `${randomBetween(-8, 8).toFixed(1)}deg`);
      });
    },
    (scope) => {
      applyToElements(scope, sample(getCardElements(), 18), `${prefix}-el-bounce`, (element) => {
        scope.setVar(element, "--ty", `${randomBetween(-34, -12).toFixed(0)}px`);
        scope.setVar(element, "--rot", `${randomBetween(-6, 6).toFixed(1)}deg`);
      });
    },
    (scope) => {
      applyToElements(scope, sample(getCardElements(), 16), `${prefix}-el-tilt`, (element) => {
        scope.setVar(element, "--rx", `${randomBetween(-18, 18).toFixed(1)}deg`);
        scope.setVar(element, "--ry", `${randomBetween(-24, 24).toFixed(1)}deg`);
        scope.setVar(element, "--rot", `${randomBetween(-4, 4).toFixed(1)}deg`);
      });
      scope.addClass(document.documentElement, `${prefix}-html-perspective`);
    },
    (scope) => {
      applyToElements(scope, sample(getCardElements(), 22), `${prefix}-el-pulse`, (element) => {
        scope.setVar(element, "--scale", `${randomBetween(1.08, 1.24).toFixed(2)}`);
      });
    },
    (scope) => {
      applyToElements(scope, sample(getCardElements(), 18), `${prefix}-el-stack`, (element) => {
        scope.setVar(element, "--tx", `${randomBetween(-32, 32).toFixed(0)}px`);
        scope.setVar(element, "--ty", `${randomBetween(-20, 20).toFixed(0)}px`);
        scope.setVar(element, "--rot", `${randomBetween(-12, 12).toFixed(1)}deg`);
        scope.setVar(element, "--scale", `${randomBetween(0.82, 1.03).toFixed(2)}`);
      });
    },
    (scope) => {
      applyToElements(scope, sample(getCardElements(), 16), `${prefix}-el-orbit`, (element) => {
        scope.setVar(element, "--radius", `${randomBetween(16, 42).toFixed(0)}px`);
      });
    },
    (scope) => {
      applyToElements(scope, sample(getCardElements(), 24), `${prefix}-el-colorwash`);
    },
    (scope) => {
      applyToElements(scope, sample(getTextElements(), 60), `${prefix}-el-wave`, (element, index) => {
        scope.setVar(element, "--ty", `${randomBetween(-24, 24).toFixed(0)}px`);
        scope.setStyle(element, "animation-delay", `${(index % 9) * 0.08}s`);
      });
    },
    (scope) => {
      applyToElements(scope, sample(getTextElements(), 48), `${prefix}-el-spacing`, (element) => {
        scope.setVar(element, "--ls", `${randomBetween(0.12, 0.42).toFixed(2)}em`);
        scope.setVar(element, "--tx", `${randomBetween(-10, 10).toFixed(0)}px`);
      });
    },
    (scope) => {
      applyToElements(scope, sample(getTextElements(), 40), `${prefix}-el-textflip`);
      scope.addClass(document.documentElement, `${prefix}-html-perspective`);
    },
    (scope) => {
      applyToElements(scope, sample(getTextElements(), 54), `${prefix}-el-slinky`, (element) => {
        scope.setVar(element, "--ty", `${randomBetween(10, 26).toFixed(0)}px`);
        scope.setVar(element, "--skew", `${randomBetween(-15, 15).toFixed(1)}deg`);
      });
    },
    (scope) => {
      applyToElements(scope, sample(getTextElements(), 70), `${prefix}-el-jitter`);
    },
    (scope) => {
      const glowColors = ["rgba(255, 0, 128, 0.9)", "rgba(0, 224, 255, 0.85)", "rgba(255, 208, 0, 0.9)"];
      applyToElements(scope, sample(getTextElements(), 42), `${prefix}-el-glow`, (element, index) => {
        scope.setVar(element, "--glow", glowColors[index % glowColors.length]);
      });
    },
    (scope) => {
      applyToElements(scope, sample(getTextElements(), 48), `${prefix}-el-split`);
    },
    (scope) => {
      applyToElements(scope, sample(getTextElements(), 38), `${prefix}-el-colorwash`);
    },
    (scope) => {
      applyToElements(scope, sample(getAllElements(), 28), `${prefix}-el-sink`, (element) => {
        scope.setVar(element, "--ty", `${randomBetween(18, 52).toFixed(0)}px`);
        scope.setVar(element, "--rot", `${randomBetween(-8, 8).toFixed(1)}deg`);
      });
    },
    (scope) => {
      applyToElements(scope, sample(getAllElements(), 28), `${prefix}-el-rise`, (element) => {
        scope.setVar(element, "--ty", `${randomBetween(-54, -18).toFixed(0)}px`);
        scope.setVar(element, "--rot", `${randomBetween(-8, 8).toFixed(1)}deg`);
      });
    },
    (scope) => {
      applyToElements(scope, sample(getAllElements(), 22), `${prefix}-el-swirl`, (element) => {
        scope.setVar(element, "--radius", `${randomBetween(14, 36).toFixed(0)}px`);
      });
    },
    (scope) => {
      applyToElements(scope, sample(getAllElements(), 26), `${prefix}-el-lean`, (element) => {
        scope.setVar(element, "--skew", `${randomBetween(-14, 14).toFixed(1)}deg`);
        scope.setVar(element, "--rot", `${randomBetween(-6, 6).toFixed(1)}deg`);
      });
    },
    (scope) => {
      const elements = sample(getCardElements().concat(getTextElements()), 34);
      applyToElements(scope, elements, `${prefix}-el-scatter`, (element) => {
        scope.setVar(element, "--tx", `${randomBetween(-90, 90).toFixed(0)}px`);
        scope.setVar(element, "--ty", `${randomBetween(-56, 56).toFixed(0)}px`);
        scope.setVar(element, "--rot", `${randomBetween(-24, 24).toFixed(1)}deg`);
        scope.setVar(element, "--scale", `${randomBetween(0.86, 1.18).toFixed(2)}`);
      });
      if (document.body) {
        scope.addClass(document.body, `${prefix}-body-wobble`);
      }
    },
    (scope) => {
      const elements = sample(getTextElements(), 36);
      applyToElements(scope, elements, `${prefix}-el-wave`, (element, index) => {
        scope.setVar(element, "--ty", `${(index % 2 === 0 ? -1 : 1) * randomBetween(12, 28).toFixed(0)}px`);
        scope.setStyle(element, "animation-delay", `${(index % 8) * 0.12}s`);
        scope.setStyle(element, "color", `hsl(${Math.floor(randomBetween(0, 360))} 95% 65%)`);
      });
    },
    (scope) => {
      const cards = sample(getCardElements(), 20);
      applyToElements(scope, cards, `${prefix}-el-tilt`, (element) => {
        scope.setVar(element, "--rx", `${randomBetween(-8, 8).toFixed(1)}deg`);
        scope.setVar(element, "--ry", `${randomBetween(-32, 32).toFixed(1)}deg`);
        scope.setVar(element, "--rot", `${randomBetween(-10, 10).toFixed(1)}deg`);
        scope.setStyle(element, "transform-origin", `${randomBetween(20, 80).toFixed(0)}% ${randomBetween(20, 80).toFixed(0)}%`);
      });
      scope.addClass(document.documentElement, `${prefix}-html-perspective`);
    },
    (scope) => {
      const mixed = sample(getAllElements(), 30);
      applyToElements(scope, mixed, `${prefix}-el-drift`, (element) => {
        scope.setVar(element, "--tx", `${randomBetween(-44, 44).toFixed(0)}px`);
        scope.setVar(element, "--ty", `${randomBetween(-44, 44).toFixed(0)}px`);
        scope.setVar(element, "--rot", `${randomBetween(-14, 14).toFixed(1)}deg`);
        scope.setStyle(element, "filter", `hue-rotate(${randomBetween(0, 360).toFixed(0)}deg)`);
      });
      scope.setOverlayClass(`${prefix}-overlay-glitch`);
    },
  ];

  function runEffect() {
    if (destroyed) {
      return;
    }

    if (currentScope) {
      currentScope.clear();
      currentScope = null;
    }

    const availableIndexes = effects.map((_, index) => index).filter((index) => index !== lastEffectIndex || effects.length === 1);
    const nextIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    lastEffectIndex = nextIndex;

    currentScope = createScope();
    effects[nextIndex](currentScope);
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
    if (cycleTimer) {
      window.clearInterval(cycleTimer);
    }
    if (currentScope) {
      currentScope.clear();
      currentScope = null;
    }
    root.remove();
    delete window[instanceKey];
  }

  window.addEventListener("keydown", handleKeyDown, true);
  window[instanceKey] = { cleanup };

  runEffect();
  cycleTimer = window.setInterval(runEffect, cycleDuration);
})();(() => {
  const instanceKey = "__chaosModeBrowserScript";
  if (window[instanceKey]?.cleanup) {
    window[instanceKey].cleanup();
  }

  const pageTarget = document.body || document.documentElement;
  const root = document.createElement("div");
  Object.assign(root.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    pointerEvents: "none",
    overflow: "hidden",
  });
  document.documentElement.appendChild(root);

  const effectDuration = 14000;
  const cycleInterval = 5000;
  const maxConcurrentEffects = 3;
  const overlayBase = {
    position: "absolute",
    inset: "0",
    pointerEvents: "none",
  };

  let destroyed = false;
  let cycleTimer = 0;
  let activeEffects = [];
  let effectBag = [];

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function shuffle(list) {
    const copy = list.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function sample(list, count) {
    return shuffle(list).slice(0, Math.max(0, count));
  }

  function isTransparent(color) {
    return !color || color === "transparent" || color === "rgba(0, 0, 0, 0)" || color === "rgba(0,0,0,0)";
  }

  function visibleElements() {
    if (!document.body) {
      return [];
    }

    return Array.from(document.body.querySelectorAll("*")).filter((element) => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }
      if (root.contains(element)) {
        return false;
      }

      const styleValue = window.getComputedStyle(element);
      if (
        styleValue.display === "none" ||
        styleValue.visibility === "hidden" ||
        Number.parseFloat(styleValue.opacity || "1") < 0.05 ||
        styleValue.position === "fixed"
      ) {
        return false;
      }

      const rect = element.getBoundingClientRect();
      if (
        rect.width < 12 ||
        rect.height < 12 ||
        rect.bottom < 0 ||
        rect.top > window.innerHeight ||
        rect.right < 0 ||
        rect.left > window.innerWidth
      ) {
        return false;
      }

      return true;
    });
  }

  function cardTargets(limit = 16) {
    const viewportArea = window.innerWidth * window.innerHeight;
    const matches = visibleElements().filter((element) => {
      const rect = element.getBoundingClientRect();
      const styleValue = window.getComputedStyle(element);
      const tagName = element.tagName.toLowerCase();
      const classText = `${element.className || ""} ${element.getAttribute("role") || ""} ${element.getAttribute("data-testid") || ""}`.toLowerCase();
      const visualCard =
        parseFloat(styleValue.borderRadius || "0") >= 6 ||
        styleValue.boxShadow !== "none" ||
        styleValue.borderStyle !== "none" ||
        !isTransparent(styleValue.backgroundColor);

      if (styleValue.display === "inline" || styleValue.display === "contents") {
        return false;
      }

      return (
        rect.width >= 70 &&
        rect.width <= 560 &&
        rect.height >= 36 &&
        rect.height <= 380 &&
        rect.width * rect.height <= viewportArea * 0.18 &&
        element.childElementCount <= 12 &&
        (visualCard || /(card|tile|panel|item|post|entry|widget|chip|box)/.test(classText) || /^(article|figure|aside|li|a|button|section|div)$/i.test(tagName))
      );
    });

    return sample(matches, limit);
  }

  function textTargets(limit = 24) {
    const matches = visibleElements().filter((element) => {
      const tagName = element.tagName.toLowerCase();
      if (!/^(h1|h2|h3|h4|h5|h6|p|span|strong|em|small|label|a|button|li|blockquote|figcaption)$/i.test(tagName)) {
        return false;
      }
      if (element.childElementCount > 0) {
        return false;
      }

      const text = (element.textContent || "").replace(/\s+/g, " ").trim();
      return text.length >= 2 && text.length <= 90;
    });

    return sample(matches, limit);
  }

  function createScope() {
    const cleanups = [];

    return {
      add(cleanup) {
        cleanups.push(cleanup);
      },
      style(target, styles) {
        if (!target) {
          return;
        }

        const previous = {};
        for (const [key, value] of Object.entries(styles)) {
          previous[key] = target.style[key];
          target.style[key] = value;
        }

        cleanups.push(() => {
          for (const [key, value] of Object.entries(previous)) {
            target.style[key] = value;
          }
        });
      },
      animate(target, keyframes, options) {
        if (!target || typeof target.animate !== "function") {
          return null;
        }

        const animation = target.animate(keyframes, options);
        cleanups.push(() => animation.cancel());
        return animation;
      },
      overlay(styles) {
        const node = document.createElement("div");
        Object.assign(node.style, overlayBase, styles);
        root.appendChild(node);
        cleanups.push(() => node.remove());
        return node;
      },
      timeout(callback, delay) {
        const timer = window.setTimeout(callback, delay);
        cleanups.push(() => window.clearTimeout(timer));
        return timer;
      },
      interval(callback, delay) {
        const timer = window.setInterval(callback, delay);
        cleanups.push(() => window.clearInterval(timer));
        return timer;
      },
      cleanup() {
        for (let index = cleanups.length - 1; index >= 0; index -= 1) {
          try {
            cleanups[index]();
          } catch (error) {
            console.error("Chaos effect cleanup failed:", error);
          }
        }
      },
    };
  }

  function prepTargets(scope, targets) {
    for (const target of targets) {
      scope.style(target, {
        willChange: "transform, filter, color, opacity, letter-spacing",
        transformOrigin: "50% 50%",
      });
    }
  }

  function animatePage(scope, keyframes, options = {}) {
    scope.style(pageTarget, {
      transformOrigin: "50% 50%",
      transformStyle: "preserve-3d",
      backfaceVisibility: "hidden",
      willChange: "transform, filter",
    });

    scope.animate(pageTarget, keyframes, {
      duration: options.duration || 2800,
      easing: options.easing || "ease-in-out",
      direction: options.direction || "alternate",
      iterations: options.iterations || Infinity,
    });
  }

  function animateTargets(scope, targets, buildFrames, buildOptions) {
    prepTargets(scope, targets);
    targets.forEach((target, index) => {
      const keyframes = buildFrames(target, index);
      const options = typeof buildOptions === "function" ? buildOptions(target, index) : buildOptions;
      scope.animate(target, keyframes, options);
    });
  }

  function fallbackPage(scope) {
    animatePage(
      scope,
      [
        { filter: "hue-rotate(0deg) saturate(1)", transform: "translate3d(0, 0, 0) scale(1)" },
        { filter: "hue-rotate(160deg) saturate(2.2)", transform: "translate3d(0, 0, 0) scale(1.03)" },
        { filter: "hue-rotate(320deg) saturate(1.2)", transform: "translate3d(0, 0, 0) scale(0.99)" },
      ],
      { duration: 2600, easing: "linear", direction: "normal" }
    );
  }

  function scatterCards(scope, amount, rotation) {
    const targets = cardTargets(18);
    if (!targets.length) {
      fallbackPage(scope);
      return;
    }

    prepTargets(scope, targets);
    targets.forEach((target, index) => {
      const dx = randomBetween(-amount, amount);
      const dy = randomBetween(-amount, amount);
      const spin = randomBetween(-rotation, rotation);
      const scale = randomBetween(0.86, 1.14);
      scope.animate(
        target,
        [
          { transform: "translate(0px, 0px) rotate(0deg) scale(1)" },
          { transform: `translate(${dx}px, ${dy}px) rotate(${spin}deg) scale(${scale})` },
        ],
        {
          duration: 900 + index * 18,
          delay: index * 16,
          easing: "cubic-bezier(0.2, 0.9, 0.2, 1)",
          fill: "forwards",
        }
      );
    });
  }

  function fanCards(scope, direction) {
    const targets = cardTargets(16).sort((left, right) => left.getBoundingClientRect().left - right.getBoundingClientRect().left);
    if (!targets.length) {
      fallbackPage(scope);
      return;
    }

    prepTargets(scope, targets);
    const middle = (targets.length - 1) / 2;
    targets.forEach((target, index) => {
      const offset = index - middle;
      const rotate = offset * 6 * direction;
      const x = offset * 18;
      const y = Math.abs(offset) * 10;
      scope.animate(
        target,
        [
          { transform: "translate(0px, 0px) rotate(0deg)" },
          { transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)` },
        ],
        {
          duration: 780,
          delay: index * 25,
          easing: "cubic-bezier(0.18, 0.82, 0.2, 1)",
          fill: "forwards",
        }
      );
    });
  }

  function driftCards(scope, direction) {
    const targets = cardTargets(18);
    if (!targets.length) {
      fallbackPage(scope);
      return;
    }

    animateTargets(
      scope,
      targets,
      () => {
        const dx = randomBetween(-18, 18);
        const dy = randomBetween(18, 80) * direction;
        const rotate = randomBetween(-4, 4);
        return [
          { transform: "translate(0px, 0px) rotate(0deg)", offset: 0 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`, offset: 0.5 },
          { transform: "translate(0px, 0px) rotate(0deg)", offset: 1 },
        ];
      },
      (_, index) => ({
        duration: 1800 + randomBetween(0, 800),
        delay: index * 40,
        iterations: Infinity,
        direction: "alternate",
        easing: "ease-in-out",
      })
    );
  }

  function spinCards(scope) {
    const targets = cardTargets(16);
    if (!targets.length) {
      fallbackPage(scope);
      return;
    }

    animateTargets(
      scope,
      targets,
      () => [
        { transform: "rotate(0deg) scale(1)" },
        { transform: `rotate(${randomBetween(260, 520)}deg) scale(${randomBetween(0.94, 1.12)})` },
      ],
      () => ({
        duration: randomBetween(2200, 3600),
        iterations: Infinity,
        direction: "alternate",
        easing: "cubic-bezier(0.33, 0, 0.2, 1)",
      })
    );
  }

  function bounceCards(scope) {
    const targets = cardTargets(18);
    if (!targets.length) {
      fallbackPage(scope);
      return;
    }

    animateTargets(
      scope,
      targets,
      () => {
        const lift = randomBetween(-48, -14);
        return [
          { transform: "translateY(0px) scale(1)", offset: 0 },
          { transform: `translateY(${lift}px) scale(1.06)`, offset: 0.35 },
          { transform: "translateY(0px) scale(0.97)", offset: 0.72 },
          { transform: "translateY(0px) scale(1)", offset: 1 },
        ];
      },
      (_, index) => ({
        duration: 900 + randomBetween(0, 700),
        delay: index * 30,
        iterations: Infinity,
        easing: "ease-in-out",
      })
    );
  }

  function shiverCards(scope) {
    const targets = cardTargets(18);
    if (!targets.length) {
      fallbackPage(scope);
      return;
    }

    animateTargets(
      scope,
      targets,
      () => [
        { transform: "translate(0px, 0px) rotate(0deg)" },
        { transform: `translate(${randomBetween(-6, 6)}px, ${randomBetween(-4, 4)}px) rotate(${randomBetween(-2.5, 2.5)}deg)` },
        { transform: `translate(${randomBetween(-6, 6)}px, ${randomBetween(-4, 4)}px) rotate(${randomBetween(-2.5, 2.5)}deg)` },
        { transform: "translate(0px, 0px) rotate(0deg)" },
      ],
      () => ({
        duration: 260,
        iterations: Infinity,
        easing: "steps(2, end)",
      })
    );
  }

  function splitSlideCards(scope) {
    const targets = cardTargets(18);
    if (!targets.length) {
      fallbackPage(scope);
      return;
    }

    prepTargets(scope, targets);
    targets.forEach((target, index) => {
      const direction = index % 2 === 0 ? -1 : 1;
      scope.animate(
        target,
        [
          { transform: "translate(0px, 0px) rotate(0deg)" },
          { transform: `translate(${direction * randomBetween(60, 160)}px, ${randomBetween(-20, 20)}px) rotate(${direction * randomBetween(4, 14)}deg)` },
        ],
        {
          duration: 820,
          delay: index * 20,
          easing: "cubic-bezier(0.18, 0.82, 0.22, 1)",
          fill: "forwards",
        }
      );
    });
  }

  function stackCards(scope) {
    const targets = cardTargets(16);
    if (!targets.length) {
      fallbackPage(scope);
      return;
    }

    prepTargets(scope, targets);
    const centerX = window.innerWidth * 0.5;
    const centerY = window.innerHeight * 0.52;
    targets.forEach((target, index) => {
      const rect = target.getBoundingClientRect();
      const dx = centerX - (rect.left + rect.width * 0.5) + randomBetween(-16, 16);
      const dy = centerY - (rect.top + rect.height * 0.5) + randomBetween(-16, 16);
      const rotate = randomBetween(-14, 14);
      scope.animate(
        target,
        [
          { transform: "translate(0px, 0px) rotate(0deg) scale(1)", opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${rotate}deg) scale(${randomBetween(0.92, 1.06)})`, opacity: randomBetween(0.76, 1) },
        ],
        {
          duration: 900 + index * 26,
          delay: index * 26,
          easing: "cubic-bezier(0.2, 0.82, 0.2, 1)",
          fill: "forwards",
        }
      );
    });
  }

  function orbitCards(scope) {
    const targets = cardTargets(14);
    if (!targets.length) {
      fallbackPage(scope);
      return;
    }

    animateTargets(
      scope,
      targets,
      (_, index) => {
        const radius = 30 + index * 6;
        return [
          { transform: `translate(${radius}px, 0px) rotate(0deg)` },
          { transform: `translate(0px, ${radius}px) rotate(90deg)` },
          { transform: `translate(${-radius}px, 0px) rotate(180deg)` },
          { transform: `translate(0px, ${-radius}px) rotate(270deg)` },
          { transform: `translate(${radius}px, 0px) rotate(360deg)` },
        ];
      },
      (_, index) => ({
        duration: 2400 + index * 140,
        iterations: Infinity,
        easing: "linear",
      })
    );
  }

  function textColorWave(scope, mode) {
    const targets = textTargets(28);
    if (!targets.length) {
      fallbackPage(scope);
      return;
    }

    prepTargets(scope, targets);
    targets.forEach((target, index) => {
      let keyframes;
      if (mode === "rainbow") {
        keyframes = [
          { color: "#ff4d6d", textShadow: "0 0 0 rgba(255, 77, 109, 0)", filter: "none" },
          { color: "#ffd166", textShadow: "0 0 12px rgba(255, 209, 102, 0.7)", filter: "brightness(1.1)" },
          { color: "#06d6a0", textShadow: "0 0 12px rgba(6, 214, 160, 0.7)", filter: "brightness(1.15)" },
          { color: "#4dabf7", textShadow: "0 0 12px rgba(77, 171, 247, 0.72)", filter: "brightness(1.1)" },
          { color: "#d66efd", textShadow: "0 0 12px rgba(214, 110, 253, 0.72)", filter: "brightness(1.14)" },
        ];
      } else {
        keyframes = [
          { textShadow: "0 0 0 rgba(255,255,255,0)", filter: "brightness(1)", color: "inherit" },
          { textShadow: "0 0 18px rgba(255, 255, 255, 0.95), 0 0 28px rgba(255, 0, 160, 0.45)", filter: "brightness(1.2)", color: "#fff7f2" },
          { textShadow: "0 0 14px rgba(0, 204, 255, 0.8), 0 0 26px rgba(0, 204, 255, 0.3)", filter: "brightness(1.14)", color: "#f2fcff" },
        ];
      }

      scope.animate(target, keyframes, {
        duration: 1800 + randomBetween(0, 1200),
        delay: index * 45,
        iterations: Infinity,
        direction: "alternate",
        easing: "ease-in-out",
      });
    });
  }

  function jitterText(scope) {
    const targets = textTargets(28);
    if (!targets.length) {
      fallbackPage(scope);
      return;
    }

    animateTargets(
      scope,
      targets,
      () => [
        { transform: "translate(0px, 0px) rotate(0deg)" },
        { transform: `translate(${randomBetween(-4, 4)}px, ${randomBetween(-4, 4)}px) rotate(${randomBetween(-3, 3)}deg)` },
        { transform: `translate(${randomBetween(-4, 4)}px, ${randomBetween(-4, 4)}px) rotate(${randomBetween(-3, 3)}deg)` },
        { transform: "translate(0px, 0px) rotate(0deg)" },
      ],
      () => ({
        duration: 240,
        iterations: Infinity,
        easing: "steps(2, end)",
      })
    );
  }

  function waveText(scope) {
    const targets = textTargets(28);
    if (!targets.length) {
      fallbackPage(scope);
      return;
    }

    animateTargets(
      scope,
      targets,
      () => {
        const lift = randomBetween(-22, -8);
        return [
          { transform: "translateY(0px)", offset: 0 },
          { transform: `translateY(${lift}px)`, offset: 0.5 },
          { transform: "translateY(0px)", offset: 1 },
        ];
      },
      (_, index) => ({
        duration: 1200 + randomBetween(0, 800),
        delay: index * 55,
        iterations: Infinity,
        easing: "ease-in-out",
      })
    );
  }

  function stretchText(scope) {
    const targets = textTargets(24);
    if (!targets.length) {
      fallbackPage(scope);
      return;
    }

    prepTargets(scope, targets);
    targets.forEach((target, index) => {
      scope.animate(
        target,
        [
          { transform: "scaleX(1)", letterSpacing: "0px" },
          { transform: `scaleX(${randomBetween(1.08, 1.28)})`, letterSpacing: `${randomBetween(1, 5)}px` },
          { transform: "scaleX(1)", letterSpacing: "0px" },
        ],
        {
          duration: 1500 + randomBetween(0, 1000),
          delay: index * 40,
          iterations: Infinity,
          easing: "ease-in-out",
        }
      );
    });
  }

  function scrambleText(scope) {
    const targets = textTargets(18);
    if (!targets.length) {
      fallbackPage(scope);
      return;
    }

    const originals = new Map();
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%!?@";
    targets.forEach((target) => {
      originals.set(target, target.textContent || "");
    });

    scope.interval(() => {
      targets.forEach((target) => {
        const original = originals.get(target) || "";
        const scrambled = original
          .split("")
          .map((character) => {
            if (character === " ") {
              return " ";
            }
            if (Math.random() < 0.3) {
              return character;
            }
            return charset[Math.floor(Math.random() * charset.length)];
          })
          .join("");
        target.textContent = scrambled;
      });
    }, 90);

    scope.add(() => {
      originals.forEach((value, target) => {
        target.textContent = value;
      });
    });
  }

  function flipText(scope) {
    const targets = textTargets(24);
    if (!targets.length) {
      fallbackPage(scope);
      return;
    }

    animateTargets(
      scope,
      targets,
      () => [
        { transform: "rotateX(0deg) rotateY(0deg)", filter: "none" },
        { transform: `rotateX(${randomBetween(180, 360)}deg) rotateY(${randomBetween(-40, 40)}deg)`, filter: "brightness(1.18)" },
      ],
      (_, index) => ({
        duration: 1400 + randomBetween(0, 900),
        delay: index * 35,
        iterations: Infinity,
        direction: "alternate",
        easing: "ease-in-out",
      })
    );
  }

  function ghostText(scope) {
    const targets = textTargets(24);
    if (!targets.length) {
      fallbackPage(scope);
      return;
    }

    prepTargets(scope, targets);
    targets.forEach((target, index) => {
      scope.animate(
        target,
        [
          { textShadow: "0 0 0 rgba(255,255,255,0)", opacity: 1 },
          { textShadow: "-6px 0 0 rgba(255,0,120,0.45), 6px 0 0 rgba(0,200,255,0.45)", opacity: 0.92 },
          { textShadow: "-10px 0 0 rgba(255,0,120,0.2), 10px 0 0 rgba(0,200,255,0.2)", opacity: 0.74 },
          { textShadow: "0 0 0 rgba(255,255,255,0)", opacity: 1 },
        ],
        {
          duration: 1700 + randomBetween(0, 1100),
          delay: index * 50,
          iterations: Infinity,
          easing: "ease-in-out",
        }
      );
    });
  }

  function overlayScanlines(scope) {
    const lines = scope.overlay({
      opacity: "0.36",
      backgroundImage: "repeating-linear-gradient(180deg, rgba(255,255,255,0.16) 0px, rgba(255,255,255,0.16) 2px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 9px)",
      mixBlendMode: "screen",
    });
    scope.animate(lines, [{ transform: "translateY(0px)" }, { transform: "translateY(22px)" }], {
      duration: 260,
      iterations: Infinity,
      easing: "linear",
    });
  }

  function overlayPrism(scope) {
    const prism = scope.overlay({
      opacity: "0.44",
      background: "conic-gradient(from 0deg at 50% 50%, rgba(255,0,153,0.28), rgba(255,196,0,0.22), rgba(0,204,255,0.28), rgba(108,92,231,0.24), rgba(255,0,153,0.28))",
      mixBlendMode: "screen",
      filter: "blur(18px)",
      transform: "scale(1.2)",
    });
    scope.animate(prism, [{ transform: "scale(1.15) rotate(0deg)" }, { transform: "scale(1.28) rotate(360deg)" }], {
      duration: 6200,
      iterations: Infinity,
      easing: "linear",
    });
  }

  function overlaySpotlight(scope) {
    const spotlight = scope.overlay({
      background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 18%, rgba(0,0,0,0.45) 46%, rgba(0,0,0,0.72) 100%)",
      mixBlendMode: "multiply",
    });
    scope.animate(
      spotlight,
      [
        { transform: "translate(-18%, -10%) scale(1.15)" },
        { transform: "translate(16%, 6%) scale(1.08)" },
        { transform: "translate(8%, 18%) scale(1.22)" },
        { transform: "translate(-12%, -4%) scale(1.12)" },
      ],
      {
        duration: 5600,
        iterations: Infinity,
        direction: "alternate",
        easing: "ease-in-out",
      }
    );
  }

  function overlayStatic(scope) {
    const noise = scope.overlay({
      opacity: "0.22",
      backgroundImage: [
        "repeating-linear-gradient(0deg, rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)",
        "repeating-linear-gradient(90deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)",
      ].join(","),
      mixBlendMode: "overlay",
    });

    scope.interval(() => {
      noise.style.opacity = `${randomBetween(0.12, 0.28)}`;
      noise.style.transform = `translate(${randomBetween(-12, 12)}px, ${randomBetween(-12, 12)}px)`;
    }, 90);
  }

  const effects = [
    (scope) => animatePage(scope, [
      { filter: "hue-rotate(0deg) saturate(1.1) brightness(1)", transform: "scale(1)" },
      { filter: "hue-rotate(180deg) saturate(2.4) brightness(1.12)", transform: "scale(1.02)" },
      { filter: "hue-rotate(360deg) saturate(1.2) brightness(1)", transform: "scale(1)" },
    ], { duration: 2600, easing: "linear", direction: "normal" }),
    (scope) => animatePage(scope, [
      { filter: "invert(0) contrast(1)" },
      { filter: "invert(1) contrast(1.8) saturate(1.6)" },
      { filter: "invert(0) contrast(1.1)" },
    ], { duration: 900, easing: "steps(2, end)" }),
    (scope) => animatePage(scope, [
      { filter: "grayscale(0) contrast(1) brightness(1)", transform: "scale(1)" },
      { filter: "grayscale(1) contrast(1.9) brightness(1.08)", transform: "scale(1.06)" },
      { filter: "grayscale(0.4) contrast(1.4) brightness(0.98)", transform: "scale(0.98)" },
    ], { duration: 2400 }),
    (scope) => animatePage(scope, [
      { filter: "blur(0px) saturate(1) contrast(1)" },
      { filter: "blur(5px) saturate(1.8) contrast(1.4)", transform: "translateY(-8px) scale(1.02)" },
      { filter: "blur(1px) saturate(1.1) contrast(1.05)", transform: "translateY(0px) scale(1)" },
    ], { duration: 2100 }),
    (scope) => animatePage(scope, [
      { transform: "perspective(1300px) rotateX(0deg)" },
      { transform: "perspective(1300px) rotateX(180deg)" },
      { transform: "perspective(1300px) rotateX(360deg)" },
    ], { duration: 3200, easing: "ease-in-out", direction: "normal" }),
    (scope) => animatePage(scope, [
      { transform: "perspective(1300px) rotateY(0deg)" },
      { transform: "perspective(1300px) rotateY(180deg)" },
      { transform: "perspective(1300px) rotateY(360deg)" },
    ], { duration: 3200, easing: "ease-in-out", direction: "normal" }),
    (scope) => animatePage(scope, [
      { transform: "rotate(0deg) scale(1)" },
      { transform: "rotate(180deg) scale(0.94)" },
      { transform: "rotate(360deg) scale(1)" },
    ], { duration: 3600, easing: "linear", direction: "normal" }),
    (scope) => animatePage(scope, [
      { transform: "translate(0px, 0px) rotate(0deg)" },
      { transform: "translate(-18px, 8px) rotate(-3deg)" },
      { transform: "translate(14px, -10px) rotate(3deg)" },
      { transform: "translate(0px, 0px) rotate(0deg)" },
    ], { duration: 1100, easing: "ease-in-out", direction: "normal" }),
    (scope) => animatePage(scope, [
      { transform: "perspective(1200px) rotateY(0deg) rotateX(0deg)" },
      { transform: "perspective(1200px) rotateY(-24deg) rotateX(6deg) translateX(-18px)" },
      { transform: "perspective(1200px) rotateY(-10deg) rotateX(3deg) translateX(-8px)" },
    ], { duration: 2200 }),
    (scope) => animatePage(scope, [
      { transform: "perspective(1200px) rotateY(0deg) rotateX(0deg)" },
      { transform: "perspective(1200px) rotateY(24deg) rotateX(-6deg) translateX(18px)" },
      { transform: "perspective(1200px) rotateY(10deg) rotateX(-2deg) translateX(8px)" },
    ], { duration: 2200 }),
    (scope) => animatePage(scope, [
      { transform: "scaleY(1) scaleX(1)" },
      { transform: "scaleY(0.72) scaleX(1.02)" },
      { transform: "scaleY(1.1) scaleX(0.96)" },
      { transform: "scaleY(1) scaleX(1)" },
    ], { duration: 1600, direction: "normal" }),
    (scope) => animatePage(scope, [
      { transform: "scale(1)" },
      { transform: "scale(1.12)" },
      { transform: "scale(0.92)" },
      { transform: "scale(1)" },
    ], { duration: 1800, direction: "normal" }),
    (scope) => animatePage(scope, [
      { transform: "scaleX(1) rotate(0deg)" },
      { transform: "scaleX(-1) rotate(0deg)" },
      { transform: "scaleX(1) rotate(0deg)" },
    ], { duration: 2400, easing: "steps(2, end)", direction: "normal" }),
    (scope) => animatePage(scope, [
      { transform: "translate(0px, 0px)", filter: "none" },
      { transform: "translate(-10px, 6px)", filter: "contrast(1.18) saturate(1.24)" },
      { transform: "translate(8px, -8px)", filter: "contrast(1.22) saturate(1.3)" },
      { transform: "translate(0px, 0px)", filter: "none" },
    ], { duration: 180, easing: "steps(2, end)", direction: "normal" }),
    (scope) => animatePage(scope, [
      { filter: "sepia(0) saturate(1) hue-rotate(0deg)", transform: "scale(1)" },
      { filter: "sepia(0.7) saturate(1.9) hue-rotate(-20deg)", transform: "scale(1.04)" },
      { filter: "sepia(0.25) saturate(1.2) hue-rotate(8deg)", transform: "scale(1)" },
    ], { duration: 2600 }),
    (scope) => animatePage(scope, [
      { transform: "rotate(0deg) skew(0deg, 0deg)", filter: "contrast(1) saturate(1)" },
      { transform: "rotate(2deg) skew(8deg, -5deg)", filter: "contrast(1.2) saturate(1.6)" },
      { transform: "rotate(-2deg) skew(-8deg, 5deg)", filter: "contrast(1.1) saturate(1.4)" },
      { transform: "rotate(0deg) skew(0deg, 0deg)", filter: "contrast(1) saturate(1)" },
    ], { duration: 1900, direction: "normal" }),
    (scope) => scatterCards(scope, 60, 18),
    (scope) => scatterCards(scope, 140, 36),
    (scope) => fanCards(scope, 1),
    (scope) => fanCards(scope, -1),
    (scope) => driftCards(scope, -1),
    (scope) => driftCards(scope, 1),
    spinCards,
    bounceCards,
    shiverCards,
    splitSlideCards,
    stackCards,
    orbitCards,
    (scope) => textColorWave(scope, "rainbow"),
    (scope) => textColorWave(scope, "glow"),
    jitterText,
    waveText,
    stretchText,
    scrambleText,
    flipText,
    ghostText,
    overlayScanlines,
    overlayPrism,
    overlaySpotlight,
    overlayStatic,
  ];

  function refillBag() {
    effectBag = shuffle(effects);
  }

  function nextEffect() {
    if (!effectBag.length) {
      refillBag();
    }
    return effectBag.pop();
  }

  function disposeEffect(record) {
    if (!record || record.done) {
      return;
    }

    record.done = true;
    window.clearTimeout(record.timer);
    try {
      record.cleanup();
    } catch (error) {
      console.error("Chaos effect cleanup failed:", error);
    }
    activeEffects = activeEffects.filter((effectRecord) => effectRecord !== record);
  }

  function runNextEffect() {
    if (destroyed) {
      return;
    }

    while (activeEffects.length >= maxConcurrentEffects) {
      disposeEffect(activeEffects[0]);
    }

    const scope = createScope();
    const effect = nextEffect();
    try {
      effect(scope);
      const record = {
        cleanup: () => scope.cleanup(),
        done: false,
        timer: 0,
      };
      record.timer = window.setTimeout(() => disposeEffect(record), effectDuration);
      activeEffects.push(record);
    } catch (error) {
      console.error("Chaos effect failed:", error);
      scope.cleanup();
    }

    cycleTimer = window.setTimeout(runNextEffect, cycleInterval);
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
    window.clearTimeout(cycleTimer);
    const records = activeEffects.slice();
    activeEffects = [];
    records.forEach((record) => disposeEffect(record));
    root.remove();
    delete window[instanceKey];
  }

  window.addEventListener("keydown", handleKeyDown, true);
  window[instanceKey] = { cleanup };
  runNextEffect();
})();