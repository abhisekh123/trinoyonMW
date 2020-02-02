
/**
 * this is a wrapper function containing higher level wrapper function for pathfinding library.
 */
const PF = require('pathfinding');

const world_config = require(__dirname + '/../../../ui/world_config');
const item_config = require(__dirname + '/../../../ui/item_config');
// const math_util = require(__dirname + '/../utils/math_util');
// const mainThreadStub = require(__dirname + '/mainthreadstub');
const bot_route_utility = require('./botRouteUtility');
const workerstate = require('../state/workerstate');

module.exports = {
    botArray: [],
    botMap: {},
    buildingMap: {},
    buildingArray: [],
    // baseMap: {}

    init: function(){
        
    },
    workerRegister:{},
    tg: {
        botConfig:{}
    },
    finder:null,

    printGrid: function(){
        let width = this.tg.grid.width;
        let height = this.tg.grid.height;
        
        let tmpArray = [];
        for (var i = 0; i < height; ++i) {
            tmpArray.length = 0;
            for (var j = 0; j < width; ++j) {
                // newNodes[i][j] = new Node(j, i, thisNodes[i][j].walkable);
                if(this.tg.grid.isWalkableAt(i, j)){
                    tmpArray.push(1);
                }else{
                    tmpArray.push(0);
                }
            }
            // console.log(tmpArray.join(" "));
        }
    },

    restoreGrid: function(){
        // let width = this.tg.grid.width;
        // let height = this.tg.grid.height;
        // let gridNodes = this.tg.grid.nodes;
        // let gridBackupNodes = this.tg.gridBackup.nodes;

        // for (var i = 0; i < height; ++i) {
        //     for (var j = 0; j < width; ++j) {
        //         // newNodes[i][j] = new Node(j, i, thisNodes[i][j].walkable);
        //         gridNodes[i][j].walkable = gridBackupNodes[i][j].walkable;
        //     }
        // }

        // this.printGrid();
        this.tg.grid = this.tg.gridBackup.clone();
    },

    findPath: function(currentPositionX, currentPositionZ, targetPositionX, targetPositionZ){
        // // console.log('findPath');
        // // console.log(currentPositionX);
        // // console.log(currentPositionZ);
        // // console.log(targetPositionX);
        // // console.log(targetPositionZ);
        var path = this.finder.findPath(
            Math.round((currentPositionX))// + this.tg.centreX
            , Math.round((currentPositionZ))// + this.tg.centreZ
            , Math.round((targetPositionX))// + this.tg.centreX
            , Math.round((targetPositionZ))// + this.tg.centreZ
            , this.tg.grid);
        this.restoreGrid();
        // for(var i = 0; i < path.length; ++i){
        //     path[i][0] = (path[i][0] - this.tg.centreX);
        //     path[i][1] = (path[i][1] - this.tg.centreZ);
        // }
        return path;
    },

    prepareGrid: function(){
        // console.log('prepareGrid.');
        // console.log(this.world_config);
        // world_config.length = Number(world_config.length);
        // world_config.breadth = Number(world_config.breadth);


        // console.log('prepare grid@bot route manager :: world_config.gridSide:' + world_config.gridSide);

        this.tg.grid = new PF.Grid(world_config.gridSide, world_config.gridSide);
        // // console.log(this.tg.grid);
        // // console.log(this.tg.grid);
        // // console.log(this.tg.grid.nodes.length);
        // // console.log(this.tg.grid.nodes[0].length);

        this.tg.centreZ = (world_config.gridSide - 1)/2;
        this.tg.centreX = (world_config.gridSide - 1)/2;

        var towerIndex = 0;

        for(var i = 0; i < world_config.obstacles.length; ++i){
            this.tg.grid.setWalkableAt(world_config.obstacles[i][0], world_config.obstacles[i][1], false);
        }
        for(var i = 0; i < world_config.defenceBottom.length; ++i){
            this.tg.grid.setWalkableAt(world_config.defenceBottom[i][0], world_config.defenceBottom[i][1], false);
            var towerID = 'tower' + towerIndex;
            world_config.defenceBottom[i].push(towerID);
            workerstate.buildingMap[towerID] = {
                life:item_config.buildings.tower.life,
                attack:item_config.buildings.tower.attack,
                isActive: true,
                type:'tower',
                team:1,
                id:towerID,
                position: {
                    x: world_config.defenceBottom[i][0],
                    z: world_config.defenceBottom[i][1]
                }
            }
            workerstate.buildingArray.push(workerstate.buildingMap[towerID]);
            ++towerIndex;
        }
        for(var i = 0; i < world_config.defenceTop.length; ++i){
            this.tg.grid.setWalkableAt(world_config.defenceTop[i][0], world_config.defenceTop[i][1], false);
            var towerID = 'tower' + towerIndex;
            world_config.defenceTop[i].push(towerID);
            workerstate.buildingMap[towerID] = {
                life:item_config.buildings.tower.life,
                attack:item_config.buildings.tower.attack,
                type:'tower',
                isActive: true,
                team:2,
                id:towerID,
                position: {
                    x: world_config.defenceTop[i][0],
                    z: world_config.defenceTop[i][1]
                }
            }
            workerstate.buildingArray.push(workerstate.buildingMap[towerID]);
            ++towerIndex;
        }
        this.tg.grid.setWalkableAt(world_config.topBase[0], world_config.topBase[1], false);
        world_config.topBase.push('base1');
        workerstate.buildingMap['base1'] = {
            life:item_config.buildings.base.life,
            attack:item_config.buildings.base.attack,
            type:'base',
            isActive: true,
            team:2,
            id:'base1',
            position: {
                x: world_config.topBase[0],
                z: world_config.topBase[1]
            }
        }
        workerstate.buildingArray.push(workerstate.buildingMap['base1']);
        this.tg.grid.setWalkableAt(world_config.bottomBase[0], world_config.bottomBase[1], false);
        world_config.bottomBase.push('base2');
        workerstate.buildingMap['base2'] = {
            life:item_config.buildings.base.life,
            attack:item_config.buildings.base.attack,
            type:'base',
            isActive: true,
            team:1,
            id:'base2',
            position: {
                x: world_config.bottomBase[0],
                z: world_config.bottomBase[1]
            }
        }
        workerstate.buildingArray.push(workerstate.buildingMap['base2']);

        this.tg.gridBackup = this.tg.grid.clone();
        // this.printGrid();

        // console.log('-------grid initialised');
        // // console.log(this.tg.grid);

        this.finder = new PF.AStarFinder({
            allowDiagonal: true,
            dontCrossCorners: true,
            heuristic: PF.Heuristic.chebyshev
        });


        bot_route_utility.init(world_config, this.tg.grid.clone());
        
    },


    // findEnemyTarget: function(botConfig) {
    //     var enemyID = null;

    //     for(var i = -botConfig.range; i < botConfig.range; ++i){

    //     }

    //     return enemyID;
    // },

    // find point(x, y) closest to position such that (x, y) in in range of targetPosition.
    findClosestPointNeighbourhood: function(position, targetPosition, range){
        for(var side = 1; side < this.tg.grid.width; ++side){
            positionRunnerStart = {x:position.x - side, z:position.z - side};// left-bottom
            var j = 0;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.x = positionRunnerStart.x + 1;
            }

            positionRunnerStart.x = positionRunnerStart.x - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower right -> upper right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.z = positionRunnerStart.z + j;
            }

            positionRunnerStart.z = positionRunnerStart.z - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.x = positionRunnerStart.x - 1;
            }

            positionRunnerStart.x = positionRunnerStart.x + 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.z = positionRunnerStart.z - 1;
            }
        }
        console.error('ERROR: FindPathToClosestPointInNeighbourhood point not found for target position:', targetBotConfig.position);
        return null;// walkable point not found. This should never happen.
    },

    // returns a path from source to a walkable point (probably nearest) in the neighbourhood of target.
    FindPathToClosestPointInNeighbourhood: function(botID, targetBotID){ // used for getting near friendly unit (wrt sight of target)
        var botConfig = this.tg.botConfig[botID];
        var targetBotConfig = this.tg.botConfig[targetBotID];
        var range = item_config.character[targetBotConfig.type].sight;

        var path = this.findPath(botConfig.position[0], botConfig.position[2]
            , targetBotConfig.position[0], targetBotConfig.position[2]);
        var pathIndex = 0;
        for(pathIndex = 0; pathIndex < path.length; ++pathIndex){ 
            // trace through path from source to destination to find first point in range.
            var pathPositionX = path[pathIndex][0];
            var pathPositionZ = path[pathIndex][1];
            if(bot_route_utility.isPointInRange(pathPositionX, pathPositionZ
                , targetBotConfig.position[0], targetBotConfig.position[2],range)){
                // got first point in path which is in range.
                break;
            }
        }
        if(pathIndex >= path.length){
            console.error('ERROR:pathIndex == path.length');
        }
        path.length = pathIndex + 1;// discard remaining path
        if(bot_route_utility.isPositionUnoccupiedByBot(path[pathIndex][0], path[pathIndex][1])){
            
            return path;
        }
        var finalPosition = findClosestPointNeighbourhood({x:botConfig.position[0], z:botConfig.position[2]}, 
            {x:targetBotConfig.position[0], z:targetBotConfig.position[2]}, range);
        if(finalPosition == null){
            console.error('ERROR:finalPosition == null');
            return path;
        }else{
            var pathRemaining = this.findPath(path[pathIndex][0], path[pathIndex][1]
                , finalPosition.x, finalPosition.z);
            return path.concat(pathRemaining);
        }
    },

    // find point(x, y) closest to position such that (x, y) in in range of targetPosition.
    findClosestVisiblePointInRange: function(position, targetPosition, range){
        for(var side = 1; side < this.tg.grid.width; ++side){
            positionRunnerStart = {x:position.x - side, z:position.z - side};// left-bottom
            var j = 0;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)
                    && bot_route_utility.testVisibility(positionRunnerStart.x, positionRunnerStart.z, targetPosition.x, targetPosition.z)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.x = positionRunnerStart.x + 1;
            }

            positionRunnerStart.x = positionRunnerStart.x - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower right -> upper right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)
                        && bot_route_utility.testVisibility(positionRunnerStart.x, positionRunnerStart.z, targetPosition.x, targetPosition.z)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.z = positionRunnerStart.z + j;
            }

            positionRunnerStart.z = positionRunnerStart.z - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)
                        && bot_route_utility.testVisibility(positionRunnerStart.x, positionRunnerStart.z, targetPosition.x, targetPosition.z)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.x = positionRunnerStart.x - 1;
            }

            positionRunnerStart.x = positionRunnerStart.x + 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)
                        && bot_route_utility.testVisibility(positionRunnerStart.x, positionRunnerStart.z, targetPosition.x, targetPosition.z)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.z = positionRunnerStart.z - 1;
            }
        }
        console.error('ERROR: FindPathToClosestPointInNeighbourhood point not found for target position:', targetBotConfig.position);
        return null;// walkable point not found. This should never happen.
    },

    FindPathToNearestVisiblePointInRange: function(botID, targetBotID){ // used for engage
        var botConfig = this.tg.botConfig[botID];
        var targetBotConfig = this.tg.botConfig[targetBotID];
        var range = item_config.weapon[botConfig.equippedWeapon].range;

        var path = this.findPath(botConfig.position[0], botConfig.position[2]
            , targetBotConfig.position[0], targetBotConfig.position[2]);
        var pathIndex = 0;
        for(pathIndex = 0; pathIndex < path.length; ++pathIndex){ 
            // trace through path from source to destination to find first point in range.
            var pathPositionX = path[pathIndex][0];
            var pathPositionZ = path[pathIndex][1];
            if(bot_route_utility.isPointInRange(pathPositionX, pathPositionZ
                , targetBotConfig.position[0], targetBotConfig.position[2],range)){
                // got first point in path which is in range.
                break;
            }
        }
        if(pathIndex >= path.length){
            console.error('ERROR:pathIndex == path.length');
        }
        path.length = pathIndex + 1;// discard remaining path
        if(bot_route_utility.isPositionUnoccupiedByBot(path[pathIndex][0], path[pathIndex][1])){
            
            return path;
        }
        var finalPosition = findClosestPointNeighbourhood({x:botConfig.position[0], z:botConfig.position[2]}, 
            {x:targetBotConfig.position[0], z:targetBotConfig.position[2]}, range);
        if(finalPosition == null){
            console.error('ERROR:finalPosition == null');
            return path;
        }else{
            var pathRemaining = this.findPath(path[pathIndex][0], path[pathIndex][1]
                , finalPosition.x, finalPosition.z);
            return path.concat(pathRemaining);
        }
    },

    FindClosestWalkablePoint: function(position){

        if(this.tg.grid.isWalkableAt(position.x, position.z) 
        && bot_route_utility.isPositionUnoccupiedByBot(position.x, position.z)){
            return position;
        }
        for(var side = 1; side < this.tg.grid.width; ++side){
            positionRunnerStart = {x:position.x - side, z:position.z - side};// left-bottom
            var j = 0;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.x = positionRunnerStart.x + 1;
            }

            positionRunnerStart.x = positionRunnerStart.x - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower right -> upper right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.z = positionRunnerStart.z + j;
            }

            positionRunnerStart.z = positionRunnerStart.z - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.x = positionRunnerStart.x - 1;
            }

            positionRunnerStart.x = positionRunnerStart.x + 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.z = positionRunnerStart.z - 1;
            }
        }
        console.error('ERROR: Closest walkable point not found for position:', position);
        return null;// walkable point not found. This should never happen.
    },

    admitNewBot: function(botConfigParam, botid){
        var botConfig = this.tg.botConfig[botid];
        // // console.log('admitNewBot@bot route manager.');
        // // console.log(botConfigParam);
        if(botConfig != undefined && botConfig != null){
            // console.log('Note@botroutemanger : Bot already present for the given ID. reassigning');
            // return;
        }

        var position = this.FindClosestWalkablePoint({x:botConfigParam.position[0], y:0, z:botConfigParam.position[2]});
        if(position!=null){
            botConfigParam.position[0] = position.x;
            botConfigParam.position[2] = position.z;
        }

        var xPos = Math.floor(botConfigParam.position[0]);
        botConfigParam.position[0] = xPos;
        var zPos = Math.floor(botConfigParam.position[2]);
        botConfigParam.position[2] = zPos;
        // this.tg.grid.setWalkableAt(xPos, zPos, false);
        this.tg.botConfig[botid] = botConfigParam;
        bot_route_utility.updateBotPosition(botid, xPos, zPos);
        return position;
    },

    // updateBotPosition: function(botid, xPos, zPos){
    //     var currentBot = this.tg.botConfig[botid];
    //     // this.tg.grid.setWalkableAt(currentBot.position[0], currentBot.position[2], true);
    //     // this.tg.grid.setWalkableAt(xPos, zPos, false);

    //     currentBot.position[0] = xPos;
    //     currentBot.position[2] = zPos;
    //     bot_route_utility.updateBotPosition(botid, xPos, zPos);
    // },

    // findClosestEmptyCell(position){
    //     if(this.tg.grid.isWalkableAt(position[0], position[2])){
    //         return position;
    //     }
    //     var layer = 1;
    //     while(layer <= world_config.floor.length && layer <= world_config.floor.bredth){
    //         var nextCell = findNextLayerStartingCell(layer, position);
    //         if(nextCell == null){
    //             return null;
    //         }

            

    //         ++layer;
    //     }
        
    // },

    // findNextLayerStartingCell(layer, position){
    //     world_config.floor.length

    //     var cornerCellX = position[0] + layer;
    //     var cornerCellZ = position[2] + layer;
    //     if(cornerCellX >= 0 && cornerCellX <= world_config.floor.breadth
    //         && cornerCellZ >= 0 && cornerCellZ <= world_config.floor.length){
    //         return {x:cornerCellX, z:cornerCellZ};
    //     }

    //     cornerCellX = position[0] - layer;
    //     cornerCellZ = position[2] + layer;
    //     if(cornerCellX >= 0 && cornerCellX <= world_config.floor.breadth
    //         && cornerCellZ >= 0 && cornerCellZ <= world_config.floor.length){
    //         return {x:cornerCellX, z:cornerCellZ};
    //     }

    //     cornerCellX = position[0] + layer;
    //     cornerCellZ = position[2] - layer;
    //     if(cornerCellX >= 0 && cornerCellX <= world_config.floor.breadth
    //         && cornerCellZ >= 0 && cornerCellZ <= world_config.floor.length){
    //         return {x:cornerCellX, z:cornerCellZ};
    //     }
    //     cornerCellX = position[0] - layer;
    //     cornerCellZ = position[2] - layer;
    //     if(cornerCellX >= 0 && cornerCellX <= world_config.floor.breadth
    //         && cornerCellZ >= 0 && cornerCellZ <= world_config.floor.length){
    //         return {x:cornerCellX, z:cornerCellZ};
    //     }

    //     console.error('ERROR:: could not find findNextLayerStartingCell()');
    //     return null;
    // },

    deActivateBot: function(botid){
        var botConfig = this.tg.botConfig[botid];
        if(botConfig == undefined || botConfig == null){
            // console.log('ERROR: Bot undefined. Skip termination process. Bot ID:' + botid);
            return;
        }
        var xPos = botConfigParam.position[0];
        var zPos = botConfigParam.position[2];
        // this.tg.grid.setWalkableAt(xPos + this.tg.centreX, zPos + this.tg.centreX, true);
        this.tg.botConfig[botid] = null;
    },
}