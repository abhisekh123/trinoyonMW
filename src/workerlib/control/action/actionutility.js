const workerState = require('../../state/workerstate');
const snapShotManager = require('../../state/snapshotmanager');

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
        console.log('addAction:' + action + ' ToBot botConfig.id:' + botConfig.id + ' at position:', botConfig.position);
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
                newPositionX = botConfig.actionData.path[botConfig.actionData.path.length - 1][0];
                newPositionZ = botConfig.actionData.path[botConfig.actionData.path.length - 1][1];
                break;
            case 'fight':
            case 'ready':
                newPositionX = botConfig.position[0];
                newPositionZ = botConfig.position[2];
                break;
            case 'die':
                // botConfig.action = null;
                botConfig.activityTimeStamp = workerState.currentTime; // time of death
                botConfig.isActive = false;

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


    processAttackAction: function (offenderConfig, defenderConfig, gameRoom) {
        defenderConfig.life -= offenderConfig.attack;
        offenderConfig.activityTimeStamp += offenderConfig.attackinterval;

        // TODO: update snapshot 
        snapShotManager.processAttackEvent(gameRoom, offenderConfig, defenderConfig);
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
                console.log('bot:' + botConfig.id + ' moved to:', botConfig.position);
                snapShotManager.updateBotSnapshot(gameRoom, botConfig);
                // console.log('return 0 at index:', i);
                return 0;
            }
        }
        // console.log('completed time slice. transiting to ready state.');
        pathPosition = botConfig.actionData.path[botConfig.actionData.path.length - 1];
        botConfig.position[0] = pathPosition[0];
        botConfig.position[2] = pathPosition[1];
        botConfig.activityTimeStamp = pathPosition[2];
        this.addActionToBot(botConfig, 'ready', null, gameRoom);
        timeSlice = workerState.currentTime - pathPosition[2];
        snapShotManager.updateBotSnapshot(gameRoom, botConfig);
        // TODO: update snapshot
        return timeSlice;
    },
}