(() => {
  const instanceKey = "__milkBrowserPasteScript";
  if (window[instanceKey]?.cleanup) {
    window[instanceKey].cleanup();
  }

  const matterUrl = "https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js";
  const stdDeviation = [8, 10];
  const colorMatrix = ["15 -3", "30 -5"];
  const uid = Math.random().toString(36).slice(2);
  const filterId = `milk-gooey-${uid}`;

  const root = document.createElement("div");
  Object.assign(root.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    overflow: "hidden",
    pointerEvents: "none",
    background: "radial-gradient(circle at 12% 8%, rgba(255, 173, 66, 0.24), rgba(255, 173, 66, 0) 42%)",
  });

  const style = document.createElement("style");
  style.textContent = `
    .milk-paste-header-${uid} {
      position: absolute;
      right: 0;
      top: 1.2rem;
      writing-mode: vertical-rl;
      text-orientation: sideways;
      font-family: Impact, Haettenschweiler, "Arial Black", sans-serif;
      font-size: min(20vh, 220px);
      line-height: 0.8;
      letter-spacing: 0.04em;
      color: rgba(255, 192, 120, 0.7);
      user-select: none;
    }

    .milk-paste-canvas-${uid} {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .milk-paste-carton-${uid},
    .milk-paste-glass-${uid} {
      position: absolute;
      pointer-events: none;
      user-select: none;
      -webkit-user-drag: none;
    }

    .milk-paste-carton-${uid} {
      left: 0;
      top: 5px;
      width: 150px;
      transform: translate(-20px, 0);
      z-index: 0;
    }

    .milk-paste-glass-${uid} {
      left: 0;
      top: 0;
      width: 250px;
      z-index: 2;
      transform: translate(-9999px, -9999px);
    }
  `;

  const header = document.createElement("div");
  header.className = `milk-paste-header-${uid}`;
  header.textContent = "OJ";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.setAttribute("aria-hidden", "true");
  svg.style.position = "absolute";
  svg.style.width = "0";
  svg.style.height = "0";
  svg.innerHTML = `
    <defs>
      <filter id="${filterId}" height="130%" x="-15%" y="-15%" width="130%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"></feGaussianBlur>
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 30 -5" result="goo"></feColorMatrix>
      </filter>
    </defs>
  `;

  const blurNode = svg.querySelector("feGaussianBlur");
  const colorNode = svg.querySelector("feColorMatrix");

  const canvas = document.createElement("canvas");
  canvas.className = `milk-paste-canvas-${uid}`;
  canvas.style.filter = `url(#${filterId})`;

  const carton = document.createElement("img");
  carton.className = `milk-paste-carton-${uid}`;
  carton.alt = "";
  carton.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 220">
      <defs>
        <linearGradient id="cartonBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fffdf8"/>
          <stop offset="100%" stop-color="#dff3ff"/>
        </linearGradient>
        <linearGradient id="cartonPanel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8ec5ff"/>
          <stop offset="100%" stop-color="#5ca2ea"/>
        </linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#2f5d7e" flood-opacity="0.25"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path d="M30 28 L92 10 L124 42 L124 196 Q124 206 114 206 L38 206 Q28 206 28 196 Z" fill="url(#cartonBody)" stroke="#79add6" stroke-width="3"/>
        <path d="M92 10 L92 54 L124 42" fill="#d0e9ff" stroke="#79add6" stroke-width="3"/>
        <path d="M28 72 H124 V168 H28 Z" fill="url(#cartonPanel)" opacity="0.95"/>
        <circle cx="76" cy="118" r="26" fill="#ffffff" opacity="0.9"/>
        <path d="M55 125 Q76 84 97 125 Q76 152 55 125 Z" fill="#77c4ff"/>
        <text x="76" y="58" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="18" fill="#5ca2ea">MILK</text>
        <text x="76" y="184" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#5a7f9f">fresh</text>
      </g>
    </svg>
  `)}`;

  const glass = document.createElement("img");
  glass.className = `milk-paste-glass-${uid}`;
  glass.alt = "";
  glass.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250">
      <defs>
        <linearGradient id="glassFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#9fd8ff" stop-opacity="0.12"/>
        </linearGradient>
        <filter id="glassShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#1d4f7d" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#glassShadow)">
        <path d="M68 36 L92 204 Q125 223 158 204 L182 36" fill="url(#glassFill)"/>
        <path d="M68 36 L92 204 Q125 223 158 204 L182 36" fill="none" stroke="#f7fdff" stroke-opacity="0.92" stroke-width="6" stroke-linejoin="round"/>
        <path d="M61 38 Q125 24 189 38" fill="none" stroke="#f7fdff" stroke-opacity="0.96" stroke-width="8" stroke-linecap="round"/>
        <path d="M99 58 L116 190" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="5" stroke-linecap="round"/>
      </g>
    </svg>
  `)}`;

  carton.style.display = "none";
  glass.style.display = "none";

  root.append(style, header, canvas, svg);
  document.documentElement.appendChild(root);

  let destroyed = false;
  let MatterLib = null;
  let engine = null;
  let render = null;
  let runner = null;
  let width = Math.max(1, window.innerWidth);
  let height = Math.max(1, window.innerHeight);
  let pointerX = width * 0.5;
  let pointerY = height * 0.5;
  let droplets = [];
  let bounds = [];
  const attractionStrength = 0.0054;
  const attractionDeadzone = 18;

  function updateFilter() {
    const index = width < 600 ? 0 : 1;
    blurNode.setAttribute("stdDeviation", stdDeviation[index]);
    colorNode.setAttribute(
      "values",
      `1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 ${colorMatrix[index]}`
    );
  }

  function resizeCanvas() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    updateFilter();

    if (render && MatterLib) {
      MatterLib.Render.setSize(render, width, height);
      render.options.width = width;
      render.options.height = height;
    }

    if (MatterLib && engine) {
      rebuildBounds();
    }
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function rebuildBounds() {
    const { Bodies, Composite } = MatterLib;
    const thickness = 120;

    if (bounds.length) {
      Composite.remove(engine.world, bounds);
      bounds = [];
    }

    bounds = [
      Bodies.rectangle(width * 0.5, -thickness * 0.5, width + thickness * 2, thickness, {
        isStatic: true,
        render: { visible: false },
      }),
      Bodies.rectangle(width * 0.5, height + thickness * 0.5, width + thickness * 2, thickness, {
        isStatic: true,
        render: { visible: false },
      }),
      Bodies.rectangle(-thickness * 0.5, height * 0.5, thickness, height + thickness * 2, {
        isStatic: true,
        render: { visible: false },
      }),
      Bodies.rectangle(width + thickness * 0.5, height * 0.5, thickness, height + thickness * 2, {
        isStatic: true,
        render: { visible: false },
      }),
    ];

    Composite.add(engine.world, bounds);
  }

  function createInitialMilk() {
    if (!MatterLib || !engine || droplets.length) {
      return;
    }

    const { Bodies, Composite, Body } = MatterLib;
    const blobCount = Math.max(140, Math.floor((width * height) / 8500));

    for (let index = 0; index < blobCount; index += 1) {
      const body = Bodies.circle(
        randomBetween(36, width - 36),
        randomBetween(36, height - 36),
        randomBetween(10, 18),
        {
          friction: 0,
          density: 0.0012,
          frictionAir: 0.035,
          restitution: 0.25,
          inertia: Infinity,
          render: { fillStyle: "#ff9f1c" },
        }
      );

      Body.setVelocity(body, {
        x: randomBetween(-1.2, 1.2),
        y: randomBetween(-1.2, 1.2),
      });
      Composite.add(engine.world, body);
      droplets.push(body);
    }
  }

  function applyAttraction() {
    if (!MatterLib || !engine) {
      return;
    }

    const { Body } = MatterLib;
    const attractionRadius = Math.hypot(width, height);
    for (let index = 0; index < droplets.length; index += 1) {
      const droplet = droplets[index];
      const dx = pointerX - droplet.position.x;
      const dy = pointerY - droplet.position.y;
      const distanceSq = dx * dx + dy * dy;
      const distance = Math.sqrt(distanceSq);

      if (!distance) {
        continue;
      }

      if (distance < attractionDeadzone) {
        Body.setVelocity(droplet, {
          x: droplet.velocity.x * 0.72,
          y: droplet.velocity.y * 0.72,
        });
        continue;
      }

      const normalizedX = dx / distance;
      const normalizedY = dy / distance;
      const distanceFactor = Math.max(0.2, Math.min(distance / attractionRadius, 1));
      const force = attractionStrength * distanceFactor * droplet.mass;

      Body.applyForce(droplet, droplet.position, {
        x: normalizedX * force,
        y: normalizedY * force,
      });
    }
  }

  function pruneDroplets() {
    if (!MatterLib || !engine) {
      return;
    }

    const { Body } = MatterLib;
    for (let index = 0; index < droplets.length; index += 1) {
      const droplet = droplets[index];
      const clampedX = Math.max(24, Math.min(width - 24, droplet.position.x));
      const clampedY = Math.max(24, Math.min(height - 24, droplet.position.y));

      if (clampedX !== droplet.position.x || clampedY !== droplet.position.y) {
        Body.setPosition(droplet, { x: clampedX, y: clampedY });
      }
    }
  }

  function handleBeforeUpdate() {
    applyAttraction();
    pruneDroplets();
  }

  function handlePointerMove(event) {
    pointerX = event.clientX;
    pointerY = event.clientY;
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      cleanup();
    }
  }

  function loadMatter() {
    if (window.Matter) {
      return Promise.resolve(window.Matter);
    }

    if (window.__milkMatterLoadPromise) {
      return window.__milkMatterLoadPromise;
    }

    window.__milkMatterLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = matterUrl;
      script.async = true;
      script.onload = () => {
        if (window.Matter) {
          resolve(window.Matter);
        } else {
          reject(new Error("Matter.js loaded without creating window.Matter"));
        }
      };
      script.onerror = () => reject(new Error("Failed to load Matter.js"));
      document.head.appendChild(script);
    });

    return window.__milkMatterLoadPromise;
  }

  async function init() {
    try {
      MatterLib = await loadMatter();
      if (destroyed) {
        return;
      }

      const { Engine, Render, Runner, Events } = MatterLib;
      engine = Engine.create({
        constraintIterations: 10,
        positionIterations: 10,
      });
      engine.gravity.y = 0.65;

      render = Render.create({
        canvas,
        engine,
        options: {
          width,
          height,
          wireframes: false,
          background: "transparent",
          pixelRatio: 1,
        },
      });

      runner = Runner.create();
      Render.run(render);
      Runner.run(runner, engine);

      rebuildBounds();
      createInitialMilk();
      Events.on(engine, "beforeUpdate", handleBeforeUpdate);
    } catch (error) {
      console.error("Milk.js paste script failed to initialize:", error);
      cleanup();
    }
  }

  function cleanup() {
    if (destroyed) {
      return;
    }
    destroyed = true;

    window.removeEventListener("resize", resizeCanvas);
    window.removeEventListener("pointermove", handlePointerMove, true);
    window.removeEventListener("keydown", handleKeyDown, true);

    if (MatterLib && engine) {
      MatterLib.Events.off(engine, "beforeUpdate", handleBeforeUpdate);
    }

    if (bounds.length && MatterLib && engine) {
      MatterLib.Composite.remove(engine.world, bounds);
      bounds = [];
    }

    if (runner && MatterLib) {
      MatterLib.Runner.stop(runner);
    }

    if (render && MatterLib) {
      MatterLib.Render.stop(render);
      if (render.canvas?.getContext) {
        const context = render.canvas.getContext("2d");
        context?.clearRect(0, 0, render.canvas.width, render.canvas.height);
      }
      render.canvas = null;
      render.context = null;
      render.textures = {};
    }

    if (engine && MatterLib) {
      MatterLib.Composite.clear(engine.world, false, true);
      MatterLib.Engine.clear(engine);
    }

    droplets = [];
    root.remove();
    delete window[instanceKey];
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pointermove", handlePointerMove, true);
  window.addEventListener("keydown", handleKeyDown, true);
  window[instanceKey] = { cleanup };
  init();
})();