const canvas = document.getElementById("main-canvas");
const context = canvas.getContext('2d');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
const canvasWidth  = canvas.width;
const canvasHeight = canvas.height;
let running = false;

let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
let data = imageData.data;
context.translate(0.5, 0.5);

function createColorGrid() {
    let y, x;
    for(y = 0; y < canvasHeight; ++y) {
        for(x = 0; x < canvasWidth; ++x) {
            let index = (y * canvasWidth + x) * 4;
            data[index]   = Math.random() * 256 ;
            data[++index] = Math.random() * 256 ;
            data[++index] = Math.random() * 256 ;
            data[++index] = 255;
        }
    }
}

let rgbWorker = new Worker("js/workers/rgb-worker.js");
let hsvWorker = new Worker("js/workers/hsv-worker.js");
let hslWorker = new Worker("js/workers/hsl-worker.js");
let lumWorker = new Worker("js/workers/lum-worker.js");
let yuvWorker = new Worker("js/workers/yuv-worker.js");

function workerDone(e) {
    if(!e.data.done) {
        let canvasData = e.data.canvasData;
        imageData.data.set(canvasData);
    } else {
        running = false;
    }
};

rgbWorker.onmessage = workerDone;
hsvWorker.onmessage = workerDone;
hslWorker.onmessage = workerDone;
lumWorker.onmessage = workerDone;
yuvWorker.onmessage = workerDone;

let i = 0;
function animate() {
    context.putImageData(imageData, 0, 0);
    requestAnimationFrame(animate);
}

createColorGrid();
context.putImageData(imageData, 0, 0);
animate();

function runWorker(worker) {
    if(!running) {
        worker.postMessage({ canvasData: data, canvasWidth: canvasWidth, canvasHeight: canvasHeight });
        running = true;
    } else {
        console.warn("A worker is currently running");
    }
}

document.getElementById('rgb-sorting').addEventListener('click', () => {
    runWorker(rgbWorker);
});

document.getElementById('hsl-sorting').addEventListener('click', () => {
    runWorker(hslWorker);
});

document.getElementById('hsv-sorting').addEventListener('click', () => {
    runWorker(hsvWorker);
});

document.getElementById('lum-sorting').addEventListener('click', () => {
    runWorker(lumWorker);
});

document.getElementById('yuv-sorting').addEventListener('click', () => {
    runWorker(yuvWorker);
});