

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

        /**
         * if goto
         *  continue action 
         *  return ts-upd 
         * endif
         * 
         * find closest hostile-all
         * 
         * if (ready) and (hostile in range)
         *  attack hostile
         *  return ts-upd (consume all time and should return 0)
         * endif
         * 
         * if (not hero) and (should go near hero)
         *  gonear hero - goto action
         * else if (hostile in sight)
         *  gonear hostile
         * endif
         * 
         * if (goto)
         *  return ts
         * endif
         * if (march)
         *  continue action
         *  return ts-upd
         * endif
         */

        const botConfig = playerConfig.botObjectList[botIndex];
        if(botConfig.isActive == false){
            return 0;
        }

        if(botConfig.action == 'goto'){
            // console.log('processAI: action goto');
            // no thinking involved. just keep going.
            timeSlice = actionManager.Bot.continuePerformingAction(botConfig, gameRoom, timeSlice);
            return timeSlice;
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
            if(this.shouldBotGoNearLeader(botConfig, distanceBetweenBotAndHero)){
                aiUtility.goNearRoutine(this.worldConfig.constants.DONTCARE, this.worldConfig.closeProximity, botConfig, gameRoom, heroConfig);
                return timeSlice;
            }
        }

        var hostileConfig = routeManager.findClosestHostile(botConfig, gameRoom, this.worldConfig.constants.ALL);
        var distanceBetweenBotAndHostile = routeManager.getDistanceBetweenPoints(
            botConfig.position[0],
            botConfig.position[2],
            hostileConfig.position[0],
            hostileConfig.position[2]
        );
    },

    processAI_old: function(playerConfig, botIndex, gameRoom, timeSlice){
        // console.log('processAI start');
        // console.log(playerConfig.id + ' selectedTeamPlayer.isAIDriven:', playerConfig.isAIDriven);

        var hostileConfig = null;
        const botConfig = playerConfig.botObjectList[botIndex];
        if(botConfig.isActive == false){
            return 0;
        }
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
            
            if(playerConfig.isAIDriven == true){
                // console.log('playerConfig:==', playerConfig);
                aiUtility.goNearRoutine(this.worldConfig.constants.VISIBLE, botConfig.range, botConfig, gameRoom, hostileConfig);
                // aiUtility.goNearRoutine(this.worldConfig.constants.VISIBLE, botConfig.range, botConfig, gameRoom, hostileConfig);
            }else{ // skip this step for user controlled bots.
                // console.log('playerConfig:==', playerConfig);
                return 0;
            }
            // aiUtility.goNearRoutine(this.worldConfig.constants.VISIBLE, botConfig.range, botConfig, gameRoom, hostileConfig);
        }

        

        if(botConfig.action == 'march' || botConfig.action == 'goto'){
            timeSlice = actionManager.Bot.continuePerformingAction(botConfig, gameRoom, timeSlice);
            // console.log('--march, timeslice:', timeSlice);
            return timeSlice;
        }
        if(botConfig.action == 'ready'){
            return 0;
        }
        // console.error('this code should not be executed');
        // actionManager.actionUtility.addActionToBot(botConfig, 'ready', null, gameRoom);
        return timeSlice; // spent the time doing nothing.
    },

}