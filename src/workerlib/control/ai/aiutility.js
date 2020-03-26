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

    engageHostile: function(botConfig, targetConfig, gameRoom){
        var distanceBetweenBotAndTarget = routeManager.getDistanceBetweenPoints(
            botConfig.position[0],
            botConfig.position[2],
            targetConfig.position[0],
            targetConfig.position[2]
        );
        // if nearesr target already in range
        if(distanceBetweenBotAndTarget <= botConfig.range){ //this should not happen
            console.error('distanceBetweenBotAndTarget <= botConfig.range, attacking');
            
        }else{
            var nearestPosition = routeManager.findClosestWalkablePosition(
                targetConfig, 
                this.worldConfig.gridSide, 
                gameRoom
            );
        }
        
        
        // if target is in range then attack
        // else
        // find closest walkable point
        // if it is closer than current distance, march
    },

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


    completeBotMovementActionFormalities: function(botConfig, positionObject, action, gameRoom){
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
        actionManager.actionUtility.addActionToBot(botConfig, action, path, gameRoom);
        // this.updateBotPositionInGridMatrix(botConfig, positionObject.x, positionObject.z, gameRoom);
    },
}


