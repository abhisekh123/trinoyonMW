const workerState = require('../state/workerstate');
const pathFindingWrapper = require('./pathfindingwrapper');
const utilityFunctions = require('../../utils/utilityfunctions');
const fs = require('fs');

module.exports = {
    worldConfig: null,
    init: function () {
        this.worldConfig = workerState.getWorldConfig();

        this.initialiseDistanceMatrix();
        this.initialiseAngleMatrix();
        if(this.worldConfig.createFreshStrategyMatrix){
            this.createStrategyMatrix();
        }else{
            this.loadStrategyMatrixFromFile();
        }
    },

    // all parameters here are actual grid positions.
    testVisibility: function(eyeX, eyeZ, targetX, targetZ){
        // this.visibilityMatrix[x][z] = {
        //     visibility : neighbourhoodVisibilityGrid,
        //     id : null,
        // };
        // console.log('eyeX:', eyeX);
        // console.log('eyeZ:', eyeZ);
        // console.log('targetX:', targetX);
        // console.log('targetZ:', targetZ);
        var targetXRelative = (targetX - eyeX) + this.worldConfig.maxRange;
        var targetZRelative = (targetZ - eyeZ) + this.worldConfig.maxRange;
        // console.log('targetXRelative:', targetXRelative);
        // console.log('targetZRelative:', targetZRelative);
        // console.log(workerState.strategyMatrix[eyeX][eyeZ].visibility);
        var visibilityMap = workerState.strategyMatrix[eyeX][eyeZ].visibility[targetXRelative];

        // console.log('visibilityMap:', visibilityMap);
        // console.log('(1 << targetZRelative):', (1 << targetZRelative));
        // console.log('(visibilityMap & (1 << targetZRelative)):', (visibilityMap & (1 << targetZRelative)));

        
        if((visibilityMap & (1 << targetZRelative)) > 0){
            return true;
        }else{
            return false;
        }
    },

    createStrategyMatrix: function () {
        // console.log('start createVisibilityMatrix, this.worldConfig.maxRange:', this.worldConfig.maxRange);
        
        let writeStream = fs.createWriteStream(this.worldConfig.strategyMatrixFileName);


        writeStream.write('this.floor.breadth\n');
        writeStream.write(this.worldConfig.gridSide + '\n');
        writeStream.write('this.floor.length\n');
        writeStream.write(this.worldConfig.gridSide.toString() + '\n');

        var tmpGridMatrixToStoreLinearPaths = new Array();
        // for each point in the grid, find seq of points forming straight line from 
        // point (x,z) to (this.worldConfig.maxRange, this.worldConfig.maxRange)
        for(var i = 0; i < this.worldConfig.neighbourhoodBoxSide; ++i){ // x axis
            tmpGridMatrixToStoreLinearPaths[i] = new Array();
            for(var j = 0; j < this.worldConfig.neighbourhoodBoxSide; ++j){ // z axis
                // console.log('i:' + i + ' j:' + j);
                if(i==this.worldConfig.maxRange && j==this.worldConfig.maxRange){ // center of the matrix
                    tmpGridMatrixToStoreLinearPaths[i][j] = {
                        linePath : [{ x: i, y: 0, z: j }]
                    };
                    continue;
                }
                // find path from (i, j) to (26, 26) and save in tmpGridMatrixToStoreLinearPaths(i, j)
                tmpGridMatrixToStoreLinearPaths[i][j] = { // from i,j to center of the matrix
                    linePath : this.draw_line(i, j, this.worldConfig.maxRange, this.worldConfig.maxRange)
                };
                // console.log('tmpGridMatrixToStoreLinearPaths[i][j]:', tmpGridMatrixToStoreLinearPaths[i][j]);
            }
        }

        // for each point in the grid : update visibility matrix.
        var strategyMatrix = new Array();
        var binaryStringArray = [];
        for (var x = 0; x < this.worldConfig.gridSide; ++x) { // scan floor along x axis
            console.log('computing grid x:' + x);
            strategyMatrix[x] = new Array();
            for (var z = 0; z < this.worldConfig.gridSide; ++z) { // scan floor along z axis
                // // console.log('z:' + z);
                // x, z are the actual grid point for which we are generating visibility graph
                writeStream.write(x + ',' + z + '\n');
                var neighbourhoodVisibilityGrid = new Array();
                // preparing visibility matrix for position (x, z)
                for (var x_small = 0; x_small < this.worldConfig.neighbourhoodBoxSide; ++x_small) { // check for neighbourhood x axis
                    
                    binaryStringArray.length = 0;
                    for (var z_small = 0; z_small < this.worldConfig.neighbourhoodBoxSide; ++z_small) { // check for neighbourhood z axis
                        // x_small - 26, z_small - 26 are the relative points
                        var actual_x = x + x_small - this.worldConfig.maxRange; // actual x coordinate in grid that we want to test. can be negetive or bigger than grid size.
                        var actual_z = z + z_small - this.worldConfig.maxRange; // actual z coordinate in grid that we want to test. can be negetive or bigger than grid size.
                        
                        // checking if we need to test visibility
                        if(pathFindingWrapper.isPointInGrid(actual_x, actual_x)){
                            // testing visibility of x, z from point actual_x, actual_z
                            // // console.log('wer:', tmpGridMatrixToStoreLinearPaths.length);
                            // // console.log('wer:', tmpGridMatrixToStoreLinearPaths[x_small].length);
                            // // console.log(x_small);
                            // // console.log(z_small);
                            // // console.log('wer:', tmpGridMatrixToStoreLinearPaths[x_small][z_small]);

                            var linePath = tmpGridMatrixToStoreLinearPaths[x_small][z_small].linePath;
                            // the visibility test is positive if all points in straight line joining the points
                            // are un blocked by any ostacle. i.e. clear line of sight.

                            binaryStringArray[z_small] = '1';
                            
                            // if points are not adjescent, make sure all point 
                            // between source and destination are visible
                            if(linePath.length > 2){
                                for (var pathIndex = 1; pathIndex < linePath.length - 1; ++pathIndex) {
                                    var actual_x_pathPoint = x + linePath[pathIndex].x - this.worldConfig.maxRange;
                                    var actual_z_pathPoint = z + linePath[pathIndex].z - this.worldConfig.maxRange;
                                    if (!pathFindingWrapper.isWalkableAt(actual_x_pathPoint, actual_z_pathPoint)) {
                                        // obstacle found. Stop scan and mark : Not Visible.
                                        // // console.log('visibility false.');
                                        binaryStringArray[z_small] = '0';
                                        break;
                                    }
                                }
                            }
                            

                        } else {
                            binaryStringArray[z_small] = '0';
                        }
                    }
                    var binaryString = binaryStringArray.join('');
                    neighbourhoodVisibilityGrid[x_small] = parseInt(binaryString, 2);
                    writeStream.write(binaryString + '\n');
                    // // console.log(binaryStringArray.join(''));
                    // // console.log(neighbourhoodVisibilityGrid[x_small]);
                }
                strategyMatrix[x][z] = {
                    visibility: neighbourhoodVisibilityGrid,
                };

            }
        }
        workerState.strategyMatrix = strategyMatrix;

        console.log('completed creating the visibility graph.');
        writeStream.end();
        writeStream.on('finish', () => {
            // console.log('wrote all data to file');
        });
    },

    loadStrategyMatrixFromFile: function(){
        // console.log('start loadVisibilityMatrixFromFile');
        // create instance of readline
        // each instance is associated with single input stream
        let rl = readline.createInterface({
            input: fs.createReadStream(this.worldConfig.strategyMatrixFileName),
        });

        let line_no = 0;

        // event is emitted after each line
        rl.on('line', function(line) {
            if(line_no == 1){
                var breadth = parseInt(line);
                if(breadth != this.worldConfig.gridSide){
                    console.error('breadth != this.floor.breadth');
                    return;
                }else{
                    // console.log('breadth test passed');
                }
            }else if(line_no == 3){
                var length = parseInt(line);
                if(length != this.worldConfig.gridSide){
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

    initialiseAngleMatrix: function() {
        var angleMatrix = new Array();
        // for each point in the grid, find seq of points forming straight line from point (x,z) to (26, 26)
        for(var i = 0; i < this.worldConfig.neighbourhoodBoxSide; ++i){ // x axis
            angleMatrix[i] = new Array();
            for(var j = 0; j < this.neighbourhoodBoxSide; ++j){ // z axis
                if(i==this.worldConfig.maxRange && j==this.worldConfig.maxRange){
                    angleMatrix[i][j] = 0;
                    continue;
                }
                
                // angle with positive z axis(away from camera). negetive for left side(x < 0)
                // calculate angle from central point:(this.worldConfig.maxRange, this.worldConfig.maxRange) to (i, j)
                angleMatrix[i][j] = utilityFunctions.roundTo2Decimal(Math.atan2((i - this.worldConfig.maxRange), (j - this.worldConfig.maxRange))); 
            }
        }
        workerState.angleMatrix = angleMatrix;
    },

    initialiseDistanceMatrix: function() {
        var distanceMatrix = new Array(this.worldConfig.gridSide);
        for(var i = 0; i < this.worldConfig.gridSide; ++i){ // x axis
            distanceMatrix[i] = new Array(this.worldConfig.gridSide);
            for(var k = 0; k < this.worldConfig.gridSide; ++k){ // z axis
                // from (0,0) to (i,k)
                distanceMatrix[i][k] = utilityFunctions.roundTo2Decimal(Math.sqrt(Math.pow(i, 2) + Math.pow(k, 2)));
            }
        }
        workerState.distanceMatrix = distanceMatrix;
    },

    draw_line: function (x0, y0, x1, y1) { // here we assume y input is for z axis and return result accordingly.
        var pathArray = new Array();
        var dx = x1 - x0;
        var dy = y1 - y0;

        var inc_x = (dx >= 0) ? +1 : -1;
        var inc_y = (dy >= 0) ? +1 : -1;

        dx = (dx < 0) ? -dx : dx;
        dy = (dy < 0) ? -dy : dy;

        if (dx >= dy) {
            var d = 2 * dy - dx
            var delta_A = 2 * dy
            var delta_B = 2 * dy - 2 * dx

            var x = 0;
            var y = 0;
            for (i = 0; i <= dx; i++) {
                // put_pixel(ctx, x + x0, y + y0, "black");
                pathArray.push(this.getPositionObject(x + x0, 0, y + y0));
                if (d > 0) {
                    d += delta_B;
                    x += inc_x;
                    y += inc_y;
                } else {
                    d += delta_A;
                    x += inc_x;
                }
            }
        } else {
            var d = 2 * dx - dy
            var delta_A = 2 * dx
            var delta_B = 2 * dx - 2 * dy

            var x = 0;
            var y = 0;
            for (i = 0; i <= dy; i++) {
                // put_pixel(ctx, x + x0, y + y0, "black");
                pathArray.push(this.getPositionObject(x + x0, 0, y + y0));
                if (d > 0) {
                    d += delta_B;
                    x += inc_x;
                    y += inc_y;
                } else {
                    d += delta_A;
                    y += inc_y;
                }
            }
        }
        return pathArray;
    },

    getPositionObject: function (x, y, z) {
        return {
            x: x,
            y: y,
            z: z
        }
    },
}