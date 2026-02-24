// Matrix Rain
(function() {
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {position:'fixed',inset:'0',zIndex:'999999',pointerEvents:'none',opacity:'0.4'});
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const cols = Math.floor(canvas.width / 14);
  const drops = Array(cols).fill(1);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*';
  setInterval(() => {
    ctx.fillStyle = 'rgba(0,0,0,.05)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#0f0';
    ctx.font = '14px monospace';
    drops.forEach((y,i) => {
      const ch = chars[Math.floor(Math.random()*chars.length)];
      ctx.fillText(ch, i*14, y*14);
      if (y*14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }, 50);
  document.addEventListener('keydown', e => { if(e.key==='Escape') canvas.remove(); });
})();