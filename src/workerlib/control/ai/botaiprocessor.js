

const workerState = require('../../state/workerstate');
const routeManager = require('../../route/routemanager');
const aiUtility = require('./aiutility');

module.exports = {

    worldConfig: null,
    itemConfig: null,

    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
    },

    processAI: function(playerConfig, botIndex, gameRoom, timeSlice){
        var hostileConfig = null;
        const botConfig = playerConfig.botObjectList[botIndex];
        // console.log('processAI:' + botConfig.id);
        
        // botConfig.attack = botTypeItemConfig.attack;
        
        if(aiUtility.canAttack(botConfig)){ // if can attack
            hostileConfig = aiUtility.findClosestHostileInRange(botConfig, gameRoom, botConfig.range);
            if(hostileConfig != null){ // if a hostile is found in range
                botConfig.action = 'fight';
                botConfig.actionData = hostileConfig;
                aiUtility.processAttackDamageEvent(botConfig, hostileConfig);
                return 0; // consumed all remaining time to attack. Done for the current iteration.
            }
        }

        // help out fellow bot
        hostileConfig = aiUtility.findClosestHostileAttackedByTeamMate(botIndex, playerConfig);
        if(hostileConfig != null){
            // find in range visible point to bot.actiondata and march to the point
            var positionNearHostile = routeManager.findClosestVisiblePointInRange(
                botConfig, 
                hostileConfig, 
                botConfig.range, 
                gameRoom
            );
            if(positionNearHostile != null){
                aiUtility.completeBotMovementActionFormalities(botConfig, positionNearHostile, 'march', gameRoom);
                return timeSlice;
            }
        }
        
        // see if needs to move
        if(botIndex == 0){ // if hero bot
        }else{ // regular bot
            // if away from Hero
            var distanceBetweenBotAndHero = routeManager.getDistanceBetweenPoints(
                botConfig.position[0],
                botConfig.position[2],
                playerConfig.botObjectList[0].position[0],
                playerConfig.botObjectList[0].position[2]
            );
            if(distanceBetweenBotAndHero > this.worldConfig.maxDistanceFromLeader){
                var positionNearLeader = routeManager.findClosestWalkablePosition(
                    playerConfig.botObjectList[0],
                    this.worldConfig.maxDistanceFromLeader,
                    gameRoom
                )
                if(positionNearLeader != null){
                    aiUtility.completeBotMovementActionFormalities(botConfig, positionNearLeader, 'march', gameRoom);
                    return timeSlice;
                }
            }
        }

        botConfig.activityTimeStamp = workerState.currentTime;
        return 0; // spent the time doing nothing.
    },


}