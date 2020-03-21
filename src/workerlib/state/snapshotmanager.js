
// const PF = require('pathfinding');
// const world_config = require(__dirname + '/../../ui/world_config');

// var fs = require('fs');
// const readline = require('readline');
const workerState = require('./workerstate');
// const environmentState = require('../../state/environmentstate');

module.exports = {

    init: function(){
    },

    // add_Regular_Event: function(gameRoom, buildingConfig){
    // },

    // for actions like goto, march
    updateBotSnapshot: function(gameRoom, botConfig){

        var snapShotObject = gameRoom.snapShot;
        var botSnapshotObject = snapShotObject.itemState[botConfig.id];

        botSnapshotObject.action = botConfig.action;
        // botSnapshotObject.actionData = null;

        // botSnapshotObject.deathTimestamp = workerState.currentTime;
        botSnapshotObject.activityTimeStamp = botConfig.activityTimeStamp;
        botSnapshotObject.isActive = true;
        botSnapshotObject.life = botConfig.life;

        botSnapshotObject.position[0] = botConfig.position[0];
        botSnapshotObject.position[1] = botConfig.position[1];
        botSnapshotObject.position[2] = botConfig.position[2];
    },

    // updateSnapshot_building: function(gameRoom, buildingConfig){
    // },


    processAttackEvent: function(gameRoom, sourceConfig, targetConfig){

        var eventObject = this.getGeneric_Event_SnapshotObject();
        eventObject.id = sourceConfig.id;
        eventObject.tid = targetConfig.id;
        eventObject.event = 'attack';
        eventObject.timestamp = workerState.currentTime;

        this.addEventToSnapshot(eventObject, gameRoom);


        var snapShotObject = gameRoom.snapShot;
        var botSnapshotObject = snapShotObject.itemState[targetConfig.id];
        botSnapshotObject.life = targetConfig.life;
    },

    registerBotDieEvent: function(gameRoom, botConfig){
        var snapShotObject = gameRoom.snapShot;
        var botSnapshotObject = snapShotObject.itemState[botConfig.id];

        // if(botSnapshotObject == undefined){
        //     botSnapshotObject = this.getGenericBotSnapshotObject();
        //     snapShotObject[botConfig.id] = botSnapshotObject;
        // }
        
        botSnapshotObject.action = 'die';
        botSnapshotObject.actionData = null;

        // botSnapshotObject.deathTimestamp = workerState.currentTime;
        botSnapshotObject.activityTimeStamp = workerState.currentTime;
        botSnapshotObject.isActive = false;

        var eventObject = this.getGeneric_Event_SnapshotObject();
        eventObject.id = botConfig.id;
        eventObject.event = 'die';
        eventObject.timestamp = workerState.currentTime;

        this.addEventToSnapshot(eventObject, gameRoom);

    },

    registerBotSpawnEvent: function(gameRoom, botConfig){
        var snapShotObject = gameRoom.snapShot;
        var botSnapshotObject = snapShotObject.itemState[botConfig.id];

        // if(botSnapshotObject == undefined){
        //     botSnapshotObject = this.getGenericBotSnapshotObject();
        //     snapShotObject[botConfig.id] = botSnapshotObject;
        // }
        
        botSnapshotObject.action = 'ready';
        // botSnapshotObject.actionData = null;

        // botSnapshotObject.deathTimestamp = workerState.currentTime;
        botSnapshotObject.activityTimeStamp = workerState.currentTime;
        botSnapshotObject.isActive = true;
        botSnapshotObject.life = botConfig.life;

        botSnapshotObject.position[0] = botConfig.position[0];
        botSnapshotObject.position[1] = botConfig.position[1];
        botSnapshotObject.position[2] = botConfig.position[2];

        var eventObject = this.getGeneric_Event_SnapshotObject();
        eventObject.id = botConfig.id;
        eventObject.event = 'spawn';
        eventObject.timestamp = workerState.currentTime;
        
        eventObject.position[0] = botConfig.position[0];
        eventObject.position[1] = botConfig.position[1];
        eventObject.position[2] = botConfig.position[2];

        this.addEventToSnapshot(eventObject, gameRoom);
    },

    add_BuildingTeamChange_Event: function(gameRoom, buildingConfig){
        var snapShotObject = gameRoom.snapShot;
        var itemSnapshotObject = snapShotObject.itemState[buildingConfig.id];

        // if(botSnapshotObject == undefined){
        //     botSnapshotObject = this.getGenericBotSnapshotObject();
        //     snapShotObject[botConfig.id] = botSnapshotObject;
        // }
        
        // botSnapshotObject.action = 'ready';
        // botSnapshotObject.actionData = null;

        // botSnapshotObject.deathTimestamp = workerState.currentTime;
        itemSnapshotObject.activityTimeStamp = workerState.currentTime;
        // itemSnapshotObject.isActive = true;
        itemSnapshotObject.life = buildingConfig.life;
        itemSnapshotObject.team = buildingConfig.team;

        var eventObject = this.getGeneric_Event_SnapshotObject();
        eventObject.id = buildingConfig.id;
        eventObject.event = 'cteam';
        eventObject.timestamp = workerState.currentTime;
        eventObject.position = buildingConfig.team;

        this.addEventToSnapshot(eventObject, gameRoom);
    },


    // private method
    addEventToSnapshot: function(eventObject, gameRoom){
        gameRoom.snapShot.eventsArray.push(eventObject);
    },

    getGeneric_Event_SnapshotObject: function(){
        return{
            id: null,
            event: null, // tattack, battack, die, spawn, cteam
            timestamp: 0,
            tid: null,
            eData: 0,
            position: [0,0,0],
        };
    },
    /**
     * REFRESH SNAPSHOT
     */

    startNewSnapshotLoop: function(startTime, endTime, gameRoom){
        gameRoom.snapShot.startTime = startTime;
        gameRoom.snapShot.currentTime = endTime;
        gameRoom.snapShot.eventsArray = [];
    },


    /**
     * FACTORY SNAPSHOT OBJECT
     */
    getGeneric_SnapshotObject: function(itemConfig){
        return{
            id: itemConfig.id,

            action: itemConfig.action,
            actionData: itemConfig.actionData,

            // deathTimestamp: workerState.currentTime,
            activityTimeStamp: workerState.currentTime,
            life: itemConfig.life,
            team: itemConfig.team,

            isActive: itemConfig.isActive,
            position: [
                itemConfig.position[0],
                itemConfig.position[1],
                itemConfig.position[2]
            ],
        };
    },

    // getGeneric_Building_SnapshotObject: function(buildingConfig){
    //     return{
    //         id: buildingConfig.id,

    //         deathTimestamp: workerState.currentTime,
    //         activityTimeStamp: workerState.currentTime,
    //         life: buildingConfig.life,
    //         team: buildingConfig.team,

    //         isActive: buildingConfig.isActive,
    //         position: [
    //             buildingConfig.position[0],
    //             buildingConfig.position[1],
    //             buildingConfig.position[2]
    //         ],
    //     };
    // },


    /**
     * INIT SNAPSHOT
     */

    setNewSnapshotObject: function(gameRoom){
        var snapShotObject = {};
        snapShotObject.gameStartTime = gameRoom.gameStartTime;
        snapShotObject.startTime = gameRoom.startTime;
        snapShotObject.currentTime = workerState.currentTime;
        snapShotObject.eventsArray = [];
        snapShotObject.itemState = {};
        snapShotObject.gameConfigArrayForPlayers = this.createGameConfigObjectForNewClients(gameRoom);

        // players 1
        for (var i = 0; i < gameRoom.players_1.length; ++i) {
            const playerConfig = gameRoom.players_1[i];
            for (var j = 0; j < playerConfig.botObjectList.length; ++j) {
                const botConfig = playerConfig.botObjectList[j];
                var botSnapshotObject = this.getGeneric_SnapshotObject(botConfig);
                snapShotObject.itemState[botSnapshotObject.id] = botSnapshotObject;
            }
        }

        // players 2
        for (var i = 0; i < gameRoom.players_2.length; ++i) {
            const playerConfig = gameRoom.players_2[i];
            for (var j = 0; j < playerConfig.botObjectList.length; ++j) {
                const botConfig = playerConfig.botObjectList[j];
                var botSnapshotObject = this.getGeneric_SnapshotObject(botConfig);
                snapShotObject.itemState[botSnapshotObject.id] = botSnapshotObject;
            }
        }

        // building 1
        for (var i = 0; i < gameRoom.buildingArray_1.length; ++i) {
            const buildingConfig = gameRoom.buildingArray_1[i];
            var buildingSnapshotObject = this.getGeneric_SnapshotObject(buildingConfig);
            snapShotObject.itemState[buildingSnapshotObject.id] = buildingSnapshotObject;
        }

        // building 2
        for (var i = 0; i < gameRoom.buildingArray_2.length; ++i) {
            const buildingConfig = gameRoom.buildingArray_2[i];
            var buildingSnapshotObject = this.getGeneric_SnapshotObject(buildingConfig);
            snapShotObject.itemState[buildingSnapshotObject.id] = buildingSnapshotObject;
        }
        gameRoom.snapShot = snapShotObject;
    },


    /**
     * FACTORY GAME CONFIG
     */


    createGameConfigObjectForNewClients: function(gameRoom){
        const gameConfigArray = [];

        for(var i = 0; i < gameRoom.players_1.length; ++i){
            const player = gameRoom.players_1[i];
            const playerConfig = {};
            playerConfig.id = player.id;
            playerConfig.team = player.team;
            playerConfig.botObjectList = this.extractBotObjectConfigInformation(player.botObjectList);
            gameConfigArray.push(playerConfig);
        }

        // players 2
        for(var i = 0; i < gameRoom.players_2.length; ++i){
            const player = gameRoom.players_2[i];
            const playerConfig = {};
            playerConfig.id = player.id;
            playerConfig.team = player.team;
            playerConfig.botObjectList = this.extractBotObjectConfigInformation(player.botObjectList);
            gameConfigArray.push(playerConfig);
        }

        return gameConfigArray;
    },

    extractBotObjectConfigInformation: function(botObjectListParam){
        const botConfigArray = [];
        // extract config information for each bot
        for(var i = 0; i < botObjectListParam.length; ++i){
            const configObject = {};
            configObject.id = botObjectListParam[i].id;
            configObject.type = botObjectListParam[i].type;
            configObject.position = botObjectListParam[i].position;
            configObject.rotation = botObjectListParam[i].rotation;
            botConfigArray.push(configObject);
        }
        return botConfigArray;
    },
}
