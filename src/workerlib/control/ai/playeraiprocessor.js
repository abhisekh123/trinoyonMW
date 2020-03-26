const workerState = require('../../state/workerstate');
const routeManager = require('../../route/routemanager');
// const botActionProcessor = require('../action/botactionprocessor');
const aiUtility = require('./aiutility');

module.exports = {

    worldConfig: null,
    itemConfig: null,
    
    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
    },

    processAI: function(playerConfigParam, gameRoom){
        var areAllBotsIdle = this.areAllBotsIdle(playerConfigParam);
        if(areAllBotsIdle == true){
            var leaderBotConfig = playerConfigParam.botObjectList[0];
            console.log('-- playerAi. all bots idle for player:' 
            + playerConfigParam.id + ' at position:', leaderBotConfig.position);
            
            
            // console.log('-- playerAi. leaderBotConfig position:', leaderBotConfig.position);
            // all bots are idle. Loiter.
            var nearestTarget = routeManager.findClosestHostile(leaderBotConfig, gameRoom);
            // // console.log(playerConfig.id);
            // console.log('nearestTarget:', nearestTarget);
            if(nearestTarget == null){
                console.error('ERROR:nearestTarget is null:', nearestTarget);
                return;
            }else{
                var distanceBetweenTargetAndLeader = routeManager.getDistanceBetweenPoints(
                    leaderBotConfig.position[0],
                    leaderBotConfig.position[2],
                    nearestTarget.position[0],
                    nearestTarget.position[2]
                );
                // if nearesr target already in range
                if(distanceBetweenTargetAndLeader <= leaderBotConfig.range){ //this should not happen
                    console.error('ERROR: distanceBetweenTargetAndLeader <= leaderBotConfig.range');
                    return;
                }
                // var leaderConfig = workerState.botMap[playerConfig.leaderBotID];
                console.log('nearest target:', nearestTarget.id);
                var nearestPosition = routeManager.findClosestWalkablePosition(
                    nearestTarget, 
                    this.worldConfig.gridSide, 
                    gameRoom
                );
                console.log('nearest position:', nearestPosition);
                if(nearestPosition == null){
                    console.log('nearestPosition == null .... surprise!');
                    return;
                }
                // console.log('player ai processor, leaderConfig:', leaderBotConfig);
                // console.log('nearest position:', nearestPosition);
                aiUtility.completeBotMovementActionFormalities(leaderBotConfig, nearestPosition, 'march', gameRoom);
                // var path = routeManager.findPath(
                //     leaderBotConfig.position[0], 
                //     leaderBotConfig.position[2], 
                //     nearestPosition.x, 
                //     nearestPosition.z);
                // // // console.log('path:', path);
                // // // console.log('4');
                // botActionProcessor.instructBot(leaderBotConfig, 'march', path);
            }
        }
    },

    areAllBotsIdle: function(playerConfigParam){
        // leaderBotID: null,
        // botIDList: []
        // var areBotsIdleFlag = true;


        for(var i = 0; i < playerConfigParam.botObjectList.length; ++i){
            var botConfig = playerConfigParam.botObjectList[i];
            if(botConfig.action == 'march' || botConfig.action == 'goto' || botConfig.action == 'fight'){
                return false;
            }
        }

        return true;
    },
}



