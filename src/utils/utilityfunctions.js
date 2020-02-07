
// Contains only pure functions.
module.exports = {
    dateObject:new Date(),
    stringArrayToNumberArray:function (stringArray){
        if(typeof stringArray !== 'undefined' && stringArray && stringArray.length > 0){
            return stringArray.map(Number);
        }
        return [];
    },
    getUniqueID: function(prefixParam, mapParam){
        var newName = prefixParam + this.getCurrentTime;
        var newNameReference = newName;
        var index = 0;
        while(mapParam[newName] != undefined){
            index++;
            newName = newNameReference + '_' + index;
        }
        return newName;
    },

    getCurrentTime:function(){
        // const d = new Date();
        // const n = d.getTime();
        // return n;
        // return this.dateObject.getTime();
        return Date.now();
    },
    dumpJSONtoOutput:function(jsonParam){
        console.log(JSON.stringify(jsonParam));
    },  
    roundTo2Decimal: function (floatValue) {
        return (Math.round(floatValue * 100) / 100);
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
};