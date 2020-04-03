const workerState = require('../../state/workerstate');
const snapShotManager = require('../../state/snapshotmanager');
const routeManager = require('../../route/routemanager');

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

        switch (botConfig.action) {
            case 'goto':
            case 'march':
                currentPositionX = botConfig.actionData.path[botConfig.actionData.path.length - 1][0];
                currentPositionZ = botConfig.actionData.path[botConfig.actionData.path.length - 1][1];
                break;
            case 'ready':
            case 'fight':
                currentPositionX = botConfig.position[0];
                currentPositionZ = botConfig.position[2];
                break;
            case 'die':
                // botConfig.action = null;
                botConfig.isActive = true;
                botConfig.life = botConfig.fullLife;
                botConfig.activityTimeStamp += botConfig.respawnTime;
                botConfig.position[0] = botConfig.spawnPosition[0];
                botConfig.position[2] = botConfig.spawnPosition[2];
                botConfig.positionUpdateTimeStamp = botConfig.activityTimeStamp;

                // TODO : update bot position in the grid. For now consider repawn position as special.
                snapShotManager.registerBotSpawnEvent(gameRoom, botConfig);
                // nothing to do as the bot does not occupy any position in grid
                break;
            case null:
                break;
            default:
                console.log('ERROR: Unknown botConfig.action:', botConfig.action);
                break;
        }
        
        switch (action) {
            case 'goto':
            case 'march':
                // newPositionX = botConfig.actionData.path[botConfig.actionData.path.length - 1][0];
                // newPositionZ = botConfig.actionData.path[botConfig.actionData.path.length - 1][1];
                console.log('==>' + action + ' botid:' + botConfig.id + ' position:' + actionData.path[actionData.path.length - 1]);
                newPositionX = actionData.path[actionData.path.length - 1][0];
                newPositionZ = actionData.path[actionData.path.length - 1][1];
                break;
            case 'fight':
            case 'ready':
                console.log('==>' + action + ' botid:' + botConfig.id + ' position:' + botConfig.position);
                newPositionX = botConfig.position[0];
                newPositionZ = botConfig.position[2];
                break;
            case 'die':
                console.log('==>' + action + ' botid:' + botConfig.id + ' position:' + botConfig.position);
                // botConfig.action = null;
                botConfig.activityTimeStamp = workerState.currentTime; // time of death
                botConfig.isActive = false;
                this.clearBotGraphEntry(gameRoom, botConfig);
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

        botConfig.action = action;
        botConfig.actionData = actionData;
    },

    // for events like 'die'
    clearBotGraphEntry: function(gameRoom, botConfig) {
        var globalIndex = botConfig.globalIndex;
        for (var i = 0; i < gameRoom.allBotObjects.length; i++) {
            if(i == globalIndex){
                continue;
            }
            var currentBot = gameRoom.allBotObjects[i];
            if(currentBot.team == botConfig.team){
                continue;
            }

            gameRoom.botGraph[globalIndex][i].distance = null;
            gameRoom.botGraph[globalIndex][i].visibility = false;

            gameRoom.botGraph[i][globalIndex].distance = null;
            gameRoom.botGraph[i][globalIndex].visibility = false;
        }
    },

    updateBotGraphEntry: function(gameRoom, botConfig) {
        // console.log('updateBotGraphEntry:', botConfig);
        var globalIndex = botConfig.globalIndex;
        var visibility = false;
        // console.log('gameRoom.allBotObjects.length:', gameRoom.allBotObjects.length);
        // console.log('gameRoom.botGraph.length:', gameRoom.botGraph.length);
        for (var i = 0; i < gameRoom.allBotObjects.length; i++) {
            // console.log('i:', i);
            // console.log('gameRoom.botGraph[globalIndex].length:', gameRoom.botGraph[globalIndex].length);
            // console.log('gameRoom.botGraph[i].length:', gameRoom.botGraph[i].length);
            if(i == globalIndex){
                continue;
            }
            var currentBot = gameRoom.allBotObjects[i];
            if(currentBot.team == botConfig.team){
                continue;
            }
            var distance = routeManager.getDistanceBetweenPoints(
                botConfig.position[0],
                botConfig.position[2],
                currentBot.position[0],
                currentBot.position[2],
            );
            
            // if input bot can see currentBot
            if(distance <= botConfig.sight){
                visibility = true;
            }else{
                visibility = false;
            }
            gameRoom.botGraph[globalIndex][i].distance = distance;
            gameRoom.botGraph[globalIndex][i].visibility = visibility;

            // if currentBot can see input bot
            if(distance <= currentBot.sight){
                visibility = true;
            }else{
                visibility = false;
            }
            
            gameRoom.botGraph[i][globalIndex].distance = distance;
            gameRoom.botGraph[i][globalIndex].visibility = visibility;
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
                snapShotManager.updateBotSnapshot(gameRoom, botConfig);
                this.updateBotGraphEntry(gameRoom, botConfig);
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
        snapShotManager.updateBotSnapshot(gameRoom, botConfig);
        this.updateBotGraphEntry(gameRoom, botConfig);
        // TODO: update snapshot
        return timeSlice;
    },


    processAttackAction: function (offenderConfig, defenderConfig, gameRoom) {
        defenderConfig.life -= offenderConfig.attack;
        offenderConfig.activityTimeStamp += offenderConfig.attackinterval;

        // TODO: update snapshot 
        snapShotManager.processAttackEvent(gameRoom, offenderConfig, defenderConfig);
    },
}