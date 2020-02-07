
const workerState = require('../state/workerstate');
const utilityFunctions = require('../../utils/utilityfunctions');
const environmentState = require('../state/environmentstate');

module.exports = {
    worldConfig: null,
    itemConfig: null,

    init: function() {
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
        this.initialiseRooms();
    },

    initialiseRooms: function(){
        for(var i = 0; i < environmentState.maxGameCount; ++i){
            const gameRoom = {};
            gameRoom.buildings = utilityFunctions.getObjectValues(workerState.buildingMap).clone();
            gameRoom.isActive = false;
            gameRoom.users = [];
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