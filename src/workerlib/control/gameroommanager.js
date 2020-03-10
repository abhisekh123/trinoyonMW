
// operation related to maintaining datastructure for game rooms.

const workerState = require('../state/workerstate');
const utilityFunctions = require('../../utils/utilityfunctions');
const environmentState = require('../../../dist/server/state/environmentstate');
const gameRoomAssetManager = require('./gameroomassetmanager');
const aiManager = require('./ai/aimanager');

module.exports = {
    worldConfig: null,
    itemConfig: null,

    init: function() {
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
        this.initialiseRooms();
    },

    /**
     * game progress / refresh
     */

    processBuildings: function(gameRoom){
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
    },

    processBots: function(gameRoom){

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

            var timeSlice;// processActionResolution;refreshWorldInterval
            var remainingTimeForThisRefreshCycle = this.deltaTimeForRefresh; // remainig time for current refresh cycle.
            
            
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
    },

    processPlayers: function(gameRoom){
        // // console.log('process players.', playerManager.playerArray);
        for(var i = 0; i < environmentState.maxPlayerPerTeam; ++i){ // populate room with generic players of team 1.
            if(gameRoom.players_1[i].isAIDriven){
                aiManager.Player.processPlayerAI(gameRoom.players_1[i], gameRoom);
            }
            if(gameRoom.players_2[i].isAIDriven){
                aiManager.Player.processPlayerAI(gameRoom.players_2[i], gameRoom);
            }
        }
    },


    /**
     * DS CRUD Operations.
     */

    initialiseRooms: function(){
        for(var i = 0; i < environmentState.maxGameCount; ++i){ // intialise each game room
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
            for(var j = 0; j < environmentState.maxPlayerPerTeam; ++j){ // populate room with generic players of team 1.
                var team = 1;
                var playerId = 'player_' + j;
                gameRoom.players_1.push(gameRoomAssetManager.getGenericPlayerObject(playerId, team, i));
            }
            for(var j = environmentState.maxPlayerPerTeam; j < (environmentState.maxPlayerPerTeam * 2); ++j){ // populate room with generic players of team 2.
                var team = 2;
                var playerId = 'player_' + j;
                gameRoom.players_2.push(gameRoomAssetManager.getGenericPlayerObject(playerId, team, i));
            }
            gameRoom.startTime = null;
            workerState.games[i] = gameRoom;
        }
        
    },

    resetGame: function(gameRoom) {
        // const gameRoom = workerState.games(indexParam);
        // gameRoom.isActive = false;
        // gameRoom.startTime = null;

        // building 1
        for(var i = 0; i < gameRoom.buildings_1.length; ++i){
            const building = gameRoom.buildings_1[i];
            building.life = workerState.buildingMap_1[building.id].life;
            building.isActive = true;
        }

        // building 2
        for(var i = 0; i < gameRoom.buildings_2.length; ++i){
            const building = gameRoom.buildings_2[i];
            building.life = workerState.buildingMap_2[building.id].life;
            building.isActive = true;
        }

        // players 1
        for(var i = 0; i < gameRoom.players_1.length; ++i){
            const player = gameRoom.players_1[i];
            player.userId = null;
            player.isConnected = false;
            player.lastCommunication = 0;
            player.joinTime = 0;
            player.isAIDriven = true;
        }

        // players 2
        for(var i = 0; i < gameRoom.players_2.length; ++i){
            const player = gameRoom.players_2[i];
            player.userId = null;
            player.isConnected = false;
            player.lastCommunication = 0;
            player.joinTime = 0;
            player.isAIDriven = true;
        }

    }
}