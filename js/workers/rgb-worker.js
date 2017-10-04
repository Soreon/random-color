let modified = 0;

function sortPixelsRGB(data, canvasWidth, canvasHeight) {
    let y, x;
    for(y = 0; y < canvasHeight; y++) {
        for(x = 0; x < canvasWidth; x++) {
            let index = (y * canvasWidth + x) * 4;
            let index2 = (y * canvasWidth + (x + 1)) * 4;
            let index3 = ((y + 1) * canvasWidth + x) * 4;
        
            if(x + 1 < canvasWidth) {
                if (data[index] > data[index2]) {
                    [data[index], data[index2]] = [data[index2], data[index]];
                    [data[index + 1], data[index2 + 1]] = [data[index2 + 1], data[index + 1]];
                    [data[index + 2], data[index2 + 2]] = [data[index2 + 2], data[index + 2]];
                    modified++;
                }
            }
            if(y + 1 < canvasHeight) {
                if (data[index + 2] > data[index3 + 2]) {
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
        canvasData = sortPixelsRGB(canvasData, canvasWidth, canvasHeight);
        self.postMessage({ canvasData: canvasData, done: false });
        if(modified == 0) {
            break;
        }
    }
    self.postMessage({ done: true });
    console.log("rgb-worker:", "My job is done");
};