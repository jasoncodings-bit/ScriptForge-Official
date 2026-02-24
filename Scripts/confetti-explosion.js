// Confetti Explosion
(function() {
  const colors = ['#7c5cff','#58a6ff','#3fb950','#f0c040','#f85149','#f778ba'];
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    Object.assign(confetti.style, {
      position:'fixed',width:'10px',height:'10px',borderRadius: Math.random()>.5?'50%':'2px',
      background:colors[Math.floor(Math.random()*colors.length)],
      left: Math.random()*100+'%',top:'-10px',zIndex:'999999',pointerEvents:'none',
      transform:'rotate('+Math.random()*360+'deg)'
    });
    document.body.appendChild(confetti);
    const duration = 1500 + Math.random() * 2000;
    const endX = (Math.random()-0.5)*300;
    confetti.animate([
      {transform:'translateY(0) translateX(0) rotate(0deg)',opacity:1},
      {transform:'translateY('+window.innerHeight+'px) translateX('+endX+'px) rotate('+Math.random()*720+'deg)',opacity:0}
    ], {duration, easing:'cubic-bezier(.25,.46,.45,.94)'});
    setTimeout(() => confetti.remove(), duration);
  }
})();