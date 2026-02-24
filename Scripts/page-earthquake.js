// Page Earthquake
(function() {
  const orig = document.body.style.cssText;
  let count = 0;
  const shake = setInterval(() => {
    const x = (Math.random() - 0.5) * 20;
    const y = (Math.random() - 0.5) * 20;
    const r = (Math.random() - 0.5) * 5;
    document.body.style.transform = 'translate('+x+'px,'+y+'px) rotate('+r+'deg)';
    if (++count > 60) {
      clearInterval(shake);
      document.body.style.cssText = orig;
    }
  }, 50);
})();