// operation related to maintaining datastructure for game rooms.

const workerState = require('../state/workerstate');
const utilityFunctions = require('../../utils/utilityfunctions');
const environmentState = require('../../../dist/server/state/environmentstate');
const gameRoomAssetManager = require('./gameroomassetmanager');
const aiManager = require('./ai/aimanager');

module.exports = {
    worldConfig: null,
    itemConfig: null,

    init: function () {
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
        this.initialiseRooms();
    },

    /**
     * game progress / refresh
     */

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
            // this.instructBot(workerstate.buildingArray[i], 'die', null);
            if (buildingConfig.type == 'base') {
                this.terminateGame(gameRoom, {
                    loosingTeam: buildingConfig.team
                });
                this.resetGame(gameRoom);
                // return;
            }
            // console.log('building:' + workerstate.buildingArray[i].id + ' DIED.');
            buildingConfig.isActive = false;
            buildingConfig.team = 0;
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

    // BOTS

    processBots: function (gameRoom) {

        // update bot life cycle
        // players 1
        for (var i = 0; i < gameRoom.players_1.length; ++i) {
            const playerConfig = gameRoom.players_1[i];
            for (var j = 0; j < playerConfig.botObjectList.length; ++j) {
                const botConfig = playerConfig.botObjectList[j];
                this.processBotLifeCycle(botConfig, gameRoom);
            }
        }

        // players 2
        for (var i = 0; i < gameRoom.players_2.length; ++i) {
            const playerConfig = gameRoom.players_2[i];
            for (var j = 0; j < playerConfig.botObjectList.length; ++j) {
                const botConfig = playerConfig.botObjectList[j];
                this.processBotLifeCycle(botConfig, gameRoom);
            }
        }
        
    },

    processBotLifeCycle: function(playerConfig, gameRoom) {
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

    processBotLifeCycle_Old: function(playerConfig, gameRoom) {
        for (var i = 0; i < playerConfig.botObjectList.length; ++i) {
            var botConfig = playerConfig.botObjectList[i];
            if (botConfig.life <= 0 && botConfig.isActive) { // bots that died in last cycle.
                // this.processBot(i, timeSlice);
                // var botConfig = this.botArray[i];
                // // console.log('6');
                this.instructBot(botConfig, 'die', null);,,,
                // workerstate.botArray[i].isActive = false;
                // console.log('bot:' + workerstate.botArray[i].id + ' DIED.');
            }
        }

        var timeSlice; // processActionResolution;refreshWorldInterval
        var remainingTimeForThisRefreshCycle = this.deltaTimeForRefresh; // remainig time for current refresh cycle.


        do {
            // console.log('--))start do loop with : remainingTimeForThisRefreshCycle = ' + remainingTimeForThisRefreshCycle);
            if (remainingTimeForThisRefreshCycle <= this.processActionResolution) {
                timeSlice = remainingTimeForThisRefreshCycle;
                remainingTimeForThisRefreshCycle = 0;
            } else {
                timeSlice = this.processActionResolution;
                remainingTimeForThisRefreshCycle = remainingTimeForThisRefreshCycle - this.processActionResolution;
            }
            for (var i = 0; i < this.maxBotCount; ++i) {
                if (workerstate.botArray[i].isActive == true) {
                    this.processBot(i, timeSlice);
                    // var botConfig = this.botArray[i];
                }
                // this.processBot(i, timeSlice); /// process all bots : active, inactive.
            }
            // // console.log('end do loop');
        } while (remainingTimeForThisRefreshCycle > 0);
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
        for (var i = 0; i < environmentState.maxGameCount; ++i) { // intialise each game room
            const gameRoom = {};
            // gameRoom.buildings_1 = utilityFunctions.cloneObject(
            //     utilityFunctions.getObjectValues(workerState.buildingMap_1)
            // );
            // gameRoom.buildings_2 = utilityFunctions.cloneObject(
            //     utilityFunctions.getObjectValues(workerState.buildingMap_2)
            // );
            gameRoom.buildingArray_1 = utilityFunctions.cloneObject(
                utilityFunctions.getObjectValues(workerState.buildingArray_1)
            );
            gameRoom.buildingArray_2 = utilityFunctions.cloneObject(
                utilityFunctions.getObjectValues(workerState.buildingArray_2)
            );

            gameRoom.isActive = false;
            gameRoom.players_1 = [];
            gameRoom.players_2 = [];
            for (var j = 0; j < environmentState.maxPlayerPerTeam; ++j) { // populate room with generic players of team 1.
                var team = 1;
                var playerId = 'player_' + j;
                gameRoom.players_1.push(gameRoomAssetManager.getGenericPlayerObject(playerId, team, i));
            }
            for (var j = environmentState.maxPlayerPerTeam; j < (environmentState.maxPlayerPerTeam * 2); ++j) { // populate room with generic players of team 2.
                var team = 2;
                var playerId = 'player_' + j;
                gameRoom.players_2.push(gameRoomAssetManager.getGenericPlayerObject(playerId, team, i));
            }
            gameRoom.startTime = null;
            workerState.games[i] = gameRoom;
        }

    },

    resetGame: function (gameRoom) {
        // const gameRoom = workerState.games(indexParam);
        // gameRoom.isActive = false;
        // gameRoom.startTime = null;

        // building 1
        for (var i = 0; i < gameRoom.buildings_1.length; ++i) {
            const building = gameRoom.buildings_1[i];
            building.life = workerState.buildingMap_1[building.id].life;
            building.isActive = true;
        }

        // building 2
        for (var i = 0; i < gameRoom.buildings_2.length; ++i) {
            const building = gameRoom.buildings_2[i];
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

    terminateGame(gameRoom, gameResultObject) { // either base destroyed or time completed.
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