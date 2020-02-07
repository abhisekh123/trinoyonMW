
const world_config = require(__dirname + '/../../../ui/world_config');
const item_config = require(__dirname + '/../../../ui/item_config');
const utilityFunctions = require('../../utils/utilityfunctions');

module.exports = {

    // game
    games: [],

    // world
    grid: null,
    gridBackup: null,
    buildingMap: {},
    buildingArray: [],

    // constants / caches
    worldReferrenceModel: null, // this is referenced to create/reset world for new games.
    distanceMatrix: null,
    angleMatrix: null,
    strategyMatrix: null,

    // time
    timePreviousGameLoopStart: 0,
    timeLastGameCreationWasAttempted: 0,
    currentTime: 0,
    timeIntervalToSimulateInEachGame: 0,

    customConfigs: {
        intervalForAttemptGameStart: 30000,
    },

    

    // user
    waitingUserCount: 0,
    waitingUserMap: {},

    getWorldConfig: function() {
        return world_config;
    },
    getItemConfig: function() {
        return item_config;
    },

    init: function() {
        this.currentTime = utilityFunctions.getCurrentTime();
        this.timePreviousGameLoopStart = this.currentTime;
        this.timeLastGameCreationWasAttempted = this.currentTime;
    }
}