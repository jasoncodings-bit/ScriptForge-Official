(async function() {
  // Image URL
  const imgUrl = "https://i.ibb.co/Y706SpP4/creepy-face-by-randyharry2009-dg3f0sg-fullview.jpg";
  // Pixel size for pixelation
  const pixelSize = 8;

  // Create overlay canvas
  let canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.zIndex = 99999;
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);
  let ctx = canvas.getContext('2d');

  // Load image
  let img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imgUrl;
  await new Promise(res => img.onload = res);

  // Resize image to fit screen
  let w = Math.ceil(canvas.width / pixelSize);
  let h = Math.ceil(canvas.height / pixelSize);

  // Draw image to offscreen canvas for sampling
  let off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  let offCtx = off.getContext('2d');
  offCtx.drawImage(img, 0, 0, w, h);

  // Prepare pixel positions
  let pixels = [];
  for (let y = 0; y < h; ++y) for (let x = 0; x < w; ++x) pixels.push([x, y]);
  // Shuffle pixels for random reveal
  for (let i = pixels.length - 1; i > 0; --i) {
    let j = Math.floor(Math.random() * (i + 1));
    [pixels[i], pixels[j]] = [pixels[j], pixels[i]];
  }

  // Reveal loop (10x slower: 1 pixel every 10 frames)
  let idx = 0;
  let frameCount = 0;
  function revealStep() {
    frameCount++;
    if (frameCount >= 10 && idx < pixels.length) {
      let [x, y] = pixels[idx];
      let color = offCtx.getImageData(x, y, 1, 1).data;
      ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      idx++;
      frameCount = 0;
    }
    if (idx < pixels.length) {
      requestAnimationFrame(revealStep);
    }
  }
  revealStep();

  // Optional: handle window resize (not animated, but keeps overlay)
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
})();