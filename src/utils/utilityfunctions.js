const util = require('util');
// Contains only pure functions.
module.exports = {
    dateObject: new Date(),
    stringArrayToNumberArray: function (stringArray) {
        if (typeof stringArray !== 'undefined' && stringArray && stringArray.length > 0) {
            return stringArray.map(Number);
        }
        return [];
    },
    getUniqueID: function (prefixParam, mapParam) {
        var newName = prefixParam + this.getCurrentTime;
        var newNameReference = newName;
        var index = 0;
        while (mapParam[newName] != undefined) {
            index++;
            newName = newNameReference + '_' + index;
        }
        return newName;
    },

    // both inputs should be integers.
    getRandom: function (rangeStart, rangeEnd) {
        return Math.floor(Math.random() * (rangeEnd - rangeStart)) + rangeStart;
    },

    getCurrentTime: function () {
        // const d = new Date();
        // const n = d.getTime();
        // return n;
        // return this.dateObject.getTime();
        return Date.now();
    },
    dumpJSONtoOutput: function (jsonParam) {
        console.log(JSON.stringify(jsonParam));
    },
    roundTo2Decimal: function (floatValue) {
        return (Math.round(floatValue * 100) / 100);
    },

    cloneObject: function (jsonObject) {
        return JSON.parse(JSON.stringify(jsonObject));
    },

    getObjectKeys: function (objectParam) {
        return Object.keys(objectParam);
    },

    getObjectValues: function (objectParam) {
        return Object.values(objectParam);
    },

    isPointInRangeBox: function (x, z, originX, originZ, rangeParam) {
        if (x < (originX - rangeParam) || x > (originX + rangeParam)) {
            return false;
        }
        if (z < (originZ - rangeParam) || z > (originZ + rangeParam)) {
            return false;
        }
        return true;
    },

    convertSecondsHHMMSS: function (sec) {
        var hrs = Math.floor(sec / 3600);
        var min = Math.floor((sec - (hrs * 3600)) / 60);
        var seconds = sec - (hrs * 3600) - (min * 60);
        seconds = Math.round(seconds * 100) / 100

        var result = (hrs < 10 ? "0" + hrs : hrs);
        result += "-" + (min < 10 ? "0" + min : min);
        result += "-" + (seconds < 10 ? "0" + seconds : seconds);
        return result;
    },

    convertSecondsMMSS: function (sec) {
        // var hrs = Math.floor(sec / 3600);
        var min = Math.floor(sec / 60);
        var seconds = sec - (min * 60);
        seconds = Math.round(seconds * 100) / 100

        // var result = (hrs < 10 ? "0" + hrs : hrs);
        var result = (min < 10 ? "0" + min : min);
        result += "-" + (seconds < 10 ? "0" + seconds : seconds);
        return result;
    },
    printEntireObjectNeatyle: function(objectParam){
        // console.log(util.inspect(objectParam, false, null, true /* enable colors */));
        console.log(JSON.stringify(objectParam, null, 4));
    },
    getRandomArbitrary: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    getRandomInt: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};