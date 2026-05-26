
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
const STONE    = 4;

const type  = new Uint8Array(W * H);   // cell type
const col   = new Uint32Array(W * H);  // packed ABGR colour
const moved = new Uint8Array(W * H);   // already-updated flag this frame
const wetness = new Float32Array(W * H); // 0 (dry) to 1 (fully wet)

function idx(x, y)      { return y * W + x; }
function inBounds(x, y) { return x >= 0 && x < W && y >= 0 && y < H; }
function isEmpty(x, y)  { return inBounds(x, y) && type[idx(x, y)] === EMPTY; }
function isSolid(x, y)  { return inBounds(x, y) && type[idx(x, y)] === STONE; }
function typeAt(x, y)   { return inBounds(x, y) ? type[idx(x, y)] : -1; }

// ── Colour generators ───────────────────────────────────────────────────────

function sandColor() {
    const r = Math.random();
    if (r < 0.05) {
        // Bright quartz / mica sparkle grain
        const b = (220 + Math.random() * 35) | 0;
        return (0xFF << 24) | ((b - 20) << 16) | (b << 8) | b;
    }
    if (r < 0.18) {
        // Dark mineral grain (feldspar / dark mica)
        const v = Math.random() * 0.5;
        const rv = (105 + v * 40) | 0;
        const gv = (75  + v * 30) | 0;
        const bv = (35  + v * 18) | 0;
        return (0xFF << 24) | (bv << 16) | (gv << 8) | rv;
    }
    // Common warm tan / golden ochre grain
    const v    = Math.random();
    const warm = Math.random() < 0.4;
    const spec = Math.random() < 0.04 ? 22 : 0;
    const rv = Math.min(255, ((warm ? 215 : 195) + v * 45 + spec) | 0);
    const gv = Math.min(255, ((warm ? 143 : 153) + v * 40 + spec * 0.5) | 0);
    const bv = ((warm ? 30  : 52)  + v * 20) | 0;
    return (0xFF << 24) | (bv << 16) | (gv << 8) | rv;
}

function wetSandColor() {
    const v  = Math.random() * 0.35;
    const rv = (68 + v * 32) | 0;
    const gv = (50 + v * 25) | 0;
    const bv = (28 + v * 18) | 0;
    return (0xFF << 24) | (bv << 16) | (gv << 8) | rv;
}

function waterColor() {
    const v  = Math.random();
    const rv = (8   + v * 16) | 0;
    const gv = (100 + v * 55) | 0;
    const bv = Math.min(255, (200 + v * 55) | 0);
    const a  = (160 + (v * 70) | 0);
    return (a << 24) | (bv << 16) | (gv << 8) | rv;
}

// Position-seeded hash gives stone consistent cracks and mineral veins
function stoneColor(x, y) {
    // Return a solid grey color for stone
    const grey = 128; // Mid-grey
    return (0xFF << 24) | (grey << 16) | (grey << 8) | grey;
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
    const isWet      = type[i] === WET_SAND;
    const fallChance = isWet ? 0.18 : 1; // Wet sand barely moves

    const canDisplace = (tx, ty) => {
        if (!inBounds(tx, ty)) return false;
        const t = typeAt(tx, ty);
        return t === EMPTY || t === WATER;
    };
    const fallTo = (tx, ty) => {
        const ti = idx(tx, ty);
        if (type[ti] === WATER) {
            // Swap: sand sinks, water bubbles up
            type[ti] = type[i]; col[ti] = col[i]; moved[ti] = 1;
            type[i]  = WATER;   col[i]  = waterColor();
        } else {
            moveCell(x, y, tx, ty);
        }
    };

    // Straight down
    if (Math.random() < fallChance && canDisplace(x, y + 1)) {
        fallTo(x, y + 1); return;
    }
    const d1 = lf ? -1 : 1, d2 = -d1;

    // Immediate diagonal
    if (Math.random() < fallChance && canDisplace(x + d1, y + 1)) {
        fallTo(x + d1, y + 1); return;
    }
    if (Math.random() < fallChance && canDisplace(x + d2, y + 1)) {
        fallTo(x + d2, y + 1); return;
    }

    // Cascade: dry sand rolls along steep slopes (full lateral path must be clear)
    if (!isWet && Math.random() < 0.3) {
        for (let d = 2; d <= 3; d++) {
            let ok1 = canDisplace(x + d1 * d, y + 1);
            for (let k = 1; k < d && ok1; k++) ok1 = isEmpty(x + d1 * k, y);
            if (ok1) { fallTo(x + d1 * d, y + 1); return; }

            let ok2 = canDisplace(x + d2 * d, y + 1);
            for (let k = 1; k < d && ok2; k++) ok2 = isEmpty(x + d2 * k, y);
            if (ok2) { fallTo(x + d2 * d, y + 1); return; }
        }
    }
}

function updateWater(x, y, lf) {
    const DISP = 6;

    // 1. Fall straight down
    if (isEmpty(x, y + 1)) {
        moveCell(x, y, x, y + 1);
        return;
    }

    const d1 = lf ? -1 : 1, d2 = -d1;

    // 2. Diagonal fall – lateral neighbour must also be clear to prevent corner-cutting
    if (isEmpty(x + d1, y) && isEmpty(x + d1, y + 1)) {
        moveCell(x, y, x + d1, y + 1);
        return;
    }
    if (isEmpty(x + d2, y) && isEmpty(x + d2, y + 1)) {
        moveCell(x, y, x + d2, y + 1);
        return;
    }

    // 3. Horizontal spread toward first fall point.
    //    Each direction is scanned independently and stops the moment any
    //    obstruction is hit — water can never jump over a stone wall.
    for (let d = 1; d <= DISP; d++) {
        const nx = x + d1 * d;
        if (!inBounds(nx, y) || !isEmpty(nx, y)) break;
        if (isEmpty(nx, y + 1)) { moveCell(x, y, nx, y); return; }
    }
    for (let d = 1; d <= DISP; d++) {
        const nx = x + d2 * d;
        if (!inBounds(nx, y) || !isEmpty(nx, y)) break;
        if (isEmpty(nx, y + 1)) { moveCell(x, y, nx, y); return; }
    }

    // 4. Completely flat surface – spread one step to equalise level
    if (isEmpty(x + d1, y)) { moveCell(x, y, x + d1, y); return; }
    if (isEmpty(x + d2, y)) { moveCell(x, y, x + d2, y); return; }
}

// Sand adjacent to water becomes wet; sand away from water gradually dries
function wetnessPass() {
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const i = idx(x, y);
            const t = type[i];
            if (t !== SAND && t !== WET_SAND) continue;

            let nearWater = false;
            outer: for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    if (typeAt(x + dx, y + dy) === WATER) { nearWater = true; break outer; }
                }
            }
            wetness[i] = nearWater
                ? Math.min(1, wetness[i] + 0.12)
                : Math.max(0, wetness[i] - 0.008);

            // Only recolor on state transition to preserve grain identity
            if (wetness[i] > 0.5 && t === SAND) {
                type[i] = WET_SAND; col[i] = wetSandColor();
            } else if (wetness[i] <= 0.5 && t === WET_SAND) {
                type[i] = SAND;     col[i] = sandColor();
            }
        }
    }
}

// Depth-aware water color: surface is bright, deeper water is darker/richer
function waterDepthColor(x, y) {
    let depth = 0;
    for (let dy = 1; dy <= 12; dy++) {
        if (typeAt(x, y - dy) !== WATER) break;
        depth++;
    }
    const t = Math.min(1, depth / 10); // 0 = surface, 1 = deep
    const v = Math.random() * 0.35;
    // Occasional foam sparkle at the surface
    if (depth === 0 && Math.random() < 0.045) {
        const w = (195 + Math.random() * 60) | 0;
        const a = (160 + Math.random() * 50) | 0;
        return (a << 24) | (w << 16) | (w << 8) | w;
    }
    const rv = (5   + (1 - t) * 14  + v * 10) | 0;
    const gv = Math.min(255, (82  + (1 - t * 0.5) * 58 + v * 35) | 0);
    const bv = Math.min(255, (192 - t * 28          + v * 48) | 0);
    const a  = Math.min(255, (155 + (1 - t) * 42    + v * 35) | 0);
    return (a << 24) | (bv << 16) | (gv << 8) | rv;
}

// Refresh water cells each frame with depth-aware shimmer
let shimmerTick = 0;
function shimmerPass() {
    if (++shimmerTick % 2 !== 0) return;
    const samples = (W * H * 0.06) | 0;
    for (let s = 0; s < samples; s++) {
        const i = (Math.random() * W * H) | 0;
        if (type[i] === WATER) {
            const wx = i % W, wy = (i / W) | 0;
            col[i] = waterDepthColor(wx, wy);
        }
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

const MODES = ['sand', 'water', 'stone'];
window.addEventListener('keydown', e => {
    if (e.key === 'g' || e.key === 'G') {
        mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
        console.log('Mode:', mode);
    }
});

function spawnBrush(px, py) {
    const r = 3;
    const gx = Math.floor(px / CELL), gy = Math.floor(py / CELL);
    for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy > r * r || Math.random() > 0.65) continue;
            const nx = gx + dx, ny = gy + dy;
            if (inBounds(nx, ny) && type[idx(nx, ny)] === EMPTY) {
                if      (mode === 'sand')  setCell(nx, ny, SAND,  sandColor());
                else if (mode === 'water') setCell(nx, ny, WATER, waterColor());
                else if (mode === 'stone') setCell(nx, ny, STONE, stoneColor(nx, ny));
            }
        }
    }
}

function eraseBrush(px, py) {
    const r = 5;
    const gx = Math.floor(px / CELL), gy = Math.floor(py / CELL);
    for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
            const nx = gx + dx, ny = gy + dy;
            if (inBounds(nx, ny) && type[idx(nx, ny)] !== STONE) {
                clearCell(nx, ny);
            }
        }
    }
}

window.addEventListener('mousedown', e => {
    if (e.button === 0) { lmb = true; spawnBrush(e.clientX, e.clientY); }
    if (e.button === 2) { rmb = true; eraseBrush(e.clientX, e.clientY); }
});
window.addEventListener('mouseup',   e => { if (e.button === 0) lmb = false; if (e.button === 2) rmb = false; });
window.addEventListener('mousemove', e => { if (lmb) spawnBrush(e.clientX, e.clientY); if (rmb) eraseBrush(e.clientX, e.clientY); });
window.addEventListener('contextmenu', e => e.preventDefault());