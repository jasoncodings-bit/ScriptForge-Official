(function () {
  const word = "mason";
  const colors = ["#ff006e", "#8338ec", "#3a86ff", "#ffbe0b", "#fb5607", "#ffffff"];

  function spawnMason() {
    const el = document.createElement("div");
    el.textContent = word;
    el.style.position = "fixed";
    el.style.zIndex = 999999;
    el.style.fontFamily = "Arial, sans-serif";
    el.style.fontWeight = "bold";
    el.style.pointerEvents = "none";
    el.style.fontSize = Math.floor(Math.random() * 40) + 20 + "px";
    el.style.color = colors[Math.floor(Math.random() * colors.length)];

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    el.style.left = x + "px";
    el.style.top = y + "px";

    document.body.appendChild(el);

    // Optional: fade out and remove
    el.style.transition = "opacity 1.5s linear";
    requestAnimationFrame(() => {
      el.style.opacity = "0";
    });
    setTimeout(() => el.remove(), 2000);
  }

  // Spam interval (lower = more spam)
  setInterval(spawnMason, 80);
})();
