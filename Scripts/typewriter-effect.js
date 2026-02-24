// Typewriter Effect
(function() {
  const original = document.title;
  let i = 0;
  document.title = '';
  const interval = setInterval(() => {
    document.title = original.substring(0, i++) + '|';
    if (i > original.length) {
      document.title = original;
      clearInterval(interval);
    }
  }, 100);
})();