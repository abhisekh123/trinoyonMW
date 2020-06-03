tg.uu = {};

tg.uu.convertSecondsHHMMSS = function (sec) {
    var hrs = Math.floor(sec / 3600);
    var min = Math.floor((sec - (hrs * 3600)) / 60);
    var seconds = sec - (hrs * 3600) - (min * 60);
    seconds = Math.round(seconds * 100) / 100

    var result = (hrs < 10 ? "0" + hrs : hrs);
    result += "-" + (min < 10 ? "0" + min : min);
    result += "-" + (seconds < 10 ? "0" + seconds : seconds);
    return result;
};

tg.uu.convertSecondsMMSS = function (sec) {
    // var hrs = Math.floor(sec / 3600);
    sec = Math.floor(sec);
    var min = Math.floor(sec / 60);
    var seconds = sec - (min * 60);
    seconds = Math.round(seconds * 100) / 100

    // var result = (hrs < 10 ? "0" + hrs : hrs);
    var result = (min < 10 ? "0" + min : min);
    result += ":" + (seconds < 10 ? "0" + seconds : seconds);
    return result;
};

tg.uu.getObjectKeys = function (objectParam) {
    return Object.keys(objectParam);
};

tg.uu.getObjectValues = function (objectParam) {
    return Object.values(objectParam);
};

// both inputs should be integers.
tg.uu.getRandom = function (rangeStart, rangeEnd) {
    return Math.floor(Math.random() * (rangeEnd - rangeStart)) + rangeStart;
};

