(async function minecraftBlockSandbox() {
  const INSTANCE_KEY = "__minecraftBlockSandbox";
  const ROOT_ID = "minecraft-block-sandbox";
  const STYLE_ID = "minecraft-block-sandbox-style";
  const BASE_SIZE = 32;
  const DEFAULT_SCALE = 1.15;
  const MAX_BLOCKS = 320;
  const GROUND_HEIGHT = 18;
  const WALL_WIDTH = 40;
  const FLOOR_TILE_SIZE = 22;
  const BLOCK_DEFS = [
    { id: "stone", name: "Stone", src: "https://i.ibb.co/TS6BrXF/stone.jpg" },
    { id: "oak", name: "Oak", src: "https://i.ibb.co/gCHmZWm/oak.jpg" },
    { id: "sand", name: "Sand", src: "https://i.ibb.co/Vc4qssXR/sand.jpg" }
  ];
  const BRUSH_MODES = [
    { id: "single", name: "Single" },
    { id: "line", name: "Line" },
    { id: "stack", name: "Stack" }
  ];

  if (window[INSTANCE_KEY] && typeof window[INSTANCE_KEY].cleanup === "function") {
    window[INSTANCE_KEY].cleanup();
  }

  await ensureMatter();
  const { Engine, Runner, Bodies, Composite } = window.Matter;

  const [grassImg, ...loadedBlocks] = await Promise.all([
    loadImg("https://i.ibb.co/Gvxwwc6f/Grass.jpg"),
    ...BLOCK_DEFS.map((block) => loadImg(block.src))
  ]);
  const blockDefs = BLOCK_DEFS.map((block, index) => ({
    ...block,
    img: loadedBlocks[index]
  }));

  removeExistingUi();
  injectStyles();

  const engine = Engine.create({
    gravity: { x: 0, y: 0.76 }
  });
  engine.timing.timeScale = 0.9;
  const runner = Runner.create();
  const bodyMeta = new WeakMap();

  const root = document.createElement("div");
  root.id = ROOT_ID;
  root.innerHTML = [
    '<canvas class="mbs-canvas"></canvas>',
    '<div class="mbs-ui">',
    '  <button class="mbs-menu-toggle" type="button">Inventory</button>',
    '  <div class="mbs-panel">',
    '    <div class="mbs-panel-header">',
    '      <div>',
    '        <div class="mbs-panel-title">Inventory</div>',
    '        <div class="mbs-panel-subtitle">Pick a block, choose a brush, and build.</div>',
    '      </div>',
    '      <div class="mbs-panel-actions">',
    '        <button class="mbs-action" data-action="clear" type="button">Clear</button>',
    '      </div>',
    '    </div>',
    '    <div class="mbs-grid"></div>',
    '    <div class="mbs-brush-row"></div>',
    '    <label class="mbs-slider-wrap">',
    '      <span class="mbs-slider-label">Block Size <strong class="mbs-size-value">115%</strong></span>',
    '      <input class="mbs-size-slider" type="range" min="80" max="170" step="5" value="115" />',
    '    </label>',
    '    <div class="mbs-footer">Left click builds. Right click removes. G toggles inventory. B cycles brush mode. 1-3 select blocks. 0 selects random.</div>',
    '  </div>',
    '</div>'
  ].join("");
  document.body.appendChild(root);

  const canvas = root.querySelector(".mbs-canvas");
  const ctx = canvas.getContext("2d");
  const menuToggle = root.querySelector(".mbs-menu-toggle");
  const panel = root.querySelector(".mbs-panel");
  const panelSubtitle = root.querySelector(".mbs-panel-subtitle");
  const grid = root.querySelector(".mbs-grid");
  const brushRow = root.querySelector(".mbs-brush-row");
  const sizeSlider = root.querySelector(".mbs-size-slider");
  const sizeValue = root.querySelector(".mbs-size-value");

  const grassTile = createTextureTile(grassImg, FLOOR_TILE_SIZE);
  const groundPattern = ctx.createPattern(grassTile, "repeat");

  const state = {
    cleanup: () => {},
    animationFrame: 0,
    selectedBlockId: "random",
    brushMode: "single",
    spawnScale: DEFAULT_SCALE,
    dynamicBodies: [],
    pointer: {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.38
    },
    boundaries: [],
    menuOpen: false,
    keyHandler: null,
    resizeHandler: null,
    pointerMoveHandler: null,
    pointerDownHandler: null,
    contextMenuHandler: null
  };
  window[INSTANCE_KEY] = state;

  buildBlockGrid();
  buildBrushButtons();
  syncCanvasSize();
  rebuildBoundaries();
  Runner.run(runner, engine);
  render();
  updateUi();

  sizeSlider.addEventListener("input", () => {
    state.spawnScale = Number(sizeSlider.value) / 100;
    updateUi();
  });

  menuToggle.addEventListener("click", () => {
    setMenuOpen(!state.menuOpen);
  });

  panel.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      const action = actionButton.dataset.action;
      if (action === "clear") {
        clearBlocks();
      }
      return;
    }

    const blockButton = event.target.closest("[data-block-id]");
    if (blockButton) {
      state.selectedBlockId = blockButton.dataset.blockId || "random";
      updateUi();
      return;
    }

    const brushButton = event.target.closest("[data-brush-mode]");
    if (brushButton) {
      state.brushMode = brushButton.dataset.brushMode || "single";
      updateUi();
    }
  });

  state.pointerMoveHandler = (event) => {
    state.pointer.x = event.clientX;
    state.pointer.y = event.clientY;
  };

  state.pointerDownHandler = (event) => {
    if (event.button === 0) {
      event.preventDefault();
      spawnFromPointer(event.clientX, event.clientY);
      return;
    }

    if (event.button === 2) {
      event.preventDefault();
      eraseNearest(event.clientX, event.clientY);
    }
  };

  state.contextMenuHandler = (event) => {
    event.preventDefault();
  };

  state.keyHandler = (event) => {
    const active = document.activeElement;
    const typing = active && (
      active.tagName === "INPUT" ||
      active.tagName === "TEXTAREA" ||
      active.isContentEditable
    );

    if ((event.key === "g" || event.key === "G") && !typing) {
      event.preventDefault();
      setMenuOpen(!state.menuOpen);
      return;
    }

    if (event.key === "Escape") {
      setMenuOpen(false);
      return;
    }

    if (typing) {
      return;
    }

    if (event.key === "0") {
      state.selectedBlockId = "random";
      updateUi();
      return;
    }

    if (event.key === "b" || event.key === "B") {
      cycleBrushMode();
      return;
    }

    const blockIndex = Number(event.key) - 1;
    if (blockIndex >= 0 && blockIndex < blockDefs.length) {
      state.selectedBlockId = blockDefs[blockIndex].id;
      updateUi();
    }
  };

  state.resizeHandler = () => {
    syncCanvasSize();
    rebuildBoundaries();
  };

  canvas.addEventListener("pointermove", state.pointerMoveHandler);
  canvas.addEventListener("pointerdown", state.pointerDownHandler);
  canvas.addEventListener("contextmenu", state.contextMenuHandler);
  window.addEventListener("keydown", state.keyHandler, true);
  window.addEventListener("resize", state.resizeHandler);

  state.cleanup = () => {
    cancelAnimationFrame(state.animationFrame);
    Runner.stop(runner);
    window.removeEventListener("keydown", state.keyHandler, true);
    window.removeEventListener("resize", state.resizeHandler);
    canvas.removeEventListener("pointermove", state.pointerMoveHandler);
    canvas.removeEventListener("pointerdown", state.pointerDownHandler);
    canvas.removeEventListener("contextmenu", state.contextMenuHandler);
    Composite.clear(engine.world, false);
    Engine.clear(engine);
    removeExistingUi();
    delete window[INSTANCE_KEY];
  };

  function buildBlockGrid() {
    grid.textContent = "";

    const randomCard = document.createElement("button");
    randomCard.type = "button";
    randomCard.className = "mbs-card";
    randomCard.dataset.blockId = "random";
    randomCard.innerHTML = [
      '<span class="mbs-preview mbs-random-preview">?</span>',
      '<span class="mbs-card-copy">',
      '  <strong>Random</strong>',
      '  <span>Cycles through every loaded block.</span>',
      '</span>'
    ].join("");
    grid.appendChild(randomCard);

    for (const block of blockDefs) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mbs-card";
      button.dataset.blockId = block.id;
      button.innerHTML = [
        `<span class="mbs-preview"><img src="${block.src}" alt="${block.name}" /></span>`,
        '<span class="mbs-card-copy">',
        `  <strong>${block.name}</strong>`,
        `  <span>${block.name} block texture.</span>`,
        '</span>'
      ].join("");
      grid.appendChild(button);
    }
  }

  function buildBrushButtons() {
    brushRow.textContent = "";
    for (const brush of BRUSH_MODES) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mbs-brush";
      button.dataset.brushMode = brush.id;
      button.textContent = brush.name;
      brushRow.appendChild(button);
    }
  }

  function updateUi() {
    const cards = grid.querySelectorAll("[data-block-id]");
    cards.forEach((card) => {
      card.classList.toggle("is-active", card.dataset.blockId === state.selectedBlockId);
    });

    const brushes = brushRow.querySelectorAll("[data-brush-mode]");
    brushes.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.brushMode === state.brushMode);
    });

    sizeValue.textContent = `${Math.round(state.spawnScale * 100)}%`;
    panelSubtitle.textContent = "Pick a block, choose a brush, and build.";
    menuToggle.textContent = state.menuOpen ? "Close Inventory" : "Inventory";
    menuToggle.classList.toggle("is-open", state.menuOpen);
  }

  function setMenuOpen(isOpen) {
    state.menuOpen = Boolean(isOpen);
    panel.classList.toggle("is-open", state.menuOpen);
    updateUi();
  }

  function cycleBrushMode() {
    const currentIndex = BRUSH_MODES.findIndex((brush) => brush.id === state.brushMode);
    const nextBrush = BRUSH_MODES[(currentIndex + 1) % BRUSH_MODES.length];
    state.brushMode = nextBrush.id;
    updateUi();
  }

  function syncCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function rebuildBoundaries() {
    if (state.boundaries.length) {
      Composite.remove(engine.world, state.boundaries);
    }

    const ground = Bodies.rectangle(
      canvas.width * 0.5,
      canvas.height - GROUND_HEIGHT * 0.5,
      canvas.width + WALL_WIDTH * 2,
      GROUND_HEIGHT,
      { isStatic: true }
    );
    const leftWall = Bodies.rectangle(
      -WALL_WIDTH * 0.5,
      canvas.height * 0.5,
      WALL_WIDTH,
      canvas.height,
      { isStatic: true }
    );
    const rightWall = Bodies.rectangle(
      canvas.width + WALL_WIDTH * 0.5,
      canvas.height * 0.5,
      WALL_WIDTH,
      canvas.height,
      { isStatic: true }
    );

    state.boundaries = [ground, leftWall, rightWall];
    Composite.add(engine.world, state.boundaries);
  }

  function getBlockSize() {
    return Math.round(BASE_SIZE * state.spawnScale);
  }

  function pickBlock() {
    if (state.selectedBlockId === "random") {
      return blockDefs[Math.floor(Math.random() * blockDefs.length)];
    }
    return blockDefs.find((block) => block.id === state.selectedBlockId) || blockDefs[0];
  }

  function spawnFromPointer(x, y) {
    const positions = getPlacementPoints(x, y);
    for (const position of positions) {
      spawnBlock(position.x, position.y);
    }
  }

  function getPlacementPoints(anchorX, anchorY) {
    const size = getBlockSize();
    const spacing = Math.max(20, Math.round(size * 0.9));
    const snappedX = snap(anchorX, spacing);
    const snappedY = snap(anchorY, spacing);

    if (state.brushMode === "line") {
      return [-1, 0, 1].map((offset) => ({ x: snappedX + offset * spacing, y: snappedY }));
    }

    if (state.brushMode === "stack") {
      return [0, 1, 2].map((offset) => ({ x: snappedX, y: snappedY - offset * spacing }));
    }

    return [{ x: snappedX, y: snappedY }];
  }

  function spawnBlock(x, y) {
    const block = pickBlock();
    const size = getBlockSize();
    const body = Bodies.rectangle(x, y, size, size, {
      restitution: 0.04,
      friction: 0.88,
      frictionAir: 0.035,
      angle: 0,
      chamfer: { radius: 4 }
    });

    bodyMeta.set(body, { block, size });
    state.dynamicBodies.push(body);
    Composite.add(engine.world, body);
    trimBlocks();
    updateUi();
  }

  function eraseNearest(x, y) {
    let closestBody = null;
    let closestDistance = Infinity;

    for (const body of state.dynamicBodies) {
      const dx = body.position.x - x;
      const dy = body.position.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const meta = bodyMeta.get(body);
      const radius = (meta?.size || getBlockSize()) * 0.8;
      if (distance < radius && distance < closestDistance) {
        closestDistance = distance;
        closestBody = body;
      }
    }

    if (!closestBody) {
      return;
    }

    Composite.remove(engine.world, closestBody);
    state.dynamicBodies = state.dynamicBodies.filter((body) => body !== closestBody);
    updateUi();
  }

  function clearBlocks() {
    for (const body of state.dynamicBodies) {
      Composite.remove(engine.world, body);
    }
    state.dynamicBodies = [];
    updateUi();
  }

  function trimBlocks() {
    while (state.dynamicBodies.length > MAX_BLOCKS) {
      const oldest = state.dynamicBodies.shift();
      Composite.remove(engine.world, oldest);
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSky();
    drawBoundaries();
    drawBlocks();
    drawPointerPreview();
    state.animationFrame = requestAnimationFrame(render);
  }

  function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(114, 192, 255, 0.1)");
    gradient.addColorStop(1, "rgba(14, 28, 42, 0.12)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    const gap = 40;
    for (let x = 0; x <= canvas.width; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBoundaries() {
    ctx.save();
    ctx.fillStyle = groundPattern || "rgba(112, 160, 80, 0.92)";
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
    ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, 1);
    ctx.restore();
  }

  function drawBlocks() {
    for (const body of state.dynamicBodies) {
      const meta = bodyMeta.get(body);
      if (!meta) {
        continue;
      }

      ctx.save();
      ctx.translate(body.position.x, body.position.y);
      ctx.rotate(body.angle);
      ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      ctx.drawImage(meta.block.img, -meta.size * 0.5, -meta.size * 0.5, meta.size, meta.size);
      ctx.restore();
    }
  }

  function drawPointerPreview() {
    const previewBlock = state.selectedBlockId === "random"
      ? blockDefs[Math.floor(performance.now() / 200) % blockDefs.length]
      : pickBlock();
    const points = getPlacementPoints(state.pointer.x, state.pointer.y);
    const size = getBlockSize();

    for (const point of points) {
      ctx.save();
      ctx.globalAlpha = 0.32;
      ctx.translate(point.x, point.y);
      ctx.drawImage(previewBlock.img, -size * 0.5, -size * 0.5, size, size);
      ctx.restore();
    }
  }

  function createTextureTile(image, tileSize) {
    const offscreen = document.createElement("canvas");
    offscreen.width = tileSize;
    offscreen.height = tileSize;
    const offscreenCtx = offscreen.getContext("2d");
    offscreenCtx.imageSmoothingEnabled = false;
    offscreenCtx.drawImage(image, 0, 0, tileSize, tileSize);
    return offscreen;
  }

  function snap(value, spacing) {
    return Math.round(value / spacing) * spacing;
  }

  function removeExistingUi() {
    const existingRoot = document.getElementById(ROOT_ID);
    if (existingRoot) {
      existingRoot.remove();
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
      #${ROOT_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        pointer-events: none;
        font-family: Verdana, sans-serif;
      }

      #${ROOT_ID},
      #${ROOT_ID} * {
        box-sizing: border-box;
      }

      #${ROOT_ID} .mbs-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: auto;
        touch-action: none;
      }

      #${ROOT_ID} .mbs-ui {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      #${ROOT_ID} .mbs-menu-toggle,
      #${ROOT_ID} .mbs-panel {
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(15, 20, 27, 0.82);
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.26);
        backdrop-filter: blur(12px);
      }

      #${ROOT_ID} .mbs-menu-toggle {
        position: absolute;
        left: 18px;
        top: 18px;
        pointer-events: auto;
        border-radius: 999px;
        color: #edf6ff;
        padding: 11px 15px;
        cursor: pointer;
      }

      #${ROOT_ID} .mbs-menu-toggle.is-open {
        border-color: rgba(110, 213, 119, 0.5);
        background: rgba(110, 213, 119, 0.18);
      }

      #${ROOT_ID} .mbs-panel {
        position: absolute;
        left: 18px;
        top: 64px;
        width: min(440px, calc(100vw - 36px));
        padding: 18px;
        border-radius: 18px;
        color: #edf6ff;
        opacity: 0;
        transform: translateY(-8px) scale(0.98);
        pointer-events: none;
        transition: opacity 150ms ease, transform 150ms ease;
      }

      #${ROOT_ID} .mbs-panel.is-open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      #${ROOT_ID} .mbs-panel-header {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
      }

      #${ROOT_ID} .mbs-panel-title {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 4px;
      }

      #${ROOT_ID} .mbs-panel-subtitle,
      #${ROOT_ID} .mbs-footer,
      #${ROOT_ID} .mbs-selected-meta,
      #${ROOT_ID} .mbs-card-copy span {
        font-size: 12px;
        line-height: 1.5;
        color: rgba(237, 246, 255, 0.72);
      }

      #${ROOT_ID} .mbs-panel-actions,
      #${ROOT_ID} .mbs-brush-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      #${ROOT_ID} .mbs-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 14px;
      }

      #${ROOT_ID} .mbs-card,
      #${ROOT_ID} .mbs-brush,
      #${ROOT_ID} .mbs-action,
      #${ROOT_ID} .mbs-slot {
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.06);
        color: #edf6ff;
      }

      #${ROOT_ID} .mbs-card {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px;
        border-radius: 14px;
        text-align: left;
        cursor: pointer;
      }

      #${ROOT_ID} .mbs-card.is-active,
      #${ROOT_ID} .mbs-brush.is-active,
      #${ROOT_ID} .mbs-slot.is-active {
        border-color: rgba(110, 213, 119, 0.94);
        background: rgba(110, 213, 119, 0.16);
        box-shadow: 0 0 0 1px rgba(110, 213, 119, 0.24) inset;
      }

      #${ROOT_ID} .mbs-preview,
      #${ROOT_ID} .mbs-slot-thumb {
        display: grid;
        place-items: center;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.08);
      }

      #${ROOT_ID} .mbs-preview {
        flex: 0 0 56px;
        width: 56px;
        height: 56px;
        border-radius: 12px;
      }

      #${ROOT_ID} .mbs-preview img,
      #${ROOT_ID} .mbs-slot-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        image-rendering: pixelated;
      }

      #${ROOT_ID} .mbs-random-preview,
      #${ROOT_ID} .mbs-slot-random {
        font-size: 28px;
        font-weight: 700;
      }

      #${ROOT_ID} .mbs-card-copy {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      #${ROOT_ID} .mbs-card-copy strong {
        font-size: 13px;
      }

      #${ROOT_ID} .mbs-brush,
      #${ROOT_ID} .mbs-action {
        border-radius: 999px;
        padding: 8px 12px;
        cursor: pointer;
      }

      #${ROOT_ID} .mbs-slider-wrap {
        display: block;
        margin-top: 16px;
      }

      #${ROOT_ID} .mbs-slider-label {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 12px;
        margin-bottom: 8px;
      }

      #${ROOT_ID} .mbs-size-slider {
        width: 100%;
      }

      #${ROOT_ID} .mbs-footer {
        margin-top: 14px;
      }

      @media (max-width: 860px) {
        #${ROOT_ID} .mbs-panel {
          width: calc(100vw - 24px);
          left: 12px;
          top: 58px;
        }

        #${ROOT_ID} .mbs-menu-toggle {
          left: 12px;
          top: 12px;
        }
      }

      @media (max-width: 620px) {
        #${ROOT_ID} .mbs-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  async function ensureMatter() {
    if (window.Matter) {
      return;
    }

    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Matter.js failed to load."));
      document.head.appendChild(script);
    });
  }

  function loadImg(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Image failed to load: ${src}`));
      img.src = src;
    });
  }
})();