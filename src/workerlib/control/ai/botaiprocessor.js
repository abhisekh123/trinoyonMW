

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



    // check bot strategic situation and activate AI if required
    // manageBotTypeAIToActivateAbility: function(botConfig, gameRoom){
    // },

    getAbilityState: function(botConfig, abilityIndex){
        return botConfig[botConfig.ability[abilityIndex].key];
    },


    useRetreatAbility: function(botConfig, gameRoom){
        for(var i = 0; i < botConfig.ability.length; ++i){
            switch (botConfig.ability[i].action) {
                case 'retreat':
                    if(this.getAbilityState(botConfig, i) == this.worldConfig.constants.ABILITY_AVAILABLE){
                        aiUtility.processAbilityRequest(botConfig, gameRoom, i);
                        return true;
                    }
                    break;
            
                default:
                    break;
            }
        }
        return false;
    },

    useHPAbility: function(botConfig, gameRoom){
        for(var i = 0; i < botConfig.ability.length; ++i){
            switch (botConfig.ability[i].action) {
                case 'sheild':
                    if(this.getAbilityState(botConfig, i) == this.worldConfig.constants.ABILITY_AVAILABLE){
                        aiUtility.processAbilityRequest(botConfig, gameRoom, i);
                    }
                    break;
            
                default:
                    break;
            }
        }
    },

    useAttackAbility: function(botConfig, gameRoom){
        for(var i = 0; i < botConfig.ability.length; ++i){
            switch (botConfig.ability[i].action) {
                case 'pulse':
                    if(this.getAbilityState(botConfig, i) == this.worldConfig.constants.ABILITY_AVAILABLE){
                        aiUtility.processAbilityRequest(botConfig, gameRoom, i);
                    }
                    break;
                case 'scorch':
                    if(this.getAbilityState(botConfig, i) == this.worldConfig.constants.ABILITY_AVAILABLE){
                        aiUtility.processAbilityRequest(botConfig, gameRoom, i);
                    }
                    break;
                default:
                    break;
            }
        }
    },

    isBotAIDriven: function(botConfig, gameRoom){
        var playerID = botConfig.player;
        var playerList = null;
        if(botConfig.team == 1){
            playerList = gameRoom.players_1;
        } else {
            playerList = gameRoom.players_2;
        }

        for(var i = 0; i < playerList.length; ++i){
            if(playerID == playerList[i].id){
                return playerList[i].isAIDriven;
            }
        }

        return true;
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

        // try retreat action
        
        if(playerConfig.isAIDriven == true){
            var offenderLifeRatio = (botConfig.life / botConfig.fullLife);
            if(offenderLifeRatio < this.itemConfig.globalAIConfig.retreatAbilityLifeFraction){
                if(this.useRetreatAbility(botConfig, gameRoom) == true){ // if successfully used ability
                    return timeSlice;
                }
                
            }
        }
        


        // find closest hostile and calculate distance.
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
            if(playerConfig.isAIDriven == true){
                this.useAttackAbility(botConfig, gameRoom);
            }

            if(hostileConfig.type != 'tower' && hostileConfig.type != 'base'){
                if(this.isBotAIDriven(hostileConfig, gameRoom)){
                    this.useHPAbility(hostileConfig, gameRoom);
                }
            }
            
            aiUtility.attackHostile(botConfig, hostileConfig, gameRoom);
            return 0; // consumed all remaining time to attack. Done for the current iteration.
        }

        /**
         * by here either (march) or (ready + no bot in range)
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
        if(botIndex != 0 && heroConfig.isActive == true && this.shouldBotGoNearLeader(botConfig, distanceBetweenBotAndHero)){
            aiUtility.goNearRoutine(this.worldConfig.constants.DONTCARE, this.worldConfig.closeProximity, botConfig, gameRoom, heroConfig);
        } else if(hostileConfig != null && distanceBetweenBotAndHostile <= botConfig.sight){
            aiUtility.goNearRoutine(this.worldConfig.constants.VISIBLE, botConfig.range, botConfig, gameRoom, hostileConfig);
            
        }
        // march routine end.

        if(botConfig.action == 'goto') {
            return timeSlice;
        } else if(botConfig.action == 'march') {
            timeSlice = actionManager.Bot.continuePerformingAction(botConfig, gameRoom, timeSlice);
            return timeSlice;
        }
        // consume entire timeSlice doing nothing.
        // console.log('do nothing for bot:', botConfig.id);
        
        botConfig.activityTimeStamp = workerState.currentTime;
        return 0;
    },

    isBotNearBase: function(botConfig, gameRoom){
        // calculate distance from base
        var distanceFromBase = 0;
        var baseObject = null;
        if(botConfig.team == 1){
            baseObject = gameRoom.buildingArray_1[0];
        }else{
            baseObject = gameRoom.buildingArray_2[0];
        }

        distanceFromBase = routeManager.getDistanceBetweenPoints(
            botConfig.position[0],
            botConfig.position[2],
            baseObject.position[0],
            baseObject.position[2]
        );

        if(distanceFromBase <= this.worldConfig.baseNeighbourhoodDistance){
            return true;
        } else {
            return false;
        }
    }

}