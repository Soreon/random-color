let modified = 0;
let grid = [];

function RGBtoLAB(r, g, b) {
    let x, y, z;

    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

    x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

    return {l:(116 * y) - 16, a:500 * (x - y), b:200 * (y - z)};
}

function generateGrid(data, canvasWidth, canvasHeight) {
    let y, x;
    for(y = 0; y < canvasHeight; y++) {
        for(x = 0; x < canvasWidth; x++) {
            let index = (y * canvasWidth + x) * 4;
            let cell = RGBtoLAB(data[index], data[index + 1], data[index + 2]);
            grid[index] = cell.l;
            grid[index + 1] = cell.a;
            grid[index + 2] = cell.b;
        }
    }
}

function sortPixelsLAB(data, canvasWidth, canvasHeight) {
    let y, x;
    for(y = 0; y < canvasHeight; y++) {
        for(x = 0; x < canvasWidth; x++) {
            let index = (y * canvasWidth + x) * 4;
            let index2 = (y * canvasWidth + (x + 1)) * 4;
            let index3 = ((y + 1) * canvasWidth + x) * 4;
        
            if(x + 1 < canvasWidth) {
                if (grid[index] > grid[index2]) {
                    data[index] = [data[index2], data[index2]=data[index]][0];
                    data[index+1] = [data[index2+1], data[index2+1]=data[index+1]][0];
                    data[index+2] = [data[index2+2], data[index2+2]=data[index+2]][0];
                    grid[index] = [grid[index2], grid[index2]=grid[index]][0];
                    grid[index+1] = [grid[index2+1], grid[index2+1]=grid[index+1]][0];
                    grid[index+2] = [grid[index2+2], grid[index2+2]=grid[index+2]][0];
                    modified++;
                }
            }
            if(y + 1 < canvasHeight) {
                if (grid[index] < grid[index3]) {
                    data[index] = [data[index3], data[index3]=data[index]][0];
                    data[index+1] = [data[index3+1], data[index3+1]=data[index+1]][0];
                    data[index+2] = [data[index3+2], data[index3+2]=data[index+2]][0];
                    grid[index] = [grid[index3], grid[index3]=grid[index]][0];
                    grid[index+1] = [grid[index3+1], grid[index3+1]=grid[index+1]][0];
                    grid[index+2] = [grid[index3+2], grid[index3+2]=grid[index+2]][0];
                    modified++;
                }
            }
        }
    }
    return data;
}

self.onmessage = function (e) {
    let canvasData = e.data.canvasData;
    let canvasWidth = e.data.canvasWidth;
    let canvasHeight = e.data.canvasHeight;
    generateGrid(canvasData, canvasWidth, canvasHeight);
    for(let i = 0; true; i += 1) {
        modified = 0;
        canvasData = sortPixelsLAB(canvasData, canvasWidth, canvasHeight);
        self.postMessage({ canvasData: canvasData, done: false });
        if(modified < 100) {
            break;
        }
    }
    self.postMessage({ done: true });
    console.log("lab-worker:", "My job is done");
};