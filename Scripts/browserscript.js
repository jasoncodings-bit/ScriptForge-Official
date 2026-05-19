// Sandbox simulation — G cycles material, LMB place, RMB erase
// Materials: sand · water · fire · oil · lava · ice · acid · stone · wood
// Current material is printed to the browser console when G is pressed

const CELL = 4;
const canvas = document.createElement('canvas');
const ctx    = canvas.getContext('2d');

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.cssText = 'position:fixed;top:0;left:0;z-index:999999;pointer-events:none;';
document.body.appendChild(canvas);

const W = Math.floor(canvas.width  / CELL);
const H = Math.floor(canvas.height / CELL);

// Cell types
const EMPTY    = 0;
const SAND     = 1;
const WATER    = 2;
const WET_SAND = 3;

const type  = new Uint8Array(W * H);   // cell type
const col   = new Uint32Array(W * H);  // packed ABGR colour
const moved = new Uint8Array(W * H);   // already-updated flag this frame
const wetness = new Float32Array(W * H); // 0 (dry) to 1 (fully wet)

function idx(x, y)      { return y * W + x; }
function inBounds(x, y) { return x >= 0 && x < W && y >= 0 && y < H; }
function isEmpty(x, y)  { return inBounds(x, y) && type[idx(x, y)] === EMPTY; }
function typeAt(x, y)   { return inBounds(x, y) ? type[idx(x, y)] : -1; }

// ── Colour generators ───────────────────────────────────────────────────────

function sandColor() {
    const g = Math.random();
    // Occasional bright specular grain for texture depth
    const spec = Math.random() < 0.07 ? 28 : 0;
    const r = Math.min(255, (198 + g * 48 + spec) | 0);
    const gr = Math.min(255, (152 + g * 38 + spec * 0.7) | 0);
    const b  = (52  + g * 22) | 0;
    return (0xFF << 24) | (b << 16) | (gr << 8) | r;
}

function wetSandColor() {
    const v = Math.random() * 0.3;
    const r = (88  + v * 30) | 0;
    const g = (68  + v * 24) | 0;
    const b = (40  + v * 18) | 0;
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
}

function waterColor() {
    const v = Math.random();
    const r = (12  + v * 22) | 0;
    const g = (88  + v * 55) | 0;
    const b = Math.min(255, (185 + v * 65) | 0);
    const a = (185 + (Math.random() * 55) | 0);
    return (a << 24) | (b << 16) | (g << 8) | r;
}

// ── Cell helpers ────────────────────────────────────────────────────────────

function setCell(x, y, t, c) { const i = idx(x, y); type[i] = t; col[i] = c; }
function clearCell(x, y)     { const i = idx(x, y); type[i] = EMPTY; col[i] = 0; }

function moveCell(fx, fy, tx, ty) {
    const fi = idx(fx, fy), ti = idx(tx, ty);
    type[ti] = type[fi]; col[ti] = col[fi];
    type[fi] = EMPTY;    col[fi] = 0;
    moved[ti] = 1;
}

// ── Physics ─────────────────────────────────────────────────────────────────

function update() {
    moved.fill(0);

    // Sweep bottom-up; alternate horizontal direction each row for fairness
    for (let y = H - 2; y >= 0; y--) {
        const lf = Math.random() < 0.5;
        for (let xi = 0; xi < W; xi++) {
            const x = lf ? xi : W - 1 - xi;
            const i = idx(x, y);
            if (moved[i]) continue;
            const t = type[i];
            if      (t === SAND || t === WET_SAND) updateSand(x, y, lf);
            else if (t === WATER)                  updateWater(x, y, lf);
        }
    }

    wetnessPass();
    shimmerPass();
}

function updateSand(x, y, lf) {
    const i = idx(x, y);
    const isWet = type[i] === WET_SAND;
    const fallChance = isWet ? 0.7 : 1; // Wet sand falls less easily

    if (Math.random() < fallChance && isEmpty(x, y + 1)) {
        moveCell(x, y, x, y + 1);
        return;
    }
    const d1 = lf ? -1 : 1, d2 = -d1;
    if (Math.random() < fallChance && isEmpty(x + d1, y + 1)) {
        moveCell(x, y, x + d1, y + 1);
    } else if (Math.random() < fallChance && isEmpty(x + d2, y + 1)) {
        moveCell(x, y, x + d2, y + 1);
    }
}

function updateWater(x, y, lf) {
    const DISP = 7; // horizontal dispersion distance

    // Fall straight down
    if (isEmpty(x, y + 1)) {
        moveCell(x, y, x, y + 1);
        col[idx(x, y + 1)] = waterColor();
        return;
    }

    // Diagonal down
    const d1 = lf ? -1 : 1, d2 = -d1;
    if (isEmpty(x + d1, y + 1)) {
        moveCell(x, y, x + d1, y + 1);
        col[idx(x + d1, y + 1)] = waterColor();
        return;
    }
    if (isEmpty(x + d2, y + 1)) {
        moveCell(x, y, x + d2, y + 1);
        col[idx(x + d2, y + 1)] = waterColor();
        return;
    }

    // Horizontal flow with momentum
    const momentum = Math.random() < 0.5 ? d1 : d2; // Randomize initial direction
    for (let d = 1; d <= DISP; d++) {
        const nx = x + momentum * d;
        if (!inBounds(nx, y) || !isEmpty(nx, y)) break; // Stop if out of bounds or blocked
        if (isEmpty(nx, y + 1)) { // Can fall from here
            moveCell(x, y, nx, y);
            col[idx(nx, y)] = waterColor();
            return;
        }
    }

    // Simulate pressure by pushing water sideways
    for (let d = 1; d <= DISP; d++) {
        const nx = x + d1 * d;
        const px = x + d2 * d;
        if (inBounds(nx, y) && isEmpty(nx, y)) {
            moveCell(x, y, nx, y);
            col[idx(nx, y)] = waterColor();
            return;
        } else if (inBounds(px, y) && isEmpty(px, y)) {
            moveCell(x, y, px, y);
            col[idx(px, y)] = waterColor();
            return;
        }
    }
}

// Dry sand adjacent to water becomes wet/muddy
function wetnessPass() {
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const i = idx(x, y);
            if (type[i] === SAND) {
                let nearWater = false;
                outer: for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        if (typeAt(x + dx, y + dy) === WATER) {
                            nearWater = true;
                            break outer;
                        }
                    }
                }
                if (nearWater) {
                    wetness[i] = Math.min(1, wetness[i] + 0.1); // Gradually increase wetness
                } else {
                    wetness[i] = Math.max(0, wetness[i] - 0.01); // Gradually dry out
                }

                // Update type and color based on wetness level
                if (wetness[i] > 0.5) {
                    type[i] = WET_SAND;
                    col[i] = wetSandColor();
                } else {
                    type[i] = SAND;
                    col[i] = sandColor();
                }
            }
        }
    }
}

// Randomly refresh a small portion of water cells each frame for shimmer
let shimmerTick = 0;
function shimmerPass() {
    if (++shimmerTick % 2 !== 0) return;
    const samples = (W * H * 0.04) | 0;
    for (let s = 0; s < samples; s++) {
        const i = (Math.random() * W * H) | 0;
        if (type[i] === WATER) col[i] = waterColor();
    }
}

// ── Rendering ───────────────────────────────────────────────────────────────

const imageData = ctx.createImageData(canvas.width, canvas.height);
const pixels    = new Uint32Array(imageData.data.buffer);

function render() {
    pixels.fill(0);
    for (let i = 0; i < W * H; i++) {
        if (type[i] === EMPTY) continue;
        const gx = i % W;
        const gy = (i / W) | 0;
        const c  = col[i];
        const rowBase = (gy * CELL) * canvas.width + gx * CELL;
        for (let py = 0; py < CELL; py++) {
            const row = rowBase + py * canvas.width;
            for (let px = 0; px < CELL; px++) pixels[row + px] = c;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function loop() { update(); render(); requestAnimationFrame(loop); }
loop();

// ── Input ────────────────────────────────────────────────────────────────────

let lmb = false, rmb = false;
let mode = 'sand'; // 'sand' | 'water'

window.addEventListener('keydown', e => {
    if (e.key === 'g' || e.key === 'G') mode = mode === 'sand' ? 'water' : 'sand';
});

function spawnBrush(px, py) {
    const r = 3;
    const gx = Math.floor(px / CELL), gy = Math.floor(py / CELL);
    for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy > r * r || Math.random() > 0.65) continue;
            const nx = gx + dx, ny = gy + dy;
            if (inBounds(nx, ny) && type[idx(nx, ny)] === EMPTY) {
                if (mode === 'sand') setCell(nx, ny, SAND,  sandColor());
                else                 setCell(nx, ny, WATER, waterColor());
            }
        }
    }
}

function eraseBrush(px, py) {
    const r = 5;
    const gx = Math.floor(px / CELL), gy = Math.floor(py / CELL);
    for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
            const nx = gx + dx, ny = gy + dy;
            if (inBounds(nx, ny)) clearCell(nx, ny);
        }
}

window.addEventListener('mousedown', e => {
    if (e.button === 0) { lmb = true; spawnBrush(e.clientX, e.clientY); }
    if (e.button === 2) { rmb = true; eraseBrush(e.clientX, e.clientY); }
});
window.addEventListener('mouseup',   e => { if (e.button === 0) lmb = false; if (e.button === 2) rmb = false; });
window.addEventListener('mousemove', e => { if (lmb) spawnBrush(e.clientX, e.clientY); if (rmb) eraseBrush(e.clientX, e.clientY); });
window.addEventListener('contextmenu', e => e.preventDefault());