

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

    shouldBotGoNearLeader: function(botConfig, distanceFromLeader){
        if((distanceFromLeader > this.worldConfig.maxDistanceFromLeader && botConfig.action == 'ready')
        || (distanceFromLeader > this.worldConfig.tooAwayFromLeader)){
            return true;
        }
        return false;
    },

    processAI: function(playerConfig, botIndex, gameRoom, timeSlice){
        // console.log('processAI start');
        var hostileConfig = null;
        const botConfig = playerConfig.botObjectList[botIndex];
        // console.log('processAI:' + botConfig.id + ' at position:', botConfig.position);
        
        // botConfig.attack = botTypeItemConfig.attack;
        if(botConfig.action == 'goto'){
            // console.log('processAI: action goto');
            // no thinking involved. just keep going.
            timeSlice = actionManager.Bot.continuePerformingAction(botConfig, gameRoom, timeSlice);
            return timeSlice;
        }

        hostileConfig = routeManager.findClosestHostile(botConfig, gameRoom, this.worldConfig.constants.ALL);
        var distanceBetweenBotAndHostile = routeManager.getDistanceBetweenPoints(
            botConfig.position[0],
            botConfig.position[2],
            hostileConfig.position[0],
            hostileConfig.position[2]
        );

        if(distanceBetweenBotAndHostile <= botConfig.range){ // if a hostile is found in range
            // console.log('--attack -> hostiles in range:' + hostileConfig.id + ' at position:', hostileConfig.position);
            actionManager.actionUtility.addActionToBot(botConfig, 'fight', hostileConfig, gameRoom);
            aiUtility.attackHostile(botConfig, hostileConfig, gameRoom);
            return 0; // consumed all remaining time to attack. Done for the current iteration.
        }

        /**
         * march routine start. At end of this routine, only possible outcome is march instruction.
         */
        var distanceBetweenBotAndHero = 0;
        if(botIndex != 0){
            var heroConfig = playerConfig.botObjectList[0];
            distanceBetweenBotAndHero = routeManager.getDistanceBetweenPoints(
                botConfig.position[0],
                botConfig.position[2],
                heroConfig.position[0],
                heroConfig.position[2]
            );
        }
        // march routine end.

        // test the non hero bots if they are away from hero bot.
        if(botIndex != 0 && this.shouldBotGoNearLeader(botConfig, distanceBetweenBotAndHero)){
            aiUtility.goNearRoutine(this.worldConfig.constants.DONTCARE, this.worldConfig.closeProximity, botConfig, gameRoom, heroConfig);
        } else {
            
            aiUtility.goNearRoutine(this.worldConfig.constants.VISIBLE, botConfig.range, botConfig, gameRoom, hostileConfig);
            
        }

        

        if(botConfig.action == 'march'){
            timeSlice = actionManager.Bot.continuePerformingAction(botConfig, gameRoom, timeSlice);
            // console.log('--march, timeslice:', timeSlice);
            return timeSlice;
        }

        // console.error('this code should not be executed');
        // actionManager.actionUtility.addActionToBot(botConfig, 'ready', null, gameRoom);
        return timeSlice; // spent the time doing nothing.
    },

}