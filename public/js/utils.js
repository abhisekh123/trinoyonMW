

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {
        type: contentType
    });
    return blob;
};

function base64StringToBlob(base64String){
    var blob = b64toBlob(data, {
        type: 'image/jpg'
    });
    var blobUrl = URL.createObjectURL(blob);
    return blobUrl;
};

function getGridPositionFromFloorPosition(positionValue){
    return Math.floor(positionValue / tg.worldItems.uiConfig.playerDimensionBaseUnit);
}

function getFloorPositionFromGridPosition(positionValue){
    return positionValue * tg.worldItems.uiConfig.playerDimensionBaseUnit;
}

function getCurrentTime () {
    // const d = new Date();
    // const n = d.getTime();
    // return n;
    // return this.dateObject.getTime();
    return Date.now();
};

function roundTo2Decimal (floatValue) {
    return (Math.round(floatValue * 100) / 100);
}
