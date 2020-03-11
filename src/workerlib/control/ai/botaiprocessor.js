

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


    isBotAwayFromLeader(characterConfig){
        // // console.log('isBotAwayFromLeader::', characterConfig);
        if(!characterConfig.isLeader){
            var playerConfig = playerManager.playerArrey[characterConfig.playerID - 1];
            // // console.log('player config:', playerConfig);
            var leaderConfig = workerstate.botMap[playerConfig.leaderBotID];
            if(leaderConfig == null || leaderConfig == undefined){
                return null;
            }
            // // console.log('plaleaderConfigyer config:', leaderConfig);
            var currentPositionX = characterConfig.payload.position[0];
            var currentPositionZ = characterConfig.payload.position[2];
            var leaderPositionX = leaderConfig.payload.position[0]; 
            var leaderPositionZ = leaderConfig.payload.position[2];

            if(Math.abs(currentPositionX - leaderPositionX) > workerstate.getWorldConfig().maxDistanceFromLeader || 
                    Math.abs(currentPositionZ - leaderPositionZ) > workerstate.getWorldConfig().maxDistanceFromLeader){
                // console.log('bot away from leader.');
                return leaderConfig;
            }else{
                return null;
            }
        }else{
            return null;
        }
    },

    planBotRoute: function(currentBot, path){ // each path element : [posX, posZ, time to travel, rotation]
        if(path.length < 1){
            // console.log('ERROR:Path smaller than 1');
        }
        // var currentTime = math_util.getCurrentTime();
        // // console.log('plan bot route at time:' + currentTime);
        var currentPositionX = currentBot.payload.position[0];
        var currentPositionZ = currentBot.payload.position[2];
        currentPositionX = path[0][0];
        currentPositionZ = path[0][1];
        currentBot.payload.position[0] = currentPositionX;
        currentBot.payload.position[2] = currentPositionZ;
        //process app path
        var timeToTravel = 0;
        // path[0].push(this.setBotPathData(path[0], path[0], currentBot));
        path[0].push(0);
        for(var i = 0; i < path.length - 1; ++i){
            var timeDelta = this.setBotPathData(path[i], path[i + 1], currentBot);
            timeToTravel += (timeDelta * 1000);//convert to milliseconds.
            path[i + 1].push(timeToTravel);
        }
        // path[path.length - 1][3] = path[path.length - 2][3]
        if(path.length > 1){//last and second last segment will have same rotation.
            path[path.length - 1][3] = path[path.length - 2][3];
        }
        currentBot.botRoute = path;
        currentBot.botRouteIndex = 0;
        // // console.log('done planning path with ' + path.length + ' steps with estimated completion time of ' + timeToTravel + ' milliseconds.');
    },


    setBotPathData: function(startPoint, endPoint, currentBot){
        // var returnObject = {
        //     currentTimeDelta = 0,

        // }
        if(startPoint[0] < endPoint[0]){
            if(startPoint[1] > endPoint[1]){
                // return 'nw';
                startPoint.push(workerstate.getWorldConfig().const.rotation['nw']);
                // return Math.round((1.5 * currentBot.strideTime)/currentBot.strideDistance);
                return ((1.5 * currentBot.strideTime)/currentBot.strideDistance);
            }else if(startPoint[1] == endPoint[1]){
                // return 'w';
                startPoint.push(workerstate.getWorldConfig().const.rotation['w']);
                return ((1 * currentBot.strideTime)/currentBot.strideDistance);
            }else if(startPoint[1] < endPoint[1]){
                // return 'sw';
                startPoint.push(workerstate.getWorldConfig().const.rotation['sw']);
                return ((1.5 * currentBot.strideTime)/currentBot.strideDistance);
            }
        }else if(startPoint[0] == endPoint[0]){
            if(startPoint[1] > endPoint[1]){
                // return 'n';
                startPoint.push(workerstate.getWorldConfig().const.rotation['n']);
                return ((1 * currentBot.strideTime)/currentBot.strideDistance);
            }else if(startPoint[1] == endPoint[1]){
                // nothing to do.
                // return 'o';
                startPoint.push(null);
                return 0;
            }else if(startPoint[1] < endPoint[1]){
                // return 's';
                startPoint.push(workerstate.getWorldConfig().const.rotation['s']);
                return ((1 * currentBot.strideTime)/currentBot.strideDistance);
            }
        }else if(startPoint[0] > endPoint[0]){
            if(startPoint[1] > endPoint[1]){
                // return 'ne';
                startPoint.push(workerstate.getWorldConfig().const.rotation['ne']);
                return ((1.5 * currentBot.strideTime)/currentBot.strideDistance);
            }else if(startPoint[1] == endPoint[1]){
                // return 'e';
                startPoint.push(workerstate.getWorldConfig().const.rotation['e']);
                return ((1 * currentBot.strideTime)/currentBot.strideDistance);
            }else if(startPoint[1] < endPoint[1]){
                // return 'se';
                startPoint.push(workerstate.getWorldConfig().const.rotation['se']);
                return ((1.5 * currentBot.strideTime)/currentBot.strideDistance);
            }
        }
    },
    

    init: function(){
        
    },
}