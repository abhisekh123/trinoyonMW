
const workerState = require('../state/workerstate');
const utilityFunctions = require('../../utils/utilityfunctions');
const environmentState = require('../../../dist/server/state/environmentstate');
const gameAssetManager = require('./gameassetmanager');

module.exports = {
    worldConfig: null,
    itemConfig: null,

    init: function() {
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
        this.initialiseRooms();
    },

    initialiseRooms: function(){
        for(var i = 0; i < environmentState.maxGameCount; ++i){ // intialise each game room
            const gameRoom = {};
            gameRoom.buildings_1 = utilityFunctions.cloneObject(
                utilityFunctions.getObjectValues(workerState.buildingMap_1)
            );
            gameRoom.buildings_2 = utilityFunctions.cloneObject(
                utilityFunctions.getObjectValues(workerState.buildingMap_2)
            );
            gameRoom.isActive = false;
            gameRoom.players_1 = [];
            gameRoom.players_2 = [];
            for(var j = 0; j < environmentState.maxPlayerPerTeam; ++j){ // populate room with generic players of team 1.
                var team = 1;
                var playerId = 'player_' + j;
                gameRoom.players_1.push(gameAssetManager.getGenericPlayerObject(playerId, team, i));
            }
            for(var j = environmentState.maxPlayerPerTeam; j < (environmentState.maxPlayerPerTeam * 2); ++j){ // populate room with generic players of team 2.
                var team = 2;
                var playerId = 'player_' + j;
                gameRoom.players_2.push(gameAssetManager.getGenericPlayerObject(playerId, team, i));
            }
            gameRoom.startTime = null;
            workerState.games[i] = gameRoom;
        }
        
    },

    resetGame: function(gameRoom) {
        // const gameRoom = workerState.games(indexParam);
        gameRoom.isActive = false;
        gameRoom.startTime = null;

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