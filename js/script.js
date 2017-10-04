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

// Initialisation de la grille de pixels avec des couleurs aléatiores
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

// Callback de réponse des workers
function workerDone(e) {
    if(!e.data.done) {
        let canvasData = e.data.canvasData;
        imageData.data.set(canvasData);
    } else {
        running = false;
    }
};

// Function d'appel des workers
function runWorker(worker) {
    if(!running) {
        worker.postMessage({ canvasData: data, canvasWidth: canvasWidth, canvasHeight: canvasHeight });
        running = true;
    } else {
        console.warn("A worker is currently running");
    }
}

// Création des workers
let colorSpaces = ['rgb','hsv','hsl','lum','yuv','lab'];
let workers = {};
colorSpaces.forEach(function(colorSpace) {
    workers[colorSpace + 'Worker'] = new Worker("js/workers/" + colorSpace + "-worker.js");
    workers[colorSpace + 'Worker'].onmessage = workerDone;
    document.getElementById(colorSpace + '-sorting').addEventListener('click', () => {
        runWorker(workers[colorSpace + 'Worker']);
    });
}, this);

let i = 0;
function animate() {
    context.putImageData(imageData, 0, 0);
    requestAnimationFrame(animate);
}

createColorGrid();
context.putImageData(imageData, 0, 0);
animate();