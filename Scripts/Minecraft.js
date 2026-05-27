(async function() {
  // Load Matter.js if not present
  if (!window.Matter) {
    await new Promise(r => {
      let s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
      s.onload = r;
      document.head.appendChild(s);
    });
  }
  const { Engine, Render, Runner, Bodies, Composite } = window.Matter;

  // Add canvas overlay
  let canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.zIndex = 9999;
  document.body.appendChild(canvas);

  // Load images
  function loadImg(src) {
    return new Promise(res => {
      let img = new Image();
      img.src = src;
      img.onload = () => res(img);
    });
  }
  let grassImg = await loadImg('https://i.ibb.co/Gvxwwc6f/Grass.jpg');
  let stoneImg = await loadImg('https://i.ibb.co/TS6BrXF/stone.jpg');
  let oakImg = await loadImg('https://i.ibb.co/gCHmZWm/oak.jpg');
  let sandImg = await loadImg('https://i.ibb.co/Vc4qssXR/sand.jpg');
  let blockImgs = [stoneImg, oakImg, sandImg];

  // Matter.js setup
  let engine = Engine.create();
  let runner = Runner.create();
  let ctx = canvas.getContext('2d');
  let groundHeight = 40;
  let ground = Bodies.rectangle(canvas.width/2, canvas.height-groundHeight/2, canvas.width, groundHeight, { isStatic: true });
  Composite.add(engine.world, [ground]);

  // Block size (30% bigger than 32)
  let blockSize = Math.round(32 * 1.3); // ~42

  // Store block image index for each body
  let bodyToImg = new WeakMap();

  // Spawn block on click
  canvas.addEventListener('mousedown', function(e) {
    let x = e.clientX, y = e.clientY;
    let imgIdx = Math.floor(Math.random() * blockImgs.length);
    let block = Bodies.rectangle(x, y, blockSize, blockSize, { restitution: 0.2, friction: 0.8 });
    bodyToImg.set(block, imgIdx);
    Composite.add(engine.world, block);
  });

  // Render loop
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let bodies = Composite.allBodies(engine.world);
    for (let body of bodies) {
      let { position, angle } = body;
      if (body === ground) {
        // Tile the grass image across the ground
        let pattern = ctx.createPattern(grassImg, 'repeat');
        ctx.save();
        ctx.translate(position.x - canvas.width/2, position.y - groundHeight/2);
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, groundHeight);
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.rotate(angle);
        let imgIdx = bodyToImg.get(body) ?? 0;
        ctx.drawImage(blockImgs[imgIdx], -blockSize/2, -blockSize/2, blockSize, blockSize);
        ctx.restore();
      }
    }
    requestAnimationFrame(render);
  }

  Runner.run(runner, engine);
  render();

  // Resize canvas on window resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    Matter.Body.setPosition(ground, { x: canvas.width/2, y: canvas.height-groundHeight/2 });
    Matter.Body.setVertices(ground, Matter.Vertices.fromPath(`0 0 ${canvas.width} 0 ${canvas.width} ${groundHeight} 0 ${groundHeight}`));
  });
})();