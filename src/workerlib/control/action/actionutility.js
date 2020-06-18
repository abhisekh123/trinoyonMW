const workerState = require('../../state/workerstate');
const snapShotManager = require('../../state/snapshotmanager');
const routeManager = require('../../route/routemanager');
const utilityFunctions = require('../../../utils/utilityfunctions');

module.exports = {
    // baseMap: {}
    worldConfig: null,
    itemConfig: null,
    init: function () {
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
    },

    updateBotPositionInGridMatrix: function (botConfig, posX, posZ, gameRoom) {
        // gameRoom.gridMatrix[botConfig.position[0]][botConfig.position[2]].object = null;
        // TODO : remove the validation.
        if (gameRoom.gridMatrix[posX][posZ].object != null && botConfig != null) {
            console.error('trying to use grid position already occupied');
        }
        gameRoom.gridMatrix[posX][posZ].object = botConfig;
        // botConfig.position[0] = posX;
        // botConfig.position[2] = posZ;
    },

    activateAbility: function (objectConfig, abilityIndex) {
        var abilityObject = objectConfig.ability[abilityIndex];

        objectConfig[abilityObject.key] = this.worldConfig.constants.ABILITY_ACTIVE;
        // abilityObject.isActive = true;
        abilityObject.timeStamp = workerState.currentTime;
    },

    addActionToBot: function (botConfig, action, actionData, gameRoom) {
        // console.log('addAction:' + action + ' ToBot botConfig.id:' + botConfig.id + ' at position:', botConfig.position);
        // console.log('-->', action);
        // console.log('==>', actionData);
        var currentPositionX = null;
        var currentPositionZ = null;

        var newPositionX = null;
        var newPositionZ = null;

        switch (botConfig.action) { // process old action
            case 'goto':
            case 'march':
                currentPositionX = botConfig.actionData.path[botConfig.actionData.path.length - 1][0];
                currentPositionZ = botConfig.actionData.path[botConfig.actionData.path.length - 1][1];
                break;
            case 'ready':
                // case 'spawn':
                botConfig.activityTimeStamp = workerState.currentTime;
                // case 'fight':
                currentPositionX = botConfig.position[0];
                currentPositionZ = botConfig.position[2];
                break;
            case 'die': // bot is getting spawned
                // botConfig.action = null;
                botConfig.isActive = true;
                botConfig.life = botConfig.fullLife;
                // botConfig.activityTimeStamp += botConfig.respawnTime;
                botConfig.activityTimeStamp = workerState.currentTime;
                botConfig.position[0] = botConfig.spawnPosition[0];
                botConfig.position[2] = botConfig.spawnPosition[2];
                botConfig.positionUpdateTimeStamp = botConfig.activityTimeStamp;
                this.updateProximityGraphEntry(gameRoom, botConfig);

                // TODO : update bot position in the grid. For now consider repawn position as special.
                snapShotManager.registerBotSpawnEvent(gameRoom, botConfig);
                // nothing to do as the bot does not occupy any position in grid
                break;
            case null: // happens when the game starts
                break;
            default:
                console.log('ERROR: Unknown botConfig.action:', botConfig.action);
                break;
        }

        // set new action
        botConfig.action = action;
        botConfig.actionData = actionData;

        switch (action) {
            case 'goto':
            case 'march':
                // newPositionX = botConfig.actionData.path[botConfig.actionData.path.length - 1][0];
                // newPositionZ = botConfig.actionData.path[botConfig.actionData.path.length - 1][1];
                // console.log('==>' + action + ' botid:' + botConfig.id + ' position:' + actionData.path[actionData.path.length - 1]);
                newPositionX = actionData.path[actionData.path.length - 1][0];
                newPositionZ = actionData.path[actionData.path.length - 1][1];
                // console.log('set new action:', action);
                // snapShotManager.updateBotSnapshotAction(gameRoom, botConfig);
                break;
                // case 'fight':
            case 'ready':
                // case 'spawn':
                // console.log('==>' + action + ' botid:' + botConfig.id + ' position:' + botConfig.position);
                newPositionX = botConfig.position[0];
                newPositionZ = botConfig.position[2];
                break;
            case 'die':
                // console.log('==>' + action + ' botid:' + botConfig.id + ' position:' + botConfig.position);
                // botConfig.action = null;
                botConfig.activityTimeStamp = workerState.currentTime; // time of death
                botConfig.isActive = false;
                this.clearProximityGraphEntry(gameRoom, botConfig);
                snapShotManager.registerBotDieEvent(gameRoom, botConfig);
                // nothing to do as the bot does not occupy any position in grid
                break;
            default:
                console.log('ERROR: Unknown action:', action);
                break;
        }

        if (currentPositionX != null && currentPositionZ != null) { // clear current grid position
            this.updateBotPositionInGridMatrix(null, currentPositionX, currentPositionZ, gameRoom);
        }

        if (newPositionX != null && newPositionZ != null) { // allocate new grid position for the bot
            this.updateBotPositionInGridMatrix(botConfig, newPositionX, newPositionZ, gameRoom);
        }

        // botConfig.activityTimeStamp = workerState.currentTime;
    },

    // for events like 'die'
    clearProximityGraphEntry: function (gameRoom, itemConfig) {
        var globalIndex = itemConfig.globalIndex;
        for (var i = 0; i < gameRoom.allDynamicObjects.length; i++) {
            if (i == globalIndex) {
                continue;
            }
            var currentBot = gameRoom.allDynamicObjects[i];
            if (currentBot.team == itemConfig.team) {
                continue;
            }

            gameRoom.proximityGraph[globalIndex][i].distance = null;
            gameRoom.proximityGraph[globalIndex][i].visibility = false;

            gameRoom.proximityGraph[i][globalIndex].distance = null;
            gameRoom.proximityGraph[i][globalIndex].visibility = false;
        }
    },

    updateProximityGraphEntry: function (gameRoom, itemConfig) {
        // console.log('updateProximityGraphEntry:', itemConfig);
        var globalIndex = itemConfig.globalIndex;
        var visibility = false;
        // console.log('gameRoom.allDynamicObjects.length:', gameRoom.allDynamicObjects.length);
        // console.log('gameRoom.proximityGraph.length:', gameRoom.proximityGraph.length);
        for (var i = 0; i < gameRoom.allDynamicObjects.length; i++) {
            // console.log('i:', i);
            // console.log('gameRoom.proximityGraph[globalIndex].length:', gameRoom.proximityGraph[globalIndex].length);
            // console.log('gameRoom.proximityGraph[i].length:', gameRoom.proximityGraph[i].length);
            if (i == globalIndex) {
                continue;
            }
            var currentBot = gameRoom.allDynamicObjects[i];
            if (currentBot.team == itemConfig.team) {
                continue;
            }
            var distance = routeManager.getDistanceBetweenPoints(
                itemConfig.position[0],
                itemConfig.position[2],
                currentBot.position[0],
                currentBot.position[2],
            );

            // if input bot can see currentBot
            if (distance <= itemConfig.sight) {
                visibility = true;
            } else {
                visibility = false;
            }
            gameRoom.proximityGraph[globalIndex][i].distance = distance;
            gameRoom.proximityGraph[globalIndex][i].visibility = visibility;

            // if currentBot can see input bot
            if (distance <= currentBot.sight) {
                visibility = true;
            } else {
                visibility = false;
            }

            gameRoom.proximityGraph[i][globalIndex].distance = distance;
            gameRoom.proximityGraph[i][globalIndex].visibility = visibility;
        }
    },

    traverseBotThroughPath: function (botConfig, timeSlice, gameRoom) {
        // console.log('traverseBotThroughPath start', timeSlice);
        // console.log('path:', botConfig.actionData);
        // ignore i = 0 as it is the starting position.
        let pathPosition = null;
        for (let i = 1; i < botConfig.actionData.path.length; i++) {
            pathPosition = botConfig.actionData.path[i];
            if (pathPosition[2] > workerState.currentTime) {
                pathPosition = botConfig.actionData.path[i - 1];
                botConfig.position[0] = pathPosition[0];
                botConfig.position[2] = pathPosition[1];
                botConfig.activityTimeStamp = pathPosition[2];
                botConfig.positionUpdateTimeStamp = botConfig.activityTimeStamp;
                // console.log('bot:' + botConfig.id + ' moved to:', botConfig.position);
                // console.log('botConfig.actionData:', botConfig.actionData.pathTimeStamp);
                snapShotManager.updateBotSnapshotState(gameRoom, botConfig);
                this.updateProximityGraphEntry(gameRoom, botConfig);
                // console.log('return 0 at index:', i);
                return 0;
            }
        }
        // console.log('completed time slice. transiting to ready state.');
        pathPosition = botConfig.actionData.path[botConfig.actionData.path.length - 1];
        botConfig.position[0] = pathPosition[0];
        botConfig.position[2] = pathPosition[1];
        botConfig.activityTimeStamp = pathPosition[2];
        botConfig.positionUpdateTimeStamp = botConfig.activityTimeStamp;
        this.addActionToBot(botConfig, 'ready', null, gameRoom);
        timeSlice = workerState.currentTime - pathPosition[2];
        // console.log('bot:' + botConfig.id + ' completed movement to:', botConfig.position);
        snapShotManager.updateBotSnapshotState(gameRoom, botConfig);
        this.updateProximityGraphEntry(gameRoom, botConfig);
        // TODO: update snapshot
        return timeSlice;
    },

    // need to be updated if more abilities(per bot) are introduced.
    // returns index of ability activated.
    getActiveAbilityIndex: function (objectConfig) {
        if (objectConfig.ability == undefined || objectConfig.ability == null) { // for buildings.
            return -1;
        }
        for (var i = 1; i < objectConfig.ability.length; ++i) { // skip first ability as it is retreat.
            if (objectConfig[objectConfig.ability[i].key] == this.worldConfig.constants.ABILITY_ACTIVE) {
                return i;
            }
        }
        return -1;
    },

    getDamageReceivedByDefender: function (defenderConfig, offenderAttack) {
        var abilityIndex = this.getActiveAbilityIndex(defenderConfig);
        if (abilityIndex < 0) { // no ability activated. regular attack.
            return offenderAttack;
        } else {
            var abilityObject = defenderConfig.ability[abilityIndex];

            switch (abilityObject.action) {
                case 'sheild': // enhanced attack with crowd control
                    var abilityConfig = this.itemConfig.abilityConfig.sheild;
                    return abilityConfig.defenceFactor * offenderAttack;
                default:
                    // no attack enhancement ability detected. Vanilla routine.
                    return offenderAttack;
            }
        }
    },

    // conciders defence of defender and returns the damage received finally
    // handles one-to-one relation : one ofender to one defender.
    completeBookKeepingForAttackEvent: function (offenderConfig, defenderConfig, offenderAttack, gameRoom) {
        // console.log('completeBookKeepingForAttackEvent::', offenderConfig);
        var isAlive = false;
        var isDefenderBuilding = false;
        if (defenderConfig.life > 0) {
            isAlive = true;
        }
        if (defenderConfig.type == 'tower' || defenderConfig.type == 'base') {
            isDefenderBuilding = true;
        }

        var attackReceived = this.getDamageReceivedByDefender(defenderConfig, offenderAttack);
        defenderConfig.life -= attackReceived;

        gameRoom.statistics.performance[offenderConfig.team].damage += offenderAttack;
        // console.log(offenderConfig.id + '--' + offenderConfig.type + '-');
        if (offenderConfig.type != 'tower' && offenderConfig.type != 'base') {
            // no need to update remaining stats
            
            // console.log(offenderConfig.playerIndex + '<=>' + offenderConfig.index);
            var botEntryInStatistics = gameRoom.statistics.detailedPerformance[offenderConfig.playerIndex][offenderConfig.index];

            // increment bot totalDamageSinceSpawn and totalDamageSinceGameStart
            botEntryInStatistics.totalDamageSinceSpawn += offenderAttack;
            botEntryInStatistics.totalDamageSinceGameStart += offenderAttack;

            // console.log(botEntryInStatistics);

            // compare totalDamageSinceSpawn and increment level if required
            if (offenderConfig.level < (offenderConfig.levelMap.length - 1)) {
                // console.log('check if eligible for levelup.');
                if (botEntryInStatistics.totalDamageSinceSpawn > offenderConfig.levelMap[offenderConfig.level].damage) {
                    // console.log('eligible for levelup.');
                    offenderConfig.level++;
                    this.updateBotConfigForNewLevel(offenderConfig);
                    botEntryInStatistics.levelHistory.push([offenderConfig.level, gameRoom.timeElapsed]);
                    // console.log(botEntryInStatistics.levelHistory);
                    snapShotManager.processLevelChangeEvent(gameRoom, offenderConfig);
                }
            }

            if (isAlive == true && defenderConfig.life < 0) {
                // kill shot
                // increment bot kill count tower or bot
                if (isDefenderBuilding) {
                    botEntryInStatistics.totalBuildingDestroy += 1;
                } else {
                    botEntryInStatistics.totalBotKill += 1;
                }
            }
        }

        return attackReceived;
    },


    // consider attack ability of offender.
    // consider if attack is type : crowd control. Manages attack to multiple recipient
    processAttackAction: function (offenderConfig, defenderConfig, gameRoom) {

        var offenderAttack = offenderConfig.levelMap[offenderConfig.level].attack;

        var abilityIndex = this.getActiveAbilityIndex(offenderConfig);
        // console.log(offenderConfig.id + 'processAttackAction:abilityIndex:' + abilityIndex);
        var attackType = 'regular';
        var totalDamageDealt = 0;
        if (abilityIndex < 0) { // no ability activated. regular attack.
            totalDamageDealt += this.completeBookKeepingForAttackEvent(offenderConfig, defenderConfig, offenderAttack, gameRoom);
        } else {
            var abilityObject = offenderConfig.ability[abilityIndex];
            var abilityConfig = this.itemConfig.abilityConfig[abilityObject.action];
            switch (abilityObject.action) {
                case 'pulse': // enhanced attack with crowd control
                    attackType = abilityObject.action;
                    var playerTeam = offenderConfig.team;
                    var enemyPlayerList = null;
                    if (playerTeam == 1) { // top team = 1
                        enemyPlayerList = gameRoom.players_2;
                    } else { // bottom team = 2
                        enemyPlayerList = gameRoom.players_1;
                    }
                    var offenderPosition = offenderConfig.position;
                    for (var playerIndex = 0; playerIndex < enemyPlayerList.length; ++playerIndex) {
                        const playerConfig = enemyPlayerList[playerIndex];
                        for (var i = 0; i < playerConfig.botObjectList.length; ++i) {
                            var botConfig = playerConfig.botObjectList[i];
                            if(botConfig.isActive == false){
                                continue;
                            }
                            if(!routeManager.checkIfBotIsVisibleToEnemyTeam(botConfig, gameRoom)){ // skip bots invisible to team
                                continue;
                            }
                            if(botConfig.id == defenderConfig.id){ // damage on defenderConfig managed seperately.
                                continue;
                            }
                            var botPosition = botConfig.position;
                            // console.log('testing for bot:', botConfig.id);
                            // console.log('position:', botConfig.position);
                            var distance = routeManager.getDistanceBetweenPoints(
                                offenderPosition[0], offenderPosition[2], botPosition[0], botPosition[2]
                            );
                            if(distance <= offenderConfig.range){
                                var damageByOffender = (offenderAttack * abilityConfig.neighbourAttackFactor) * (distance / offenderConfig.range);
                                totalDamageDealt += this.completeBookKeepingForAttackEvent(offenderConfig, defenderConfig, damageByOffender, gameRoom);
                            }
                        }
                    }
                    totalDamageDealt += this.completeBookKeepingForAttackEvent(
                        offenderConfig, 
                        defenderConfig, 
                        offenderAttack * abilityConfig.targetAttackFactor, 
                        gameRoom
                    );
                    // disable ability
                    offenderConfig[abilityObject.key] = this.worldConfig.constants.ABILITY_UNAVAILABLE;
                    break;
                case 'scorch': // fire projectiles
                    attackType = abilityObject.action;
                    var damageByOffender = offenderAttack * abilityConfig.targetAttackFactor;
                    totalDamageDealt += this.completeBookKeepingForAttackEvent(
                        offenderConfig, 
                        defenderConfig, 
                        damageByOffender, 
                        gameRoom
                    );
                    break;
                default:
                    // no attack enhancement ability detected. Vanilla routine.
                    break;
            }
        }

        // defenderConfig.life -= offenderConfig.attack;

        snapShotManager.processAttackEvent(gameRoom, offenderConfig, defenderConfig, attackType);
        offenderConfig.activityTimeStamp += offenderConfig.attackinterval;




        // snapShotManager.updateBotSnapshot(gameRoom, offenderConfig);

        // console.log(offenderConfig.level + ':' + offenderConfig.playerIndex + ':' + offenderConfig.index+ ':' + offenderConfig.id);


    },

    updateBotConfigForNewLevel: function (botObject) {
        var botLevelMap = botObject.levelMap[botObject.level];
        botObject.attack = botLevelMap.attack;
        // botObject.attackTimestamp = 0;

        var botSpeed = botLevelMap.speed;
        var botLife = botLevelMap.life;

        // botObject.life = botLife;
        botObject.fullLife = botLife;

        botObject.speed = botSpeed; //one tile per 1000 ms.
        // times are in miliseconds. but speed is in meter/second
        botObject.diagonalTime = utilityFunctions.roundTo2Decimal((1.414 * 1000) / botSpeed);
        botObject.adjacentTime = utilityFunctions.roundTo2Decimal((1 * 1000) / botSpeed);
    },

    // botConfig.level = 0;
    //         var botEntryInStatistics = gameRoom.statistics.detailedPerformance[botConfig.playerIndex][botConfig.index];
    //         botEntryInStatistics.totalDeath += 1;
    //         botEntryInStatistics.totalDamageSinceSpawn = 0;

    //         var botEntry = {
    //             type: botObject.type,
    //             totalDamageSinceSpawn: 0,
    //             totalDamageSinceGameStart: 0,
    //             totalBuildingDestroy: 0,
    //             totalBotKill: 0,
    //             totalDeath: 0,
    //         }
}