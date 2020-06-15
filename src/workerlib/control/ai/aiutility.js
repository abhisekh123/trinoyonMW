/**
 * Common utility functions used by other ai modules.
 */

const workerState = require('../../state/workerstate');
const routeManager = require('../../route/routemanager');
const actionManager = require('../action/actionmanager');
const aiUtility_route = require('./aiutility_route');

module.exports = {
    worldConfig: null,
    itemConfig: null,
    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
        aiUtility_route.init();
        // console.log('==++++', this.worldConfig);
    },
    'aiutilityRoute': aiUtility_route,

    canAttack: function(objectConfig){
        if((workerState.currentTime - objectConfig.activityTimeStamp) > objectConfig.attackinterval){
            return true;
        }
        return false;
    },

    processAbilityRequest: function(objectConfig, gameRoom, abilityIndex){
        var abilityObject = objectConfig.ability[abilityIndex];
        // console.log('processAbilityRequest:', abilityObject);
        // var key = ;
        if(objectConfig[abilityObject.key] == this.worldConfig.constants.ABILITY_AVAILABLE){
            actionManager.actionUtility.activateAbility(objectConfig, abilityIndex);

            // process abilities which execute immediately
            switch (abilityObject.action) {
                case 'retreat': // goto base
                    var basePosition = null;
                    if(objectConfig.team == 1){
                        basePosition = this.worldConfig.topBase;
                    } else if(objectConfig.team == 2){
                        basePosition = this.worldConfig.bottomBase;
                    }
                    if(basePosition != null){
                        // console.log('retreat to:', basePosition);
                        this.goNearDesignatedPosition(
                            objectConfig, 
                            {x: basePosition[0], z: basePosition[1]},
                            'goto', 
                            gameRoom, 
                        );
                    }
                    break;
            
                default:
                    break;
            }
        }
    },

    // attack as many times possible.  add remainitng time to bot in activityTimeStam field.
    attackHostile: function(offenderConfig, defenderConfig, gameRoom){
        while (this.canAttack(offenderConfig)){
            actionManager.actionUtility.processAttackAction(offenderConfig, defenderConfig, gameRoom);
        }
    },


    completeBotMovementActionFormalities: function(botConfig, positionObject, action, gameRoom, targetConfig){
        // console.log(positionObject);
        if(botConfig.position[0] == positionObject.x && botConfig.position[2] == positionObject.z){
            // console.log(botConfig.id + ' completeBotMovementActionFormalities do nothing => start:' + botConfig.position[0] + '] , [' + botConfig.position[2]);
            // console.log('end:' + positionObject.x + '] , [' + positionObject.z);
            actionManager.actionUtility.addActionToBot(botConfig, 'ready', null, gameRoom);
            return;
        }
        var path = routeManager.findPath(
            botConfig.position[0],
            botConfig.position[2],
            positionObject.x,
            positionObject.z
        );
        if(path.length < 2){
            console.log('path.length < 2 => start:' + botConfig.position[0] + '] , [' + botConfig.position[2]);
            console.log('end:' + positionObject.x + '] , [' + positionObject.z);
        }
        
        aiUtility_route.planBotRoute(botConfig, path); // set timestamp to each path position.
        // console.log('botConfig.id:', botConfig.id);
        // console.log('completeBotMovementActionFormalities path:', path);
        var actionData = {
            path: path,
            pathTimeStamp: workerState.currentTime,
            // targetConfig: targetConfig.id
        }
        if(targetConfig == null){
            actionData.targetConfig = null;
        }else{
            actionData.targetConfig = targetConfig.id;
        }
        // console.log('completeBotMovementActionFormalities actionData:', actionData);
        actionManager.actionUtility.addActionToBot(botConfig, action, actionData, gameRoom);
        // this.updateBotPositionInGridMatrix(botConfig, positionObject.x, positionObject.z, gameRoom);
    },

    goNearDesignatedPosition: function(botConfig, positionObject, action, gameRoom){
        // console.log('goNearDesignatedPosition for:' + botConfig.id + ' position:', positionObject);
        var nearestPosition = routeManager.findNearestWalkablePositionInNeighbourhood(positionObject, gameRoom, this.worldConfig.maxRange);

        // console.log('goNearDesignatedPosition closest position:', closestWalkablePosition);
        if(nearestPosition != null){
            this.completeBotMovementActionFormalities(
                botConfig, 
                nearestPosition, 
                action, 
                gameRoom, 
                null
            );
        } else {
            console.error('@goNearDesignatedPosition, unable to perform action.');
        }
        
    },

    /**
     * visibility: 1(visible), 0(dont care), -1(invisible)
     * range: positive(in range), 0(dont care), negetive(outside range)
     * 
     * this function will either set movement action or will retain the bot unchanged.
     */
    goNearRoutine: function(visibility, range, botConfig, gameRoom, targetConfig){
        // console.log('goNearRoutine for:', botConfig.id);
        var distance = routeManager.getDistanceBetweenPoints(
            botConfig.position[0],
            botConfig.position[2],
            targetConfig.position[0],
            targetConfig.position[2]
        );
        
        if(botConfig.action == 'march'){ // if bot already moving near the given target.
            if(botConfig.actionData.targetConfig != null && botConfig.actionData.targetConfig == targetConfig.id){
                if(targetConfig.type == 'base' || targetConfig.type == 'tower'){ // objects that dont change position.
                    if(distance < botConfig.sight){
                        botConfig.action = 'goto';
                    }
                    // since tower or base does not change position.
                    // so do nothing. let the bot continue moving.
                    return;
                }
                // the bot is already moving towards the given target.
                if(botConfig.actionData.pathTimeStamp >= targetConfig.positionUpdateTimeStamp){
                    // the target bot did not move after the input bot started march
                    // so do nothing. let the bot continue moving.
                    if(distance < botConfig.sight){
                        botConfig.action = 'goto';
                    }
                    return;
                }
            }
        }

        var nearestPosition = routeManager.findClosestWalkablePosition(
            visibility,
            range,
            botConfig,
            targetConfig,
            gameRoom
        );
        // var path = null;
        if(nearestPosition == null){
            console.error('no suitable position found for bot so action remains unchanged:', botConfig.id);
        }else{
            distance = routeManager.getDistanceBetweenPoints(
                botConfig.position[0],
                botConfig.position[2],
                nearestPosition.x,
                nearestPosition.z
            );

            // if target is too near or we are going near a bot of same player
            if(distance < botConfig.sight || botConfig.player == targetConfig.player){
                this.completeBotMovementActionFormalities(botConfig, nearestPosition, 'goto', gameRoom, targetConfig);
            }else{
                this.completeBotMovementActionFormalities(botConfig, nearestPosition, 'march', gameRoom, targetConfig);
            }
            
        }
        
    },

}


