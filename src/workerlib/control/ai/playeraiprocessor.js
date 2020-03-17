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
            // all bots are idle. Loiter.
            var nearestTarget = routeManager.findClosestPlayerOrTowerOrBase(leaderBotConfig, gameRoom);
            // // console.log(playerConfig.id);
            // console.log('nearestTarget:', nearestTarget);
            if(nearestTarget == null){
                console.log('nearestTarget is null:', nearestTarget);
                return;
            }else{
                // var leaderConfig = workerState.botMap[playerConfig.leaderBotID];
                // // console.log(leaderConfig.payload.position);
                var nearestPosition = routeManager.findClosestWalkablePosition(
                    nearestTarget, 
                    this.worldConfig.gridSide, 
                    gameRoom
                );
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
        var areBotsIdleFlag = false;


        for(var i = 0; i < playerConfigParam.botObjectList.length; ++i){
            var botConfig = playerConfigParam.botObjectList[i];
            if(botConfig.action == null || botConfig.instruction == null){
                areBotsIdleFlag = true;
            }else{
                return false;
            }
        }

        return areBotsIdleFlag;
    },
}



