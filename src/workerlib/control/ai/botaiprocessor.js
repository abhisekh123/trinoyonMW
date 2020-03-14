

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
        

        if(botIndex == 0){
            // if(find closest bot with action = fight)
            hostileConfig = aiUtility.findClosestHostileAttackedByTeamMate(botIndex, playerConfig);
            // find in range visible point to bot.actiondata and march to the point

        }else{
            if find closest bot with action = fight
                // find in range visible point to bot.actiondata and march to the point
            else if away from isHero
                get nearest neighbour and march to point.
        }

        

        
        // // console.log('((((((((((((suitableEnemy:', suitableEnemy.id);
        
        if(suitableEnemy != null ){// if engaged to enemy
            
            botConfig.engagedEnemyType = suitableEnemy.chosenTargetType;
            botConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;
            // switch (suitableEnemy.chosenTargetType) {
            //     case 'bot':
            //         botConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;        
            //         break;
            //     case 'static':
            //         botConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;
            //         break;
            //     default:
            //         break;
            // }
            
            if(suitableEnemy.pathToEnemy.length < (botConfig.range + 1)){ // if enemy in range
                // engage enemy
                // instruct bot to attack
                // // console.log('2');
                this.instructBot(botConfig, 'attack', {botRotation: suitableEnemy.botRotation});
            }else{
                // bit.engagedTargetID = null
                // // console.log('instruct bot goto:');
                this.instructBot(botConfig, 'goto', 
                {
                    // botRotation: suitableEnemy.botRotation,
                    pathToEnemy: suitableEnemy.pathToEnemy,
                });
            }
        }else{
            leaderConfig = this.isBotAwayFromLeader(botConfig);
            // console.log('leaderConfig:', leaderConfig);
            if( leaderConfig != null){
                // // console.log('this is leader config:', leaderConfig);
                var path = routeManager.findPath(
                    botConfig.payload.position[0], 
                    botConfig.payload.position[2], 
                    leaderConfig.payload.position[0], 
                    leaderConfig.payload.position[2]);
                // // console.log('2');
                this.planBotRoute(botConfig, path);
                this.instructBot(botConfig, 'goto', 
                    {
                        // botRotation: suitableEnemy.botRotation,
                        pathToEnemy: path,
                    });
            
            }else{
                // // console.log('3');
                this.instructBot(botConfig, 'idle', null);
            }
        }
        
        // action = goto; instruction = null
        // if hostile visible, engage hostile
        // instruction = engage, action = null
        // if away from commander, goto commander
        // action = goto.
    },

}