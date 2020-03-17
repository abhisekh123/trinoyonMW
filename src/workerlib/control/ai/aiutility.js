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

    addActionToBot: function(botConfig, action, actionData){
        botConfig.action = action;
        botConfig.actionData = actionData;
    },

    canAttack: function(objectConfig){
        if((workerState.currentTime - objectConfig.activityTimeStamp) > objectConfig.attackinterval){
            return true;
        }
        return false;
    },

    // canAttack + attack as many times possible.  add remainitng time to bot in activityTimeStam field.
    processAttackDamageEvent: function(offenderConfig, defenderConfig){
        // timeSlice += offenderConfig.residueTimeslice;
        do {
            defenderConfig.life -= offenderConfig.attack; 
            objectConfig.activityTimeStamp += objectConfig.attackinterval;
        } while (this.canAttack(offenderConfig));
        
    },

    findClosestHostileAttackedByTeamMate: function(botIndex, playerConfig){
        var hostileConfig = null;
        // console.log(this.worldConfig);
        var minDist = this.worldConfig.gridSide + 1;

        const botConfig = playerConfig.botObjectList[j];
        
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

    // here the itemConfig can be buildingConfig or botConfig.
    // we are taking rangeParam because it can be range as well as sight or something else.
    findClosestHostileInRange: function(itemConfig, gameRoom, rangeParam){
        var enemyTeam = 2;
        if(itemConfig.team == 2){
            enemyTeam = 1;
        }

        // increase widhth and check the perimeter
        for(var side = 1; side < rangeParam; ++side){
            positionRunnerStart = {x:itemConfig.position[0] - side, z:itemConfig.position[2] - side};// left-bottom
            var j = 0;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                const objectAtPosition = routeManager.getObjectOccupyingThePosition(
                    positionRunnerStart.x,
                    positionRunnerStart.z,
                    gameRoom
                );
                // if point in grid and occupied.
                if( objectAtPosition != null && objectAtPosition != -1 ){
                    if(objectAtPosition.team == enemyTeam){
                        // found an hostile
                        return objectAtPosition;
                    }
                }
                
                positionRunnerStart.x = positionRunnerStart.x + 1;
            }

            positionRunnerStart.x = positionRunnerStart.x - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower right -> upper right
                const objectAtPosition = routeManager.getObjectOccupyingThePosition(
                    positionRunnerStart.x,
                    positionRunnerStart.z,
                    gameRoom
                );
                // if point in grid and occupied.
                if( objectAtPosition != null && objectAtPosition != -1 ){
                    if(objectAtPosition.team == enemyTeam){
                        // found an hostile
                        return objectAtPosition;
                    }
                }

                positionRunnerStart.z = positionRunnerStart.z + j;
            }

            positionRunnerStart.z = positionRunnerStart.z - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                const objectAtPosition = routeManager.getObjectOccupyingThePosition(
                    positionRunnerStart.x,
                    positionRunnerStart.z,
                    gameRoom
                );
                // if point in grid and occupied.
                if( objectAtPosition != null && objectAtPosition != -1 ){
                    if(objectAtPosition.team == enemyTeam){
                        // found an hostile
                        return objectAtPosition;
                    }
                }
                positionRunnerStart.x = positionRunnerStart.x - 1;
            }

            positionRunnerStart.x = positionRunnerStart.x + 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                const objectAtPosition = routeManager.getObjectOccupyingThePosition(
                    positionRunnerStart.x,
                    positionRunnerStart.z,
                    gameRoom
                );
                // if point in grid and occupied.
                if( objectAtPosition != null && objectAtPosition != -1 ){
                    if(objectAtPosition.team == enemyTeam){
                        // found an hostile
                        return objectAtPosition;
                    }
                }
                positionRunnerStart.z = positionRunnerStart.z - 1;
            }
        }

        return null; // no hostiles in range.
    },


    completeBotMovementActionFormalities: function(botConfig, positionObject, action, gameRoom){
        var path = routeManager.findPath(
            botConfig.position[0],
            botConfig.position[2],
            positionObject.x,
            positionObject.z
        );
        // console.log('completeBotMovementActionFormalities path:', path);
        this.planBotRoute(botConfig, path); // set timestamp to each path position.
        this.addActionToBot(botConfig, action, path);
        this.updateBotPositionInGridMatrix(botConfig, positionObject.x, positionObject.z, gameRoom);
    },

    updateBotPositionInGridMatrix: function(botConfig, posX, posZ, gameRoom){
        gameRoom.gridMatrix[botConfig.position[0]][botConfig.position[2]].object = null;
        gameRoom.gridMatrix[posX][posZ].object = botConfig;
        botConfig.position[0] = posX;
        botConfig.position[2] = posZ;
    },

    planBotRoute: function(botConfig, path){ // each path element : [posX, posZ, time to travel, rotation]
        if(path.length < 2){ // TODO: check if path can be length 1.
            console.log('ERROR:Path smaller than 2', botConfig);
            console.log('path:', path);
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


