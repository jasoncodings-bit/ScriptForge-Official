// ==UserScript==
// @name         Emoji Cursor Follower
// @match        *://*/*
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Create the emoji element
    const cat = document.createElement("div");
    cat.textContent = "🐱";
    cat.id = "cursor-cat";
    cat.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        font-size: 40px;
        pointer-events: none;
        z-index: 999999999;
        transition: transform 0.08s linear;
    `;
    document.documentElement.appendChild(cat);

    // Track cursor
    let x = 0, y = 0;

    document.addEventListener("mousemove", (e) => {
        x = e.clientX;
        y = e.clientY;
        cat.style.transform = `translate(${x}px, ${y}px)`;
    });
})();