const workerState = require('../../state/workerstate');

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
        var currentPositionX = null;
        var currentPositionZ = null;

        var newPositionX = null;
        var newPositionZ = null;

        switch (botConfig.action) {
            case 'goto':
            case 'march':
                currentPositionX = botConfig.actionData[botConfig.actionData.length - 1][0];
                currentPositionZ = botConfig.actionData[botConfig.actionData.length - 1][1];
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
                snapShotManager.add_BotRespawn_Event(gameRoom, botConfig);
                // nothing to do as the bot does not occupy any position in grid
                break;
            default:
                console.log('ERROR: Unknown botConfig.action:', botConfig.action);
                break;
        }

        switch (action) {
            case 'goto':
            case 'march':
                newPositionX = actionData[actionData.length - 1][0];
                newPositionZ = actionData[actionData.length - 1][1];
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

                snapShotManager.add_BotDie_Event(gameRoom, botConfig);
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
        objectConfig.activityTimeStamp += objectConfig.attackinterval;

        // TODO: update snapshot 
    },

    traverseBotThroughPath: function (botConfig, timeSlice, gameRoom) {
        // ignore i = 0 as it is the starting position.
        let pathPosition = null;
        for (let i = 1; i < botConfig.actionData.length; i++) {
            pathPosition = botConfig.actionData[i];
            if (pathPosition[2] > workerState.currentTime) {
                pathPosition = botConfig.actionData[i - 1];
                botConfig.position[0] = pathPosition[0];
                botConfig.position[2] = pathPosition[1];
                botConfig.activityTimeStamp = pathPosition[2];
                return 0;
            }
        }
        pathPosition = botConfig.actionData[botConfig.actionData.length - 1];
        botConfig.position[0] = pathPosition[0];
        botConfig.position[2] = pathPosition[1];
        botConfig.activityTimeStamp = pathPosition[2];
        this.addActionToBot(botConfig, 'ready', null, gameRoom);
        timeSlice = workerState.currentTime - pathPosition[2];

        // TODO: update snapshot
        return timeSlice;
    },
}