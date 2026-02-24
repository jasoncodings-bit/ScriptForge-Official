// Disco Mode
(function() {
  const colors = ['#ff0000','#ff8800','#ffff00','#00ff00','#0088ff','#8800ff','#ff00ff'];
  let i = 0;
  const interval = setInterval(() => {
    document.body.style.backgroundColor = colors[i % colors.length];
    document.body.style.transition = 'background-color 0.2s';
    i++;
  }, 300);
  setTimeout(() => { clearInterval(interval); document.body.style.backgroundColor = ''; }, 6000);
})();