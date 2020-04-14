

tg.rm = {};

tg.rm.init = function () {

    tg.rm.pathMap = {};
    tg.rm.initPathMap();
};

tg.rm.planBotRoute = function(){

};

// between two consecutive midpoints.
tg.rm.planIntermediateSubPath = function(midPointSource, midPointDestination){
    var direction = tg.rm.getDirection(midPointSource.start, midPointDestination.end);
    if(direction == null){ // curved path because the mid points are diagonal.
        // console.error('direction == null for terminal sub path.');
        var directionFirstHalf = tg.rm.getDirection(midPointSource.start, midPointSource.end);
        var directionSecondHalf = tg.rm.getDirection(midPointDestination.start, midPointDestination.end);
        var path = tg.rm.pathMap[directionFirstHalf][directionSecondHalf];
        for(var i = 0; i < path.length; ++ i){
            path[i].x += start.x;
            path[i].z += start.z;
        }
        return path;
    } else {
        var path = tg.rm.pathMap[direction].fullPath;
        for(var i = 0; i < path.length; ++ i){
            path[i].x += start.x;
            path[i].z += start.z;
        }
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
        for(var i = 0; i < path.length; ++ i){
            path[i].x += start.x;
            path[i].z += start.z;
        }
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
    tg.rm.pathMap.right = {};
    tg.rm.pathMap.right.fullPath = [{
            x: 0.125,
            z: 0,
            timeFactor: 0.125,
        },
        {
            x: 0.25,
            z: 0,
            timeFactor: 0.25,
        },
        {
            x: 0.375,
            z: 0,
            timeFactor: 0.375,
        },
        {
            x: 0.5,
            z: 0,
            timeFactor: 0.5,
        },
        {
            x: 0.625,
            z: 0,
            timeFactor: 0.625,
        },
        {
            x: 0.75,
            z: 0,
            timeFactor: 0.75,
        },
        {
            x: 0.875,
            z: 0,
            timeFactor: 0.875,
        },
        {
            x: 1,
            z: 0,
            timeFactor: 1
        },
    ];
    tg.rm.pathMap.right.halfPath = [{
            x: 0.125,
            z: 0,
            timeFactor: 0.125,
        },
        {
            x: 0.25,
            z: 0,
            timeFactor: 0.25,
        },
        {
            x: 0.375,
            z: 0,
            timeFactor: 0.375,
        },
        {
            x: 0.5,
            z: 0,
            timeFactor: 0.5,
        },
    ];


    tg.rm.pathMap.left = {};
    tg.rm.pathMap.left.fullPath = [{
            x: -0.125,
            z: 0,
            timeFactor: 0.125,
        },
        {
            x: -0.25,
            z: 0,
            timeFactor: 0.25,
        },
        {
            x: -0.375,
            z: 0,
            timeFactor: 0.375,
        },
        {
            x: -0.5,
            z: 0,
            timeFactor: 0.5,
        },
        {
            x: -0.625,
            z: 0,
            timeFactor: 0.625,
        },
        {
            x: -0.75,
            z: 0,
            timeFactor: 0.75,
        },
        {
            x: -0.875,
            z: 0,
            timeFactor: 0.875,
        },
        {
            x: -1,
            z: 0,
            timeFactor: 1
        },
    ];
    tg.rm.pathMap.left.halfPath = [{
            x: -0.125,
            z: 0,
            timeFactor: 0.125,
        },
        {
            x: -0.25,
            z: 0,
            timeFactor: 0.25,
        },
        {
            x: -0.375,
            z: 0,
            timeFactor: 0.375,
        },
        {
            x: -0.5,
            z: 0,
            timeFactor: 0.5,
        },
    ];

    tg.rm.pathMap.up = {};
    tg.rm.pathMap.up.fullPath = [{
            x: 0,
            z: 0.125,
            timeFactor: 0.125,
        },
        {
            x: 0,
            z: 0.25,
            timeFactor: 0.25,
        },
        {
            x: 0,
            z: 0.375,
            timeFactor: 0.375,
        },
        {
            x: 0,
            z: 0.5,
            timeFactor: 0.5,
        },
        {
            x: 0,
            z: 0.625,
            timeFactor: 0.625,
        },
        {
            x: 0,
            z: 0.75,
            timeFactor: 0.75,
        },
        {
            x: 0,
            z: 0.875,
            timeFactor: 0.875,
        },
        {
            x: 0,
            z: 1,
            timeFactor: 1
        },
    ];
    tg.rm.pathMap.up.halfPath = [{
            x: 0,
            z: 0.125,
            timeFactor: 0.125,
        },
        {
            x: 0,
            z: 0.25,
            timeFactor: 0.25,
        },
        {
            x: 0,
            z: 0.375,
            timeFactor: 0.375,
        },
        {
            x: 0,
            z: 0.5,
            timeFactor: 0.5,
        },
    ];

    tg.rm.pathMap.down = {};
    tg.rm.pathMap.down.fullPath = [{
            x: 0,
            z: -0.125,
            timeFactor: 0.125,
        },
        {
            x: 0,
            z: -0.25,
            timeFactor: 0.25,
        },
        {
            x: 0,
            z: -0.375,
            timeFactor: 0.375,
        },
        {
            x: 0,
            z: -0.5,
            timeFactor: 0.5,
        },
        {
            x: 0,
            z: -0.625,
            timeFactor: 0.625,
        },
        {
            x: 0,
            z: -0.75,
            timeFactor: 0.75,
        },
        {
            x: 0,
            z: -0.875,
            timeFactor: 0.875,
        },
        {
            x: 0,
            z: -1,
            timeFactor: 1
        },
    ];
    tg.rm.pathMap.down.halfPath = [{
            x: 0,
            z: -0.125,
            timeFactor: 0.125,
        },
        {
            x: 0,
            z: -0.25,
            timeFactor: 0.25,
        },
        {
            x: 0,
            z: -0.375,
            timeFactor: 0.375,
        },
        {
            x: 0,
            z: -0.5,
            timeFactor: 0.5,
        },
    ];

    tg.rm.pathMap.right.up = tg.rm.getCurvedPath({
        x: 1,
        z: 0
    }, {
        x: 1,
        z: 1
    }, );
    tg.rm.pathMap.right.down = tg.rm.getCurvedPath({
        x: 1,
        z: 0
    }, {
        x: 1,
        z: -1
    }, );

    tg.rm.pathMap.left.up = tg.rm.getCurvedPath({
        x: -1,
        z: 0
    }, {
        x: -1,
        z: 1
    }, );
    tg.rm.pathMap.left.down = tg.rm.getCurvedPath({
        x: -1,
        z: 0
    }, {
        x: -1,
        z: -1
    }, );

    tg.rm.pathMap.up.right = tg.rm.getCurvedPath({
        x: 0,
        z: 1
    }, {
        x: 1,
        z: 1
    }, );
    tg.rm.pathMap.up.left = tg.rm.getCurvedPath({
        x: 0,
        z: 1
    }, {
        x: -1,
        z: 1
    }, );

    tg.rm.pathMap.down.right = tg.rm.getCurvedPath({
        x: 0,
        z: -1
    }, {
        x: 1,
        z: -1
    }, );
    tg.rm.pathMap.down.left = tg.rm.getCurvedPath({
        x: 0,
        z: -1
    }, {
        x: -1,
        z: -1
    }, );
};

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
        x: (d.x + e.x) / 2,
        z: (d.z + e.z) / 2,
        timeFactor: 0.25,
    };
    var v3 = { // 4
        x: c.x,
        z: c.z,
        timeFactor: 0.5,
    };
    var v4 = { // 6
        x: (g.x + f.x) / 2,
        z: (g.z + f.z) / 2,
        timeFactor: 0.75,
    };
    var v5 = { // 8
        x: pos2.x,
        z: pos2.z,
        timeFactor: 1,
    };

    var v6 = { // 1
        x: (start.x + v2.x) / 2,
        z: (start.z + v2.z) / 2,
        timeFactor: 0.125,
    };
    var v7 = { // 3
        x: (v2.x + v3.x) / 2,
        z: (v2.z + v3.z) / 2,
        timeFactor: 0.375,
    };
    var v8 = { // 5
        x: (v3.x + v4.x) / 2,
        z: (v3.z + v4.z) / 2,
        timeFactor: 0.625,
    };
    var v9 = { // 7
        x: (v4.x + pos2.x) / 2,
        z: (v4.z + pos2.z) / 2,
        timeFactor: 0.875
    };

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