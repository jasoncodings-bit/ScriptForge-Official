// Snow Effect
(function() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes sf-snow { to { transform: translateY(100vh) rotate(360deg); } }
    .sf-flake { position:fixed;top:-10px;color:#fff;font-size:16px;pointer-events:none;z-index:999999;opacity:0.8; }
  `;
  document.head.appendChild(style);
  const flakes = ['❄','❅','❆','•'];
  for (let i = 0; i < 50; i++) {
    const el = document.createElement('div');
    el.className = 'sf-flake';
    el.textContent = flakes[Math.floor(Math.random()*flakes.length)];
    el.style.left = Math.random()*100+'%';
    el.style.fontSize = (10+Math.random()*16)+'px';
    el.style.animation = 'sf-snow '+(3+Math.random()*5)+'s linear '+(Math.random()*5)+'s infinite';
    el.style.opacity = 0.3+Math.random()*0.5;
    document.body.appendChild(el);
  }
})();