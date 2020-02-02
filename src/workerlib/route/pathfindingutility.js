
/**
 * this file contains logical function that are used by ai/action
 */
const PF = require('pathfinding');
const world_config = require(__dirname + '/../../../ui/world_config');
const workerstate = require('../state/workerstate');
const botroutemanager = require(__dirname + '/botroutemanager');

var fs = require('fs');
const readline = require('readline');


module.exports = {
    botArray: [],
    botMap: {},
    buildingMap: {},
    buildingArray: [],
    // baseMap: {}
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


    // used for movement of player to nearesrt enemy. used by player AI
    findClosestPlayerOrTowerOrBase: function(playerConfigParam){
        var playerTeam = playerConfigParam.teamID;
        var defenseList = null;
        var base = null;
        // console.log('findClosestPlayerOrTowerOrBase->leaderID:' + playerConfigParam.leaderBotID);
        var leaderConfig = workerstate.botMap[playerConfigParam.leaderBotID];
        var leaderPosition = leaderConfig.payload.position;

        // console.log('leader position:', leaderPosition, ' team:' + playerTeam, ' playerid:' + playerConfigParam.playerID);
        
        var minDistance = workerstate.getWorldConfig().gridSide + 1;

        var target = null;
        var targetType = null;
        if(playerTeam == 1){// top team = 1
            defenseList = workerstate.getWorldConfig().defenceTop;
            base = workerstate.getWorldConfig().topBase
        }else{// bottom team = 2
            defenseList = workerstate.getWorldConfig().defenceBottom;
            base = workerstate.getWorldConfig().bottomBase;
        }

        // find closest player
        for(var playerIndex = 0; playerIndex < this.maxPlayerCount; ++playerIndex){
            const playerConfig = playerManager.playerArrey[playerIndex];
            // skip inactive player and players controlled by real people and players in the same team
            if(!playerConfig.isActive || playerConfig.teamID == playerConfigParam.teamID){
                // TODO: Add logic to spawn new AI player / admit new player here.
                continue;
            }
            var tmpLeaderConfig = workerstate.botMap[playerConfig.leaderBotID];
            var tmpLeaderPosition = tmpLeaderConfig.payload.position;
            // console.log('comparing with playerID:', playerConfig.playerID, ' tmpLeaderPosition:', tmpLeaderPosition);
            var distance = bot_route_utility.findDIstanceBetweenTwoPoints(
                leaderPosition[0], leaderPosition[2], tmpLeaderPosition[0], tmpLeaderPosition[2]
            )
            // console.log('calculated distance:', distance);
            if(distance < minDistance){
                minDistance = distance;
                target = [tmpLeaderPosition[0], tmpLeaderPosition[2]]
                targetType = 'bot';
            }
        }

        // console.log('after comparing palyers, minDistance:', minDistance, ' target:', target);

        for(var i = 0; i < defenseList.length; ++i){
            if(!defenseList[i].isActive){
                // TODO: Add logic to spawn new AI player / admit new player here.
                continue;
            }
            // console.log('comparing with defenseList[i]:', defenseList[i]);
            var distance = bot_route_utility.findDIstanceBetweenTwoPoints(
                leaderPosition[0], leaderPosition[2], defenseList[i][0], defenseList[i][1]
            )
            if(distance < minDistance){
                minDistance = distance;
                target = defenseList[i];
                targetType = 'static';
            }
        }

        // console.log('after comparing defenseList, minDistance:', minDistance, ' target:', target);

        // test base
        // console.log('comparing with base:', base);
        var distance = bot_route_utility.findDIstanceBetweenTwoPoints(
            leaderPosition[0], leaderPosition[2], base[0], base[1]
        )
        if(distance < minDistance){
            minDistance = distance;
            target = base;
            targetType = 'static';
        }

        // console.log('after comparing defenseList, minDistance:', minDistance, ' target:', target);

        if(target == null){
            return null;
        }else{
            return {
                target: target,
                targetType: targetType
            }
        }
    },


    init: function(){
        
    },
}