

module.exports = {
    botArray: [],
    botMap: {},
    buildingMap: {},
    buildingArray: [],
    // baseMap: {}



    getSuitableOtherTeamBotTarget: function(botConfigParam){
        // console.log('getSuitableOtherTeamBotTarget for:' + botConfigParam.id 
            // + ' at position:' + botConfigParam.payload.position
            // + ' team:' + botConfigParam.team
            // + ' playerID:' + botConfigParam.playerID);
        // // console.log(botConfigParam);
        var x = botConfigParam.payload.position[0];
        var z = botConfigParam.payload.position[2];
        const range = botConfigParam.range;
        const teamIDParam = botConfigParam.team;
        let minDist = world_config.gridSide + 1;
        // let selectedvisibilityMatrixObject = null;
        let chosenEnemyID = null;
        let pathToEnemy = null;
        let botRotation = null;
        let chosenTargetType = null;
        // this.visibilityMatrix[x][z] = {
        //     visibility : neighbourhoodVisibilityGrid,
        //     localPath : neighbourPathGrid,
        //     id : null,
        // };
        var visibilityMatrixAtLocation = this.visibilityMatrix[x][z];
        var buildingID = null;
        for (let i = x - range; i <= x + range; i++) {
            for (let j = z - range; j <= z + range; j++) {
                if(!this.isPointInGrid(i, j) || (i == x && j == z)){
                    continue;
                }
                // // console.log('testing for bot:' + this.visibilityMatrix[i][j].id + ' at x:' + i + ' z:' + j);
                if(this.visibilityMatrix[i][j].id != null){ // if grid position occupied
                    // // console.log('testing for bot:' + this.visibilityMatrix[i][j].id + ' at x:' + i + ' z:' + j);
                    const botConfig = workerstate.botMap[this.visibilityMatrix[i][j].id];
                    if(botConfig.team != teamIDParam && botConfig.isActive){
                        // // console.log('------...........>>>>>>>>>if');
                        // var botX = botConfig.payload.position[0];
                        // var botZ = botConfig.payload.position[2];
                        var tX = i - x + this.maxRange;
                        var tZ = j - z + this.maxRange;
                        // var path = visibilityMatrixAtLocation.localPath[tX][tZ];
                        var path = this.findPath(x, z, i, j);
                        // console.log('got path:', path);
                        if(minDist > path.length){
                            // selectedvisibilityMatrixObject = distMatrixObject;
                            minDist = path.length;
                            chosenEnemyID = this.visibilityMatrix[i][j].id;
                            pathToEnemy = path;
                            rotation = this.distanceMatrix[tX][tZ].anglePositiveZAxis;
                            chosenTargetType = 'bot'
                        }
                    }
                }else{
                    buildingID = this.isObstacleDefenseOrBase(i, j, teamIDParam);
                    if(buildingID === null || buildingID === undefined){
                        // // console.log('skipping as buildingID === null || buildingID === undefined');
                    }else{
                        // console.log('testing for is buildingID: at x:' + i + ' z:' + j + ' buildingID:', buildingID);
                        const buildingConfig = workerstate.buildingMap[buildingID];
                        // // console.log('=============>buildingConfig:', buildingConfig);
                        if(!buildingConfig.isActive || buildingConfig.life <= 0){
                            // return null;
                            // skip inactive buildings
                            // console.log('skipping inactive building:', buildingID);
                        }else{
                            // // console.log('%%%%%%%%%%%%returned building id:', buildingID);
                            if(buildingID != null){
                                // // console.log('buildingID=', buildingID);
                                var tX = i - x + this.maxRange;
                                var tZ = j - z + this.maxRange;
                                // var path = visibilityMatrixAtLocation.localPath[tX][tZ];
                                var path = this.findPath(x, z, i, j);
                                // console.log('got path:', path);
                                if(minDist > path.length){
                                    // selectedvisibilityMatrixObject = distMatrixObject;
                                    minDist = path.length;
                                    chosenEnemyID = buildingID;
                                    pathToEnemy = path;
                                    rotation = this.distanceMatrix[tX][tZ].anglePositiveZAxis;
                                    chosenTargetType = 'static'
                                }
                            }
                        }
                    }
                }
            }
        }
        // // console.log('returning chosen opponent.');
        if(chosenEnemyID != null){
            // console.log(11111111111);
            // // console.log('getSuitableOtherTeamBotTarget returning:', {
            //     chosenEnemyID,
            //     pathToEnemy,
            //     botRotation,
            //     chosenTargetType
            // });
            var returnvar = {};
            // // console.log(returnvar);
            returnvar.chosenEnemyID = chosenEnemyID;
            // // console.log(returnvar);
            returnvar.pathToEnemy = pathToEnemy;
            // // console.log(returnvar);
            returnvar.botRotation = botRotation;
            // // console.log(returnvar);
            returnvar.chosenTargetType = chosenTargetType;
            // console.log(returnvar);
            return returnvar;
        }else{
            // console.log(2);
            // // console.log('getSuitableOtherTeamBotTarget returning null');
            return null;
        }
        
    },

    
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