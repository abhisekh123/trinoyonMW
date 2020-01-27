
//top level : implements worker logic

const world_config = require(__dirname + '/../../ui/world_config');
const item_config = require(__dirname + '/../../ui/item_config');
const math_util = require(__dirname + '/../utils/misc_util');
const botroutemanager = require(__dirname + '/botroutemanager');
const snapshotmanager = require(__dirname + '/snapshotmanager');
const mainThreadStub = require(__dirname + '/mainthreadstub');
const playerManager = require(__dirname + '/playerManager');
const bot_route_utility = require('./botRouteUtility');
const workerstate = require('./workerstate');
// const bot_route_utility = require('./botRouteUtility');

//bots always ave instruction: guard, follow, go

module.exports = {
    lastTick: 0,
    refreshWorldInterval: world_config.refreshWorldInterval, // refreshWorld() should run once every interval.
    processActionResolution: world_config.processActionResolution, // for each refreshWorld() delta time will be broken into interval of this.
    simulationTicks:6,
    lastRefreshTimeStamp:0,
    deltaTimeForRefresh:0,
    maxRange:null,
    latestSnapshot:{},
    isStateUpdated:false,
    isGameRunning: true,
    

    maxBotCount: 0,
    maxBotPerPlayer: 0,
    maxPlayerCount: 0,
    // botArray: [],
    // botMap: {},

    initialiseConstantCache: function(){
    },


    sendSnapshotUpdateToMain: function(){
        var responseJSONString = mainThreadStub.getResponseEmptyPacket('update', this.latestSnapshot);
        mainThreadStub.postMessage(responseJSONString, '');
    },

    continuePerformingAction: function(currentBot, timeSliceParam){
        // // console.log(currentBot);
        // console.log('performing action for bot:<' + currentBot.id + '> with actionIndex:' + currentBot.botRouteIndex 
            // + ' action:' + currentBot.instruction.type + ' currentBot.timeelapsedincurrentaction:'
            // + currentBot.timeelapsedincurrentaction);
        // adding correction by taking into account
        // the partially executed action in the last iteration.
        // // console.log('process action for bot:' + currentBot.id);
        // // console.log('time sliece:' + timeSliceParam);
        // // console.log('currentBot.timeelapsedincurrentaction:' + currentBot.timeelapsedincurrentaction);
        var justStartedFlag = false;
        if(currentBot.timeelapsedincurrentaction == 0){
            justStartedFlag = true;
        }

        timeSliceParam += currentBot.timeelapsedincurrentaction; 
        currentBot.timeelapsedincurrentaction = 0;
        // // console.log('continuePerformingAction for:', currentBot.id);
        // // console.log(currentBot);

        var currentWeapon = currentBot.currentweapon;
        // var weaponConfig = item_config.weapon[currentWeapon];
        var weaponConfig = item_config.weapon['handGun'];

        // if(currentBot.instruction == null)
        // {
        //     // console.log(currentBot.id + ' has null instruction.');
        //     // console.log(currentBot);
        //     return;
        // }else{
        //     // console.log(currentBot.id + ' has valid instruction.');
        // }

        switch(currentBot.instruction.type){
            case 'goto':
                var update = {};
                
                // var currentPositionX = currentBot.payload.position[0];
                // var currentPositionZ = currentBot.payload.position[2];
                // var targetPositionX = currentBot.instruction.x;
                // var targetPositionZ = currentBot.instruction.z;
                for(var i = currentBot.botRouteIndex; i < currentBot.botRoute.length; ++i){

                    if(currentBot.botRoute[i][2]>timeSliceParam){//check how much we have proceeded in goto action wrt current time.
                        currentBot.timeelapsedincurrentaction = timeSliceParam;
                        timeSliceParam = 0;
                        break;
                    }
                    // timeSliceParam -= currentBot.botRoute[i][2];
                    currentBot.botRouteIndex = i;
                }
                currentBot.payload.position[0] = currentBot.botRoute[currentBot.botRouteIndex][0];
                currentBot.payload.position[2] = currentBot.botRoute[currentBot.botRouteIndex][1];
                currentBot.payload.rotation = currentBot.botRoute[currentBot.botRouteIndex][3];

                // update latest snapshot.
                update.x = currentBot.payload.position[0];
                update.z = currentBot.payload.position[2];
                update.rot = currentBot.payload.rotation;
                // console.log('updateBotPosition: botid:', currentBot.id, ' position:', currentBot.payload.position);
                bot_route_utility.updateBotPosition(currentBot.id, currentBot.payload.position[0], currentBot.payload.position[2]);
                // botroutemanager.updateBotPosition(currentBot.id, currentBot.payload.position[0], currentBot.payload.position[2]);

                if(currentBot.botRouteIndex >= currentBot.botRoute.length - 1){
                    // // console.log('done with current action. switching to idle mode.');
                    // // console.log(currentBot);
                    currentBot.botRoute = null;
                    currentBot.botRouteIndex = 0;
                    currentBot.isPerformingAction = false;
                    currentBot.timeelapsedincurrentaction = 0;

                    // update client to transition animation to idle
                    update.action = 'idle';
                }else{
                    update.action = currentBot.instruction.type;
                }
                
                this.latestSnapshot[currentBot.id] = update;
                this.isStateUpdated = true;

                // // console.log('exiting with reout index:' + currentBot.botRouteIndex);
                // // console.log('time sliece - currentBot.timeelapsedincurrentaction:' + currentBot.timeelapsedincurrentaction);
                return timeSliceParam;
            case 'idle': // spend the time slice doing nothing.
                // var update = {};
                // update.x = currentBot.payload.position[0];
                // update.z = currentBot.payload.position[2];
                // update.rot = currentBot.payload.rotation;
                // update.action = 'idle';
                // this.latestSnapshot[currentBot.id] = update;
                // this.isStateUpdated = true;

                currentBot.isPerformingAction = false;
                currentBot.hasInstruction = false;
                return 0; // consume entire time slice.
            case 'die':
                // console.log(this.lastLoopExecutionTimeStamp, ' death of:', currentBot.id);
                // currentBot.instruction.type = 'attack';
                // currentBot.instruction.rotation = instructionPayload.botRotation;
                // characterConfig.engagedEnemyType = suitableEnemy.chosenTargetType;
                // characterConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;
    

                // currentBot.payload.rotation = currentBot.instruction.rotation
                currentBot.timeelapsedincurrentaction = 0;
                currentBot.isActive = false;
                timeSliceParam = 0;
                currentBot.botRoute = null;
                currentBot.botRouteIndex = 0;
                currentBot.isPerformingAction = false;
                currentBot.hasInstruction = false;
                currentBot.timeelapsedincurrentaction = 0;

                

                // if(currentBot.type == 'base'){
                //     this.terminateGame(currentBot);
                // }else{
                    
                // }
                var update = {};
                update.action = currentBot.instruction.type;
                update.botType = currentBot.type;
                update.x = currentBot.payload.position[0];
                update.z = currentBot.payload.position[2];
                this.latestSnapshot[currentBot.id] = update;
                this.isStateUpdated = true;
                this.respawnIfNeeded(currentBot);
                // // console.log('exiting with reout index:' + currentBot.botRouteIndex);
                // // console.log('time sliece - currentBot.timeelapsedincurrentaction:' + currentBot.timeelapsedincurrentaction);
                return timeSliceParam;
            case 'spawn': // birth
                
                // currentBot.instruction.type = 'attack';
                // currentBot.instruction.rotation = instructionPayload.botRotation;
                // characterConfig.engagedEnemyType = suitableEnemy.chosenTargetType;
                // characterConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;
    

                // currentBot.payload.rotation = currentBot.instruction.rotation
                currentBot.timeelapsedincurrentaction = 0;
                // currentBot.isActive = true;
                timeSliceParam = 0;
                currentBot.botRoute = null;
                currentBot.botRouteIndex = 0;
                currentBot.isPerformingAction = false;
                currentBot.hasInstruction = false;
                currentBot.timeelapsedincurrentaction = 0;
                // update.action = 'spawn';
                // console.log(this.lastLoopExecutionTimeStamp, ' rebirth of:', currentBot.id , ' at position:', currentBot.payload.position);
                var update = {};
                update.action = currentBot.instruction.type;
                update.botType = currentBot.type;
                update.x = currentBot.payload.position[0];
                update.z = currentBot.payload.position[2];
                this.latestSnapshot[currentBot.id] = update;
                this.isStateUpdated = true;
                // // console.log('exiting with reout index:' + currentBot.botRouteIndex);
                // // console.log('time sliece - currentBot.timeelapsedincurrentaction:' + currentBot.timeelapsedincurrentaction);
                return timeSliceParam;
            case 'attack': // attack
            // currentBot.instruction.type = 'attack';
            // currentBot.instruction.rotation = instructionPayload.botRotation;
            // characterConfig.engagedEnemyType = suitableEnemy.chosenTargetType;
            // characterConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;

                // console.log('bot:' + currentBot.id + ' attack:' + currentBot.engagedEnemyTarget
                    // + ' enemy type:' + currentBot.engagedEnemyType);
                currentBot.payload.rotation = currentBot.instruction.rotation
                currentBot.timeelapsedincurrentaction = timeSliceParam;

                var update = {};

                if(currentBot.timeelapsedincurrentaction >= currentBot.attackinterval){
                    timeSliceParam = currentBot.timeelapsedincurrentaction - currentBot.attackinterval;
                    currentBot.botRoute = null;
                    currentBot.botRouteIndex = 0;
                    currentBot.isPerformingAction = false;
                    currentBot.hasInstruction = false;
                    currentBot.timeelapsedincurrentaction = 0;
                    update.action = 'idle';
                    update.x = currentBot.payload.position[0];
                    update.z = currentBot.payload.position[2];
                    update.rot = currentBot.payload.rotation;
                    this.latestSnapshot[currentBot.id] = update;
                    this.isStateUpdated = true;
                }else{
                    update.action = currentBot.instruction.type;
                    timeSliceParam = 0;
                    if(justStartedFlag){
                        // update latest snapshot.
                        update.action = currentBot.instruction.type;
                        update.x = currentBot.payload.position[0];
                        update.z = currentBot.payload.position[2];
                        update.rot = currentBot.payload.rotation;
                        this.latestSnapshot[currentBot.id] = update;
                        this.isStateUpdated = true;
                        this.updateLifeWithBotAttackDamage(currentBot);
                    }
                }
                // // console.log('exiting with reout index:' + currentBot.botRouteIndex);
                // // console.log('time sliece - currentBot.timeelapsedincurrentaction:' + currentBot.timeelapsedincurrentaction);
                return timeSliceParam;
            case 'reload':
                if(weaponConfig.reloadinterval > timeSliceParam){
                    currentBot.timeelapsedincurrentaction = timeSliceParam;
                    timeSliceParam = 0;
                }else{
                    timeSliceParam -= weaponConfig.reloadinterval;
                    currentBot.shotfired = 0;
                    if(currentBot.shotfired > weaponConfig.ammocapacity){
                        update.action = 'attack';
                        currentBot.instruction.type = 'attack';
                        break;
                    }
                }
                return timeSliceParam;
            case 'holsterweapon':
                //nextweapon weaponConfig
                
                // totalTime
                if(weaponConfig.holsterinterval > timeSliceParam){
                    currentBot.timeelapsedincurrentaction = timeSliceParam;
                    timeSliceParam = 0;
                }else{
                    timeSliceParam -= weaponConfig.holsterinterval;
                    update.action = 'equipweapon';
                    currentBot.instruction.type = 'equipweapon';
                }
                return timeSliceParam;
            case 'equipweapon':
                var nextWeaponConfig = item_config.wepon[currentBot.nextweapon];
                //nextweapon weaponConfig
                if(nextWeaponConfig.equipinterval > timeSliceParam){
                    currentBot.timeelapsedincurrentaction = timeSliceParam;
                    timeSliceParam = 0;
                }else{
                    timeSliceParam -= nextWeaponConfig.equipinterval;
                    update.action = currentBot.backupinstruction;
                    currentBot.instruction = currentBot.backupinstruction;
                }
                currentBot.nextweapon = null;
                return timeSliceParam;
            default:
                // console.log('unknown action type:' + currentBot.instruction.type);
                break;
        }
    },

    terminateGame(itemConfigParam){
        var loosingTeam = itemConfigParam.team;
        var update = {};
        update.action = 'over';
        update.loosingTeam = loosingTeam;
        update.x = 0;
        update.z = 0;
        this.latestSnapshot[itemConfigParam.id] = update;
        this.isStateUpdated = true;
        // this.isGameRunning = false;
        this.sendSnapshotUpdateToMain();

        // reset game
        playerManager.reset();

        for (let index = 0; index < world_config.characters.length; index++) {
            const characterConfig = world_config.characters[index];
            var botObject = workerstate.botArray[index];
            botObject.payload.position[0] = characterConfig.position.x;
            botObject.payload.position[2] = characterConfig.position.z;
            botObject.life = characterConfig.life;
        }
        
        for (let index = 0; index < workerstate.buildingArray.length; index++) {
            var buildingType = workerstate.buildingArray[index].type;
            var buildingItemConfig = item_config.buildings[buildingType];
            workerstate.buildingArray[i].life = buildingItemConfig.life;;
            workerstate.buildingArray[i].isActive = true;
        }
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

    respawnIfNeeded(characterConfig){
        var parentCtrl = this;
        switch(characterConfig.type){
            case 'bot':
            // enemyConfig = workerstate.botMap[characterConfig.engagedEnemyTarget];
            setTimeout(function(){
                parentCtrl.respawn(characterConfig);
                // tg.selectedObjectPointerMesh.position.x = position.x;
                // tg.selectedObjectPointerMesh.position.y = position.z;
                // tg.selectedObjectPointerMesh.position.y = tg.selectedObjectPointerMeshPositionY;
            }, 
            characterConfig.spawnDuration);
            break;
            case 'tower':
            // enemyConfig = workerstate.buildingMap[characterConfig.engagedEnemyTarget];
            break;
            default:
            // console.log('ERROR: unknown enemy type:' + characterConfig);
            break;
        }
    },

    respawn(itemConfigParam){

        itemConfigParam.isActive = true;
        var itemTypeConfig = item_config.characters[itemConfigParam.botType];
        itemConfigParam.life = itemTypeConfig.life;
        var spawnPosition = null;
        if(itemConfigParam.isLeader){
            // spawn near base
            var team = itemConfigParam.team;
            var basePosition = null;
            if(team == 1){
                basePosition = workerstate.buildingMap['base2'].position;
            }else{
                basePosition = workerstate.buildingMap['base1'].position;
            }
            spawnPosition = botroutemanager.FindClosestWalkablePoint(basePosition);
        }else{
            var playerConfig = playerManager.getPlayerByTeamID(itemConfigParam.team);
            var leaderConfig = workerstate.botMap[playerConfig.leaderBotID];
            spawnPosition = botroutemanager.FindClosestWalkablePoint({
                x: leaderConfig.payload.position[0],
                z: leaderConfig.payload.position[2]
            });
        }
        itemConfigParam.payload.position[0] = spawnPosition.x;
        itemConfigParam.payload.position[2] = spawnPosition.z;
        // // console.log('1');
        this.instructBot(itemConfigParam, 'spawn', {botRotation: 0});
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

            if(Math.abs(currentPositionX - leaderPositionX) > world_config.maxDistanceFromLeader || 
                    Math.abs(currentPositionZ - leaderPositionZ) > world_config.maxDistanceFromLeader){
                // console.log('bot away from leader.');
                return leaderConfig;
            }else{
                return null;
            }
        }else{
            return null;
        }
    },

    instructBot: function(currentBot, instructionParam, instructionPayload){
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
            case 'spawn':
            currentBot.instruction = {};
            currentBot.instruction.type = 'spawn';
            currentBot.instruction.rotation = instructionPayload.botRotation;
            currentBot.hasInstruction = false;
            currentBot.isPerformingAction = true;
            break;
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
            var path = instructionPayload.pathToEnemy;
            // // console.log('goto path:', instructionPayload.pathToEnemy);
            currentBot.instruction = {};
            currentBot.instruction.type = 'goto';
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

    requestAIToInstructBot: function(characterConfig){
        
        // var characterConfig = workerstate.botArray[botID];
        // console.log('requestAIToInstructBot:' + characterConfig.id);
        var botType = characterConfig.type;
        // var botItemConfig = item_config.characters[botType];
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
            // case 'spawn':
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
                startPoint.push(world_config.const.rotation['nw']);
                // return Math.round((1.5 * currentBot.strideTime)/currentBot.strideDistance);
                return ((1.5 * currentBot.strideTime)/currentBot.strideDistance);
            }else if(startPoint[1] == endPoint[1]){
                // return 'w';
                startPoint.push(world_config.const.rotation['w']);
                return ((1 * currentBot.strideTime)/currentBot.strideDistance);
            }else if(startPoint[1] < endPoint[1]){
                // return 'sw';
                startPoint.push(world_config.const.rotation['sw']);
                return ((1.5 * currentBot.strideTime)/currentBot.strideDistance);
            }
        }else if(startPoint[0] == endPoint[0]){
            if(startPoint[1] > endPoint[1]){
                // return 'n';
                startPoint.push(world_config.const.rotation['n']);
                return ((1 * currentBot.strideTime)/currentBot.strideDistance);
            }else if(startPoint[1] == endPoint[1]){
                // nothing to do.
                // return 'o';
                startPoint.push(null);
                return 0;
            }else if(startPoint[1] < endPoint[1]){
                // return 's';
                startPoint.push(world_config.const.rotation['s']);
                return ((1 * currentBot.strideTime)/currentBot.strideDistance);
            }
        }else if(startPoint[0] > endPoint[0]){
            if(startPoint[1] > endPoint[1]){
                // return 'ne';
                startPoint.push(world_config.const.rotation['ne']);
                return ((1.5 * currentBot.strideTime)/currentBot.strideDistance);
            }else if(startPoint[1] == endPoint[1]){
                // return 'e';
                startPoint.push(world_config.const.rotation['e']);
                return ((1 * currentBot.strideTime)/currentBot.strideDistance);
            }else if(startPoint[1] < endPoint[1]){
                // return 'se';
                startPoint.push(world_config.const.rotation['se']);
                return ((1.5 * currentBot.strideTime)/currentBot.strideDistance);
            }
        }
    },


    processNewMessages: function(){
        console.log('woreker@processNewMessages');
        var playerID = -1;
        for(var i = 0; i < mainThreadStub.messagebuffer.length; ++i){
            // // console.log(i + '>processNewMessages::' + mainThreadStub.messagebuffer[i]);
            var currentMessage = mainThreadStub.messagebuffer[i];
            if(currentMessage == null || currentMessage == undefined || currentMessage.type == undefined || currentMessage.type == null){
                continue;
            }
            switch(currentMessage.type){
                case 'action':
                    // // console.log('process action');
                    this.updateBotAction(currentMessage);
                    break;
                case 'request_game_admit':
                    console.log('request game admit');
                    var clientID = currentMessage.clientID;
                    var playerConfig = this.admitNewPlayer(clientID, false);
                    if(playerConfig != null){
                        currentMessage.type = 'request_game_admit_ack';
                        currentMessage = snapshotmanager.addSnapshot(currentMessage, playerConfig);
                        
                        // mainThreadStub.postMessage(currentMessage, '');
                        // this.refreshWorld();
                    }else{
                        currentMessage.type = 'request_game_admit_nack';
                        currentMessage.bots = [];
                        currentMessage.objects = {};
                        currentMessage.playerConfig = {};
                        // mainThreadStub.postMessage(currentMessage, '');
                    }
                    // console.log('---returning:', currentMessage);
                    console.log('player admitted successfully.');
                    mainThreadStub.postMessage(currentMessage, '');
                    break;
                case 'request_game_exit':
                case 'client_disconnected':
                    // console.log('process action:', currentMessage.type);
                    // this.updateBotAction(currentMessage);
                    // routine to send world details to main worker.
                    var clientID = currentMessage.clientID;

                    // console.log('get exit request from client:' + clientID);

                    playerID = playerManager.getPlayerID(clientID);
                    if(playerID == null || playerID == undefined){
                        console.error('ERROR removing player from worker with clientID:' + clientID + ' Client already not existing.');
                        return;
                    }
                    this.removePlayer(clientID);
                    playerManager.removePlayer(clientID);
                    break;
                default:
                    // console.log('ERROR@WebWorker:Received message with unknown type:' + currentMessage);
            }
        }

        mainThreadStub.messagebuffer.length = 0;
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

    processBot: function(botID, timeSliceParam){ // time slice is the time that needs to be consumed in this cycle
        
        var currentBot = workerstate.botArray[botID];
        // console.log('-------->>start processBot for: <' + currentBot.id + '>');
        var timeSlice = timeSliceParam;
        while(timeSlice > 0){
            // console.log('timeSlice:', timeSlice);
            if(currentBot.isPerformingAction){
                // // console.log('action:' + currentBot.id);
                timeSlice = this.continuePerformingAction(currentBot, timeSlice);
            }else if(currentBot.hasInstruction){ // instruction provided either by user or AI
                // // console.log('instruction:' + currentBot.id);
                this.processInstruction(botID);
            }else{// standing idle. This is executed for idle user bot.
                // // console.log('else');
                // timeSlice = 0;
                this.requestAIToInstructBot(currentBot);
            }
        }
        // // console.log('exit');
    },

    areAllBotsIdle: function(playerConfigParam){
        // leaderBotID: null,
        // botIDList: []
        var areBotsIdleFlag = false;
        var leaderID = playerConfigParam.leaderBotID;
        if(leaderID == null || leaderID == undefined){
            // console.log('ERROR:leader id not present.');
            return false;
        }

        // // console.log('===', );
        var leaderConfig = workerstate.botMap[playerConfigParam.leaderBotID];
        if(leaderConfig.instruction == null || leaderConfig.instruction.type == 'idle'){
            areBotsIdleFlag = true;
        }else{
            return false;
        }

        for (let i = 0; i < playerConfigParam.botIDList.length; i++) {
            // const element = array[i];
            var botConfig = workerstate.botMap[playerConfigParam.botIDList[i]];
            if(botConfig.instruction == null || leaderConfig.instruction.type == 'idle'){
                areBotsIdleFlag = true;
            }else{
                return false;
            }
        }
        return areBotsIdleFlag;
    },

    // used for movement of player to nearesrt enemy. used by player AI
    findClosestPlayerOrTowerOrBase: function(playerConfigParam){
        var playerTeam = playerConfigParam.teamID;
        var defenseList = null;
        var base = null;
        // console.log('findClosestPlayerOrTowerOrBase->leaderID:' + playerConfigParam.leaderBotID);
        var leaderConfig = workerstate.botMap[playerConfigParam.leaderBotID];
        var leaderPosition = leaderConfig.payload.position;

        // console.log('leader position:', leaderPosition, ' team:' + playerTeam, ' playerid:' + playerConfigParam.playerID);
        
        var minDistance = world_config.gridSide + 1;

        var target = null;
        var targetType = null;
        if(playerTeam == 1){// top team = 1
            defenseList = world_config.defenceTop;
            base = world_config.topBase
        }else{// bottom team = 2
            defenseList = world_config.defenceBottom;
            base = world_config.bottomBase;
        }

        // find closest player
        for(var playerIndex = 0; playerIndex < this.maxPlayerCount; ++playerIndex){
            const playerConfig = playerManager.playerArrey[playerIndex];
            // skip inactive player and players controlled by real people and players in the same team
            if(!playerConfig.isActive || playerConfig.teamID == playerConfigParam.teamID){
                // TODO: Add logic to spawn new AI player / admit new player here.
                continue;
            }
            var tmpLeaderConfig = workerstate.botMap[playerConfig.leaderBotID];
            var tmpLeaderPosition = tmpLeaderConfig.payload.position;
            // console.log('comparing with playerID:', playerConfig.playerID, ' tmpLeaderPosition:', tmpLeaderPosition);
            var distance = bot_route_utility.findDIstanceBetweenTwoPoints(
                leaderPosition[0], leaderPosition[2], tmpLeaderPosition[0], tmpLeaderPosition[2]
            )
            // console.log('calculated distance:', distance);
            if(distance < minDistance){
                minDistance = distance;
                target = [tmpLeaderPosition[0], tmpLeaderPosition[2]]
                targetType = 'bot';
            }
        }

        // console.log('after comparing palyers, minDistance:', minDistance, ' target:', target);

        for(var i = 0; i < defenseList.length; ++i){
            if(!defenseList[i].isActive){
                // TODO: Add logic to spawn new AI player / admit new player here.
                continue;
            }
            // console.log('comparing with defenseList[i]:', defenseList[i]);
            var distance = bot_route_utility.findDIstanceBetweenTwoPoints(
                leaderPosition[0], leaderPosition[2], defenseList[i][0], defenseList[i][1]
            )
            if(distance < minDistance){
                minDistance = distance;
                target = defenseList[i];
                targetType = 'static';
            }
        }

        // console.log('after comparing defenseList, minDistance:', minDistance, ' target:', target);

        // test base
        // console.log('comparing with base:', base);
        var distance = bot_route_utility.findDIstanceBetweenTwoPoints(
            leaderPosition[0], leaderPosition[2], base[0], base[1]
        )
        if(distance < minDistance){
            minDistance = distance;
            target = base;
            targetType = 'static';
        }

        // console.log('after comparing defenseList, minDistance:', minDistance, ' target:', target);

        if(target == null){
            return null;
        }else{
            return {
                target: target,
                targetType: targetType
            }
        }
    },

    processPlayers: function(){
        // // console.log('process players.', playerManager.playerArrey);
        for(var playerIndex = 0, botIndex = 0; playerIndex < playerManager.playerArrey.length; ++playerIndex){
            const playerConfig = playerManager.playerArrey[playerIndex];
            // console.log('process player:', playerConfig.playerID);
            // skip inactive player and players controlled by real people
            if(!playerConfig.isActive || !playerConfig.isAIDriven){
                // TODO: Add logic to spawn new AI player / admit new player here.
                continue;
            }
            // check if commandar bot is still active
            // var botIndex = this.maxBotPerPlayer * playerIndex;
            // if(!workerstate.botArray[botIndex].isActive){
            //     playerConfig.isActive = false;
            //     continue;
            // }

            // if player is AI
            // // console.log('playerConfig.id:', playerConfig);
            var areAllBotsIdle = this.areAllBotsIdle(playerConfig);
            // console.log('areAllBotsIdle:', areAllBotsIdle);
            if(areAllBotsIdle){
                // all bots are idle. Loiter.
                var nearestTarget = this.findClosestPlayerOrTowerOrBase(playerConfig);
                // // console.log(playerConfig.id);
                // console.log('nearestTarget:', nearestTarget);
                if(nearestTarget == null){
                    return;
                }else{
                    var leaderConfig = workerstate.botMap[playerConfig.leaderBotID];
                    // // console.log(leaderConfig.payload.position);
                    // // console.log(nearestTarget.target);
                    var nearestPosition = botroutemanager.FindClosestWalkablePoint({x:nearestTarget.target[0], y:0, z:nearestTarget.target[1]});
                    var path = botroutemanager.findPath(
                        leaderConfig.payload.position[0], 
                        leaderConfig.payload.position[2], 
                        nearestPosition.x, 
                        nearestPosition.z);
                    // // console.log('path:', path);
                    // // console.log('4');
                    this.instructBot(leaderConfig, 'goto',
                    {
                        // botRotation: suitableEnemy.botRotation,
                        pathToEnemy: path,
                    });
                }
            }
        }
    },

    refreshWorld: function(){
        // console.log('=========>refreshWorld');
        // var messageList = mainThreadStub.messagebuffer;
        if(mainThreadStub.messagebuffer.length > 0){
            this.processNewMessages();
        }
        if(this.isStateUpdated){
            this.latestSnapshot = {};
            this.isStateUpdated = false;
        }
        var currentTime = math_util.getCurrentTime();
        this.deltaTimeForRefresh = currentTime - this.lastLoopExecutionTimeStamp;
        this.lastLoopExecutionTimeStamp = currentTime;

        if(playerManager.connectedPlayerCount > 0 && this.isGameRunning){
            this.processPlayers();
            
            // console.log('=== completed processing players');
            var timeSlice;// processActionResolution;refreshWorldInterval
            var remainingTimeForThisRefreshCycle = this.deltaTimeForRefresh; // remainig time for current refresh cycle.
            
            // update building life cycle:
            for(var i = 0; i < workerstate.buildingArray.length; ++i){
                if(workerstate.buildingArray[i].life <= 0 && workerstate.buildingArray[i].isActive){ // bots that died in last cycle.
                    // this.processBot(i, timeSlice);
                    // var botConfig = this.botArray[i];
                    // // console.log('5');
                    // this.instructBot(workerstate.buildingArray[i], 'die', null);
                    if(workerstate.buildingArray[i].type == 'base'){
                        this.terminateGame(workerstate.buildingArray[i]);
                        this.refreshWorld();
                        // return;
                    }
                    // console.log('building:' + workerstate.buildingArray[i].id + ' DIED.');
                    workerstate.buildingArray[i].isActive = false;
                    var update = {};
                    update.action = 'die';
                    update.botType = workerstate.buildingArray[i].type;
                    update.x = workerstate.buildingArray[i].position.x;
                    update.z = workerstate.buildingArray[i].position.z;
                    this.latestSnapshot[workerstate.buildingArray[i].id] = update;
                    this.isStateUpdated = true;
                }
            }
            // update bot life cycle
            for(var i = 0; i < this.maxBotCount; ++i){
                if(workerstate.botArray[i].life <= 0 && workerstate.botArray[i].isActive){ // bots that died in last cycle.
                    // this.processBot(i, timeSlice);
                    // var botConfig = this.botArray[i];
                    // // console.log('6');
                    this.instructBot(workerstate.botArray[i], 'die', null);
                    // workerstate.botArray[i].isActive = false;
                    // console.log('bot:' + workerstate.botArray[i].id + ' DIED.');
                }
            }
            do{
                // console.log('--))start do loop with : remainingTimeForThisRefreshCycle = ' + remainingTimeForThisRefreshCycle);
                if(remainingTimeForThisRefreshCycle <= this.processActionResolution){
                    timeSlice = remainingTimeForThisRefreshCycle;
                    remainingTimeForThisRefreshCycle = 0;
                }else{
                    timeSlice = this.processActionResolution;
                    remainingTimeForThisRefreshCycle = remainingTimeForThisRefreshCycle - this.processActionResolution;
                }
                for(var i = 0; i < this.maxBotCount; ++i){
                    if(workerstate.botArray[i].isActive == true){
                        this.processBot(i, timeSlice);
                        // var botConfig = this.botArray[i];
                    }
                    // this.processBot(i, timeSlice); /// process all bots : active, inactive.
                }
                // // console.log('end do loop');
            }while(remainingTimeForThisRefreshCycle > 0);
        }
        
        
        
        if(this.isStateUpdated){
            this.sendSnapshotUpdateToMain();
        }
        

        let timeElapsed = math_util.getCurrentTime() - this.lastLoopExecutionTimeStamp;
        // // console.log('refreshWorld time duration:' + timeElapsed);
        if(timeElapsed > this.refreshWorldInterval){
            setTimeout((()=>{this.refreshWorld()}), 0);
        }else{
            setTimeout((()=>{this.refreshWorld()}), this.refreshWorldInterval - timeElapsed);
        }
    },

    

    engageHostile: function(botId, targetId){

    },

    setGoal: function(){

    },

    getNextAction: function(){

    },

    updateAction: function(){

    },

    removePlayer: function(clientID){
        const playerID = playerManager.getPlayerID(clientID);
        const playerConfig = playerManager.playerArrey[playerID];
        const botStartIndex = playerID * this.maxBotPerPlayer;

        // // console.log('botStartIndex:' + botStartIndex);
        for(var j = 0; j < this.maxBotPerPlayer; ++j){
            workerstate.botArray[j + botStartIndex].isActive = true;
            workerstate.botArray[j + botStartIndex].teamColor = playerConfig.teamColor;
            workerstate.botArray[j + botStartIndex].isAIDriven = true;
        }
    },

    initializeWorldByPopulatingWithBots: function(){
        // // console.log('playerManager.playerArrey:', playerManager.playerArrey);
        for (let index = 0; index < world_config.characters.length; index++) {
            const characterConfig = world_config.characters[index];
            var botType = characterConfig.type;
            var botItemConfig = item_config.characters[botType];
            // // console.log('characterConfig.playerID:', characterConfig.playerID);
            var playerConfig = playerManager.playerArrey[characterConfig.playerID - 1];

            if(characterConfig.isLeader){
                playerConfig.leaderBotID = characterConfig.id;
            }else{
                playerConfig.botIDList.push(characterConfig.id);
            }

            var botObject = {
                timeelapsedincurrentaction:0,
                isActive:true,
                isAIDriven:false,
                id:characterConfig.id,
                isLeader: characterConfig.isLeader,
                shotfired:0,
                botRouteIndex:0,
                targetbotid:null,
                // currentweapon:botItemConfig.attachmentmesh[0],
                nextweapon:null,
                backupinstruction:null,
                // weaponinventory:botItemConfig.attachmentmesh,
                life:botItemConfig.life,
                attack: botItemConfig.attack,
                attackinterval: botItemConfig.attackinterval,
                spawnDuration: botItemConfig.spawnDuration,
                damageincurred:0,
                speed: botItemConfig.speed,
                range: botItemConfig.range,
                engagedEnemyTarget: null,
                engagedEnemyType: null,
                type: 'bot',
                botType: botType,
                team:characterConfig.team,
                playerID:characterConfig.playerID,
                botIndex: index,
                instruction: {
                    type: 'idle'
                },
                // currentBot.instruction.type = 'idle',
                payload:{
                    teamColor:playerConfig.teamColor,
                    type:botType,
                    // team:characterConfig.team,
                    position:[
                        characterConfig.position.x, 
                        characterConfig.position.y, 
                        characterConfig.position.z
                    ],
                    rotation:0,
                },
            };
            // // console.log('admitting new bot at initialization:', botObject.payload.position);
            workerstate.botArray[index] = botObject;
            workerstate.botMap[characterConfig.id] = botObject;
            this.admitNewBot(index);
        }
    },
    admitNewPlayer: function(clientID, isAI){
        // console.log('admit new player:' + clientID);
        const playerConfig = playerManager.admitNewPlayer(clientID);
        // console.log('new player id:' + playerConfig.playerID);
        // // console.log('maxBotPerPlayer:' + this.maxBotPerPlayer);
        // if(playerConfig != null){
        //     const botStartIndex = playerID * this.maxBotPerPlayer;
        //     // console.log('botStartIndex:' + botStartIndex);
        //     for(var j = 0; j < this.maxBotPerPlayer; ++j){
        //         workerstate.botArray[j + botStartIndex].isActive = true;
        //         workerstate.botArray[j + botStartIndex].teamColor = playerConfig.teamColor;
        //         workerstate.botArray[j + botStartIndex].isAIDriven = false;
        //         // var botConfig = {
        //         //     type:'rifleman',
        //         //     team:playerID,
        //         //     position:[j,0.5,-10],
        //         //     rotation:0.001,
        //         //     id:j + botStartIndex,
        //         // }
        //         // this.botArray[j + botStartIndex].payload = botConfig;
        //         this.admitNewBot(j + botStartIndex);
        //     }
        // }
        return playerConfig;
    },
    admitNewBot: function(botIndex){
        // // console.log('admit new bot:' + botIndex);
        // var botList = this.botArray;
        // var botID = this.findEmptyBotSlot();
        var botElement = workerstate.botArray[botIndex];
        
        var botItemProperty = item_config.characters[botElement.payload.type];

        workerstate.botArray[botIndex].hasInstruction = false;
        workerstate.botArray[botIndex].isPerformingAction = false;
        workerstate.botArray[botIndex].life = botItemProperty.life;
        // workerstate.botArray[botIndex].equippedWeapon = botItemProperty.attachmentmesh[0];

        workerstate.botArray[botIndex].strideDistance = botItemProperty.strideDistance;
        workerstate.botArray[botIndex].strideTime = botItemProperty.strideTime;
        workerstate.botArray[botIndex].range = botItemProperty.range;
        workerstate.botArray[botIndex].botRoute = null;


        workerstate.botArray[botIndex].botRoute = null;

        var position = botroutemanager.admitNewBot(botElement.payload, botIndex);
        workerstate.botArray[botIndex].payload.position[0] = position.x;
        workerstate.botArray[botIndex].payload.position[2] = position.z;
    },


    deActivateBot: function(botID){
        if(workerstate.botArray[botID].isActive == false){
            // console.log('ERROR:the agent is already inactive.');
        }
        botroutemanager.deActivateBot(botID);
    },
    
    
    testTimerMethod: function(){
        // console.log('log@worker' + math_util.getCurrentTime());
    },
    init: function(){
        snapshotmanager.init();
        playerManager.init();
        this.maxPlayerCount = world_config.commonConfig.maxPlayerCount;
        // console.log('init world @ worker logic. world_config.commonConfig.maxBotCount:' + world_config.commonConfig.maxBotCount);
        this.initialiseConstantCache();
        botroutemanager.prepareGrid();
        this.maxBotPerPlayer = world_config.commonConfig.maxBotPerPlayer;
        this.maxBotCount = world_config.commonConfig.maxBotCount;
        if(this.maxBotCount != world_config.commonConfig.maxBotPerPlayer * world_config.commonConfig.maxPlayerCount){
            console.error('!!!!!!ERROR:this.maxBotCount != world_config.commonConfig.maxBotPerPlayer * world_config.commonConfig.maxPlayerCount');
        }

        //populating world with bots
        this.initializeWorldByPopulatingWithBots();
        // // console.log(workerstate);
        // // console.log("workerstate: %j", workerstate);
        this.isGameRunning = true;
        this.refreshWorld();

        // console.log('complete world init.');
    },
};