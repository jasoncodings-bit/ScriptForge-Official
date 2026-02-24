(function () {
  if (window.__svPhysics) return;
  window.__svPhysics = true;

  var script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
  script.onload = function () {
    var Matter = window.Matter;
    var Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint,
      Composite = Matter.Composite;

    /* ── state ── */
    var W = window.innerWidth, H = window.innerHeight;
    var settings = {
      shape: 'random',      // 'rectangle','circle','polygon','triangle','random'
      minSize: 20,
      maxSize: 70,
      bounciness: 0.6,
      friction: 0.1,
      gravityY: 1,
      gravityX: 0,
      rainMode: false,
      rainInterval: null,
      rainSpeed: 120,       // ms between drops
      hasCeiling: false,
      explosionForce: 0.05
    };

    var colorSets = {
      neon:    ['#ff006e','#fb5607','#ffbe0b','#3a86ff','#8338ec','#06d6a0'],
      pastel:  ['#ffadad','#ffd6a5','#fdffb6','#caffbf','#9bf6ff','#bdb2ff','#ffc6ff'],
      cyber:   ['#0ff','#f0f','#ff0','#0f0','#f00','#00f'],
      sunset:  ['#264653','#2a9d8f','#e9c46a','#f4a261','#e76f51'],
      mono:    ['#eee','#ccc','#aaa','#888','#666']
    };
    var currentPalette = 'neon';
    var colors = colorSets[currentPalette];

    /* ── engine & render ── */
    var engine = Engine.create();
    engine.gravity.y = settings.gravityY;
    engine.gravity.x = settings.gravityX;

    var canvas = document.createElement('canvas');
    canvas.id = '__svPhysCanvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:auto;z-index:2147483646;';
    document.body.appendChild(canvas);

    var render = Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: W, height: H,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio || 1
      }
    });

    /* ── walls ── */
    var wallOpts = { isStatic: true, render: { visible: false } };
    var ground    = Bodies.rectangle(W / 2, H + 30, W * 2, 60, { isStatic: true, render: { fillStyle: '#58a6ff' } });
    var leftWall  = Bodies.rectangle(-30, H / 2, 60, H * 2, wallOpts);
    var rightWall = Bodies.rectangle(W + 30, H / 2, 60, H * 2, wallOpts);
    var ceiling   = Bodies.rectangle(W / 2, -30, W * 2, 60, wallOpts);
    World.add(engine.world, [ground, leftWall, rightWall]);

    /* ── mouse drag ── */
    var mouse = Mouse.create(canvas);
    var mc = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } }
    });
    World.add(engine.world, mc);
    render.mouse = mouse;

    /* ── helpers ── */
    function rnd(a, b) { return Math.random() * (b - a) + a; }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function spawnBody(x, y) {
      var size = rnd(settings.minSize, settings.maxSize);
      var col = pick(colors);
      var opts = {
        restitution: settings.bounciness,
        friction: settings.friction,
        angle: rnd(0, Math.PI * 2),
        render: {
          fillStyle: col,
          strokeStyle: col,
          lineWidth: 0
        }
      };
      var shape = settings.shape === 'random'
        ? pick(['rectangle', 'circle', 'polygon', 'triangle'])
        : settings.shape;
      var body;
      switch (shape) {
        case 'circle':
          body = Bodies.circle(x, y, size / 2, opts);
          break;
        case 'triangle':
          body = Bodies.polygon(x, y, 3, size / 2, opts);
          break;
        case 'polygon':
          body = Bodies.polygon(x, y, Math.floor(rnd(5, 9)), size / 2, opts);
          break;
        default:
          body = Bodies.rectangle(x, y, size, size, opts);
      }
      World.add(engine.world, body);
      return body;
    }

    function clearAll() {
      Composite.allBodies(engine.world).forEach(function (b) {
        if (!b.isStatic) World.remove(engine.world, b);
      });
    }

    function explode() {
      var f = settings.explosionForce;
      Composite.allBodies(engine.world).forEach(function (b) {
        if (!b.isStatic) {
          Body.applyForce(b, b.position, {
            x: (b.position.x - W / 2) * f,
            y: (b.position.y - H / 2) * f
          });
        }
      });
    }

    function implode() {
      Composite.allBodies(engine.world).forEach(function (b) {
        if (!b.isStatic) {
          Body.applyForce(b, b.position, {
            x: -(b.position.x - W / 2) * 0.02,
            y: -(b.position.y - H / 2) * 0.02
          });
        }
      });
    }

    function antigravity() {
      Composite.allBodies(engine.world).forEach(function (b) {
        if (!b.isStatic) {
          Body.applyForce(b, b.position, { x: 0, y: -0.05 });
        }
      });
    }

    function toggleRain() {
      settings.rainMode = !settings.rainMode;
      if (settings.rainMode) {
        settings.rainInterval = setInterval(function () {
          spawnBody(rnd(60, W - 60), -40);
        }, settings.rainSpeed);
      } else {
        clearInterval(settings.rainInterval);
        settings.rainInterval = null;
      }
      refreshUI();
    }

    function toggleCeiling() {
      settings.hasCeiling = !settings.hasCeiling;
      if (settings.hasCeiling) {
        World.add(engine.world, ceiling);
      } else {
        World.remove(engine.world, ceiling);
      }
      refreshUI();
    }

    function setGravityY(v) {
      settings.gravityY = v;
      engine.gravity.y = v;
    }

    /* ── click to spawn ── */
    canvas.addEventListener('click', function (e) {
      // ignore clicks on the UI panel
      if (e.target !== canvas) return;
      spawnBody(e.clientX, e.clientY);
    });

    /* ── keyboard shortcuts (still work) ── */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'c' || e.key === 'C') clearAll();
      if (e.key === 'e' || e.key === 'E') explode();
      if (e.key === 'r' || e.key === 'R') toggleRain();
      if (e.key === 'i' || e.key === 'I') implode();
    });

    /* ── resize ── */
    window.addEventListener('resize', function () {
      W = window.innerWidth; H = window.innerHeight;
      render.options.width = W; render.options.height = H;
      render.canvas.width = W; render.canvas.height = H;
      Body.setPosition(ground,    { x: W / 2, y: H + 30 });
      Body.setPosition(leftWall,  { x: -30,   y: H / 2 });
      Body.setPosition(rightWall, { x: W + 30, y: H / 2 });
      Body.setPosition(ceiling,   { x: W / 2,  y: -30 });
    });

    /* ═════════════════════════════════════════════
       ── UI PANEL (collapsible icon in corner) ──
       ═════════════════════════════════════════════ */
    var panelOpen = false;

    // --- Toggle button (always visible) ---
    var toggleBtn = document.createElement('div');
    toggleBtn.id = '__svPhysToggle';
    toggleBtn.innerHTML = '&#9881;'; // gear icon
    toggleBtn.title = 'Block Spawner Controls';
    toggleBtn.style.cssText =
      'position:fixed;bottom:16px;right:16px;z-index:2147483647;' +
      'width:44px;height:44px;border-radius:50%;' +
      'background:rgba(30,30,30,0.85);color:#58a6ff;' +
      'font-size:24px;display:flex;align-items:center;justify-content:center;' +
      'cursor:pointer;user-select:none;backdrop-filter:blur(8px);' +
      'border:1px solid rgba(88,166,255,0.3);' +
      'box-shadow:0 2px 12px rgba(0,0,0,0.4);transition:transform .2s,background .2s;';
    toggleBtn.addEventListener('mouseenter', function () { toggleBtn.style.transform = 'scale(1.12)'; });
    toggleBtn.addEventListener('mouseleave', function () { toggleBtn.style.transform = 'scale(1)'; });
    document.body.appendChild(toggleBtn);

    // --- Panel ---
    var panel = document.createElement('div');
    panel.id = '__svPhysPanel';
    panel.style.cssText =
      'position:fixed;bottom:70px;right:16px;z-index:2147483647;' +
      'width:260px;max-height:80vh;overflow-y:auto;' +
      'background:rgba(22,22,26,0.92);color:#e6e6e6;' +
      'border-radius:14px;padding:16px;font-family:system-ui,sans-serif;font-size:13px;' +
      'backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,0.08);' +
      'box-shadow:0 8px 32px rgba(0,0,0,0.5);display:none;' +
      'transition:opacity .2s,transform .2s;';
    document.body.appendChild(panel);

    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      panelOpen = !panelOpen;
      panel.style.display = panelOpen ? 'block' : 'none';
      toggleBtn.innerHTML = panelOpen ? '&#10005;' : '&#9881;';
    });

    // helper to build UI
    function el(tag, text, styles) {
      var d = document.createElement(tag);
      if (text) d.textContent = text;
      if (styles) d.style.cssText = styles;
      return d;
    }

    function makeBtn(label, onClick, accent) {
      var b = document.createElement('button');
      b.textContent = label;
      b.style.cssText =
        'padding:6px 10px;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;' +
        'color:#fff;margin:3px;transition:filter .15s;' +
        'background:' + (accent || 'rgba(88,166,255,0.25)') + ';';
      b.addEventListener('mouseenter', function () { b.style.filter = 'brightness(1.3)'; });
      b.addEventListener('mouseleave', function () { b.style.filter = 'brightness(1)'; });
      b.addEventListener('click', function (e) { e.stopPropagation(); onClick(); });
      return b;
    }

    function makeSlider(label, min, max, step, value, onChange) {
      var wrap = document.createElement('div');
      wrap.style.cssText = 'margin:8px 0;';
      var lbl = el('div', label + ': ' + value, 'margin-bottom:3px;color:#aaa;font-size:11px;');
      var inp = document.createElement('input');
      inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step; inp.value = value;
      inp.style.cssText = 'width:100%;accent-color:#58a6ff;cursor:pointer;';
      inp.addEventListener('input', function () {
        lbl.textContent = label + ': ' + parseFloat(inp.value).toFixed(step < 1 ? 2 : 0);
        onChange(parseFloat(inp.value));
      });
      inp.addEventListener('click', function (e) { e.stopPropagation(); });
      wrap.appendChild(lbl);
      wrap.appendChild(inp);
      return wrap;
    }

    function makeSelect(label, options, selected, onChange) {
      var wrap = document.createElement('div');
      wrap.style.cssText = 'margin:8px 0;';
      var lbl = el('div', label, 'margin-bottom:3px;color:#aaa;font-size:11px;');
      var sel = document.createElement('select');
      sel.style.cssText =
        'width:100%;padding:5px 8px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);' +
        'background:#1a1a1e;color:#e6e6e6;font-size:12px;cursor:pointer;';
      options.forEach(function (o) {
        var opt = document.createElement('option');
        opt.value = o.value; opt.textContent = o.label;
        if (o.value === selected) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', function () { onChange(sel.value); });
      sel.addEventListener('click', function (e) { e.stopPropagation(); });
      wrap.appendChild(lbl);
      wrap.appendChild(sel);
      return wrap;
    }

    function buildPanel() {
      panel.innerHTML = '';

      // title
      var title = el('div', 'Block Spawner', 'font-size:15px;font-weight:700;margin-bottom:10px;color:#58a6ff;letter-spacing:0.5px;');
      panel.appendChild(title);

      // shape select
      panel.appendChild(makeSelect('Shape', [
        { value: 'random', label: 'Random' },
        { value: 'rectangle', label: 'Rectangle' },
        { value: 'circle', label: 'Circle' },
        { value: 'triangle', label: 'Triangle' },
        { value: 'polygon', label: 'Polygon' }
      ], settings.shape, function (v) { settings.shape = v; }));

      // palette select
      panel.appendChild(makeSelect('Color Palette', [
        { value: 'neon', label: 'Neon' },
        { value: 'pastel', label: 'Pastel' },
        { value: 'cyber', label: 'Cyber' },
        { value: 'sunset', label: 'Sunset' },
        { value: 'mono', label: 'Mono' }
      ], currentPalette, function (v) { currentPalette = v; colors = colorSets[v]; }));

      // sliders
      panel.appendChild(makeSlider('Min Size', 5, 100, 1, settings.minSize, function (v) { settings.minSize = v; }));
      panel.appendChild(makeSlider('Max Size', 10, 150, 1, settings.maxSize, function (v) { settings.maxSize = v; }));
      panel.appendChild(makeSlider('Bounciness', 0, 1, 0.05, settings.bounciness, function (v) { settings.bounciness = v; }));
      panel.appendChild(makeSlider('Friction', 0, 1, 0.05, settings.friction, function (v) { settings.friction = v; }));
      panel.appendChild(makeSlider('Gravity', -3, 3, 0.1, settings.gravityY, function (v) { setGravityY(v); }));
      panel.appendChild(makeSlider('Explosion Force', 0.01, 0.2, 0.01, settings.explosionForce, function (v) { settings.explosionForce = v; }));
      panel.appendChild(makeSlider('Rain Speed (ms)', 30, 500, 10, settings.rainSpeed, function (v) {
        settings.rainSpeed = v;
        if (settings.rainMode) { clearInterval(settings.rainInterval); settings.rainInterval = setInterval(function () { spawnBody(rnd(60, W - 60), -40); }, v); }
      }));

      // section label
      panel.appendChild(el('div', 'Actions', 'margin:12px 0 6px;font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:1px;'));

      // action buttons
      var btnWrap = document.createElement('div');
      btnWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:2px;';

      btnWrap.appendChild(makeBtn(settings.rainMode ? '🌧 Rain ON' : '🌧 Rain', toggleRain, settings.rainMode ? 'rgba(63,185,80,0.35)' : undefined));
      btnWrap.appendChild(makeBtn('💥 Explode', explode, 'rgba(248,81,73,0.3)'));
      btnWrap.appendChild(makeBtn('🌀 Implode', implode, 'rgba(210,168,255,0.3)'));
      btnWrap.appendChild(makeBtn('⬆ Anti-Grav', antigravity, 'rgba(255,166,87,0.3)'));
      btnWrap.appendChild(makeBtn(settings.hasCeiling ? '🔓 Ceiling ON' : '🔒 Ceiling', toggleCeiling, settings.hasCeiling ? 'rgba(63,185,80,0.35)' : undefined));
      btnWrap.appendChild(makeBtn('🗑 Clear All', clearAll, 'rgba(248,81,73,0.2)'));

      panel.appendChild(btnWrap);

      // block count
      var countEl = el('div', '', 'margin-top:12px;color:#666;font-size:11px;text-align:center;');
      function updateCount() {
        var n = Composite.allBodies(engine.world).filter(function (b) { return !b.isStatic; }).length;
        countEl.textContent = n + ' block' + (n !== 1 ? 's' : '') + ' spawned';
      }
      updateCount();
      setInterval(updateCount, 500);
      panel.appendChild(countEl);

      // shortcuts hint
      var hint = el('div',
        'Click anywhere to spawn  •  Drag to move\nC = clear  E = explode  I = implode  R = rain',
        'margin-top:10px;color:#555;font-size:10px;text-align:center;white-space:pre-line;line-height:1.5;');
      panel.appendChild(hint);
    }

    function refreshUI() { if (panelOpen) buildPanel(); }

    buildPanel();

    /* ── run ── */
    Engine.run(engine);
    Render.run(render);
  };
  document.head.appendChild(script);
})();