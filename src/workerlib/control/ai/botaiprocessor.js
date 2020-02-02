

module.exports = {
    botArray: [],
    botMap: {},
    buildingMap: {},
    buildingArray: [],
    // baseMap: {}


    requestAIToInstructBot: function(characterConfig){
        
        // var characterConfig = workerstate.botArray[botID];
        // console.log('requestAIToInstructBot:' + characterConfig.id);
        var botType = characterConfig.type;
        // var botItemConfig = workerstate.getItemConfig().characters[botType];
        // var playerConfig = playerManager.playerArrey[characterConfig.team];

        // if(characterConfig.isLeader){
        //     playerConfig.leaderBotID = characterConfig.id;
        // }else{
        //     playerConfig.botIDList.push(characterConfig.id);
        // }

        var suitableEnemy = bot_route_utility.getSuitableOtherTeamBotTarget(characterConfig);
        // // console.log('((((((((((((suitableEnemy:', suitableEnemy.id);
        var leaderConfig = null;
        // {
        //     chosenEnemyID,
        //     pathToEnemy,
        //      botRotation
        //      chosenTargetType
        // };
        if(suitableEnemy != null ){// if engaged to enemy
            // console.log('SuitableEnemy:', suitableEnemy.chosenEnemyID);
            characterConfig.engagedEnemyType = suitableEnemy.chosenTargetType;
            characterConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;
            // switch (suitableEnemy.chosenTargetType) {
            //     case 'bot':
            //         characterConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;        
            //         break;
            //     case 'static':
            //         characterConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;
            //         break;
            //     default:
            //         break;
            // }
            
            if(suitableEnemy.pathToEnemy.length < (characterConfig.range + 1)){ // if enemy in range
                // engage enemy
                // instruct bot to attack
                // // console.log('2');
                this.instructBot(characterConfig, 'attack', {botRotation: suitableEnemy.botRotation});
            }else{
                // bit.engagedTargetID = null
                // // console.log('instruct bot goto:');
                this.instructBot(characterConfig, 'goto', 
                {
                    // botRotation: suitableEnemy.botRotation,
                    pathToEnemy: suitableEnemy.pathToEnemy,
                });
            }
        }else{
            leaderConfig = this.isBotAwayFromLeader(characterConfig);
            // console.log('leaderConfig:', leaderConfig);
            if( leaderConfig != null){
                // // console.log('this is leader config:', leaderConfig);
                var path = botroutemanager.findPath(
                    characterConfig.payload.position[0], 
                    characterConfig.payload.position[2], 
                    leaderConfig.payload.position[0], 
                    leaderConfig.payload.position[2]);
                // // console.log('2');
                this.planBotRoute(characterConfig, path);
                this.instructBot(characterConfig, 'goto', 
                    {
                        // botRotation: suitableEnemy.botRotation,
                        pathToEnemy: path,
                    });
            
            }else{
                // // console.log('3');
                this.instructBot(characterConfig, 'idle', null);
            }
        }
        
        // action = goto; instruction = null
        // if hostile visible, engage hostile
        // instruction = engage, action = null
        // if away from commander, goto commander
        // action = goto.
    },


    init: function(){
        
    },
}