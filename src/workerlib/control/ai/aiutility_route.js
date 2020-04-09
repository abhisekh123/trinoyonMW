/**
 * Common utility functions used by other ai modules.
 */

const workerState = require('../../state/workerstate');
const routeManager = require('../../route/routemanager');

module.exports = {
    // baseMap: {}
    worldConfig: null,
    itemConfig: null,
    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();

        // console.log('==++++', this.worldConfig);
    },


    findClosestHostileAttackedByTeamMate: function(botIndex, playerConfig){
        var hostileConfig = null;
        // console.log(this.worldConfig);
        var minDist = this.worldConfig.gridSide + 1;

        const botConfig = playerConfig.botObjectList[botIndex];
        
        for (var j = 0; j < playerConfig.botObjectList.length; ++j) {
            if(j == botIndex){
                continue;
            }
            const teamBotConfig = playerConfig.botObjectList[j];
            if(teamBotConfig.isActive == false){
                continue;
            }
            if(teamBotConfig.action == 'fight'){
                // if the bot is in fighting mode, find how far away is his target
                var dist = routeManager.getDistanceBetweenPoints(
                    botConfig.position[0],
                    botConfig.position[2],
                    teamBotConfig.actionData.position[0],
                    teamBotConfig.actionData.position[2]
                );
                if(dist < minDist){
                    minDist = dist;
                    hostileConfig = teamBotConfig.actionData;
                }
            }
            
        }
        return hostileConfig;
    },

    // findClosestHostileInRange: function(itemConfig, gameRoom, rangeParam){
    //     const targetConfig = routeManager.findClosestHostile(itemConfig, gameRoom);
    //     if(targetConfig != null){
    //         var distance = routeManager.getDistanceBetweenPoints(
    //             itemConfig.position[0], itemConfig.position[2], targetConfig.position[0], targetConfig.position[2]
    //         );
    //         if(rangeParam >= distance){
    //             return targetConfig;
    //         }else{
    //             return null;
    //         }
    //     }else{
    //         return null;
    //     }
    // },
    // here the itemConfig can be buildingConfig or botConfig.
    // we are taking rangeParam because it can be range as well as sight or something else.
    // findClosestHostileInRange_old: function(itemConfig, gameRoom, rangeParam){
    //     console.log('this.findClosestHostileInRange for:', itemConfig);
    //     var enemyTeam = 2;
    //     if(itemConfig.team == 2){
    //         enemyTeam = 1;
    //     }
    //     console.log('enemyTeam:', enemyTeam);
    //     // increase widhth and check the perimeter
    //     for(var side = 1; side < rangeParam; ++side){
    //         positionRunnerStart = {x:itemConfig.position[0] - side, z:itemConfig.position[2] - side};// left-bottom
    //         var j = 0;
    //         for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
    //             const objectAtPosition = routeManager.getObjectOccupyingThePosition(
    //                 positionRunnerStart.x,
    //                 positionRunnerStart.z,
    //                 gameRoom
    //             );
    //             // if point in grid and occupied.
    //             if( objectAtPosition != null && objectAtPosition != -1 ){
    //                 if(objectAtPosition.team == enemyTeam){
    //                     // found an hostile
    //                     return objectAtPosition;
    //                 }
    //             }
                
    //             positionRunnerStart.x = positionRunnerStart.x + 1;
    //         }

    //         positionRunnerStart.x = positionRunnerStart.x - 1;
    //         for(j = 0; j <= (2 * side); ++j){ // lower right -> upper right
    //             const objectAtPosition = routeManager.getObjectOccupyingThePosition(
    //                 positionRunnerStart.x,
    //                 positionRunnerStart.z,
    //                 gameRoom
    //             );
    //             // if point in grid and occupied.
    //             if( objectAtPosition != null && objectAtPosition != -1 ){
    //                 if(objectAtPosition.team == enemyTeam){
    //                     // found an hostile
    //                     return objectAtPosition;
    //                 }
    //             }

    //             positionRunnerStart.z = positionRunnerStart.z + j;
    //         }

    //         positionRunnerStart.z = positionRunnerStart.z - 1;
    //         for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
    //             const objectAtPosition = routeManager.getObjectOccupyingThePosition(
    //                 positionRunnerStart.x,
    //                 positionRunnerStart.z,
    //                 gameRoom
    //             );
    //             // if point in grid and occupied.
    //             if( objectAtPosition != null && objectAtPosition != -1 ){
    //                 if(objectAtPosition.team == enemyTeam){
    //                     // found an hostile
    //                     return objectAtPosition;
    //                 }
    //             }
    //             positionRunnerStart.x = positionRunnerStart.x - 1;
    //         }

    //         positionRunnerStart.x = positionRunnerStart.x + 1;
    //         for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
    //             const objectAtPosition = routeManager.getObjectOccupyingThePosition(
    //                 positionRunnerStart.x,
    //                 positionRunnerStart.z,
    //                 gameRoom
    //             );
    //             // if point in grid and occupied.
    //             if( objectAtPosition != null && objectAtPosition != -1 ){
    //                 if(objectAtPosition.team == enemyTeam){
    //                     // found an hostile
    //                     return objectAtPosition;
    //                 }
    //             }
    //             positionRunnerStart.z = positionRunnerStart.z - 1;
    //         }
    //     }

    //     return null; // no hostiles in range.
    // },



    planBotRoute: function(botConfig, path){ // each path element : [posX, posZ, time to travel, rotation]
        if(path.length < 2){ // TODO: check if path can be length 1.
            console.error('ERROR:Path smaller than 2', botConfig.id);
            // console.log('path:', path);
            return;
        }
        // var currentTime = workerState.currentTime;
        var pathTime = botConfig.activityTimeStamp;
        // path[0].push(this.setBotPathData(path[0], path[0], botConfig));
        path[0].push(pathTime); // position at begining.
        var diffCount = 0;
        for(var i = 1; i < path.length; ++i){
            diffCount = 0;
            // var timeDelta = this.setBotPathData(path[i], path[i + 1], botConfig);
            // timeToTravel += (timeDelta * 1000);//convert to milliseconds.

            // testing if tow consecutive path positions are adjacent or diagonal.
            if(path[i - 1][0] != path[i][0]){
                ++diffCount;
            }
            if(path[i - 1][1] != path[i][1]){
                ++diffCount;
            }
            if(diffCount == 1){
                // adjacent
                pathTime += botConfig.adjacentTime;
            } else if(diffCount == 2){
                // adjacent
                pathTime += botConfig.diagonalTime;
            } else {
                console.log('ERROR: unknown value for path planning:', diffCount);
                pathTime += botConfig.diagonalTime;
            }
            path[i].push(pathTime);
        }
        return;
    },
}


