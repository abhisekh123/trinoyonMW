

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

        var distanceBetweenBotAndHostile = this.worldConfig.gridSide + 1;
        var hostileConfig = routeManager.findClosestHostile(botConfig, gameRoom, this.worldConfig.constants.ALL);
        if(hostileConfig != null){
            distanceBetweenBotAndHostile = routeManager.getDistanceBetweenPoints(
                botConfig.position[0],
                botConfig.position[2],
                hostileConfig.position[0],
                hostileConfig.position[2]
            );
        }

        if(distanceBetweenBotAndHostile <= botConfig.range && botConfig.action == 'ready'){ // if a hostile is found in range
            // console.log('--attack -> hostiles in range:' + hostileConfig.id + ' at position:', hostileConfig.position);
            // actionManager.actionUtility.addActionToBot(botConfig, 'fight', hostileConfig, gameRoom);
            aiUtility.attackHostile(botConfig, hostileConfig, gameRoom);
            return 0; // consumed all remaining time to attack. Done for the current iteration.
        }

        /**
         * march ai routine start. At end of this routine, only possible outcome is march instruction.
         */
        var distanceBetweenBotAndHero = this.worldConfig.gridSide + 1;
        if(botIndex != 0){
            var heroConfig = playerConfig.botObjectList[0];
            distanceBetweenBotAndHero = routeManager.getDistanceBetweenPoints(
                botConfig.position[0],
                botConfig.position[2],
                heroConfig.position[0],
                heroConfig.position[2]
            );
        }

        // test the non hero bots if they are away from hero bot.
        if(botIndex != 0 && this.shouldBotGoNearLeader(botConfig, distanceBetweenBotAndHero)){
            aiUtility.goNearRoutine(this.worldConfig.constants.DONTCARE, this.worldConfig.closeProximity, botConfig, gameRoom, heroConfig);
        } else if(distanceBetweenBotAndHostile <= botConfig.sight){
            aiUtility.goNearRoutine(this.worldConfig.constants.VISIBLE, botConfig.range, botConfig, gameRoom, hostileConfig);
            // if(playerConfig.isAIDriven == true){
            // }
            // aiUtility.goNearRoutine(this.worldConfig.constants.VISIBLE, botConfig.range, botConfig, gameRoom, hostileConfig);
        }
        // march routine end.

        if(botConfig.action == 'goto') {
            return timeSlice;
        } else if(botConfig.action == 'march') {
            timeSlice = actionManager.Bot.continuePerformingAction(botConfig, gameRoom, timeSlice);
            return timeSlice;
        }
        // consume entire timeSlice doing nothing.
        return 0;
    },

}