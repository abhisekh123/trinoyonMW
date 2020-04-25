/**
 * this file contains logical function that are used by ai/action
 */
const pathFindingWrapper = require('./pathfindingwrapper');
const customRoutingUtility = require('./customroutingutility');
const workerState = require('../state/workerstate');



module.exports = {
    worldConfig: null,
    itemConfig: null,

    customRoutingUtility: customRoutingUtility,

    init: function () {
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();

        pathFindingWrapper.init();
        customRoutingUtility.init();
    },

    checkIfBotIsVisibleToEnemyTeam: function(itemConfig, gameRoom){
        var botTeam = itemConfig.team;
        for(var i = 0; i < gameRoom.proximityGraph.length; ++i){ // each row
            if(gameRoom.allDynamicObjects[i].team == botTeam){ // skip team member bots
                continue;
            }
            // if allDynamicObjects[i] can see itemConfig.
            if(gameRoom.proximityGraph[i][itemConfig.globalIndex].visibility == true){ 
                return true;
            }
        }
        return false;
    },

    // TODO: HAVE FLAG : HOSTILE TYPE: BUILDINGS, HERO AND BUILDING, EVERYTHING?
    // TODO: need refinement. search only for hero bot. Or dont consider bots / players at all
    // used for movement of player to nearesrt enemy hero or building. used by player AI
    findClosestHostile: function (configParam, gameRoom, hostileTypeFlag) {
        var playerTeam = configParam.team;
        var enemyPlayerList = null;
        // console.log('hostileFlag:', hostileTypeFlag);
        // console.log('findClosestHostile->ID:', botConfigParam);

        var leaderPosition = configParam.position;

        // console.log('leader position:', leaderPosition, ' team:' + playerTeam, ' playerid:' + botConfigParam.playerID);

        var minDistance = this.worldConfig.gridSide + 1;

        var target = null;
        // var targetType = null;

        // find closest enemy player bots
        if(hostileTypeFlag == this.worldConfig.constants.ALL || hostileTypeFlag == this.worldConfig.constants.BOTS){
            if (playerTeam == 1) { // top team = 1
                enemyPlayerList = gameRoom.players_2;
            } else { // bottom team = 2
                enemyPlayerList = gameRoom.players_1;
            }
            for (var playerIndex = 0; playerIndex < enemyPlayerList.length; ++playerIndex) {
                const playerConfig = enemyPlayerList[playerIndex];
                
    
                for (var i = 0; i < playerConfig.botObjectList.length; ++i) {
                    var botConfig = playerConfig.botObjectList[i];
                    if(botConfig.isActive == false){
                        continue;
                    }
                    if(!this.checkIfBotIsVisibleToEnemyTeam(botConfig, gameRoom)){ // skip bots invisible to team
                        continue;
                    }
                    var botPosition = botConfig.position;
                    // console.log('testing for bot:', botConfig.id);
                    // console.log('position:', botConfig.position);
                    var distance = this.getDistanceBetweenPoints(
                        leaderPosition[0], leaderPosition[2], botPosition[0], botPosition[2]
                    );
                    // console.log('distance:', distance);
                    if (distance < minDistance) {
                        minDistance = distance;
                        target = botConfig;
                    }
                }
    
                // console.log('comparing with playerID:', playerConfig.playerID, ' tmpLeaderPosition:', tmpLeaderPosition);
                // console.log('calculated distance:', distance);
            }
        }

        // console.log('completed scaning enemy bots. target:', target);
        

        // console.log('min distance:', minDistance);

        // console.log('after comparing palyers, minDistance:', minDistance, ' target:', target);
        if(hostileTypeFlag == this.worldConfig.constants.ALL || hostileTypeFlag == this.worldConfig.constants.BUILDINGS){
            for (var i = 0; i < gameRoom.buildingArray_1.length; ++i) {
                var buildingConfig = gameRoom.buildingArray_1[i];
                if (buildingConfig.team == 0 || buildingConfig.team == playerTeam) {
                    // TODO: Add logic to spawn new AI player / admit new player here.
                    continue;
                }
                // console.log('comparing with defenseList[i]:', defenseList[i]);
                // console.log('testing for building:', buildingConfig.id);
                // console.log('position:', buildingConfig.position);
                var distance = this.getDistanceBetweenPoints(
                    leaderPosition[0], leaderPosition[2], buildingConfig.position[0], buildingConfig.position[2]
                );
                // console.log('distance:', distance);
                if (distance < minDistance) {
                    minDistance = distance;
                    target = buildingConfig;
    
                }
            }
            // console.log('min distance:', minDistance);
            for (var i = 0; i < gameRoom.buildingArray_2.length; ++i) {
                var buildingConfig = gameRoom.buildingArray_2[i];
                if (buildingConfig.team == 0 || buildingConfig.team == playerTeam) {
                    // TODO: Add logic to spawn new AI player / admit new player here.
                    continue;
                }
                // console.log('testing for building:', buildingConfig.id);
                // console.log('position:', buildingConfig.position);
                // console.log('comparing with defenseList[i]:', defenseList[i]);
                var distance = this.getDistanceBetweenPoints(
                    leaderPosition[0], leaderPosition[2], buildingConfig.position[0], buildingConfig.position[2]
                );
                // console.log('distance:', distance);
                if (distance < minDistance) {
                    minDistance = distance;
                    target = buildingConfig;
    
                }
            }
        }
        
        // console.log('min distance:', minDistance);
        // console.log('target:', target);
        // console.log('after comparing defenseList, minDistance:', minDistance, ' target:', target);
        // if (target == null) {
        //     return null;
        // } else {
        //     return target;
        // }
        return target;
    },

    // TODO: remove repeatative codes.
    /**
     * visibilityFlag:
     * VISIBLE: 1,
        INVISIBLE: 2,
        DONTCARE: 0,
     */
    // find point(x, y) closest walkable to botConfigParam within range to targetConfig.
    findClosestWalkablePosition: function (visibilityFlag, rangeParam, botConfigParam, targetConfig, gameRoom) {
        // console.log('findClosestWalkablePosition for:', botConfigParam.position);
        if(
            (visibilityFlag != this.worldConfig.constants.VISIBLE) 
            && (visibilityFlag != this.worldConfig.constants.INVISIBLE) 
            && (visibilityFlag != this.worldConfig.constants.DONTCARE)
        ){
            console.error('ERROR: unknown visibility flag:', visibilityFlag);
            return null;
        }

        // console.log('findClosestWalkablePosition:', visibilityFlag);
        // console.log('botConfigParam id:', botConfigParam.id);
        // console.log('botConfigParam type:', botConfigParam.type);
        // console.log('botConfigParam position:', botConfigParam.position);

        // console.log('target id:', targetConfig.id);
        // console.log('target type:', targetConfig.type);
        // console.log('target position:', targetConfig.position);
        // console.log('range:', rangeParam);

        var minDistance = this.worldConfig.gridSide + 1;
        var foundSuitablePosition = false;
        var selectedPosition = {
            x: 0,
            z: 0
        }
        var isPositionEligible = false;
        var targetPositionX = targetConfig.position[0];
        var targetPositionZ = targetConfig.position[2];
        var neighbourhoodPosition = {
            x: 0,
            z: 0
        };
        for(var i = -rangeParam; i <= rangeParam; ++i){ // x-axis
            for(var j = -rangeParam; j <= rangeParam; ++j){ // z-axis
                neighbourhoodPosition.x = targetPositionX + i;
                neighbourhoodPosition.z = targetPositionZ + j;
                // console.log('testing for:', neighbourhoodPosition);
                
                if(this.isPositionWalkable(gameRoom, neighbourhoodPosition.x, neighbourhoodPosition.z)){
                    // skip if position is out of range
                    var distanceFromTargetPosition = this.getDistanceBetweenPoints(
                        neighbourhoodPosition.x,
                        neighbourhoodPosition.z,
                        targetConfig.position[0],
                        targetConfig.position[2]
                    );
                    if(distanceFromTargetPosition > rangeParam){
                        // console.log('position is walkable but out of range. distance:', distanceFromTargetPosition);
                        continue;
                    }

                    // test if position is eligible
                    isPositionEligible = false;
                    if (visibilityFlag == this.worldConfig.constants.DONTCARE){
                        // found a satisfactory position
                        // return positionRunnerStart;
                        isPositionEligible = true;
                    }else{
                        var visibility = customRoutingUtility.testVisibility(
                            targetConfig.position[0],
                            targetConfig.position[2],
                            neighbourhoodPosition.x,
                            neighbourhoodPosition.z
                        );
                        if (visibilityFlag == this.worldConfig.constants.VISIBLE){
                            if(visibility == true){
                                // found a satisfactory position
                                // return positionRunnerStart;
                                isPositionEligible = true;
                            }else{
                                // console.log('skipping position as it is invisible:', neighbourhoodPosition);
                            }
                        } else { // invisible.
                            if(visibility == false){
                                // found a satisfactory position
                                // return positionRunnerStart;
                                isPositionEligible = true;
                            }else{
                                // console.log('skipping position as it is visible:', neighbourhoodPosition);
                            }
                        }
                    }
                    if(isPositionEligible == true){
                        // console.log('found an eligible position:', neighbourhoodPosition);
                        var distanceFromBot = this.getDistanceBetweenPoints(
                            neighbourhoodPosition.x,
                            neighbourhoodPosition.z,
                            botConfigParam.position[0],
                            botConfigParam.position[2]
                        );
                        // console.log('distance from bot:', distanceFromBot);
                        if(distanceFromBot < minDistance){
                            foundSuitablePosition = true;
                            minDistance = distanceFromBot;
                            selectedPosition.x = neighbourhoodPosition.x;
                            selectedPosition.z = neighbourhoodPosition.z;
                        }
                    }
                }
            }
        }
        if(foundSuitablePosition == true){
            // console.log('findClosestWalkablePosition foundSuitablePosition == true');
            return selectedPosition;
        } else {
            if(rangeParam < this.worldConfig.maxRange){
                // try compromise with a bigger area
                var nearestPosition = this.findClosestWalkablePosition(
                    this.worldConfig.constants.DONTCARE,
                    this.worldConfig.maxRange,
                    botConfigParam,
                    targetConfig,
                    gameRoom
                );
                // console.log('findClosestWalkablePosition rec result');
                return nearestPosition;
            }
            // console.log('findClosestWalkablePosition null');
            return null; // no hostiles in range.
        }
    },

    // here the itemConfig can be buildingConfig or botConfig.
    // we are taking rangeParam because it can be range as well as sight or something else.
    findNearestWalkablePositionInNeighbourhood: function(positionParam, gameRoom, rangeParam){
        // console.log('findNearestWalkablePositionInNeighbourhood for:', positionParam);

        // var objectAtPosition = this.getObjectOccupyingThePosition(
        //     positionParam.x,
        //     positionParam.z,
        //     gameRoom
        // );
        // if position in grid is unoccupied.
        if(this.isPositionWalkable(gameRoom, positionParam.x, positionParam.z)){
            return positionParam;
        }
        
        // console.log('enemyTeam:', enemyTeam);
        // increase widhth and check the perimeter
        for(var side = 1; side < rangeParam; ++side){
            positionRunnerStart = {x:positionParam.x - side, z:positionParam.z - side};// left-bottom
            var j = 0;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                // objectAtPosition = this.getObjectOccupyingThePosition(
                //     positionRunnerStart.x,
                //     positionRunnerStart.z,
                //     gameRoom
                // );
                // // if position in grid is unoccupied.
                // if( objectAtPosition == null){
                //     return positionRunnerStart;
                // }
                if(this.isPositionWalkable(gameRoom, positionRunnerStart.x, positionRunnerStart.z)){
                    return positionRunnerStart;
                }
                
                positionRunnerStart.x = positionRunnerStart.x + 1;
            }

            positionRunnerStart.x = positionRunnerStart.x - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower right -> upper right
                // objectAtPosition = this.getObjectOccupyingThePosition(
                //     positionRunnerStart.x,
                //     positionRunnerStart.z,
                //     gameRoom
                // );
                // // if position in grid is unoccupied.
                // if( objectAtPosition == null){
                //     return positionRunnerStart;
                // }
                if(this.isPositionWalkable(gameRoom, positionRunnerStart.x, positionRunnerStart.z)){
                    return positionRunnerStart;
                }
                positionRunnerStart.z = positionRunnerStart.z + j;
            }

            positionRunnerStart.z = positionRunnerStart.z - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                // objectAtPosition = this.getObjectOccupyingThePosition(
                //     positionRunnerStart.x,
                //     positionRunnerStart.z,
                //     gameRoom
                // );
                // // if position in grid is unoccupied.
                // if( objectAtPosition == null){
                //     return positionRunnerStart;
                // }
                if(this.isPositionWalkable(gameRoom, positionRunnerStart.x, positionRunnerStart.z)){
                    return positionRunnerStart;
                }
                positionRunnerStart.x = positionRunnerStart.x - 1;
            }

            positionRunnerStart.x = positionRunnerStart.x + 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                // objectAtPosition = this.getObjectOccupyingThePosition(
                //     positionRunnerStart.x,
                //     positionRunnerStart.z,
                //     gameRoom
                // );
                // // if position in grid is unoccupied.
                // if( objectAtPosition == null){
                //     return positionRunnerStart;
                // }
                if(this.isPositionWalkable(gameRoom, positionRunnerStart.x, positionRunnerStart.z)){
                    return positionRunnerStart;
                }
                positionRunnerStart.z = positionRunnerStart.z - 1;
            }
        }

        return null; // no hostiles in range.
    },
    

    isPositionWalkable: function(gameRoom, positionX, positionZ){
        if (pathFindingWrapper.isPointInGrid(positionX, positionZ)) {
            const objectAtPosition = this.getObjectOccupyingThePosition(
                positionX,
                positionZ,
                gameRoom,
            );
            // console.log('objectAtPosition:', objectAtPosition);
            const isWalkableAt = pathFindingWrapper.isWalkableAt(
                positionX,
                positionZ
            );
            // console.log('isWalkableAt:', isWalkableAt);
            // if point in grid is walkable and unoccupied.
            if (objectAtPosition == null && isWalkableAt == true) {
                // console.log('position is walkable.');
                return true;
            }else{
                return false;
            }
        }else{
            // console.log('position not in grid.');
            return false;
        }
    },



    getObjectOccupyingThePosition: function (xPosParam, zPosParam, gameRoom) {
        if (!pathFindingWrapper.isPointInGrid(xPosParam, zPosParam)) {
            return -1;
        }
        return gameRoom.gridMatrix[xPosParam][zPosParam].object;
    },



    findPath: function (currentPositionX, currentPositionZ, targetPositionX, targetPositionZ) {
        return pathFindingWrapper.findPath(currentPositionX, currentPositionZ, targetPositionX, targetPositionZ);
    },

    getDistanceBetweenPoints: function (startX, startZ, endX, endZ) {
        if (!pathFindingWrapper.isPointInGrid(startX, startZ)) {
            return -1;
        }
        if (!pathFindingWrapper.isPointInGrid(endX, endZ)) {
            return -1;
        }

        return workerState.distanceMatrix[Math.abs(endX - startX)][Math.abs(endZ - startZ)];
    },

}