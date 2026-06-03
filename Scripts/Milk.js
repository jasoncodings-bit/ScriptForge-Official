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
    background: "radial-gradient(circle at 12% 8%, rgba(195, 230, 228, 0.18), rgba(195, 230, 228, 0) 40%)",
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
      color: rgba(255, 255, 255, 0.5);
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
  header.textContent = "MILK";

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

  root.append(style, header, carton, canvas, glass, svg);
  document.documentElement.appendChild(root);

  let destroyed = false;
  let MatterLib = null;
  let engine = null;
  let render = null;
  let runner = null;
  let width = Math.max(1, window.innerWidth);
  let height = Math.max(1, window.innerHeight);
  let pointerX = width * 0.5 + 70;
  let pointerY = height * 0.8;
  let targetGlassX = width * 0.5;
  let targetGlassY = height * 0.8;
  let spawnAccumulator = 0;
  let droplets = [];
  let glassBodies = null;

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

    if (glassBodies) {
      targetGlassX = width * 0.5;
      targetGlassY = height * 0.8;
      glassBodies.setPosition({ x: targetGlassX, y: targetGlassY });
    }
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createGlassBodies() {
    const { Bodies, Composite, Body } = MatterLib;
    const thickness = 25;
    const cx = width * 0.5;
    const cy = height * 0.8;
    const left = Bodies.rectangle(cx - 60, cy, thickness, 150, {
      chamfer: { radius: 10 },
      isStatic: true,
      angle: (-15 * Math.PI) / 180,
      render: { visible: false },
    });
    const right = Bodies.rectangle(cx + 37, cy, thickness, 150, {
      chamfer: { radius: 10 },
      isStatic: true,
      angle: (15 * Math.PI) / 180,
      render: { visible: false },
    });
    const bottom = Bodies.rectangle(cx - 10, cy + 72, 85, thickness * 2, {
      chamfer: { radius: 20 },
      isStatic: true,
      render: { visible: false },
    });

    Composite.add(engine.world, [left, right, bottom]);

    return {
      left,
      right,
      bottom,
      setPosition(position) {
        Body.setPosition(left, { x: position.x - 60, y: position.y });
        Body.setPosition(right, { x: position.x + 37, y: position.y });
        Body.setPosition(bottom, { x: position.x - 10, y: position.y + 72 });
        glass.style.transform = `translate(${position.x - 125}px, ${position.y - 125}px)`;
      },
      remove() {
        Composite.remove(engine.world, left);
        Composite.remove(engine.world, right);
        Composite.remove(engine.world, bottom);
      },
    };
  }

  function createLiquid() {
    if (!MatterLib || !engine || droplets.length > 500) {
      return;
    }

    const { Bodies, Composite, Body } = MatterLib;
    const body = Bodies.circle(105, 105, randomBetween(6, 7), {
      friction: 0,
      density: 1,
      frictionAir: 0,
      restitution: 0.7,
      render: { fillStyle: "#ffffff" },
    });
    Body.setVelocity(body, { x: 2.9 + Math.random() * 0.6, y: -0.1 + Math.random() * 0.2 });
    Composite.add(engine.world, body);
    droplets.push(body);
  }

  function pruneDroplets() {
    if (!MatterLib || !engine) {
      return;
    }

    const { Composite } = MatterLib;
    for (let index = droplets.length - 1; index >= 0; index -= 1) {
      const droplet = droplets[index];
      if (
        droplet.position.y - droplet.circleRadius > height + 80 ||
        droplet.position.x - droplet.circleRadius > width + 80 ||
        droplet.position.x + droplet.circleRadius < -80
      ) {
        Composite.remove(engine.world, droplet);
        droplets.splice(index, 1);
      }
    }
  }

  function handleBeforeUpdate(event) {
    spawnAccumulator += event.delta;
    while (spawnAccumulator >= 18) {
      createLiquid();
      spawnAccumulator -= 18;
    }

    if (glassBodies) {
      const nextX = Math.max(140, Math.min(width - 40, pointerX - 70));
      const nextY = Math.max(120, Math.min(height - 90, pointerY));
      targetGlassX += (nextX - targetGlassX) * 0.24;
      targetGlassY += (nextY - targetGlassY) * 0.24;
      glassBodies.setPosition({ x: targetGlassX, y: targetGlassY });
    }

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
      engine.gravity.y = 1;

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

      glassBodies = createGlassBodies();
      glassBodies.setPosition({ x: targetGlassX, y: targetGlassY });
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

    if (glassBodies) {
      glassBodies.remove();
      glassBodies = null;
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