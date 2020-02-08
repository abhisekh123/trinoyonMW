
const workerState = require('../state/workerstate');
const utilityFunctions = require('../../utils/utilityfunctions');
const environmentState = require('../state/environmentstate');
const playerManager = require('./playermanager');

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
            gameRoom.buildings_1 = utilityFunctions.getObjectValues(workerState.buildingMap_1).clone();
            gameRoom.buildings_2 = utilityFunctions.getObjectValues(workerState.buildingMap_2).clone();
            gameRoom.isActive = false;
            gameRoom.players_1 = [];
            gameRoom.players_2 = [];
            for(var j = 0; j < 5; ++j){ // populate room with generic players of team 1.
                var team = 1;
                var playerId = 'player_' + j;
                gameRoom.players_1.push(playerManager.getGenericPlayerObject(playerId, team, i));
            }
            for(var j = 5; j < 10; ++j){ // populate room with generic players of team 2.
                var team = 2;
                var playerId = 'player_' + j;
                gameRoom.players_2.push(playerManager.getGenericPlayerObject(playerId, team, i));
            }
            gameRoom.startTime = null;
            gameRoom.bots = [];
            workerState.games = gameRoom;
        }
        
    },

    resetGame: function(indexParam) {
        const gameRoom = workerState.games(indexParam);
        gameRoom.bots = [];
        gameRoom.isActive = false;
        gameRoom.users = [];
        gameRoom.startTime = null;

        for(var i = 0; i < gameRoom.buildings.length; ++i){
            const building = gameRoom.buildings[i];
            building.life = workerState.buildingMap[building.id].life;
            building.isActive = true;
        }
    }
}