// Upside Down Page
(function() {
  if (document.body.style.transform === 'rotate(180deg)') {
    document.body.style.transform = '';
  } else {
    document.body.style.transform = 'rotate(180deg)';
    document.body.style.transformOrigin = 'center center';
  }
})();