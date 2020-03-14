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
            positionRunnerStart = {x:position.x - side, z:position.z - side};// left-bottom
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
    }
}


