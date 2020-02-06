
const world_config = require(__dirname + '/../../../ui/world_config');
const item_config = require(__dirname + '/../../../ui/item_config');
const utilityFunctions = require('../../utils/utilityfunctions');

module.exports = {
    timePreviousGameLoopStart: 0,
    timeLastGameCreationWasAttempted: 0,
    currentTime: 0,
    timeIntervalToSimulateInEachGame: 0,

    customConfigs: {
        intervalForAttemptGameStart: 30000,
    },

    distanceMatrix: null,
    angleMatrix: null,

    waitingUserCount: 0,
    waitingUserMap: {},

    games: [],
    grid: null,
    gridBackup: null,
    strategyMatrix: null,
    buildingMap: {},
    buildingArray: [],

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