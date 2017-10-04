let modified = 0;

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

function sortPixelsLAB(data, canvasWidth, canvasHeight) {
    let y, x;
    for(y = 0; y < canvasHeight; y++) {
        for(x = 0; x < canvasWidth; x++) {
            let index = (y * canvasWidth + x) * 4;
            let index2 = (y * canvasWidth + (x + 1)) * 4;
            let index3 = ((y + 1) * canvasWidth + x) * 4;
        
            let c1 = RGBtoLAB(data[index], data[index + 1], data[index + 2]);
            if(x + 1 < canvasWidth) {
                let c2 = RGBtoLAB(data[index2], data[index2 + 1], data[index2 + 2]);
                if (c1.l > c2.l) {
                    [data[index], data[index2]] = [data[index2], data[index]];
                    [data[index + 1], data[index2 + 1]] = [data[index2 + 1], data[index + 1]];
                    [data[index + 2], data[index2 + 2]] = [data[index2 + 2], data[index + 2]];
                    modified++;
                }
            }
            if(y + 1 < canvasHeight) {
                let c3 = RGBtoLAB(data[index3], data[index3 + 1], data[index3 + 2]);
                if (c1.b < c3.b) {
                    [data[index], data[index3]] = [data[index3], data[index]];
                    [data[index + 1], data[index3 + 1]] = [data[index3 + 1], data[index + 1]];
                    [data[index + 2], data[index3 + 2]] = [data[index3 + 2], data[index + 2]];
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
    for(let i = 0; true; i += 1) {
        modified = 0;
        canvasData = sortPixelsLAB(canvasData, canvasWidth, canvasHeight);
        self.postMessage({ canvasData: canvasData, done: false });
        if(modified < 500) {
            break;
        }
    }
    self.postMessage({ done: true });
    console.log("lab-worker:", "My job is done");
};