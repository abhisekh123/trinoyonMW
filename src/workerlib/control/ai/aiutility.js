/**
 * Common utility functions used by other ai modules.
 */

const workerState = require('../../state/workerstate');
const routeManager = require('../../route/routemanager');
const actionManager = require('../action/actionmanager');
const aiUtility_route = require('./aiutility_route');

module.exports = {
    // baseMap: {}
    worldConfig: null,
    itemConfig: null,
    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
        aiUtility_route.init();
        // console.log('==++++', this.worldConfig);
    },
    'aiutilityRoute': aiUtility_route,

    // engageHostile: function(botConfig, targetConfig, gameRoom){
    //     var distanceBetweenBotAndTarget = routeManager.getDistanceBetweenPoints(
    //         botConfig.position[0],
    //         botConfig.position[2],
    //         targetConfig.position[0],
    //         targetConfig.position[2]
    //     );
    //     // if nearesr target already in range
    //     if(distanceBetweenBotAndTarget <= botConfig.range){ //this should not happen
    //         console.error('distanceBetweenBotAndTarget <= botConfig.range, attacking');
            
    //     }else{
    //         var nearestPosition = routeManager.findClosestWalkablePosition(
    //             targetConfig, 
    //             this.worldConfig.gridSide, 
    //             gameRoom
    //         );
    //     }
        
        
    //     // if target is in range then attack
    //     // else
    //     // find closest walkable point
    //     // if it is closer than current distance, march
    // },

    // action routines
    canAttack: function(objectConfig){
        if((workerState.currentTime - objectConfig.activityTimeStamp) > objectConfig.attackinterval){
            return true;
        }
        return false;
    },

    // canAttack + attack as many times possible.  add remainitng time to bot in activityTimeStam field.
    attackHostile: function(offenderConfig, defenderConfig, gameRoom){
        while (this.canAttack(offenderConfig)){
            actionManager.actionUtility.processAttackAction(offenderConfig, defenderConfig, gameRoom);
        }
    },


    completeBotMovementActionFormalities: function(botConfig, positionObject, action, gameRoom, targetConfig){
        var path = routeManager.findPath(
            botConfig.position[0],
            botConfig.position[2],
            positionObject.x,
            positionObject.z
        );
        if(path.length < 2){
            console.log('start:' + botConfig.position[0] + '] , [' + botConfig.position[2]);
            console.log('end:' + positionObject.x + '] , [' + positionObject.z)
        }
        
        aiUtility_route.planBotRoute(botConfig, path); // set timestamp to each path position.
        // console.log('completeBotMovementActionFormalities path:', path);
        actionData = {
            path: path,
            timeStamp: workerState.currentTime,
            targetConfig: targetConfig
        }
        actionManager.actionUtility.addActionToBot(botConfig, action, actionData, gameRoom);
        // this.updateBotPositionInGridMatrix(botConfig, positionObject.x, positionObject.z, gameRoom);
    },

    /**
     * visibility: 1(visible), 0(dont care), -1(invisible)
     * range: positive(in range), 0(dont care), negetive(outside range)
     * 
     * this function will either set movement action or will retain the bot unchanged.
     */
    goNearRoutine: function(visibility, range, botConfig, gameRoom, targetConfig){
        var distance = routeManager.getDistanceBetweenPoints(
            botConfig.position[0],
            botConfig.position[2],
            targetConfig.position[0],
            targetConfig.position[2]
        );
        if(botConfig.action == 'march'){
            if(botConfig.actionData.targetConfig.id == targetConfig.id){
                if(targetConfig.type == 'base' || targetConfig.type == 'tower'){
                    if(distance < botConfig.sight){
                        botConfig.action = 'goto';
                    }
                    // since tower or base does not change position.
                    // so do nothing. let the bot continue moving.
                    return;
                }
                // the bot is already moving towards the given target.
                if(botConfig.actionData.timeStamp >= targetConfig.positionUpdateTimeStamp){
                    // the target bot did not move after the input bot started march
                    // so do nothing. let the bot continue moving.
                    if(distance < botConfig.sight){
                        botConfig.action = 'goto';
                    }
                    return;
                }
            }
        }

        // var targetX = targetConfig.position[0];
        // var targetZ = targetConfig.position[2];

        // if(this.isPositionCriteriaSatisfied(visibility, range, gameRoom, botConfig, targetConfig)){
        //     // bot is already in a desirable position. though this should not happen.
        //     return;
        // }
        // var newPosition = this.findClosestWalkablePositionForGivenCriteria(visibility, range, botConfig, targetConfig, gameRoom);
        var nearestPosition = routeManager.findClosestWalkablePosition(
            visibility,
            range,
            botConfig,
            targetConfig,
            gameRoom
        );
        // var path = null;
        if(nearestPosition == null){
            console.log('no suitable position found for bot so action remains unchanged:', botConfig.id);
            // find path to target.
            // path = routeManager.findPath(
            //     botConfig.position[0],
            //     botConfig.position[2],
            //     positionObject.x,
            //     positionObject.z
            // );
            // for(var i = 0; i < path.length; ++i){
            //     // if path position is not satisfied, nearest position = path[i - 1];
            // }
            // remove the path positions
        }else{
            distance = routeManager.getDistanceBetweenPoints(
                botConfig.position[0],
                botConfig.position[2],
                nearestPosition.x,
                nearestPosition.z
            );
            if(distance < botConfig.sight){
                this.completeBotMovementActionFormalities(botConfig, nearestPosition, 'goto', gameRoom, targetConfig);
            }else{
                this.completeBotMovementActionFormalities(botConfig, nearestPosition, 'march', gameRoom, targetConfig);
            }
            
        }
        // if(this.comparePositionsForCriteria(visibility, range, 
        //     targetX, targetZ, 
        //     currentX, currentZ, 
        //     newPosition.x, newPosition.z, gameRoom) > 0){
        //         this.completeBotMovementActionFormalities(botConfig, newPosition, 'march', gameRoom, targetConfig);
        // }
        // aiUtility.completeBotMovementActionFormalities(botConfig, positionNearLeader, 'march', gameRoom);
        
    },

    // isPositionCriteriaSatisfied: function(visibility, range, gameRoom, botConfig, targetConfig){

    // },

    // comparePositionsForCriteria: function(visibility, range, targetX, targetZ, currentX, currentZ,  newX, newZ, gameRoom){

    // },

    // findClosestWalkablePositionForGivenCriteria: function(visibility, range, botConfig, targetConfig, gameRoom){

    // },
}


