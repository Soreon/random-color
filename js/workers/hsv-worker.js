let modified = 0;

function RGBtoHSV(r, g, b) {
    let rg = r > g ? r : g;
    let max  = rg > b ? rg : b;
    rg = r < g ? r : g;
    let min  = rg < b ? rg : b;

    let d = max - min;
    let h;
    let s = (max === 0 ? 0 : d / max);
    let v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
        h: h,
        s: s,
        v: v
    };
}

function sortPixelsHSV(data, canvasWidth, canvasHeight) {
    let y, x;
    for(y = 0; y < canvasHeight; y++) {
        for(x = 0; x < canvasWidth; x++) {
            let index = (y * canvasWidth + x) * 4;
            let index2 = (y * canvasWidth + (x + 1)) * 4;
            let index3 = ((y + 1) * canvasWidth + x) * 4;
        
            let c1 = RGBtoHSV(data[index], data[index + 1], data[index + 2]);
            if(x + 1 < canvasWidth) {
                let c2 = RGBtoHSV(data[index2], data[index2 + 1], data[index2 + 2]);
                if (c1.h > c2.h) {
                    [data[index], data[index2]] = [data[index2], data[index]];
                    [data[index + 1], data[index2 + 1]] = [data[index2 + 1], data[index + 1]];
                    [data[index + 2], data[index2 + 2]] = [data[index2 + 2], data[index + 2]];
                    modified++;
                }
            }
            if(y + 1 < canvasHeight) {
                let c3 = RGBtoHSV(data[index3], data[index3 + 1], data[index3 + 2]);
                if (c1.v < c3.v) {
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
        canvasData = sortPixelsHSV(canvasData, canvasWidth, canvasHeight);
        self.postMessage({ canvasData: canvasData, done: false });
        if(modified < 500) {
            break;
        }
    }
    self.postMessage({ done: true });
    console.log("hsv-worker:", "My job is done");
};