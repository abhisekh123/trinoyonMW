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


    getSuitableEnemyTarget: function(objectConfig, gameRoom){
        var enemyTeamID = 1;
        if(objectConfig.team == 0){
            return; // neutral tower. nothing to do.
        }else if(objectConfig.team == 1){
            enemyTeamID = 2;
        }
        // let minDist = world_config.gridSide + 1;
        // gameRoom.gridMatrix
    },

    getSuitableOtherTeamBotTarget_OLD: function(botConfig, gameRoom){
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

}