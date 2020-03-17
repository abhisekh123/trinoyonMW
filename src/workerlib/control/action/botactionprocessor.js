
const workerState = require('../../state/workerstate');
const aiUtility = require('../ai/aiutility');

module.exports = {
    // baseMap: {}
    worldConfig: null,
    itemConfig: null,
    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
    },

    traverseBotThroughPath: function(botConfig, timeSlice){
        // ignore i = 0 as it is the starting position.
        let pathPosition = null;
        for (let i = 1; i < botConfig.actionData.length; i++) { 
            pathPosition = botConfig.actionData[i];
            if(pathPosition[2]>workerState.currentTime){
                pathPosition = botConfig.actionData[i - 1];
                botConfig.position[0] = pathPosition[0];
                botConfig.position[2] = pathPosition[1];
                botConfig.activityTimeStamp = pathPosition[2];
                return 0;
            }
        }
        pathPosition = botConfig.actionData[botConfig.actionData.length - 1];
        botConfig.action = 'ready';
        botConfig.position[0] = pathPosition[0];
        botConfig.position[2] = pathPosition[1];
        botConfig.activityTimeStamp = pathPosition[2];

        timeSlice = workerState.currentTime - pathPosition[2];

        return timeSlice;
    },

    
    continuePerformingAction: function(botConfig, gameRoom, timeSlice){
        switch(botConfig.action){
            case 'goto':
            // else continue transport
            timeSlice = this.traverseBotThroughPath(botConfig, timeSlice);
            break;
            case 'march':
            // check if hostile in range
            if(aiUtility.canAttack(botConfig)){ // if can attack
                var hostileConfig = aiUtility.findClosestHostileInRange(botConfig, gameRoom, botConfig.range);
                if(hostileConfig != null){ // if a hostile is found in range
                    botConfig.action = 'fight';
                    botConfig.actionData = hostileConfig;
                    aiUtility.processAttackDamageEvent(botConfig, hostileConfig);
                    return 0; // consumed all remaining time to attack. Done for the current iteration.
                }
            }
            timeSlice = this.traverseBotThroughPath(botConfig, timeSlice);
            // action = ready
            // else continue transport
            break;
            default:
            console.log('unknown botConfig.action:', botConfig.action);
            return 0;
        }
        return timeSlice;
    },

    updateLifeWithBotAttackDamage(characterConfig){
        // currentBot.instruction.type = 'attack';
        // currentBot.instruction.rotation = instructionPayload.botRotation;
        // characterConfig.engagedEnemyType = suitableEnemy.chosenTargetType;
        // characterConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;
        var enemyConfig = null;
        var attackDamage = characterConfig.attack;
        // // console.log('characterConfig.engagedEnemyType:', characterConfig.engagedEnemyType);
        // // console.log(characterConfig);
        switch(characterConfig.engagedEnemyType){
            case 'bot':
            enemyConfig = workerstate.botMap[characterConfig.engagedEnemyTarget];
            break;
            case 'static':
            enemyConfig = workerstate.buildingMap[characterConfig.engagedEnemyTarget];
            break;
            default:
            // console.log('ERROR: unknown enemy type:' + characterConfig.engagedEnemyType);
            return;
            // break;
        }
        // console.log('/////////////enemy life:', enemyConfig.life, ' enemyConfig.id:', enemyConfig.id);
        // // console.log(enemyConfig);
        enemyConfig.life -= attackDamage;
        // if(characterConfig.engagedEnemyType == 'static'){
        //     if(enemyConfig.life <= 0){
        //         ,,,,
        //     }
        // }else{

        // }
        // console.log('enemy life after attack:', enemyConfig.life);
    },
    
}
