let modified = 0;

function rgbToYuv(r, g, b){
    let y =  0.299*r + 0.587*g + 0.114*b;
    let u = -0.147*r - 0.289*g + 0.436*b;
    let v =  0.615*r - 0.515*g - 0.100*b;

    return { y: y, u: u, v: v };
}

function sortPixelsYUV(data, canvasWidth, canvasHeight) {
    let y, x;
    for(y = 0; y < canvasHeight; y++) {
        for(x = 0; x < canvasWidth; x++) {
            let index = (y * canvasWidth + x) * 4;
            let index2 = (y * canvasWidth + (x + 1)) * 4;
            let index3 = ((y + 1) * canvasWidth + x) * 4;
        
            let c1 = rgbToYuv(data[index], data[index + 1], data[index + 2]);
            if(x + 1 < canvasWidth) {
                let c2 = rgbToYuv(data[index2], data[index2 + 1], data[index2 + 2]);
                if (c1.v > c2.v) {
                    [data[index], data[index2]] = [data[index2], data[index]];
                    [data[index + 1], data[index2 + 1]] = [data[index2 + 1], data[index + 1]];
                    [data[index + 2], data[index2 + 2]] = [data[index2 + 2], data[index + 2]];
                    modified++;
                }
            }
            if(y + 1 < canvasHeight) {
                let c3 = rgbToYuv(data[index3], data[index3 + 1], data[index3 + 2]);
                if (c1.y < c3.y) {
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
        canvasData = sortPixelsYUV(canvasData, canvasWidth, canvasHeight);
        self.postMessage({ canvasData: canvasData, done: false });
        if(modified < 100) {
            break;
        }
    }
    self.postMessage({ done: true });
    console.log("yuv-worker:", "My job is done");
};