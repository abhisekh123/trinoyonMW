

tg.rm = {};

tg.rm.init = function () {

    tg.rm.pathMap = {};
    tg.rm.initPathMap();
};

tg.rm.planBotRoute = function(botObject, updateItemConfig){
    // console.log('updateItemConfig:', updateItemConfig);
    if(updateItemConfig.actionData.path.length < 2){
        return {
            x: (updateItemConfig.position[0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
            z: (updateItemConfig.position[2] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
            timeFactor: 0,
        };
    }

    var midPointArray = [];
    var incomingPath = [];

    // convert path from array to z,x coordinate object
    for(var i = 0; i < updateItemConfig.actionData.path.length; ++i){
        incomingPath.push({
            x: (updateItemConfig.actionData.path[i][0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
            z: (updateItemConfig.actionData.path[i][1] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
        });
    }

    // generate and populate mid point array
    for(var i = 1; i < incomingPath.length; ++i){
        midPointArray.push({
            start: incomingPath[i - 1],
            end: incomingPath[i]
        })
    }

    // var plannedPathArrayIndex = 0;
    var plannedPathArray = []; // this is the final planned path to be returned
    // initialise to starting position
    var plannedPositionRunner = { // this object maintains state of the last item in plannedPathArray
        x: incomingPath[0].x,
        z: incomingPath[0].z,
        time: tg.currentTime
    }

    // time taken for bot to travel from one planned path to next one.
    var timeToTravelToNextPlannedPathPosition = botObject.timeTakenToCover1Tile / tg.worldItems.uiConfig.plannedPathResolution;
    
    // plan path from start to first mid point
    var pathGuideArray = tg.rm.planTerminalSubPath(incomingPath[0], midPointArray[0].end);
    // console.log('pathGuideArray start:', pathGuideArray);
    for(var i = 0; i < pathGuideArray.length; ++i){
        
        plannedPositionRunner.time += timeToTravelToNextPlannedPathPosition;

        // creating seperate object to help garbage collection.
        plannedPathArray.push({
            x: plannedPositionRunner.x + pathGuideArray[i].x,
            z: plannedPositionRunner.z + pathGuideArray[i].z,
            time: plannedPositionRunner.time,
            rotation: pathGuideArray[i].rotation
        });
    }
    // console.log('plannedPathArray start:', plannedPathArray);
    plannedPositionRunner.x += pathGuideArray[pathGuideArray.length - 1].x;
    plannedPositionRunner.z += pathGuideArray[pathGuideArray.length - 1].z;

    // plan path between each mid point to next one
    for(var i = 1; i < midPointArray.length; ++i){
        pathGuideArray = tg.rm.planIntermediateSubPath(
            midPointArray[i - 1], 
            midPointArray[i]
        );
        // console.log('pathGuideArray:' + i + ':', pathGuideArray);
        for(var j = 0; j < pathGuideArray.length; ++j){
            plannedPositionRunner.time += timeToTravelToNextPlannedPathPosition;
            plannedPathArray.push({
                x: plannedPositionRunner.x + pathGuideArray[j].x,
                z: plannedPositionRunner.z + pathGuideArray[j].z,
                time: plannedPositionRunner.time,
                rotation: pathGuideArray[j].rotation
            });
        }
        // console.log('plannedPathArray:' + i + ':', plannedPathArray);
        plannedPositionRunner.x += pathGuideArray[pathGuideArray.length - 1].x;
        plannedPositionRunner.z += pathGuideArray[pathGuideArray.length - 1].z;
    }


    // plan path from last mid point to last path position
    pathGuideArray = tg.rm.planTerminalSubPath(
        midPointArray[midPointArray.length - 1].start,
        incomingPath[incomingPath.length - 1]
    );
    // console.log('pathGuideArray end:', pathGuideArray);
    for(var i = 0; i < pathGuideArray.length; ++i){
        plannedPositionRunner.time += timeToTravelToNextPlannedPathPosition;
        plannedPathArray.push({
            x: plannedPositionRunner.x + pathGuideArray[i].x,
            z: plannedPositionRunner.z + pathGuideArray[i].z,
            time: plannedPositionRunner.time,
            rotation: pathGuideArray[i].rotation
        });
    }

    // for(var i = 0; i < plannedPathArray.length; ++i){
    //     plannedPathArray[i].x = (plannedPathArray[i].x + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit;
    //     plannedPathArray[i].z = (plannedPathArray[i].z + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit;
    // }
    // console.log('plannedPathArray end:', plannedPathArray);
    // botObject.plannedPath = plannedPathArray;
    return plannedPathArray;
};

// between two consecutive midpoints.
tg.rm.planIntermediateSubPath = function(midPointSource, midPointDestination){
    var direction = tg.rm.getDirection(midPointSource.start, midPointDestination.end);
    if(direction == null){ // curved path because the mid points are diagonal.
        // console.error('direction == null for terminal sub path.');
        var directionFirstHalf = tg.rm.getDirection(midPointSource.start, midPointSource.end);
        var directionSecondHalf = tg.rm.getDirection(midPointDestination.start, midPointDestination.end);
        var path = tg.rm.pathMap[directionFirstHalf][directionSecondHalf];
        // for(var i = 0; i < path.length; ++ i){
        //     path[i].x += start.x;
        //     path[i].z += start.z;
        // }
        return path;
    } else {
        var path = tg.rm.pathMap[direction].fullPath;
        // for(var i = 0; i < path.length; ++ i){
        //     path[i].x += start.x;
        //     path[i].z += start.z;
        // }
        return path;
    }
};

// between start and first mid point or last midpoint and end.
tg.rm.planTerminalSubPath = function(start, end){
    var direction = tg.rm.getDirection(start, end);
    if(direction == null){
        console.error('direction == null for terminal sub path.');
        return [];
    } else {
        var path = tg.rm.pathMap[direction].halfPath;
        // for(var i = 0; i < path.length; ++ i){
        //     path[i].x += start.x;
        //     path[i].z += start.z;
        // }
        return path;
    }
};

tg.rm.getDirection = function(start, end){
    if(start.x == end.x || start.z == end.z){
        if(start.x != end.x){
            if(start.x < end.x){
                return 'right';
            } else {
                return 'left';
            }
        } else {
            if(start.z < end.z){
                return 'up';
            } else {
                return 'down';
            }
        }
    } else {
        return null;
    }
};

tg.rm.initPathMap = function () {
    var intermediateValueArray = [];
    var intermediateValue = tg.worldItems.uiConfig.playerDimensionBaseUnit / tg.worldItems.uiConfig.plannedPathResolution;
    var tmpValue = 0;

    for(var i = 0; i < tg.worldItems.uiConfig.plannedPathResolution; ++i){
        tmpValue += intermediateValue;
        intermediateValueArray.push(tmpValue);
    }

    tg.rm.pathMap.right = {};
    tg.rm.pathMap.right.fullPath = [];
    tg.rm.pathMap.right.halfPath = [];

    tg.rm.pathMap.left = {};
    tg.rm.pathMap.left.fullPath = [];
    tg.rm.pathMap.left.halfPath = [];

    tg.rm.pathMap.up = {};
    tg.rm.pathMap.up.fullPath = [];
    tg.rm.pathMap.up.halfPath = [];

    tg.rm.pathMap.down = {};
    tg.rm.pathMap.down.fullPath = [];
    tg.rm.pathMap.down.halfPath = [];

    // half of the resolution for (first half) fullpath and halfpath
    for(var i = 0; i < tg.worldItems.uiConfig.plannedPathResolution / 2; ++i){
        // right
        tg.rm.pathMap.right.fullPath.push({
            x: intermediateValueArray[i],
            z: 0,
            rotation: roundTo2Decimal(Math.PI / 2)
        });
        tg.rm.pathMap.right.halfPath.push({
            x: intermediateValueArray[i],
            z: 0,
            rotation: roundTo2Decimal(Math.PI / 2)
        });
        // left
        tg.rm.pathMap.left.fullPath.push({
            x: -intermediateValueArray[i],
            z: 0,
            rotation: roundTo2Decimal(Math.PI * 3 / 2)
        });
        tg.rm.pathMap.left.halfPath.push({
            x: -intermediateValueArray[i],
            z: 0,
            rotation: roundTo2Decimal(Math.PI * 3 / 2)
        });
        // up
        tg.rm.pathMap.up.fullPath.push({
            x: 0,
            z: intermediateValueArray[i],
            rotation: 0
        });
        tg.rm.pathMap.up.halfPath.push({
            x: 0,
            z: intermediateValueArray[i],
            rotation: 0
        });
        // down
        tg.rm.pathMap.down.fullPath.push({
            x: 0,
            z: -intermediateValueArray[i],
            rotation: roundTo2Decimal(Math.PI)
        });
        tg.rm.pathMap.down.halfPath.push({
            x: 0,
            z: -intermediateValueArray[i],
            rotation: roundTo2Decimal(Math.PI)
        });
    }

    // remaining half of the resolution to fill up (remainig half) of full path.
    for(var i = tg.worldItems.uiConfig.plannedPathResolution / 2; i < tg.worldItems.uiConfig.plannedPathResolution; ++i){
        // right
        tg.rm.pathMap.right.fullPath.push({
            x: intermediateValueArray[i],
            z: 0,
            rotation: roundTo2Decimal(Math.PI / 2)
        });
        // left
        tg.rm.pathMap.left.fullPath.push({
            x: -intermediateValueArray[i],
            z: 0,
            rotation: roundTo2Decimal(Math.PI * 3 / 2)
        });
        // up
        tg.rm.pathMap.up.fullPath.push({
            x: 0,
            z: intermediateValueArray[i],
            rotation: 0
        });
        // down
        tg.rm.pathMap.down.fullPath.push({
            x: 0,
            z: -intermediateValueArray[i],
            rotation: roundTo2Decimal(Math.PI)
        });
    }

    tg.rm.pathMap.right.up = tg.rm.getCurvedPath({
        x: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        z: 0
    }, {
        x: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        z: tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, );
    tg.rm.pathMap.right.down = tg.rm.getCurvedPath({
        x: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        z: 0
    }, {
        x: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        z: -tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, );

    tg.rm.pathMap.left.up = tg.rm.getCurvedPath({
        x: -tg.worldItems.uiConfig.playerDimensionBaseUnit,
        z: 0
    }, {
        x: -tg.worldItems.uiConfig.playerDimensionBaseUnit,
        z: tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, );
    tg.rm.pathMap.left.down = tg.rm.getCurvedPath({
        x: -tg.worldItems.uiConfig.playerDimensionBaseUnit,
        z: 0
    }, {
        x: -tg.worldItems.uiConfig.playerDimensionBaseUnit,
        z: -tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, );

    tg.rm.pathMap.up.right = tg.rm.getCurvedPath({
        x: 0,
        z: tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, {
        x: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        z: tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, );
    tg.rm.pathMap.up.left = tg.rm.getCurvedPath({
        x: 0,
        z: tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, {
        x: -tg.worldItems.uiConfig.playerDimensionBaseUnit,
        z: tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, );

    tg.rm.pathMap.down.right = tg.rm.getCurvedPath({
        x: 0,
        z: -tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, {
        x: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        z: -tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, );
    tg.rm.pathMap.down.left = tg.rm.getCurvedPath({
        x: 0,
        z: -tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, {
        x: -tg.worldItems.uiConfig.playerDimensionBaseUnit,
        z: -tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, );
}


tg.rm.getCurvedPath = function (pos1, pos2) {

    var start = {
        x: 0,
        z: 0
    };

    var a = { // mid start / pos1
        x: (start.x + pos1.x) / 2,
        z: (start.z + pos1.z) / 2,
    };

    var b = { // mid pos1 / pos2
        x: (pos1.x + pos2.x) / 2,
        z: (pos1.z + pos2.z) / 2,
    };

    var c = { // mid a / b
        x: (a.x + b.x) / 2,
        z: (a.z + b.z) / 2,
    }

    var d = { // mid start / a
        x: (start.x + a.x) / 2,
        z: (start.z + a.z) / 2,
    }
    var e = { // mid a / c
        x: (a.x + c.x) / 2,
        z: (a.z + c.z) / 2,
    }
    var f = { // mid b / pos2
        x: (b.x + pos2.x) / 2,
        z: (b.z + pos2.z) / 2,
    }
    var g = { // mid c / b
        x: (c.x + b.x) / 2,
        z: (c.z + b.z) / 2,
    }


    var v2 = { // 2
        x: roundTo2Decimal((d.x + e.x) / 2),
        z: roundTo2Decimal((d.z + e.z) / 2),
    };
    
    var v3 = { // 4
        x: roundTo2Decimal(c.x),
        z: roundTo2Decimal(c.z),
    };
    var v4 = { // 6
        x: roundTo2Decimal((g.x + f.x) / 2),
        z: roundTo2Decimal((g.z + f.z) / 2),
    };
    var v5 = { // 8
        x: roundTo2Decimal(pos2.x),
        z: roundTo2Decimal(pos2.z),
    };

    var v6 = { // 1
        x: roundTo2Decimal((start.x + v2.x) / 2),
        z: roundTo2Decimal((start.z + v2.z) / 2),
    };
    var v7 = { // 3
        x: roundTo2Decimal((v2.x + v3.x) / 2),
        z: roundTo2Decimal((v2.z + v3.z) / 2),
    };
    var v8 = { // 5
        x: roundTo2Decimal((v3.x + v4.x) / 2),
        z: roundTo2Decimal((v3.z + v4.z) / 2),
    };
    var v9 = { // 7
        x: roundTo2Decimal((v4.x + pos2.x) / 2),
        z: roundTo2Decimal((v4.z + pos2.z) / 2),
    };

    v2.rotation = roundTo2Decimal(Math.atan2((v2.x - v6.x), (v2.z - v6.z)));
    v9.rotation = roundTo2Decimal(Math.atan2((v9.x - v4.x), (v9.z - v4.z)));
    v8.rotation = roundTo2Decimal(Math.atan2((v8.x - v3.x), (v8.z - v3.z)));
    v7.rotation = roundTo2Decimal(Math.atan2((v7.x - v2.x), (v7.z - v2.z)));
    v6.rotation = roundTo2Decimal(Math.atan2((v6.x - start.x), (v6.z - start.z)));
    v5.rotation = roundTo2Decimal(Math.atan2((pos2.x - v9.x), (pos2.z - v9.z)));
    v3.rotation = roundTo2Decimal(Math.atan2((v3.x - v7.x), (v3.z - v7.z)));
    v4.rotation = roundTo2Decimal(Math.atan2((v4.x - v8.x), (v4.z - v8.z)));

    var path = [];
    path.push(v6);
    path.push(v2);
    path.push(v7);
    path.push(v3);
    path.push(v8);
    path.push(v4);
    path.push(v9);
    path.push(v5);
    return path;
};
