const workerState = require('../../state/workerstate');
const routeManager = require('../../route/routemanager');
// const botActionProcessor = require('../action/botactionprocessor');
const aiUtility = require('./aiutility');
const utilityFunctions = require('../../../utils/utilityfunctions');

module.exports = {

    worldConfig: null,
    itemConfig: null,
    
    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
    },

    processAI: function(playerConfigParam, gameRoom){
        // console.log(playerConfigParam.id + ' selectedTeamPlayer.isAIDriven:', playerConfigParam.isAIDriven);
        
        // console.log('playerConfigParam:', playerConfigParam);
        var areAllBotsIdle = this.areAllBotsIdle(playerConfigParam);
        if(areAllBotsIdle == true){
            var leaderBotConfig = playerConfigParam.botObjectList[0];
            // console.log('-- playerAi. all bots idle for player:' 
            // + playerConfigParam.id + ' at position:', leaderBotConfig.position);
            
            
            // console.log('-- playerAi. leaderBotConfig position:', leaderBotConfig.position);
            // all bots are idle. Loiter.
            /**
             * TODO: SHOULD CONSIDER HOSTILE BUILDINGS ONLY
             */
            // console.log('123',this.worldConfig.constants);
            // console.log('123',this.worldConfig.constants.BUILDINGS);
            var nearestTarget = routeManager.findClosestHostile(leaderBotConfig, gameRoom, this.worldConfig.constants.BOTS);
            // // console.log(playerConfig.id);
            // console.log('nearestTarget:', nearestTarget);
            if(nearestTarget == null){
                
                // return;
                var randomPosition = {
                    x: utilityFunctions.getRandomInt(0, this.worldConfig.gridSide),
                    z: utilityFunctions.getRandomInt(0, this.worldConfig.gridSide),
                };
                var nearestPosition = routeManager.findNearestWalkablePositionInNeighbourhood(randomPosition, gameRoom, this.worldConfig.maxRange);
                // console.log('@playerAI, nearestTarget is null for player:' + playerConfigParam.id + ' random position:', randomPosition);
                if(nearestPosition != null){
                    aiUtility.goNearDesignatedPosition(
                        leaderBotConfig, 
                        nearestPosition, 
                        'march', 
                        gameRoom, 
                    );
                }
                
            }else{

                aiUtility.goNearRoutine(this.worldConfig.constants.VISIBLE, leaderBotConfig.range, leaderBotConfig, gameRoom, nearestTarget);
                
            }
        }
    },

    areAllBotsIdle: function(playerConfigParam){
        // leaderBotID: null,
        // botIDList: []
        // var areBotsIdleFlag = true;


        for(var i = 0; i < playerConfigParam.botObjectList.length; ++i){
            var botConfig = playerConfigParam.botObjectList[i];
            // if(botConfig.action == 'march' || botConfig.action == 'goto' || botConfig.action == 'fight'){
            if(botConfig.action == 'march' || botConfig.action == 'goto'){
                return false;
            }
        }

        return true;
    },
}



