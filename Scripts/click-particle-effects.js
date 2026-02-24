// Click Particle Effects
(function() {
  document.addEventListener('click', e => {
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      Object.assign(p.style, {
        position:'fixed',width:'6px',height:'6px',borderRadius:'50%',
        background:'hsl('+Math.random()*360+',80%,60%)',
        left:e.clientX+'px',top:e.clientY+'px',zIndex:'999999',pointerEvents:'none'
      });
      document.body.appendChild(p);
      const angle = (Math.PI*2/12)*i;
      const dist = 30+Math.random()*40;
      p.animate([
        {transform:'translate(0,0) scale(1)',opacity:1},
        {transform:'translate('+(Math.cos(angle)*dist)+'px,'+(Math.sin(angle)*dist)+'px) scale(0)',opacity:0}
      ], {duration:500+Math.random()*300,easing:'ease-out'});
      setTimeout(()=>p.remove(), 800);
    }
  });
})();