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



    // TODO: need refinement. search only for hero bot. Or dont consider bots / players at all
    // used for movement of player to nearesrt enemy hero or building. used by player AI
    findClosestPlayerOrTowerOrBase: function (botConfigParam, gameRoom) {
        var playerTeam = botConfigParam.teamId;
        // var defenseList = null;
        // var base = null;
        var enemyPlayerList = null;
        // console.log('findClosestPlayerOrTowerOrBase->ID:', botConfigParam);
        // var leaderConfig = workerstate.botMap[botConfigParam.leaderBotID];

        var leaderPosition = botConfigParam.position;

        // console.log('leader position:', leaderPosition, ' team:' + playerTeam, ' playerid:' + botConfigParam.playerID);

        var minDistance = this.worldConfig.gridSide + 1;

        var target = null;
        // var targetType = null;

        if (playerTeam == 1) { // top team = 1
            // defenseList = workerstate.getWorldConfig().defenceTop;
            // base = workerstate.getWorldConfig().topBase
            enemyPlayerList = gameRoom.players_2;
        } else { // bottom team = 2
            // defenseList = workerstate.getWorldConfig().defenceBottom;
            // base = workerstate.getWorldConfig().bottomBase;
            enemyPlayerList = gameRoom.players_1;
        }

        // find closest enemy player bots
        for (var playerIndex = 0; playerIndex < enemyPlayerList.length; ++playerIndex) {
            const playerConfig = enemyPlayerList[playerIndex];
            
            // skip inactive player and players controlled by real people and players in the same team
            // if(!playerConfig.isActive || playerConfig.teamID == botConfigParam.teamID){
            //     // TODO: Add logic to spawn new AI player / admit new player here.
            //     continue;
            // }

            for (var i = 0; i < playerConfig.botObjectList.length; ++i) {
                var botConfig = playerConfig.botObjectList[i];
                if(botConfig.isActive == false){
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
                    // target = [botPosition[0], botPosition[2]]
                    target = botConfig;
                    // targetType = 'bot';
                }
            }

            // console.log('comparing with playerID:', playerConfig.playerID, ' tmpLeaderPosition:', tmpLeaderPosition);
            // console.log('calculated distance:', distance);
        }

        // console.log('min distance:', minDistance);

        // console.log('after comparing palyers, minDistance:', minDistance, ' target:', target);

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
                // if(i == 0){
                //     targetType = 'base';
                // }else{
                //     targetType = 'static';
                // }

            }
        }
        // console.log('min distance:', minDistance);
        // gameRoom.buildingArray_2
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
                // if(i == 0){
                //     targetType = 'base';
                // }else{
                //     targetType = 'static';
                // }

            }
        }
        // console.log('min distance:', minDistance);
        // console.log('target:', target);
        // console.log('after comparing defenseList, minDistance:', minDistance, ' target:', target);
        if (target == null) {
            return null;
        } else {
            return target;
            // {
            //     target: target,
            //     targetType: targetType
            // }
        }

    },

    // find point(x, y) closest walkable to targetConfig.
    findClosestWalkablePosition: function (targetConfig, rangeParam, gameRoom) {
        // increase widhth and check the perimeter
        for (var side = 1; side < rangeParam; ++side) {
            positionRunnerStart = {
                x: targetConfig.position[0] - side,
                z: targetConfig.position[2] - side
            }; // left-bottom
            var j = 0;
            for (j = 0; j <= (2 * side); ++j) { // lower left -> lower right
                if(this.isPositionWalkable(gameRoom, positionRunnerStart.x, positionRunnerStart.z)){
                    return positionRunnerStart;
                }
                positionRunnerStart.x = positionRunnerStart.x + 1;
            }

            positionRunnerStart.x = positionRunnerStart.x - 1;
            for (j = 0; j <= (2 * side); ++j) { // lower right -> upper right
                if(this.isPositionWalkable(gameRoom, positionRunnerStart.x, positionRunnerStart.z)){
                    return positionRunnerStart;
                }
                positionRunnerStart.z = positionRunnerStart.z + j;
            }

            positionRunnerStart.z = positionRunnerStart.z - 1;
            for (j = 0; j <= (2 * side); ++j) { // lower left -> lower right
                if(this.isPositionWalkable(gameRoom, positionRunnerStart.x, positionRunnerStart.z)){
                    return positionRunnerStart;
                }
                positionRunnerStart.x = positionRunnerStart.x - 1;
            }

            positionRunnerStart.x = positionRunnerStart.x + 1;
            for (j = 0; j <= (2 * side); ++j) { // lower left -> lower right
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
            const isWalkableAt = pathFindingWrapper.isWalkableAt(
                positionX,
                positionZ
            );
            // if point in grid is walkable and unoccupied.
            if (objectAtPosition == null && isWalkableAt == true) {
                return true;
            }else{
                return false;
            }
        }
    },


    // find point(x, y) closest to position such that (x, y) in in range of targetPosition.
    findClosestVisiblePositionInRange: function (sourceConfig, targetConfig, range, gameRoom) {
        var minDistance = this.worldConfig.gridSide + 1;
        var closestPosition = {
            x: 0,
            y: 0
        }
        var foundSuitablePosition = false;

        for (var i = -range; i < range; ++i) { // x-axis
            for (var j = -range; j < range; ++j) { // z-axis
                var actualPositionX = i + targetConfig.position[0];
                var actualPositionZ = j + targetConfig.position[2];
                var objectOccupyintThePosition = this.getObjectOccupyingThePosition(
                    actualPositionX,
                    actualPositionZ,
                    gameRoom
                );
                if (objectOccupyintThePosition != null) { // already some bot / building is occupying the position
                    continue;
                }

                var distanceBetweenTargetAndNewPosition = this.getDistanceBetweenPoints(
                    targetConfig.position[0],
                    targetConfig.position[2],
                    actualPositionX,
                    actualPositionZ
                );
                if (distanceBetweenTargetAndNewPosition < range) {
                    var visibility = customRoutingUtility.testVisibility(
                        targetConfig.position[0],
                        targetConfig.position[2],
                        actualPositionX,
                        actualPositionZ
                    );
                    if (visibility == true) {
                        var distanceBetweenSourceAndNewPosition = this.getDistanceBetweenPoints(
                            sourceConfig.position[0],
                            sourceConfig.position[2],
                            actualPositionX,
                            actualPositionZ
                        );

                        if (distanceBetweenSourceAndNewPosition < minDistance) {
                            minDistance = distanceBetweenSourceAndNewPosition;
                            closestPosition.x = actualPositionX;
                            closestPosition.z = actualPositionZ;
                            foundSuitablePosition = true;
                        }
                    }
                }

            }
        }
        if (foundSuitablePosition == true) {
            return closestPosition;
        } else {
            return null;
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