(() => {
	const instanceKey = "__pixelShuffleOverlay";
	if (window[instanceKey]?.cleanup) {
		window[instanceKey].cleanup();
	}

	const html2canvasUrl = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
	const root = document.createElement("div");
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d", { willReadFrequently: true });

	Object.assign(root.style, {
		position: "fixed",
		inset: "0",
		zIndex: "2147483647",
		pointerEvents: "none",
		overflow: "hidden",
		background: "transparent",
	});

	Object.assign(canvas.style, {
		width: "100%",
		height: "100%",
		display: "block",
		imageRendering: "pixelated",
	});

	root.appendChild(canvas);
	document.documentElement.appendChild(root);

	let destroyed = false;
	let animationFrame = 0;
	let sourceCanvas = null;
	let workingData = null;
	let width = 0;
	let height = 0;
	const blockSize = 6;
	const swapsPerFrame = 24;

	function randomBlockOrigin() {
		return {
			x: Math.floor(Math.random() * Math.max(1, width - blockSize)),
			y: Math.floor(Math.random() * Math.max(1, height - blockSize)),
		};
	}

	function swapBlocks(first, second) {
		if (!workingData) {
			return;
		}

		const data = workingData.data;
		for (let offsetY = 0; offsetY < blockSize; offsetY += 1) {
			for (let offsetX = 0; offsetX < blockSize; offsetX += 1) {
				const firstIndex = ((first.y + offsetY) * width + (first.x + offsetX)) * 4;
				const secondIndex = ((second.y + offsetY) * width + (second.x + offsetX)) * 4;

				for (let channel = 0; channel < 4; channel += 1) {
					const temp = data[firstIndex + channel];
					data[firstIndex + channel] = data[secondIndex + channel];
					data[secondIndex + channel] = temp;
				}
			}
		}
	}

	function tick() {
		if (destroyed || !workingData || !context) {
			return;
		}

		for (let index = 0; index < swapsPerFrame; index += 1) {
			swapBlocks(randomBlockOrigin(), randomBlockOrigin());
		}

		context.putImageData(workingData, 0, 0);
		animationFrame = window.requestAnimationFrame(tick);
	}

	function handleKeyDown(event) {
		if (event.key === "Escape") {
			cleanup();
		}
	}

	function cleanup() {
		if (destroyed) {
			return;
		}

		destroyed = true;
		window.removeEventListener("keydown", handleKeyDown, true);
		if (animationFrame) {
			window.cancelAnimationFrame(animationFrame);
		}
		root.remove();
		delete window[instanceKey];
	}

	function loadHtml2Canvas() {
		if (window.html2canvas) {
			return Promise.resolve(window.html2canvas);
		}

		if (window.__pixelShuffleHtml2CanvasPromise) {
			return window.__pixelShuffleHtml2CanvasPromise;
		}

		window.__pixelShuffleHtml2CanvasPromise = new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src = html2canvasUrl;
			script.async = true;
			script.onload = () => {
				if (window.html2canvas) {
					resolve(window.html2canvas);
				} else {
					reject(new Error("html2canvas loaded without creating window.html2canvas"));
				}
			};
			script.onerror = () => reject(new Error("Failed to load html2canvas"));
			document.head.appendChild(script);
		});

		return window.__pixelShuffleHtml2CanvasPromise;
	}

	async function init() {
		try {
			const html2canvas = await loadHtml2Canvas();
			if (destroyed) {
				return;
			}

			sourceCanvas = await html2canvas(document.documentElement, {
				backgroundColor: null,
				logging: false,
				useCORS: true,
				scale: Math.max(0.5, Math.min(1, window.devicePixelRatio || 1)),
				width: window.innerWidth,
				height: window.innerHeight,
				x: window.scrollX,
				y: window.scrollY,
				windowWidth: document.documentElement.clientWidth,
				windowHeight: document.documentElement.clientHeight,
			});

			if (destroyed) {
				return;
			}

			width = sourceCanvas.width;
			height = sourceCanvas.height;
			canvas.width = width;
			canvas.height = height;
			context.drawImage(sourceCanvas, 0, 0);
			workingData = context.getImageData(0, 0, width, height);
			animationFrame = window.requestAnimationFrame(tick);
		} catch (error) {
			console.error("Pixel shuffle overlay failed to initialize:", error);
			cleanup();
		}
	}

	window.addEventListener("keydown", handleKeyDown, true);
	window[instanceKey] = { cleanup };
	init();
})();
