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

    updateBotPositionInGridMatrix: function(botConfig, posX, posZ, gameRoom){
        // gameRoom.gridMatrix[botConfig.position[0]][botConfig.position[2]].object = null;
        // TODO : remove the validation.
        if(gameRoom.gridMatrix[posX][posZ].object != null && botConfig != null){
            console.error('trying to use grid position already occupied');
        }
        gameRoom.gridMatrix[posX][posZ].object = botConfig;
        // botConfig.position[0] = posX;
        // botConfig.position[2] = posZ;
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
                snapShotManager.updateBotSnapshotAction(gameRoom, botConfig);
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

        if(currentPositionX != null && currentPositionZ != null){ // clear current grid position
            this.updateBotPositionInGridMatrix(null, currentPositionX, currentPositionZ, gameRoom);
        }
        
        if(newPositionX != null && newPositionZ != null){ // allocate new grid position for the bot
            this.updateBotPositionInGridMatrix(botConfig, newPositionX, newPositionZ, gameRoom);
        }

        // botConfig.activityTimeStamp = workerState.currentTime;
    },

    // for events like 'die'
    clearProximityGraphEntry: function(gameRoom, itemConfig) {
        var globalIndex = itemConfig.globalIndex;
        for (var i = 0; i < gameRoom.allDynamicObjects.length; i++) {
            if(i == globalIndex){
                continue;
            }
            var currentBot = gameRoom.allDynamicObjects[i];
            if(currentBot.team == itemConfig.team){
                continue;
            }

            gameRoom.proximityGraph[globalIndex][i].distance = null;
            gameRoom.proximityGraph[globalIndex][i].visibility = false;

            gameRoom.proximityGraph[i][globalIndex].distance = null;
            gameRoom.proximityGraph[i][globalIndex].visibility = false;
        }
    },

    updateProximityGraphEntry: function(gameRoom, itemConfig) {
        // console.log('updateProximityGraphEntry:', itemConfig);
        var globalIndex = itemConfig.globalIndex;
        var visibility = false;
        // console.log('gameRoom.allDynamicObjects.length:', gameRoom.allDynamicObjects.length);
        // console.log('gameRoom.proximityGraph.length:', gameRoom.proximityGraph.length);
        for (var i = 0; i < gameRoom.allDynamicObjects.length; i++) {
            // console.log('i:', i);
            // console.log('gameRoom.proximityGraph[globalIndex].length:', gameRoom.proximityGraph[globalIndex].length);
            // console.log('gameRoom.proximityGraph[i].length:', gameRoom.proximityGraph[i].length);
            if(i == globalIndex){
                continue;
            }
            var currentBot = gameRoom.allDynamicObjects[i];
            if(currentBot.team == itemConfig.team){
                continue;
            }
            var distance = routeManager.getDistanceBetweenPoints(
                itemConfig.position[0],
                itemConfig.position[2],
                currentBot.position[0],
                currentBot.position[2],
            );
            
            // if input bot can see currentBot
            if(distance <= itemConfig.sight){
                visibility = true;
            }else{
                visibility = false;
            }
            gameRoom.proximityGraph[globalIndex][i].distance = distance;
            gameRoom.proximityGraph[globalIndex][i].visibility = visibility;

            // if currentBot can see input bot
            if(distance <= currentBot.sight){
                visibility = true;
            }else{
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


    processAttackAction: function (offenderConfig, defenderConfig, gameRoom) {
        var isAlive = false;
        var isBuilding = false;
        if(defenderConfig.life > 0){
            isAlive = true;
        }
        if(defenderConfig.type == 'tower' || defenderConfig.type == 'base'){
            isBuilding = true;
        }
        var offenderAttack = offenderConfig.attack;
        // defenderConfig.life -= offenderConfig.attack;
        defenderConfig.life -= offenderAttack;
        snapShotManager.processAttackEvent(gameRoom, offenderConfig, defenderConfig);
        offenderConfig.activityTimeStamp += offenderConfig.attackinterval;

        if(offenderConfig.type == 'tower' || offenderConfig.type == 'base'){
            // no need to update remaining stats
            return;
        }

        gameRoom.statistics.performance[offenderConfig.team].damage += offenderAttack;
        // snapShotManager.updateBotSnapshot(gameRoom, offenderConfig);

        // console.log(offenderConfig.level + ':' + offenderConfig.playerIndex + ':' + offenderConfig.index+ ':' + offenderConfig.id);

        var botEntryInStatistics = gameRoom.statistics.detailedPerformance[offenderConfig.playerIndex][offenderConfig.index];

        // increment bot totalDamageSinceSpawn and totalDamageSinceGameStart
        botEntryInStatistics.totalDamageSinceSpawn += offenderAttack;
        botEntryInStatistics.totalDamageSinceGameStart += offenderAttack;

        // console.log(botEntryInStatistics);

        // compare totalDamageSinceSpawn and increment level if required
        if(offenderConfig.level < (offenderConfig.levelMap.length - 1)){
            // console.log('check if eligible for levelup.');
            if(botEntryInStatistics.totalDamageSinceSpawn > offenderConfig.levelMap[offenderConfig.level].damage){
                // console.log('eligible for levelup.');
                offenderConfig.level++;
                this.updateBotConfigForNewLevel(offenderConfig);
                botEntryInStatistics.levelHistory.push([offenderConfig.level, gameRoom.timeElapsed]);
                // console.log(botEntryInStatistics.levelHistory);
                snapShotManager.processLevelChangeEvent(gameRoom, offenderConfig);
            }
        }

        if(isAlive == true && defenderConfig.life < 0){
            // kill shot
            // increment bot kill count tower or bot
            if(isBuilding){
                botEntryInStatistics.totalBuildingDestroy += 1;
            }else{
                botEntryInStatistics.totalBotKill += 1;
            }
        }
    },

    updateBotConfigForNewLevel: function(botObject){
        var botLevelMap = botObject.levelMap[botObject.level];
        botObject.attack = botLevelMap.attack;
        // botObject.attackTimestamp = 0;

        var botSpeed = botLevelMap.speed;
        var botLife = botLevelMap.life;

        botObject.life = botLife;
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