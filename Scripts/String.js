(() => {
  const instanceKey = "__stringBrowserScript";
  if (window[instanceKey]?.cleanup) {
    window[instanceKey].cleanup();
  }

  const config = {
    pressure: 50,
    gravity: 30,
    curl: 50,
    thick: 40,
    chaos: 25,
    maxTotalPoints: 7200,
    maxStrandPoints: 180,
    emitCount: 3,
    linkLength: 2.5,
    breakDistance: 25,
  };

  const colors = ["#ff1493", "#00d9a0", "#ffc400", "#00b8ff", "#ff5533", "#b84dff"];
  const lightColors = ["#ff6ec7", "#66ffc8", "#ffe066", "#66d9ff", "#ff9a75", "#d4a0ff"];

  const root = document.createElement("div");
  root.style.position = "fixed";
  root.style.inset = "0";
  root.style.zIndex = "2147483647";
  root.style.pointerEvents = "none";

  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  root.appendChild(canvas);
  document.documentElement.appendChild(root);

  const context = canvas.getContext("2d");
  const maskCanvas = document.createElement("canvas");
  const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });

  let width = 0;
  let height = 0;
  let deviceScale = 1;
  let maskData = null;
  let maskBounds = null;
  let currentStrand = null;
  let strandColorIndex = 0;
  let nozzleX = 0;
  let nozzleY = 0;
  let targetX = 0;
  let targetY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let lastPointerTime = 0;
  let animationFrameId = 0;
  let tickCount = 0;
  let strands = [];

  class Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.ox = x;
      this.oy = y;
      this.done = false;
      this.stillness = 0;
    }

    update() {
      if (this.done) {
        return;
      }

      const gravity = (config.gravity / 100) * 0.4;
      let velocityX = (this.x - this.ox) * 0.97;
      let velocityY = (this.y - this.oy) * 0.97;
      this.ox = this.x;
      this.oy = this.y;
      this.x += velocityX;
      this.y += velocityY + gravity;

      if (hitsMask(this.x, this.y)) {
        if (!hitsMask(this.x, this.oy)) {
          this.y = this.oy;
        } else if (!hitsMask(this.ox, this.y)) {
          this.x = this.ox;
        } else {
          this.x = this.ox;
          this.y = this.oy;
        }

        this.ox = this.x;
        this.oy = this.y;
        this.stillness += 4;
      }

      if (this.y > height - 1) {
        this.y = height - 1;
        this.oy = this.y;
        this.stillness += 4;
      }

      if (this.y < 0) {
        this.y = 0;
        this.oy = 0;
        this.stillness += 4;
      }

      if (this.x < 0) {
        this.x = 0;
      } else if (this.x > width) {
        this.x = width;
      }

      if (this.stillness > 14) {
        this.done = true;
      }
    }
  }

  class Link {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.length = config.linkLength;
      this.broken = false;
    }

    solve() {
      if (this.broken) {
        return;
      }

      const deltaX = this.b.x - this.a.x;
      const deltaY = this.b.y - this.a.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 0.001;
      if (distance > config.breakDistance) {
        this.broken = true;
        return;
      }

      const force = ((this.length - distance) / distance) * 0.25;
      if (!this.a.done) {
        this.a.x -= deltaX * force;
        this.a.y -= deltaY * force;
      }
      if (!this.b.done) {
        this.b.x += deltaX * force;
        this.b.y += deltaY * force;
      }
    }
  }

  class Strand {
    constructor(colorIndex) {
      this.colorIndex = colorIndex;
      this.points = [];
      this.links = [];
    }

    add(x, y, velocityX, velocityY) {
      const point = new Point(x, y);
      point.ox = x - velocityX;
      point.oy = y - velocityY;
      if (this.points.length > 0) {
        this.links.push(new Link(this.points[this.points.length - 1], point));
      }
      this.points.push(point);
    }
  }

  function resizeCanvas() {
    deviceScale = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    canvas.width = Math.floor(width * deviceScale);
    canvas.height = Math.floor(height * deviceScale);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);

    maskCanvas.width = width;
    maskCanvas.height = height;
    buildMask();

    if (nozzleX === 0 && nozzleY === 0) {
      nozzleX = width * 0.2;
      nozzleY = height * 0.18;
      targetX = nozzleX;
      targetY = nozzleY;
      pointerX = nozzleX;
      pointerY = nozzleY;
    }
  }

  function traceMaskShape(drawContext) {
    const size = Math.min(width, height) * 0.24;
    const centerX = width * 0.5;
    const centerY = height * 0.48;

    drawContext.beginPath();
    drawContext.moveTo(centerX - size * 0.72, centerY - size * 0.08);
    drawContext.bezierCurveTo(
      centerX - size * 0.48,
      centerY - size * 0.62,
      centerX + size * 0.12,
      centerY - size * 0.58,
      centerX + size * 0.2,
      centerY - size * 0.12
    );
    drawContext.bezierCurveTo(
      centerX + size * 0.26,
      centerY + size * 0.24,
      centerX - size * 0.12,
      centerY + size * 0.26,
      centerX - size * 0.3,
      centerY - size * 0.02
    );
    drawContext.bezierCurveTo(
      centerX - size * 0.5,
      centerY - size * 0.36,
      centerX - size * 0.08,
      centerY - size * 0.72,
      centerX + size * 0.46,
      centerY - size * 0.44
    );
    drawContext.bezierCurveTo(
      centerX + size * 0.84,
      centerY - size * 0.22,
      centerX + size * 0.74,
      centerY + size * 0.38,
      centerX + size * 0.18,
      centerY + size * 0.5
    );
    drawContext.bezierCurveTo(
      centerX - size * 0.12,
      centerY + size * 0.56,
      centerX - size * 0.4,
      centerY + size * 0.38,
      centerX - size * 0.44,
      centerY + size * 0.14
    );

    drawContext.moveTo(centerX - size * 0.1, centerY - size * 0.42);
    drawContext.bezierCurveTo(
      centerX + size * 0.14,
      centerY - size * 0.24,
      centerX + size * 0.12,
      centerY + size * 0.04,
      centerX - size * 0.08,
      centerY + size * 0.18
    );
    drawContext.bezierCurveTo(
      centerX - size * 0.24,
      centerY + size * 0.28,
      centerX - size * 0.34,
      centerY + size * 0.44,
      centerX - size * 0.2,
      centerY + size * 0.58
    );

    maskBounds = {
      x: centerX,
      y: centerY,
      width: size * 1.8,
      height: size * 1.5,
    };
  }

  function buildMask() {
    maskContext.clearRect(0, 0, width, height);
    maskContext.lineCap = "round";
    maskContext.lineJoin = "round";
    maskContext.strokeStyle = "rgba(255,255,255,1)";
    maskContext.lineWidth = Math.max(20, Math.min(width, height) * 0.05);
    traceMaskShape(maskContext);
    maskContext.stroke();

    maskContext.lineWidth *= 0.42;
    traceMaskShape(maskContext);
    maskContext.stroke();

    maskData = maskContext.getImageData(0, 0, width, height).data;
  }

  function hitsMask(x, y) {
    if (!maskData) {
      return false;
    }

    const pixelX = Math.round(x);
    const pixelY = Math.round(y);
    if (pixelX < 0 || pixelY < 0 || pixelX >= width || pixelY >= height) {
      return false;
    }

    return maskData[(pixelY * width + pixelX) * 4 + 3] > 30;
  }

  function roundedRect(drawContext, x, y, w, h, r) {
    drawContext.beginPath();
    drawContext.moveTo(x + r, y);
    drawContext.lineTo(x + w - r, y);
    drawContext.quadraticCurveTo(x + w, y, x + w, y + r);
    drawContext.lineTo(x + w, y + h - r);
    drawContext.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    drawContext.lineTo(x + r, y + h);
    drawContext.quadraticCurveTo(x, y + h, x, y + h - r);
    drawContext.lineTo(x, y + r);
    drawContext.quadraticCurveTo(x, y, x + r, y);
    drawContext.closePath();
  }

  function aimAngle(centerX, centerY) {
    const rawAngle = Math.atan2(maskBounds.y - centerY, maskBounds.x - centerX);
    return Math.atan2(Math.sin(rawAngle) * 0.16, Math.cos(rawAngle));
  }

  function tipWorld(centerX, centerY, rotation) {
    const nozzleXOffset = 10;
    const nozzleYOffset = -26;
    return {
      x: centerX + nozzleXOffset * Math.cos(rotation) - nozzleYOffset * Math.sin(rotation),
      y: centerY + nozzleXOffset * Math.sin(rotation) + nozzleYOffset * Math.cos(rotation),
    };
  }

  function drawCan(centerX, centerY) {
    const angle = aimAngle(centerX, centerY);
    const widthValue = 18;
    const heightValue = 46;
    context.save();
    context.translate(centerX, centerY);
    context.rotate(angle);

    context.save();
    context.shadowColor = "rgba(0,0,0,0.12)";
    context.shadowBlur = 8;
    context.shadowOffsetY = 3;
    const bodyGradient = context.createLinearGradient(-widthValue / 2, 0, widthValue / 2, 0);
    bodyGradient.addColorStop(0, "#9a2020");
    bodyGradient.addColorStop(0.13, "#d43530");
    bodyGradient.addColorStop(0.4, "#ee4e48");
    bodyGradient.addColorStop(0.6, "#e84040");
    bodyGradient.addColorStop(0.85, "#d43530");
    bodyGradient.addColorStop(1, "#8a1818");
    context.fillStyle = bodyGradient;
    roundedRect(context, -widthValue / 2, -heightValue / 2, widthValue, heightValue, 4);
    context.fill();
    context.restore();

    const metalGradient = context.createLinearGradient(-widthValue / 2, 0, widthValue / 2, 0);
    metalGradient.addColorStop(0, "#aaa");
    metalGradient.addColorStop(0.4, "#ddd");
    metalGradient.addColorStop(1, "#999");
    context.fillStyle = metalGradient;
    roundedRect(context, -widthValue / 2 + 1, heightValue / 2 - 3, widthValue - 2, 3, 1);
    context.fill();
    roundedRect(context, -widthValue / 2 + 1, -heightValue / 2, widthValue - 2, 3, 1);
    context.fill();

    context.fillStyle = "rgba(255,255,255,0.08)";
    roundedRect(context, -widthValue / 2 + 2, -5, widthValue - 4, 12, 2);
    context.fill();

    context.fillStyle = "rgba(255,255,255,0.28)";
    context.font = "bold 4px sans-serif";
    context.textAlign = "center";
    context.fillText("STRING", 0, 1);
    context.fillText("SPRAY", 0, 5.5);

    context.fillStyle = metalGradient;
    roundedRect(context, -5, -heightValue / 2 - 4, 10, 5, 2);
    context.fill();

    context.fillStyle = currentStrand ? colors[currentStrand.colorIndex] : "#d44";
    context.beginPath();
    context.ellipse(0, -heightValue / 2 - 5, 4, 2, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#bbb";
    context.beginPath();
    context.moveTo(2, -heightValue / 2 - 3);
    context.lineTo(9, -27);
    context.lineTo(9, -24);
    context.lineTo(2, -heightValue / 2 + 1);
    context.closePath();
    context.fill();

    context.fillStyle = "#888";
    context.beginPath();
    context.arc(10, -26, 2, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function createStrand() {
    currentStrand = new Strand(strandColorIndex % colors.length);
    strandColorIndex += 1;
    strands.push(currentStrand);
  }

  function pruneStrands() {
    let totalPoints = 0;
    for (const strand of strands) {
      totalPoints += strand.points.length;
    }

    while (totalPoints > config.maxTotalPoints && strands.length > 1) {
      const oldest = strands[0];
      if (oldest === currentStrand) {
        break;
      }

      if (oldest.points.length > 0) {
        oldest.points.shift();
        oldest.links.shift();
        totalPoints -= 1;
      } else {
        strands.shift();
      }
    }

    strands = strands.filter((strand) => strand.points.length > 1 || strand === currentStrand);
  }

  function emitFrom(centerX, centerY) {
    if (!currentStrand) {
      createStrand();
    }

    const angle = aimAngle(centerX, centerY);
    const tip = tipWorld(centerX, centerY, angle);
    const pressure = 3 + (config.pressure / 100) * 11;
    const curlAmount = (config.curl / 100) * 4;
    const chaosAmount = (config.chaos / 100) * 1.2;

    tickCount += 1;
    for (let emissionIndex = 0; emissionIndex < config.emitCount; emissionIndex += 1) {
      const speed = pressure + Math.random() * 2;
      const curl = Math.sin(tickCount * 0.35 + emissionIndex * 1.7) * curlAmount;
      const wobble = (Math.random() - 0.5) * (0.15 + chaosAmount);
      const perpendicular = angle + Math.PI / 2;
      currentStrand.add(
        tip.x,
        tip.y,
        Math.cos(angle + wobble) * speed + Math.cos(perpendicular) * curl,
        Math.sin(angle + wobble) * speed + Math.sin(perpendicular) * curl
      );
    }

    if (currentStrand.points.length > config.maxStrandPoints) {
      createStrand();
    }

    pruneStrands();
  }

  function drawStrands() {
    const thickness = 0.5 + (config.thick / 100) * 3.5;
    context.lineCap = "round";
    context.lineJoin = "round";

    for (const strand of strands) {
      if (strand.points.length < 2) {
        continue;
      }

      const color = colors[strand.colorIndex];
      const highlight = lightColors[strand.colorIndex];
      context.beginPath();
      context.moveTo(strand.points[0].x, strand.points[0].y);

      for (let pointIndex = 1; pointIndex < strand.points.length; pointIndex += 1) {
        if (pointIndex - 1 < strand.links.length && strand.links[pointIndex - 1].broken) {
          context.moveTo(strand.points[pointIndex].x, strand.points[pointIndex].y);
          continue;
        }

        const previous = strand.points[pointIndex - 1];
        const current = strand.points[pointIndex];
        const deltaX = current.x - previous.x;
        const deltaY = current.y - previous.y;
        if (deltaX * deltaX + deltaY * deltaY > 600) {
          context.moveTo(current.x, current.y);
          continue;
        }

        context.quadraticCurveTo(previous.x, previous.y, (previous.x + current.x) / 2, (previous.y + current.y) / 2);
      }

      context.save();
      context.shadowColor = color;
      context.shadowBlur = 2;
      context.strokeStyle = color;
      context.globalAlpha = 0.12;
      context.lineWidth = thickness + 2;
      context.stroke();
      context.restore();

      context.strokeStyle = color;
      context.globalAlpha = 0.9;
      context.lineWidth = thickness;
      context.stroke();

      context.strokeStyle = highlight;
      context.globalAlpha = 0.2;
      context.lineWidth = thickness * 0.3;
      context.stroke();
      context.globalAlpha = 1;
    }
  }

  function drawMask() {
    const size = Math.min(width, height) * 0.24;
    const centerX = width * 0.5;
    const centerY = height * 0.48;

    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "rgba(15, 21, 28, 0.18)";
    context.lineWidth = Math.max(20, Math.min(width, height) * 0.05);
    traceMaskShape(context);
    context.stroke();

    context.strokeStyle = "rgba(255, 255, 255, 0.12)";
    context.lineWidth *= 0.42;
    traceMaskShape(context);
    context.stroke();

    const glow = context.createRadialGradient(centerX, centerY, size * 0.1, centerX, centerY, size * 0.95);
    glow.addColorStop(0, "rgba(255,255,255,0.12)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(centerX, centerY, size * 0.95, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function updateTargets() {
    const time = performance.now();
    const orbitX = width * 0.12 + ((Math.sin(time * 0.0007) + 1) / 2) * width * 0.76;
    const orbitY = height * 0.14 + Math.sin(time * 0.0018) * height * 0.05;
    const pointerBlend = Math.max(0, 1 - (time - lastPointerTime) / 1400);
    targetX = orbitX * (1 - pointerBlend) + pointerX * pointerBlend;
    targetY = orbitY * (1 - pointerBlend) + pointerY * pointerBlend;
    nozzleX += (targetX - nozzleX) * 0.08;
    nozzleY += (targetY - nozzleY) * 0.08;
  }

  function animate() {
    updateTargets();
    context.clearRect(0, 0, width, height);

    emitFrom(nozzleX, nozzleY);

    for (const strand of strands) {
      for (const point of strand.points) {
        point.update();
      }

      for (let solveIndex = 0; solveIndex < 2; solveIndex += 1) {
        for (const link of strand.links) {
          link.solve();
        }
      }
    }

    drawStrands();
    drawMask();
    drawCan(nozzleX, nozzleY);
    animationFrameId = window.requestAnimationFrame(animate);
  }

  function handlePointerMove(event) {
    pointerX = event.clientX;
    pointerY = event.clientY;
    lastPointerTime = performance.now();
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      cleanup();
    }
  }

  function cleanup() {
    window.removeEventListener("resize", resizeCanvas);
    window.removeEventListener("pointermove", handlePointerMove, true);
    window.removeEventListener("keydown", handleKeyDown, true);
    window.cancelAnimationFrame(animationFrameId);
    root.remove();
    delete window[instanceKey];
  }

  resizeCanvas();
  createStrand();
  animationFrameId = window.requestAnimationFrame(animate);
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pointermove", handlePointerMove, true);
  window.addEventListener("keydown", handleKeyDown, true);

  window[instanceKey] = { cleanup };
})();