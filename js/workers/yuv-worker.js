let modified = 0;
let grid = [];

function rgbToYuv(r, g, b){
    let y =  0.299*r + 0.587*g + 0.114*b;
    let u = -0.147*r - 0.289*g + 0.436*b;
    let v =  0.615*r - 0.515*g - 0.100*b;

    return { y: y, u: u, v: v };
}

function generateGrid(data, canvasWidth, canvasHeight) {
    let y, x;
    for(y = 0; y < canvasHeight; y++) {
        for(x = 0; x < canvasWidth; x++) {
            let index = (y * canvasWidth + x) * 4;
            let cell = rgbToYuv(data[index], data[index + 1], data[index + 2]);
            grid[index] = cell.y;
            grid[index + 1] = cell.u;
            grid[index + 2] = cell.v;
        }
    }
}

function sortPixelsYUV(data, canvasWidth, canvasHeight) {
    let y, x;
    for(y = 0; y < canvasHeight; y++) {
        for(x = 0; x < canvasWidth; x++) {
            let index = (y * canvasWidth + x) * 4;
            let index2 = (y * canvasWidth + (x + 1)) * 4;
            let index3 = ((y + 1) * canvasWidth + x) * 4;
        
            if(x + 1 < canvasWidth) {
                if (grid[index + 2] > grid[index2 + 2]) {
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
        canvasData = sortPixelsYUV(canvasData, canvasWidth, canvasHeight);
        self.postMessage({ canvasData: canvasData, done: false });
        if(modified < 100) {
            break;
        }
    }
    self.postMessage({ done: true });
    console.log("yuv-worker:", "My job is done");
};