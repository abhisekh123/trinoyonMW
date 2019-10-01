
const PF = require('pathfinding');
const world_config = require(__dirname + '/../../data/world_config');
const workerstate = require('./workerstate');
const botroutemanager = require(__dirname + '/botroutemanager');

var fs = require('fs');
const readline = require('readline');

module.exports = {
    workerRegister:{},
    grid: null,
    gridBackup: null,
    finder:null,
    mapPrecalculatedDataGrid: null,
    botPositionArray: new Array(), // bot id vs bot position.
    finder: null,
    tempGrid: null, // contains 53 x 53 grid that will be used for generating visibility map.
    visibilityMatrix: null, // grid floor meta data : bot ID + visibility matrix (per grid position)
    distanceMatrix: null,
    maxRange: 26,
    neighbourhoodBoxSide: 53,
    maxBotCount: 100,
    createFreshVisibility: true,

    restoreGrid: function(){
        this.grid = this.gridBackup.clone();
    },

    findPath: function(currentPositionX, currentPositionZ, targetPositionX, targetPositionZ){
        // console.log('findPath:' + currentPositionX + ',' + currentPositionZ + ' to '
            // + targetPositionX + ',' + targetPositionZ);
        // // console.log(currentPositionX);
        // // console.log(currentPositionZ);
        // // console.log(targetPositionX);
        // // console.log(targetPositionZ);
        var path = this.finder.findPath(
            Math.round((currentPositionX))// + this.tg.centreX
            , Math.round((currentPositionZ))// + this.tg.centreZ
            , Math.round((targetPositionX))// + this.tg.centreX
            , Math.round((targetPositionZ))// + this.tg.centreZ
            , this.grid);
        this.restoreGrid();
        // for(var i = 0; i < path.length; ++i){
        //     path[i][0] = (path[i][0] - this.tg.centreX);
        //     path[i][1] = (path[i][1] - this.tg.centreZ);
        // }
        return path;
    },

    init: function(world_config, grid){
        this.maxRange = world_config.maxRange,
        this.neighbourhoodBoxSide = world_config.neighbourhoodBoxSide,
        this.maxBotCount = world_config.commonConfig.maxBotCount;
        this.grid = grid;
        this.gridBackup = this.grid.clone();
        // // console.log('bot_route_utility:', world_config.gridSide);
        this.finder = new PF.AStarFinder({
            allowDiagonal: true,
            dontCrossCorners: true,
            heuristic: PF.Heuristic.chebyshev
        });

        // // console.log('((((((((((((((((((((');
        // var path = this.findPath(12, 3, 45, 70);
        // // console.log(path);

        for(var i = 0; i < this.maxBotCount; ++i){
            this.botPositionArray[i] = {x:0, y:0, z:0};
        }

        // this.tempGrid = 53 x 53 grid.
        this.tempGrid = new PF.Grid(this.neighbourhoodBoxSide, this.neighbourhoodBoxSide);
        var tmpGridMatrixToStoreLinearPaths = new Array();
        this.distanceMatrix = new Array();
        // for each point in the grid, find seq of points forming straight line from point (x,z) to (26, 26)
        for(var i = 0; i < this.neighbourhoodBoxSide; ++i){ // x axis
            tmpGridMatrixToStoreLinearPaths[i] = new Array();
            this.distanceMatrix[i] = new Array();
            for(var j = 0; j < this.neighbourhoodBoxSide; ++j){ // z axis
                if(i==this.maxRange && j==this.maxRange){
                    this.distanceMatrix[i][j] = {};
                    this.distanceMatrix[i][j].anglePositiveZAxis = 0;
                    // save distance from i, j to 26, 26
                    this.distanceMatrix[i][j].distance = 0;
                    tmpGridMatrixToStoreLinearPaths[i][j] = {
                        linePath : [{ x: i, y: 0, z: j }]
                    };
                    continue;
                }
                // find path from (i, j) to (26, 26) and save in tmpGridMatrixToStoreLinearPaths(i, j)
                tmpGridMatrixToStoreLinearPaths[i][j] = {
                    linePath : this.draw_line(i, j, this.maxRange, this.maxRange)
                };
                // // console.log('i:' + i + ' j:' + j);
                // // console.log(tmpGridMatrixToStoreLinearPaths[i][j]);
                // angle with positive z axis(away from camera). negetive for left side(x < 0)
                this.distanceMatrix[i][j] = {};
                this.distanceMatrix[i][j].anglePositiveZAxis = this.roundTo2Decimal(Math.atan2((i - this.maxRange), (j - this.maxRange))); 
                // save distance from i, j to 26, 26
                this.distanceMatrix[i][j].distance = this.roundTo2Decimal(Math.sqrt(Math.pow((i - this.maxRange), 2) + Math.pow((j - this.maxRange), 2)));
            }
        }
        // // console.log(tmpGridMatrixToStoreLinearPaths[26][26]);
        // // console.log(JSON.stringify(this.distanceMatrix));

        if(this.createFreshVisibility){
            this.createVisibilityMatrix(tmpGridMatrixToStoreLinearPaths, 'visibilityMatrix.txt');
        }else{
            this.loadVisibilityMatrixFromFile('visibilityMatrix.txt');
        }
        
        // Update botEntryDirectionMap
        // Update BFS arrays.
    },

    testVisibility: function(eyeX, eyeZ, targetX, targetZ){
        // this.visibilityMatrix[x][z] = {
        //     visibility : neighbourhoodVisibilityGrid,
        //     id : null,
        // };
        var visibilityMap = this.visibilityMatrix[eyeX][eyeZ].visibility[targetX];
        if((visibilityMap & (1 << targetZ)) > 0){
            return true;
        }else{
            return false;
        }
    },

    loadVisibilityMatrixFromFile: function(fileName){
        // console.log('start loadVisibilityMatrixFromFile');
        // create instance of readline
        // each instance is associated with single input stream
        let rl = readline.createInterface({
            input: fs.createReadStream(fileName),
        });

        let line_no = 0;
        var parentCtrl = this;

        // event is emitted after each line
        rl.on('line', function(line) {
            if(line_no == 1){
                var breadth = parseInt(line);
                if(breadth != world_config.gridSide){
                    console.error('breadth != this.floor.breadth');
                    return;
                }else{
                    // console.log('breadth test passed');
                }
            }else if(line_no == 3){
                var length = parseInt(line);
                if(length != world_config.gridSide){
                    console.error('length != this.floor.length');
                    return;
                }else{
                    // console.log('length test passed');
                }
            }
            line_no++;
            // console.log(line);
        });

        // end
        rl.on('close', function(line) {
            // console.log('Total lines : ' + line_no);
        });
    },

    createVisibilityMatrix: function(tmpGridMatrixToStoreLinearPaths, fileName){
        // // console.log('start createVisibilityMatrix');
        // var fileAppender = fs.createWriteStream(fileName, {
        //     flags: 'a' // 'a' means appending (old data will be preserved)
        // });
        let writeStream = fs.createWriteStream(fileName);
        
        // fileAppender.write('this.floor.breadth\n');
        // fileAppender.write(this.floor.breadth + '\n');
        // fileAppender.write('this.floor.length\n');
        // fileAppender.write(this.floor.length.toString() + '\n');

        writeStream.write('this.floor.breadth\n');
        writeStream.write(world_config.gridSide + '\n');
        writeStream.write('this.floor.length\n');
        writeStream.write(world_config.gridSide.toString() + '\n');
        
        // for each point in the grid : update visibility matrix.
        this.visibilityMatrix = new Array();
        var binaryStringArray = [];
        for(var x = 0; x < world_config.gridSide; ++x){ // scan floor along x axis
            console.log('computing grid x:' + x);
            this.visibilityMatrix[x] = new Array();
            for(var z = 0; z < world_config.gridSide; ++z){ // scan floor along z axis
                // // console.log('z:' + z);
                // x, z are the actual grid point for which we are generating visibility graph
                writeStream.write(x + ',' + z + '\n');
                var neighbourhoodVisibilityGrid = new Array();
                // var neighbourPathGrid = new Array();
                for(var x_small = 0; x_small < this.neighbourhoodBoxSide; ++x_small){ // check for neighbourhood x axis
                    // neighbourhoodVisibilityGrid[x_small] = new Array();
                    // neighbourPathGrid[x_small] = new Array();
                    binaryStringArray.length = 0;
                    for(var z_small = 0; z_small < this.neighbourhoodBoxSide; ++z_small){ // check for neighbourhood z axis
                        // x_small - 26, z_small - 26 are the relative points
                        var actual_x = x + x_small - this.maxRange; // actual x coordinate in grid that we want to test.
                        var actual_z = z + z_small - this.maxRange; // actual z coordinate in grid that we want to test.
                        
                        if(this.isPointInGrid(actual_x, actual_z)){ // checking if we need to test visibility
                            // testing visibility of x, z from point actual_x, actual_z
                            // // console.log('wer:', tmpGridMatrixToStoreLinearPaths.length);
                            // // console.log('wer:', tmpGridMatrixToStoreLinearPaths[x_small].length);
                            // // console.log(x_small);
                            // // console.log(z_small);
                            // // console.log('wer:', tmpGridMatrixToStoreLinearPaths[x_small][z_small]);
                            // var path = this.findPath(x, z, actual_x, actual_z);
                            // neighbourPathGrid[x_small][z_small] = path;

                            if(!this.grid.isWalkableAt(actual_x, actual_z)){
                                binaryStringArray[z_small] = '0';
                                continue;
                            }
                            var linePath = tmpGridMatrixToStoreLinearPaths[x_small][z_small].linePath;
                            // the visibility test is positive if all points in straight line joining the points
                            // are un blocked by any ostacle. i.e. clear line of sight.
                            // neighbourhoodVisibilityGrid[x_small][z_small] = true;
                            binaryStringArray[z_small] = '1';
                            for(var pathIndex = 0; pathIndex < linePath.length; ++pathIndex){
                                var actual_x_pathPoint = x + linePath[pathIndex].x - this.maxRange;
                                var actual_z_pathPoint = z + linePath[pathIndex].z - this.maxRange;
                                if(!this.grid.isWalkableAt(actual_x_pathPoint, actual_z_pathPoint)){
                                    // obstacle found. Stop scan and mark : Not Visible.
                                    // neighbourhoodVisibilityGrid[x_small][z_small] = false;
                                    // // console.log('visibility false.');
                                    binaryStringArray[z_small] = '0';
                                    break;
                                }
                            }

                        }else{
                            // neighbourhoodVisibilityGrid[x_small][z_small] = false;
                            binaryStringArray[z_small] = '0';
                        }
                    }
                    var binaryString = binaryStringArray.join('');
                    neighbourhoodVisibilityGrid[x_small] = parseInt(binaryString, 2);
                    writeStream.write(binaryString + '\n');
                    // // console.log(binaryStringArray.join(''));
                    // // console.log(neighbourhoodVisibilityGrid[x_small]);
                }
                this.visibilityMatrix[x][z] = {
                    visibility : neighbourhoodVisibilityGrid,
                    // localPath : neighbourPathGrid,
                    id : null,
                };

            }
        }
        console.log('completed creating the visibility graph.');
        // fileAppender.close();
        // writeStream.close();
        writeStream.end();
        writeStream.on('finish', () => {  
            // console.log('wrote all data to file');
        });
    },



    isPointInGrid: function(x, z){
        if(x < 0 || x >= world_config.gridSide){
            return false;
        }
        if(z < 0 || z >= world_config.gridSide){
            return false;
        }
        return true;
    },

    getBotTeam: function(botID) {

    },

    updateBotPosition: function(id, x, z){
        // return;
        var botIndex = 0;
        // // console.log('id23:' + id);
        var botConfig = workerstate.botMap[id];
        if(botConfig==null || botConfig==undefined){
            botIndex = id;
            botConfig = workerstate.botArray[id];
        }else{
            botIndex = botConfig.botIndex;
        }
        if(this.botPositionArray[botIndex].x < 0
        || this.botPositionArray[botIndex].y < 0
        || this.botPositionArray[botIndex].z < 0){
            this.botPositionArray[botIndex].x = 0;
            this.botPositionArray[botIndex].y = 0;
            this.botPositionArray[botIndex].z = 0;
            // // console.log('ERROR++++++++++++++++++++++@@@@@@@@@@updateBotPosition');
        }else{
            this.visibilityMatrix[this.botPositionArray[botIndex].x][this.botPositionArray[botIndex].z].id = null;
        }
        // update bot to position map
        this.botPositionArray[botIndex].x = x;
        this.botPositionArray[botIndex].z = z;
        // update grid map but marking grid with bot position.
        this.visibilityMatrix[x][z].id = botConfig.id;
    },

    isPositionUnoccupiedByBot: function(x, z){
        if(this.visibilityMatrix[x][z].id == null){
            return true;
        }else{
            return false;
        }
    },

    getSuitableOtherTeamBotTarget: function(botConfigParam){
        // console.log('getSuitableOtherTeamBotTarget for:' + botConfigParam.id 
            // + ' at position:' + botConfigParam.payload.position
            // + ' team:' + botConfigParam.team
            // + ' playerID:' + botConfigParam.playerID);
        // // console.log(botConfigParam);
        var x = botConfigParam.payload.position[0];
        var z = botConfigParam.payload.position[2];
        const range = botConfigParam.range;
        const teamIDParam = botConfigParam.team;
        let minDist = world_config.gridSide + 1;
        // let selectedvisibilityMatrixObject = null;
        let chosenEnemyID = null;
        let pathToEnemy = null;
        let botRotation = null;
        let chosenTargetType = null;
        // this.visibilityMatrix[x][z] = {
        //     visibility : neighbourhoodVisibilityGrid,
        //     localPath : neighbourPathGrid,
        //     id : null,
        // };
        var visibilityMatrixAtLocation = this.visibilityMatrix[x][z];
        var buildingID = null;
        for (let i = x - range; i <= x + range; i++) {
            for (let j = z - range; j <= z + range; j++) {
                if(!this.isPointInGrid(i, j) || (i == x && j == z)){
                    continue;
                }
                // // console.log('testing for bot:' + this.visibilityMatrix[i][j].id + ' at x:' + i + ' z:' + j);
                if(this.visibilityMatrix[i][j].id != null){ // if grid position occupied
                    // // console.log('testing for bot:' + this.visibilityMatrix[i][j].id + ' at x:' + i + ' z:' + j);
                    const botConfig = workerstate.botMap[this.visibilityMatrix[i][j].id];
                    if(botConfig.team != teamIDParam && botConfig.isActive){
                        // // console.log('------...........>>>>>>>>>if');
                        // var botX = botConfig.payload.position[0];
                        // var botZ = botConfig.payload.position[2];
                        var tX = i - x + this.maxRange;
                        var tZ = j - z + this.maxRange;
                        // var path = visibilityMatrixAtLocation.localPath[tX][tZ];
                        var path = this.findPath(x, z, i, j);
                        // console.log('got path:', path);
                        if(minDist > path.length){
                            // selectedvisibilityMatrixObject = distMatrixObject;
                            minDist = path.length;
                            chosenEnemyID = this.visibilityMatrix[i][j].id;
                            pathToEnemy = path;
                            rotation = this.distanceMatrix[tX][tZ].anglePositiveZAxis;
                            chosenTargetType = 'bot'
                        }
                    }
                }else{
                    buildingID = this.isObstacleDefenseOrBase(i, j, teamIDParam);
                    if(buildingID === null || buildingID === undefined){
                        // // console.log('skipping as buildingID === null || buildingID === undefined');
                    }else{
                        // console.log('testing for is buildingID: at x:' + i + ' z:' + j + ' buildingID:', buildingID);
                        const buildingConfig = workerstate.buildingMap[buildingID];
                        // // console.log('=============>buildingConfig:', buildingConfig);
                        if(!buildingConfig.isActive || buildingConfig.life <= 0){
                            // return null;
                            // skip inactive buildings
                            // console.log('skipping inactive building:', buildingID);
                        }else{
                            // // console.log('%%%%%%%%%%%%returned building id:', buildingID);
                            if(buildingID != null){
                                // // console.log('buildingID=', buildingID);
                                var tX = i - x + this.maxRange;
                                var tZ = j - z + this.maxRange;
                                // var path = visibilityMatrixAtLocation.localPath[tX][tZ];
                                var path = this.findPath(x, z, i, j);
                                // console.log('got path:', path);
                                if(minDist > path.length){
                                    // selectedvisibilityMatrixObject = distMatrixObject;
                                    minDist = path.length;
                                    chosenEnemyID = buildingID;
                                    pathToEnemy = path;
                                    rotation = this.distanceMatrix[tX][tZ].anglePositiveZAxis;
                                    chosenTargetType = 'static'
                                }
                            }
                        }
                    }
                }
            }
        }
        // // console.log('returning chosen opponent.');
        if(chosenEnemyID != null){
            // console.log(11111111111);
            // // console.log('getSuitableOtherTeamBotTarget returning:', {
            //     chosenEnemyID,
            //     pathToEnemy,
            //     botRotation,
            //     chosenTargetType
            // });
            var returnvar = {};
            // // console.log(returnvar);
            returnvar.chosenEnemyID = chosenEnemyID;
            // // console.log(returnvar);
            returnvar.pathToEnemy = pathToEnemy;
            // // console.log(returnvar);
            returnvar.botRotation = botRotation;
            // // console.log(returnvar);
            returnvar.chosenTargetType = chosenTargetType;
            // console.log(returnvar);
            return returnvar;
        }else{
            // console.log(2);
            // // console.log('getSuitableOtherTeamBotTarget returning null');
            return null;
        }
        
    },

    isObstacleDefenseOrBase(x, z, teamIDParam){
        // topBase:[44,6], // 2
        // bottomBase:[44,82], // 1
        // defenceBottom:[[48,79],[40,79],[44,71],[19,73],[72,69]], // 1
        // defenceTop:[[44,17],[40,9],[48,9],[16,19],[69,15]], // 2

        if(this.grid.isWalkableAt(x, z)){
            return null;
        }
        // // console.log('teamIDParam:', teamIDParam);
        if(teamIDParam == 1){
            for (let i = 0; i < world_config.defenceTop.length; i++) {
                if(x === world_config.defenceTop[i][0] && z === world_config.defenceTop[i][1]){
                    return world_config.defenceTop[i][2];
                }
            }
            // // console.log('world_config.topBase:', world_config.topBase);
            if(x === world_config.topBase[0] && z === world_config.topBase[1]){
                return world_config.topBase[2];
            }
        }else{
            for (let i = 0; i < world_config.defenceBottom.length; i++) {
                if(x === world_config.defenceBottom[i][0] && z === world_config.defenceBottom[i][1]){
                    // // console.log('returning:', )
                    return world_config.defenceBottom[i][2];
                }
            }
            // // console.log('world_config.bottomBase:', world_config.bottomBase);
            if(x === world_config.bottomBase[0] && z === world_config.bottomBase[1]){
                return world_config.bottomBase[2];
            }
        }

        return null;
    },

    stitchPaths: function(){

    },

    draw_line: function(x0, y0, x1, y1) {// here we assume y input is for z axis and return result accordingly.
        var pathArray = new Array();
        var dx = x1 - x0;
        var dy = y1 - y0;
    
        var inc_x = (dx >= 0) ? +1 : -1;
        var inc_y = (dy >= 0) ? +1 : -1;
    
        dx = (dx < 0) ? -dx : dx;
        dy = (dy < 0) ? -dy : dy;
    
        if (dx >= dy) {
            var d = 2*dy - dx
            var delta_A = 2*dy
            var delta_B = 2*dy - 2*dx
    
            var x = 0;
            var y = 0;
            for (i=0; i<=dx; i++) {
                // put_pixel(ctx, x + x0, y + y0, "black");
                pathArray.push(this.getPositionObject(x + x0, 0, y + y0));
                if (d > 0) {
                    d += delta_B;
                    x += inc_x;
                    y += inc_y;
                }
                else {
                    d += delta_A;
                    x += inc_x;
                }
            }
        }
        else {
            var d = 2*dx - dy
            var delta_A = 2*dx
            var delta_B = 2*dx - 2*dy
    
            var x = 0;
            var y = 0;
            for (i=0; i<=dy; i++) {
                // put_pixel(ctx, x + x0, y + y0, "black");
                pathArray.push(this.getPositionObject(x + x0, 0, y + y0));
                if (d > 0) {
                    d += delta_B;
                    x += inc_x;
                    y += inc_y;
                }
                else {
                    d += delta_A;
                    y += inc_y;
                }
            }
        }
        return pathArray;
    },

    roundTo2Decimal: function(floatValue){
        return (Math.round(floatValue * 100) / 100);
    },

    getPositionObject: function(x, y, z){
        return {
            x:x,
            y:y,
            z:z
        }
    },
    findDIstanceBetweenTwoPoints(x1, z1, x2, z2){
        return this.roundTo2Decimal(Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((z1 - z2), 2)));
    },

    isPointInRange: function(x, z, targetX, targetZ, range){
        if(Math.abs(targetX - x) <= range && Math.abs(targetZ - z) <= range){
            if(range <= this.neighbourhoodBoxSide){// get distance from distanceMatrix
                var dist = this.distanceMatrix[Math.abs(targetX - x)][Math.abs(targetZ - z)].distance;
                if(dist <= range){
                    return true;
                }
            }else{
                var dist = this.roundTo2Decimal(Math.sqrt(Math.pow((targetX - x), 2) + Math.pow((targetZ - z), 2)));
                if(dist <= range){
                    return true;
                }
            }
        }
        return false;
    }  
}
