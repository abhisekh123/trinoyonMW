

const workerState = require('../../state/workerstate');
const routeManager = require('../../route/routemanager');
const aiUtility = require('./aiutility');
const actionManager = require('../action/actionmanager');

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
        if(botConfig.action == 'goto'){
            // no thinking involved. just keep going.
            timeSlice = actionManager.Bot.continuePerformingAction(botConfig, gameRoom, timeSlice);
            return timeSlice;
        }

        hostileConfig = aiUtility.aiutilityRoute.findClosestHostileInRange(botConfig, gameRoom, botConfig.range);
        if(hostileConfig != null){ // if a hostile is found in range
            actionManager.actionUtility.addActionToBot(botConfig, 'fight', hostileConfig, gameRoom);
            aiUtility.attackHostile(botConfig, hostileConfig, gameRoom);
            return 0; // consumed all remaining time to attack. Done for the current iteration.
        }
        
        if(botConfig.action == 'march'){
            timeSlice = actionManager.Bot.continuePerformingAction(botConfig, gameRoom, timeSlice);
            return timeSlice;
        }

        // help out fellow bot
        hostileConfig = aiUtility.aiutilityRoute.findClosestHostileAttackedByTeamMate(botIndex, playerConfig);
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

        actionManager.actionUtility.addActionToBot(botConfig, 'ready', null, gameRoom);
        return 0; // spent the time doing nothing.
    },


}