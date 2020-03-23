// operation related to maintaining datastructure for game rooms.

const workerState = require('../state/workerstate');
const utilityFunctions = require('../../utils/utilityfunctions');
const environmentState = require('../../../dist/server/state/environmentstate');
const gameRoomAssetManager = require('./gameroomassetmanager');
const aiManager = require('./ai/aimanager');
const actionManager = require('./action/actionmanager');
const snapShotManager = require('../state/snapshotmanager');

module.exports = {
    worldConfig: null,
    itemConfig: null,

    init: function () {
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
        this.initialiseRooms();
    },

    refreshVisibility: function(gameRoom){
        // TODO : 
    },

    /**
     * game progress / refresh
     */

    
    // BOTS

    processBots: function (gameRoom) {

        // update bot life cycle. 
        // All bots who died / respawned during previous iteration interval are processed simultaniously.
        // players 1
        // console.log('start processing bot life cycle for team 1');
        for (var i = 0; i < gameRoom.players_1.length; ++i) {
            const playerConfig = gameRoom.players_1[i];
            for (var j = 0; j < playerConfig.botObjectList.length; ++j) {
                const botConfig = playerConfig.botObjectList[j];
                this.processBotLifeCycle(botConfig, gameRoom);
            }
        }
        // console.log('completed processing bot life cycle for team 1');

        // players 2
        // console.log('start processing bot life cycle for team 2');
        for (var i = 0; i < gameRoom.players_2.length; ++i) {
            const playerConfig = gameRoom.players_2[i];
            for (var j = 0; j < playerConfig.botObjectList.length; ++j) {
                const botConfig = playerConfig.botObjectList[j];
                this.processBotLifeCycle(botConfig, gameRoom);
            }
        }
        // console.log('completed processing bot life cycle for team 2');

        // All bots execute action even if they die during the current iteration interval.
        // this is to make result independent of sequence at which the bots are executed.
        // process bot action
        // console.log('start processing bot action for team 1');
        for (var i = 0; i < gameRoom.players_1.length; ++i) {
            const playerConfig = gameRoom.players_1[i];
            for (var j = 0; j < playerConfig.botObjectList.length; ++j) {
                const botConfig = playerConfig.botObjectList[j];
                if(botConfig.isActive == false){
                    continue;
                }
                this.processBotAction(playerConfig, gameRoom, j);
            }
        }
        // console.log('completed processing bot action for team 1');

        // players 2
        // console.log('start processing bot action for team 2');
        for (var i = 0; i < gameRoom.players_2.length; ++i) {
            const playerConfig = gameRoom.players_2[i];
            for (var j = 0; j < playerConfig.botObjectList.length; ++j) {
                const botConfig = playerConfig.botObjectList[j];
                if(botConfig.isActive == false){
                    continue;
                }
                this.processBotAction(playerConfig, gameRoom, j);
            }
        }
        // console.log('completed processing bot action for team 2');
    },


    processBotAction: function(playerConfig, gameRoom, botIndex) {
        // console.log('botaction for index:', botIndex);
        // const botConfig = playerConfig.botObjectList[botIndex];
        // try consuming the timeslice by performing action
        // deciding action does not consume time.
        var timeSlice = workerState.timeIntervalToSimulateInEachGame;
        while(timeSlice > 0){ 
            // console.log('timeSlice:', timeSlice);
            // if(botConfig.action == 'march' || botConfig.action == 'goto'){
            //     // console.log('action:' + botConfig.id);
            //     timeSlice = actionManager.Bot.continuePerformingAction(botConfig, gameRoom, timeSlice);
            // }else{// standing idle. This is executed for idle user bot.
            //     // // console.log('else');
            //     // timeSlice = 0;
            //     timeSlice = aiManager.Bot.processAI(playerConfig, botIndex, gameRoom, timeSlice);
            // }
            timeSlice = aiManager.Bot.processAI(playerConfig, botIndex, gameRoom, timeSlice);
            // console.log('timeSlice returned:', timeSlice);
        }
    },

    processBotLifeCycle: function(botConfig, gameRoom) {
        // if bot is inactive, check if can spawn. return.
        if(botConfig.isActive == false){
            // check if eligible to respawn
            if((workerState.currentTime - botConfig.activityTimeStamp) > botConfig.respawnTime){
                actionManager.actionUtility.addActionToBot(botConfig, 'ready', null, gameRoom);
                return;
            }
        }

        

        if (botConfig.life <= 0 && botConfig.isActive == true) { // bots that died in last cycle.
            actionManager.actionUtility.addActionToBot(botConfig, 'die', null, gameRoom);
            return;
        }
    },


    // BUILDINGS

    processBuildings: function (gameRoom) {
        // update building life cycle:
        for (var i = 0; i < gameRoom.buildingArray_1.length; ++i) {
            var buildingConfig = gameRoom.buildingArray_1[i];
            this.processBuildingLifeCycle(buildingConfig, gameRoom);
        }

        for (var i = 0; i < gameRoom.buildingArray_2.length; ++i) {
            var buildingConfig = gameRoom.buildingArray_2[i];
            this.processBuildingLifeCycle(buildingConfig, gameRoom);
        }
    },


    processBuildingLifeCycle: function (buildingConfig, gameRoom) {
        // life:this.itemConfig.items.base.life,
        //     attack:this.itemConfig.items.base.attack,
        //     type:'base',
        //     isActive: true,
        //     team:1,
        if (buildingConfig.team == 0) {
            // nothing to do for now
            return;
        }
        if (buildingConfig.life <= 0 && buildingConfig.isActive) { // bots that died in last cycle.
            // this.processBot(i, timeSlice);
            // var botConfig = this.botArray[i];
            // // console.log('5');
            if (buildingConfig.type == 'base') {
                console.log('base destroyed.');
                this.terminateGame(gameRoom, {
                    loosingTeam: buildingConfig.team
                });
                // this.resetGame(gameRoom);
                return;
            }
            // console.log('building:' + workerstate.buildingArray[i].id + ' DIED.');
            buildingConfig.isActive = false;
            buildingConfig.team = 0;

            snapShotManager.add_BuildingTeamChange_Event(gameRoom, buildingConfig);
            // var update = {};
            // update.action = 'die';
            // update.botType = workerstate.buildingArray[i].type;
            // update.x = workerstate.buildingArray[i].position.x;
            // update.z = workerstate.buildingArray[i].position.z;
            // this.latestSnapshot[workerstate.buildingArray[i].id] = update;
            // this.isStateUpdated = true;
            return;
        }
        if (buildingConfig.type == 'base') {
            aiManager.Base.processAI(buildingConfig, gameRoom);
        } else {
            aiManager.Tower.processAI(buildingConfig, gameRoom);
        }

    },

    // PLAYERS

    processPlayers: function (gameRoom) {
        // // console.log('process players.', playerManager.playerArray);
        for (var i = 0; i < environmentState.maxPlayerPerTeam; ++i) { // populate room with generic players of team 1.
            if (gameRoom.players_1[i].isAIDriven) {
                aiManager.Player.processAI(gameRoom.players_1[i], gameRoom);
            }
            if (gameRoom.players_2[i].isAIDriven) {
                aiManager.Player.processAI(gameRoom.players_2[i], gameRoom);
            }
        }
    },


    /**
     * DS CRUD Operations.
     */

    initialiseRooms: function () {
        // console.log('workerState.gameRoomArray:', workerState.gameRoomArray);
        for (var gameId = 0; gameId < environmentState.maxGameCount; ++gameId) { // intialise each game room
            const gameRoom = {};
            gameRoom.id = 'gameroom_' + gameId;
            gameRoom.timer = null;
            gameRoom.gameStartTime = 0;
            // console.log('init gameRoom:', gameId);


            var gridMatrix = new Array(this.worldConfig.gridSide);
            for(var i = 0; i < this.worldConfig.gridSide; ++i){ // x axis
                gridMatrix[i] = new Array(this.worldConfig.gridSide);
                for(var k = 0; k < this.worldConfig.gridSide; ++k){ // z axis
                    gridMatrix[i][k] = {
                        object: null
                    }
                }
            }
            gameRoom.gridMatrix = gridMatrix;
            

            // gameRoom.buildingArray_1 = utilityFunctions.cloneObject(
            //     utilityFunctions.getObjectValues(workerState.buildingMap_1)
            // );
            // gameRoom.buildingArray_2 = utilityFunctions.cloneObject(
            //     utilityFunctions.getObjectValues(workerState.buildingMap_2)
            // );
            gameRoom.buildingArray_1 = utilityFunctions.cloneObject(
                // utilityFunctions.getObjectValues(workerState.buildingArray_1)
                workerState.buildingArray_1
            );
            gameRoom.buildingArray_2 = utilityFunctions.cloneObject(
                // utilityFunctions.getObjectValues(workerState.buildingArray_2)
                workerState.buildingArray_2
            );

            // update grid
            // building 1
            for (var i = 0; i < gameRoom.buildingArray_1.length; ++i) {
                const building = gameRoom.buildingArray_1[i];
                gameRoom.gridMatrix[building.position[0]][building.position[2]].object = building;
            }

            // building 2
            for (var i = 0; i < gameRoom.buildingArray_2.length; ++i) {
                const building = gameRoom.buildingArray_2[i];
                gameRoom.gridMatrix[building.position[0]][building.position[2]].object = building;
            }

            // NOTE: We are not updating the grid position for bots. They will be updated when they move.

            gameRoom.isActive = false;
            gameRoom.players_1 = [];
            gameRoom.players_2 = [];
            for (var j = 0; j < environmentState.maxPlayerPerTeam; ++j) { // populate room with generic players of team 1.
                var team = 1;
                var playerId = 'player_' + j;
                gameRoom.players_1.push(gameRoomAssetManager.getGenericPlayerObject(playerId, team, gameId));
            }
            for (var j = environmentState.maxPlayerPerTeam; j < (environmentState.maxPlayerPerTeam * 2); ++j) { // populate room with generic players of team 2.
                var team = 2;
                var playerId = 'player_' + j;
                gameRoom.players_2.push(gameRoomAssetManager.getGenericPlayerObject(playerId, team, gameId));
            }
            gameRoom.startTime = null;
            // console.log('init gameRoom3:', gameId);
            workerState.gameRoomArray[gameId] = gameRoom;
            // console.log('init gameRoom4:', gameId);
        }
        // console.log('completed initialiseRooms', workerState.gameRoomArray);

    },

    resetGame: function (gameRoom) {
        // gameRoom.isActive = false;
        // gameRoom.startTime = null;

        // remove all entries except buildings and towers
        for(var i = 0; i < this.worldConfig.gridSide; ++i){ // x axis
            for(var k = 0; k < this.worldConfig.gridSide; ++k){ // z axis
                if(gameRoom.gridMatrix[i][k].object == undefined){
                    gameRoom.gridMatrix[i][k].object = null;
                }
                if(gameRoom.gridMatrix[i][k].object != null){
                    if(gameRoom.gridMatrix[i][k].object.type != 'tower' && gameRoom.gridMatrix[i][k].object.type != 'base'){
                        gameRoom.gridMatrix[i][k].object = null;
                    }
                }
            }
        }
        // gameRoom.gridMatrix = gridMatrix;

        // building 1
        for (var i = 0; i < gameRoom.buildingArray_1.length; ++i) {
            const building = gameRoom.buildingArray_1[i];
            building.life = workerState.buildingMap_1[building.id].life;
            building.isActive = true;
        }

        // building 2
        for (var i = 0; i < gameRoom.buildingArray_2.length; ++i) {
            const building = gameRoom.buildingArray_2[i];
            building.life = workerState.buildingMap_2[building.id].life;
            building.isActive = true;
        }

        // players 1
        for (var i = 0; i < gameRoom.players_1.length; ++i) {
            const player = gameRoom.players_1[i];
            player.userId = null;
            player.isConnected = false;
            player.lastCommunication = 0;
            player.joinTime = 0;
            player.isAIDriven = true;
        }

        // players 2
        for (var i = 0; i < gameRoom.players_2.length; ++i) {
            const player = gameRoom.players_2[i];
            player.userId = null;
            player.isConnected = false;
            player.lastCommunication = 0;
            player.joinTime = 0;
            player.isAIDriven = true;
        }

    },

    terminateGame: function(gameRoom, gameResultObject) { // either base destroyed or time completed.
        console.log('###################################');
        console.log('###################################');
        console.log('###################################');
        gameRoom.isActive = false;
        return;
        // gameRoomManager.resetGame(gameRoom);


        // old code
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
        gameRoomAssetManager.reset();

        for (let index = 0; index < workerstate.getWorldConfig().characters.length; index++) {
            const characterConfig = workerstate.getWorldConfig().characters[index];
            var botObject = workerstate.botArray[index];
            botObject.payload.position[0] = characterConfig.position.x;
            botObject.payload.position[2] = characterConfig.position.z;
            botObject.life = characterConfig.life;
        }

        for (let index = 0; index < workerstate.buildingArray.length; index++) {
            var buildingType = workerstate.buildingArray[index].type;
            var buildingItemConfig = workerstate.getItemConfig().buildings[buildingType];
            workerstate.buildingArray[i].life = buildingItemConfig.life;;
            workerstate.buildingArray[i].isActive = true;
        }
    },
}