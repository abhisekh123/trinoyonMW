module.exports = {
    botArray: [],
    botMap: {},
    buildingMap: {},
    buildingArray: [],
    // baseMap: {}
    workerRegister: {},
    grid: null,
    gridBackup: null,
    finder: null,
    mapPrecalculatedDataGrid: null,
    botPositionArray: new Array(), // bot id vs bot position.
    finder: null,
    tempGrid: null, // contains 53 x 53 grid that will be used for generating visibility map.
    visibilityMatrix: null, // grid floor meta data : bot ID + visibility matrix (per grid position)
    distanceMatrix: null,
    maxRange: 26,
    neighbourhoodBoxSide: 53,
    maxBotCount: 100,
    createFreshVisibility: true,

    restoreGrid: function () {
        this.grid = this.gridBackup.clone();
    },

    findDIstanceBetweenTwoPoints(x1, z1, x2, z2) {
        return this.roundTo2Decimal(Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((z1 - z2), 2)));
    },


    isObstacleDefenseOrBase(x, z, teamIDParam) {
        // topBase:[44,6], // 2
        // bottomBase:[44,82], // 1
        // defenceBottom:[[48,79],[40,79],[44,71],[19,73],[72,69]], // 1
        // defenceTop:[[44,17],[40,9],[48,9],[16,19],[69,15]], // 2

        if (this.grid.isWalkableAt(x, z)) {
            return null;
        }
        // // console.log('teamIDParam:', teamIDParam);
        if (teamIDParam == 1) {
            for (let i = 0; i < world_config.defenceTop.length; i++) {
                if (x === world_config.defenceTop[i][0] && z === world_config.defenceTop[i][1]) {
                    return world_config.defenceTop[i][2];
                }
            }
            // // console.log('world_config.topBase:', world_config.topBase);
            if (x === world_config.topBase[0] && z === world_config.topBase[1]) {
                return world_config.topBase[2];
            }
        } else {
            for (let i = 0; i < world_config.defenceBottom.length; i++) {
                if (x === world_config.defenceBottom[i][0] && z === world_config.defenceBottom[i][1]) {
                    // // console.log('returning:', )
                    return world_config.defenceBottom[i][2];
                }
            }
            // // console.log('world_config.bottomBase:', world_config.bottomBase);
            if (x === world_config.bottomBase[0] && z === world_config.bottomBase[1]) {
                return world_config.bottomBase[2];
            }
        }

        return null;
    },

    deActivateBot: function (botid) {
        var botConfig = this.tg.botConfig[botid];
        if (botConfig == undefined || botConfig == null) {
            // console.log('ERROR: Bot undefined. Skip termination process. Bot ID:' + botid);
            return;
        }
        var xPos = botConfigParam.position[0];
        var zPos = botConfigParam.position[2];
        // workerState.grid.setWalkableAt(xPos + this.tg.centreX, zPos + this.tg.centreX, true);
        this.tg.botConfig[botid] = null;
    },

    getNewPlayerColor() {
        // var color = this.selfColor;
        // var color = [1,1,1];
        // while(color == this.selfColor || color == this.botColor){
        //     // color = '#' + Math.floor(Math.random() * 16777215).toString(16);// random color
        //     color = [
        //         Math.floor(Math.random() * 100) / 100,
        //         Math.floor(Math.random() * 100) / 100,
        //         Math.floor(Math.random() * 100) / 100,
        //     ];
        // }
        // // console.log('tmp');
        // var tmp = Math.random();
        // // console.log(tmp);
        // tmp = Math.floor(tmp * 100) / 100;
        // // console.log(tmp);
        // tmp = Math.floor(Math.random() * 100) / 100;
        // // console.log(tmp);
        var color = [
            Math.floor(Math.random() * 100) / 100,
            Math.floor(Math.random() * 100) / 100,
            Math.floor(Math.random() * 100) / 100,
        ];
        // // console.log('generated color:' + color);
        return color;
    },

    updateBotPosition: function (id, x, z) {
        // return;
        var botIndex = 0;
        // // console.log('id23:' + id);
        var botConfig = workerstate.botMap[id];
        if (botConfig == null || botConfig == undefined) {
            botIndex = id;
            botConfig = workerstate.botArray[id];
        } else {
            botIndex = botConfig.botIndex;
        }
        if (this.botPositionArray[botIndex].x < 0 ||
            this.botPositionArray[botIndex].y < 0 ||
            this.botPositionArray[botIndex].z < 0) {
            this.botPositionArray[botIndex].x = 0;
            this.botPositionArray[botIndex].y = 0;
            this.botPositionArray[botIndex].z = 0;
            // // console.log('ERROR++++++++++++++++++++++@@@@@@@@@@updateBotPosition');
        } else {
            this.visibilityMatrix[this.botPositionArray[botIndex].x][this.botPositionArray[botIndex].z].id = null;
        }
        // update bot to position map
        this.botPositionArray[botIndex].x = x;
        this.botPositionArray[botIndex].z = z;
        // update grid map but marking grid with bot position.
        this.visibilityMatrix[x][z].id = botConfig.id;
    },

    isPointInRange: function (x, z, targetX, targetZ, range) {
        if (Math.abs(targetX - x) <= range && Math.abs(targetZ - z) <= range) {
            if (range <= this.neighbourhoodBoxSide) { // get distance from distanceMatrix
                var dist = this.distanceMatrix[Math.abs(targetX - x)][Math.abs(targetZ - z)].distance;
                if (dist <= range) {
                    return true;
                }
            } else {
                var dist = this.roundTo2Decimal(Math.sqrt(Math.pow((targetX - x), 2) + Math.pow((targetZ - z), 2)));
                if (dist <= range) {
                    return true;
                }
            }
        }
        return false;
    },


    findPath: function (currentPositionX, currentPositionZ, targetPositionX, targetPositionZ) {
        // console.log('findPath:' + currentPositionX + ',' + currentPositionZ + ' to '
        // + targetPositionX + ',' + targetPositionZ);
        // // console.log(currentPositionX);
        // // console.log(currentPositionZ);
        // // console.log(targetPositionX);
        // // console.log(targetPositionZ);
        var path = this.finder.findPath(
            Math.round((currentPositionX)) // + this.tg.centreX
            , Math.round((currentPositionZ)) // + this.tg.centreZ
            , Math.round((targetPositionX)) // + this.tg.centreX
            , Math.round((targetPositionZ)) // + this.tg.centreZ
            , this.grid);
        this.restoreGrid();
        // for(var i = 0; i < path.length; ++i){
        //     path[i][0] = (path[i][0] - this.tg.centreX);
        //     path[i][1] = (path[i][1] - this.tg.centreZ);
        // }
        return path;
    },



    admitNewBot: function (botConfigParam, botid) {
        var botConfig = this.tg.botConfig[botid];
        // // console.log('admitNewBot@bot route manager.');
        // // console.log(botConfigParam);
        if (botConfig != undefined && botConfig != null) {
            // console.log('Note@botroutemanger : Bot already present for the given ID. reassigning');
            // return;
        }

        var position = this.FindClosestWalkablePoint({
            x: botConfigParam.position[0],
            y: 0,
            z: botConfigParam.position[2]
        });
        if (position != null) {
            botConfigParam.position[0] = position.x;
            botConfigParam.position[2] = position.z;
        }

        var xPos = Math.floor(botConfigParam.position[0]);
        botConfigParam.position[0] = xPos;
        var zPos = Math.floor(botConfigParam.position[2]);
        botConfigParam.position[2] = zPos;
        // this.tg.grid.setWalkableAt(xPos, zPos, false);
        this.tg.botConfig[botid] = botConfigParam;
        bot_route_utility.updateBotPosition(botid, xPos, zPos);
        return position;
    },



    initializeWorldByPopulatingWithBots: function () {
        // // console.log('gameRoomAssetManager.playerArrey:', gameRoomAssetManager.playerArrey);
        for (let index = 0; index < workerstate.getWorldConfig().characters.length; index++) {
            const characterConfig = workerstate.getWorldConfig().characters[index];
            var botType = characterConfig.type;
            var botItemConfig = workerstate.getItemConfig().characters[botType];
            // // console.log('characterConfig.playerID:', characterConfig.playerID);
            var playerConfig = gameRoomAssetManager.playerArrey[characterConfig.playerID - 1];

            if (characterConfig.isLeader) {
                playerConfig.leaderBotID = characterConfig.id;
            } else {
                playerConfig.botIDList.push(characterConfig.id);
            }

            var botObject = {
                timeelapsedincurrentaction: 0,
                isActive: true,
                isAIDriven: false,
                id: characterConfig.id,
                isLeader: characterConfig.isLeader,
                shotfired: 0,
                botRouteIndex: 0,
                targetbotid: null,
                // currentweapon:botItemConfig.attachmentmesh[0],
                nextweapon: null,
                backupinstruction: null,
                // weaponinventory:botItemConfig.attachmentmesh,
                life: botItemConfig.life,
                attack: botItemConfig.attack,
                attackinterval: botItemConfig.attackinterval,
                spawnDuration: botItemConfig.spawnDuration,
                damageincurred: 0,
                speed: botItemConfig.speed,
                range: botItemConfig.range,
                engagedEnemyTarget: null,
                engagedEnemyType: null,
                type: 'bot',
                botType: botType,
                team: characterConfig.team,
                playerID: characterConfig.playerID,
                botIndex: index,
                instruction: {
                    type: 'idle'
                },
                // currentBot.instruction.type = 'idle',
                payload: {
                    teamColor: playerConfig.teamColor,
                    type: botType,
                    // team:characterConfig.team,
                    position: [
                        characterConfig.position.x,
                        characterConfig.position.y,
                        characterConfig.position.z
                    ],
                    rotation: 0,
                },
            };
            // // console.log('admitting new bot at initialization:', botObject.payload.position);
            workerstate.botArray[index] = botObject;
            workerstate.botMap[characterConfig.id] = botObject;
            this.admitNewBot(index);
        }
    },


    getSuitableEnemyTarget: function (objectConfig, gameRoom) {
        var enemyTeamID = 1;
        if (objectConfig.team == 0) {
            return; // neutral tower. nothing to do.
        } else if (objectConfig.team == 1) {
            enemyTeamID = 2;
        }
        // let minDist = world_config.gridSide + 1;
        // gameRoom.gridMatrix
    },

    getSuitableOtherTeamBotTarget_OLD: function (botConfig, gameRoom) {
        // console.log('getSuitableOtherTeamBotTarget for:' + botConfig.id 
        // + ' at position:' + botConfig.payload.position
        // + ' team:' + botConfig.team
        // + ' playerID:' + botConfig.playerID);
        // // console.log(botConfig);
        var x = botConfig.payload.position[0];
        var z = botConfig.payload.position[2];
        const range = botConfig.range;
        const teamIDParam = botConfig.team;

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
                if (!this.isPointInGrid(i, j) || (i == x && j == z)) {
                    continue;
                }
                // // console.log('testing for bot:' + this.visibilityMatrix[i][j].id + ' at x:' + i + ' z:' + j);
                if (this.visibilityMatrix[i][j].id != null) { // if grid position occupied
                    // // console.log('testing for bot:' + this.visibilityMatrix[i][j].id + ' at x:' + i + ' z:' + j);
                    const botConfig = workerstate.botMap[this.visibilityMatrix[i][j].id];
                    if (botConfig.team != teamIDParam && botConfig.isActive) {
                        // // console.log('------...........>>>>>>>>>if');
                        // var botX = botConfig.payload.position[0];
                        // var botZ = botConfig.payload.position[2];
                        var tX = i - x + this.maxRange;
                        var tZ = j - z + this.maxRange;
                        // var path = visibilityMatrixAtLocation.localPath[tX][tZ];
                        var path = this.findPath(x, z, i, j);
                        // console.log('got path:', path);
                        if (minDist > path.length) {
                            // selectedvisibilityMatrixObject = distMatrixObject;
                            minDist = path.length;
                            chosenEnemyID = this.visibilityMatrix[i][j].id;
                            pathToEnemy = path;
                            rotation = this.distanceMatrix[tX][tZ].anglePositiveZAxis;
                            chosenTargetType = 'bot'
                        }
                    }
                } else {
                    buildingID = this.isObstacleDefenseOrBase(i, j, teamIDParam);
                    if (buildingID === null || buildingID === undefined) {
                        // // console.log('skipping as buildingID === null || buildingID === undefined');
                    } else {
                        // console.log('testing for is buildingID: at x:' + i + ' z:' + j + ' buildingID:', buildingID);
                        const buildingConfig = workerstate.buildingMap[buildingID];
                        // // console.log('=============>buildingConfig:', buildingConfig);
                        if (!buildingConfig.isActive || buildingConfig.life <= 0) {
                            // return null;
                            // skip inactive buildings
                            // console.log('skipping inactive building:', buildingID);
                        } else {
                            // // console.log('%%%%%%%%%%%%returned building id:', buildingID);
                            if (buildingID != null) {
                                // // console.log('buildingID=', buildingID);
                                var tX = i - x + this.maxRange;
                                var tZ = j - z + this.maxRange;
                                // var path = visibilityMatrixAtLocation.localPath[tX][tZ];
                                var path = this.findPath(x, z, i, j);
                                // console.log('got path:', path);
                                if (minDist > path.length) {
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
        if (chosenEnemyID != null) {
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
        } else {
            // console.log(2);
            // // console.log('getSuitableOtherTeamBotTarget returning null');
            return null;
        }

    },



    giveInstruction: function(currentBot, instructionParam, instructionPayload){
        // console.log('instructBot->bot:', currentBot.id, ' instructionParam:', instructionParam
            // , ' instructionPayload:', instructionPayload);
        currentBot.timeelapsedincurrentaction = 0;
        switch(instructionParam){
            case 'idle':
            currentBot.instruction = {};
            currentBot.instruction.type = 'idle';
            currentBot.hasInstruction = true;
            currentBot.isPerformingAction = false;
            break;
            case 'attack':
            currentBot.instruction = {};
            currentBot.instruction.type = 'attack';
            currentBot.instruction.rotation = instructionPayload.botRotation;
            currentBot.hasInstruction = true;
            currentBot.isPerformingAction = false;
            break;
            case 'march':
            case 'goto':
            // {
            //     botRotation: suitableEnemy.botRotation,
            //     pathToEnemy: suitableEnemy.pathToEnemy,
            // }
            // var currentPositionX = currentBot.payload.position[0];
            // var currentPositionZ = currentBot.payload.position[2];
            // var closestWalkablePosition = botroutemanager.FindClosestWalkablePoint(currentBot.instruction);
            // // console.log('closest point found:', closestWalkablePosition);
            // var targetPositionX = closestWalkablePosition.x;
            // var targetPositionZ = closestWalkablePosition.z;

            // var path = botroutemanager.findPath(currentPositionX, currentPositionZ, targetPositionX, targetPositionZ);
            var path = instructionPayload;
            // // console.log('goto path:', instructionPayload.pathToEnemy);
            currentBot.instruction = {};
            currentBot.instruction.type = instructionParam;
            // // console.log('312');
            this.planBotRoute(currentBot, path);
            currentBot.isPerformingAction = true;
            // // console.log(path);
            // // console.log(currentBot);
            currentBot.hasInstruction = false;
            // currentBot.instruction = null;
            // botroutemanager.updateBotPosition(botID, targetPositionX, targetPositionZ);
            break;
            case 'die':
            currentBot.isPerformingAction = true;
            // // console.log('perform action:die:::', currentBot.id);
            currentBot.hasInstruction = false;
            currentBot.instruction = {};
            currentBot.instruction.type = 'die';
            break;
            default:
                // console.log('ERROR: unknown instruction:' + instructionParam);
        }

    },


    updateBotAction: function(action){
        // // console.log('update bot action');
        // // console.log(action);
        // if(action.message.target == 'ground'){
        //     // console.log('got action request for ground. skipping.');
        //     return;
        // }
        // // console.log('---');
        var botID = action.message.id;
        var botItem = workerstate.botMap[botID];
        // // console.log('current bot:');
        // // console.log(this.botArray);
        // // console.log(botID);
        // // console.log(workerstate.botMap[botID]);
        var payload = action.message;
        switch(payload.type){
            case 'changeweapon':
            case 'goto':
                botItem.instruction = payload;
                botItem.hasInstruction = true;
                break;
        }
        // // console.log('botItem:');
        // // console.log(botItem);
    },

    // actionManager.Bot.processInstruction(botConfig, gameRoom);
    processInstruction: function(botID){
        var currentBot = workerstate.botArray[botID];
        // console.log('process bot instruction for botID:' + botID + ' currentBot.instruction.type:' + currentBot.instruction.type);
        // // console.log(currentBot);

        switch(currentBot.instruction.type){
            case 'goto':
                var currentPositionX = currentBot.payload.position[0];
                var currentPositionZ = currentBot.payload.position[2];
                var closestWalkablePosition = botroutemanager.FindClosestWalkablePoint(currentBot.instruction);
                // // console.log('closest point found:', closestWalkablePosition);
                var targetPositionX = closestWalkablePosition.x;
                var targetPositionZ = closestWalkablePosition.z;

                var path = botroutemanager.findPath(currentPositionX, currentPositionZ, targetPositionX, targetPositionZ);
                // // console.log('1');
                this.planBotRoute(currentBot, path);
                currentBot.isPerformingAction = true;
                // // console.log(path);
                // // console.log(currentBot);
                currentBot.hasInstruction = false;
                // currentBot.instruction = null;
                // botroutemanager.updateBotPosition(botID, targetPositionX, targetPositionZ);
                break;
            case 'attack':
                // // console.log('process attack instruction.');
                currentBot.isPerformingAction = true;
                // // console.log(path);
                // // console.log(currentBot);
                currentBot.hasInstruction = false;
                break;
            case 'changeweapon':
                currentBot.backupinstruction = currentBot.instruction;
                currentBot.instruction = {};
                currentBot.instruction.type = 'holsterweapon';
                currentBot.nextweapon = currentBot.backupinstruction.nextweapon;
                // currentBot.nextweapon = currentBot.instruction.nextweapon;
                break;
            case 'idle':
                // currentBot.backupinstruction = currentBot.instruction;
                // currentBot.instruction = {};
                // currentBot.instruction.type = 'idle';
                // currentBot.nextweapon = currentBot.backupinstruction.nextweapon;
                currentBot.isPerformingAction = true;
                currentBot.hasInstruction = false;
                // currentBot.nextweapon = currentBot.instruction.nextweapon;
                break;
            default:
                // console.log('unknown action type:' + currentBot.instruction.type);
                break;
        }

        
    },
    
    clearSnaphsot: function(){
        this.snapshot.length = 0;
    },

    // populate current message with latest game snapshot. To be sent to newly admitted player.
    getGameConfig: function(gameId){
        currentMessage.bots = [];
        currentMessage.objects = [];
        currentMessage.playerConfig = {};
        for (let index = 0; index < workerstate.botArray.length; index++) {
            const element = workerstate.botArray[index];
            const botConfigEntry = {};
            botConfigEntry.x = element.payload.position[0];
            botConfigEntry.y = 0;
            botConfigEntry.z = element.payload.position[2];
            botConfigEntry.ry = element.payload.rotation;
            botConfigEntry.playerID = element.playerID;
            botConfigEntry.isLeader = element.isLeader;
            botConfigEntry.id = element.id;
            botConfigEntry.life = element.life;
            botConfigEntry.isActive = element.isActive;
            botConfigEntry.action = element.instruction.type;
            currentMessage.bots[index] = botConfigEntry;
        }
        for (let index = 0; index < workerstate.buildingArray.length; index++) {
            const element = workerstate.buildingArray[index];
            const buildingConfigEntry = {};
            buildingConfigEntry.life = element.life;
            buildingConfigEntry.team = element.team;
            buildingConfigEntry.isActive = element.isActive;
            buildingConfigEntry.id = element.id;
            currentMessage.objects[index] = buildingConfigEntry;
        }
        
        return currentMessage;
    },
    getSnapshot: function(){
        // return this.snapshot;
    },


    processAI: function(playerConfig, botIndex, gameRoom, timeSlice){

        const botConfig = playerConfig.botObjectList[botIndex];
        // console.log('processAI:' + botConfig.id);
        
        // botConfig.attack = botTypeItemConfig.attack;
        
        

        
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

    /**
     * game life cycle
     */

    reset: function(){
        this.playerMap = {};
        this.init();
    },


    getPlayerID: function(userId){
        return this.playerMap.get(userId);
    },


    // find point(x, y) closest to position such that (x, y) in in range of targetPosition.
    findClosestVisiblePointInRange: function(sourceConfig, targetConfig, range, gameRoom){
        var minDistance = this.worldConfig.gridSide + 1;
        var closestPosition = {
            x: 0,
            y: 0
        }
        var foundSuitablePosition = false;

        for(var i = -range; i < range; ++i){ // x-axis
            for(var j = -range; j < this.tg.grid.width; ++j){ // z-axis
                var actualPositionX = i + targetConfig.position[0];
                var actualPositionZ = j + targetConfig.position[2];
                var objectOccupyintThePosition = this.getObjectOccupyingThePosition(
                    actualPositionX,
                    actualPositionZ,
                    gameRoom
                );
                if(objectOccupyintThePosition != null){ // already some bot / building is occupying the position
                    continue;
                }

                var distanceBetweenTargetAndNewPosition = this.getDistanceBetweenPoints(
                    targetConfig.position[0], 
                    targetConfig.position[2], 
                    actualPointX, 
                    actualPointZ
                );
                if(distanceBetweenTargetAndNewPosition < range){
                    var visibility = customRoutingUtility.testVisibility(
                        targetConfig.position[0], 
                        targetConfig.position[2], 
                        actualPointX, 
                        actualPointZ
                    );
                    if(visibility == true){
                        var distanceBetweenSourceAndNewPosition = this.getDistanceBetweenPoints(
                            sourceConfig.position[0], 
                            sourceConfig.position[2], 
                            actualPointX, 
                            actualPointZ
                        );

                        if(distanceBetweenSourceAndNewPosition < minDistance){
                            minDistance = distanceBetweenSourceAndNewPosition;
                            closestPosition.x = actualPositionX;
                            closestPosition.z = actualPositionZ;
                        }
                    }
                }
                
            }
        }
        for(var side = 1; side < this.tg.grid.width; ++side){
            positionRunnerStart = {x:position.x - side, z:position.z - side};// left-bottom
            var j = 0;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(pathFindingWrapper.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(pathFindingWrapper.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && this.getObjectOccupyingThePosition(positionRunnerStart.x, positionRunnerStart.z, gameRoom) == null
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)
                    && customRoutingUtility.testVisibility(positionRunnerStart.x, positionRunnerStart.z, targetPosition.x, targetPosition.z)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.x = positionRunnerStart.x + 1;
            }

            positionRunnerStart.x = positionRunnerStart.x - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower right -> upper right
                
                if(pathFindingWrapper.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(pathFindingWrapper.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && this.getObjectOccupyingThePosition(positionRunnerStart.x, positionRunnerStart.z, gameRoom) == null
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)
                        && customRoutingUtility.testVisibility(positionRunnerStart.x, positionRunnerStart.z, targetPosition.x, targetPosition.z)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.z = positionRunnerStart.z + j;
            }

            positionRunnerStart.z = positionRunnerStart.z - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(pathFindingWrapper.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(pathFindingWrapper.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && this.getObjectOccupyingThePosition(positionRunnerStart.x, positionRunnerStart.z, gameRoom) == null
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)
                        && customRoutingUtility.testVisibility(positionRunnerStart.x, positionRunnerStart.z, targetPosition.x, targetPosition.z)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.x = positionRunnerStart.x - 1;
            }

            positionRunnerStart.x = positionRunnerStart.x + 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(pathFindingWrapper.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(pathFindingWrapper.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && this.getObjectOccupyingThePosition(positionRunnerStart.x, positionRunnerStart.z, gameRoom) == null
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)
                        && customRoutingUtility.testVisibility(positionRunnerStart.x, positionRunnerStart.z, targetPosition.x, targetPosition.z)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.z = positionRunnerStart.z - 1;
            }
        }
        console.error('ERROR: FindPathToClosestPointInNeighbourhood point not found for target position:', targetBotConfig.position);
        return null;// walkable point not found. This should never happen.
    },


    // returns a path from source to a walkable point (probably nearest) in the neighbourhood of target.
    findPathToClosestPointInNeighbourhood: function(botID, targetBotID){ // used for getting near friendly unit (wrt sight of target)
        var botConfig = this.tg.botConfig[botID];
        var targetBotConfig = this.tg.botConfig[targetBotID];
        var range = item_config.character[targetBotConfig.type].sight;

        var path = this.findPath(botConfig.position[0], botConfig.position[2]
            , targetBotConfig.position[0], targetBotConfig.position[2]);
        var pathIndex = 0;
        for(pathIndex = 0; pathIndex < path.length; ++pathIndex){ 
            // trace through path from source to destination to find first point in range.
            var pathPositionX = path[pathIndex][0];
            var pathPositionZ = path[pathIndex][1];
            if(bot_route_utility.isPointInRange(pathPositionX, pathPositionZ
                , targetBotConfig.position[0], targetBotConfig.position[2],range)){
                // got first point in path which is in range.
                break;
            }
        }
        if(pathIndex >= path.length){
            console.error('ERROR:pathIndex == path.length');
        }
        path.length = pathIndex + 1;// discard remaining path
        if(bot_route_utility.isPositionUnoccupiedByBot(path[pathIndex][0], path[pathIndex][1])){
            
            return path;
        }
        var finalPosition = findClosestPointNeighbourhood({x:botConfig.position[0], z:botConfig.position[2]}, 
            {x:targetBotConfig.position[0], z:targetBotConfig.position[2]}, range);
        if(finalPosition == null){
            console.error('ERROR:finalPosition == null');
            return path;
        }else{
            var pathRemaining = this.findPath(path[pathIndex][0], path[pathIndex][1]
                , finalPosition.x, finalPosition.z);
            return path.concat(pathRemaining);
        }
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
    

    findPathToNearestVisiblePointInRange: function(botID, targetBotID){ // used for engage
        var botConfig = this.tg.botConfig[botID];
        var targetBotConfig = this.tg.botConfig[targetBotID];
        var range = item_config.weapon[botConfig.equippedWeapon].range;

        var path = this.findPath(botConfig.position[0], botConfig.position[2]
            , targetBotConfig.position[0], targetBotConfig.position[2]);
        var pathIndex = 0;
        for(pathIndex = 0; pathIndex < path.length; ++pathIndex){ 
            // trace through path from source to destination to find first point in range.
            var pathPositionX = path[pathIndex][0];
            var pathPositionZ = path[pathIndex][1];
            if(bot_route_utility.isPointInRange(pathPositionX, pathPositionZ
                , targetBotConfig.position[0], targetBotConfig.position[2],range)){
                // got first point in path which is in range.
                break;
            }
        }
        if(pathIndex >= path.length){
            console.error('ERROR:pathIndex == path.length');
        }
        path.length = pathIndex + 1;// discard remaining path
        if(bot_route_utility.isPositionUnoccupiedByBot(path[pathIndex][0], path[pathIndex][1])){
            
            return path;
        }
        var finalPosition = findClosestPointNeighbourhood({x:botConfig.position[0], z:botConfig.position[2]}, 
            {x:targetBotConfig.position[0], z:targetBotConfig.position[2]}, range);
        if(finalPosition == null){
            console.error('ERROR:finalPosition == null');
            return path;
        }else{
            var pathRemaining = this.findPath(path[pathIndex][0], path[pathIndex][1]
                , finalPosition.x, finalPosition.z);
            return path.concat(pathRemaining);
        }
    },


    // find closest point which is not an obstacle and also not occupied by some other bot.
    findClosestWalkablePoint: function(position){ // position = [xpos, ypos, zpos]

        if(pathFindingWrapper.isWalkableAt(position[0], position[2]) 
        && this.getObjectOccupyingThePosition(position[0], position[2], gameRoom) == null){
            return position;
        }

        for(var side = 1; side < this.tg.grid.width; ++side){
            var positionRunnerStart = {x:position[0] - side, z:position[2] - side};// left-bottom
            var j = 0;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(pathFindingWrapper.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(pathFindingWrapper.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && this.getObjectOccupyingThePosition(positionRunnerStart.x, positionRunnerStart.z, gameRoom) == null){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.x = positionRunnerStart.x + 1;
            }

            positionRunnerStart.x = positionRunnerStart.x - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower right -> upper right
                
                if(pathFindingWrapper.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(pathFindingWrapper.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && this.getObjectOccupyingThePosition(positionRunnerStart.x, positionRunnerStart.z, gameRoom) == null){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.z = positionRunnerStart.z + j;
            }

            positionRunnerStart.z = positionRunnerStart.z - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(pathFindingWrapper.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(pathFindingWrapper.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && this.getObjectOccupyingThePosition(positionRunnerStart.x, positionRunnerStart.z, gameRoom) == null){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.x = positionRunnerStart.x - 1;
            }

            positionRunnerStart.x = positionRunnerStart.x + 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(pathFindingWrapper.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(pathFindingWrapper.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && this.getObjectOccupyingThePosition(positionRunnerStart.x, positionRunnerStart.z, gameRoom) == null){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.z = positionRunnerStart.z - 1;
            }
        }
        console.error('ERROR: Closest walkable point not found for position:', position);
        return null;// walkable point not found. This should never happen.
    },

}