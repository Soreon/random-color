let modified = 0;

function sortPixelsLum(data, canvasWidth, canvasHeight) {
    let y, x;
    for(y = 0; y < canvasHeight; y++) {
        for(x = 0; x < canvasWidth; x++) {
            let index = (y * canvasWidth + x) * 4;
            let index2 = ((y + 1) * canvasWidth + x) * 4;
        
            let c1 = Math.sqrt( .241 * data[index] + .691 * data[index + 1] + .068 * data[index + 2] );
            if(y + 1 < canvasHeight) {
                let c2 = Math.sqrt( .241 * data[index2] + .691 * data[index2 + 1] + .068 * data[index2 + 2] );
                if (c1 < c2) {
                    data[index] = [data[index2], data[index2]=data[index]][0];
                    data[index+1] = [data[index2+1], data[index2+1]=data[index+1]][0];
                    data[index+2] = [data[index2+2], data[index2+2]=data[index+2]][0];
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
        canvasData = sortPixelsLum(canvasData, canvasWidth, canvasHeight);
        self.postMessage({ canvasData: canvasData, done: false });
        if(modified < 250) {
            break;
        }
    }
    self.postMessage({ done: true });
    console.log("lum-worker:", "My job is done");
};