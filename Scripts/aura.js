// ==UserScript==
// @name         Color Pulse Aura
// @match        *://*/*
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const aura = document.createElement("div");
    aura.id = "color-aura";
    aura.style.cssText = `
        position: fixed;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 999999999;
        mix-blend-mode: screen;
        background: radial-gradient(circle, rgba(255,0,150,0.8), rgba(0,0,0,0));
        transition: transform 0.05s linear;
    `;
    document.documentElement.appendChild(aura);

    let lastX = 0, lastY = 0;
    let hue = 0;

    document.addEventListener("mousemove", (e) => {
        const speed = Math.hypot(e.clientX - lastX, e.clientY - lastY);

        hue = (hue + speed * 0.5) % 360;

        aura.style.background = `
            radial-gradient(circle,
            hsla(${hue}, 100%, 60%, 0.9),
            hsla(${hue}, 100%, 60%, 0))
        `;

        aura.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;

        lastX = e.clientX;
        lastY = e.clientY;

        spawnTrail(e.clientX, e.clientY, hue);
    });

    function spawnTrail(x, y, hue) {
        const dot = document.createElement("div");
        dot.style.cssText = `
            position: fixed;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            left: ${x - 6}px;
            top: ${y - 6}px;
            background: hsla(${hue}, 100%, 60%, 0.8);
            pointer-events: none;
            z-index: 999999998;
            opacity: 1;
            transition: opacity 0.5s linear, transform 0.5s linear;
        `;
        document.body.appendChild(dot);

        requestAnimationFrame(() => {
            dot.style.opacity = "0";
            dot.style.transform = "scale(0.4)";
        });

        setTimeout(() => dot.remove(), 500);
    }
})();
