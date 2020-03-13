const workerState = require('../../state/workerstate');
const routeManager = require('../../route/routemanager');

module.exports = {

    worldConfig: null,
    itemConfig: null,

    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
    },

    processAI: function(playerConfig, index, gameRoom){
        // console.log('processAI:' + botConfig.id);

        if(canAttack){
            if(hostileInRange){
                bot.action = fight
                canAttack + attack as many times possible.  add remainitng time to bot residue
                update time slice to zero.
                return time slice
            }else{
                bot.action = ready
                update time slice to zero.
                return time slice
            }
        }else{
            if(isHero){
                // var suitableEnemy = routeManager.findClosestPlayerOrTowerOrBase(botConfig, gameRoom);
                // find closest bot with action = fight
            }else{
    
            }
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