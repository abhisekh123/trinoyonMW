
const worldConfig = require(__dirname + '/../../../ui/world_config');
const itemConfig = require(__dirname + '/../../../ui/item_config');
const utilityFunctions = require('../../utils/utilityfunctions');

module.exports = {

    // game
    games: [],

    // players
    // players: null,
    waitingUsersLinkedList: null,

    // user
    // waitingUserCount: 0,
    // waitingUserMap: {},

    // world
    grid: null,
    gridBackup: null,
    buildingMap_1: {},
    buildingArray_1: [],
    buildingMap_2: {},
    buildingArray_2: [],

    // constants / caches
    worldReferrenceModel: null, // this is referenced to create/reset world for new games.
    distanceMatrix: null,
    angleMatrix: null,
    strategyMatrix: null,

    // time
    timePreviousGameLoopStart: 0,
    timeLastGameCreationWasAttempted: 0,
    currentTime: 0,
    timeIntervalToSimulateInEachGame: 0, // time slice since last loop. Need to simulate each game for this interval.

    timeWhenLastAttemptWasMadeToProcessWaitingUsers: 0,
    minInterval_AttemptToProcessWaitingUsers: 5000, // in miliseconds

    customConfigs: {
        intervalForAttemptGameStart: 30000,
    },

    getWorldConfig: function() {
        return worldConfig;
    },
    getItemConfig: function() {
        return itemConfig;
    },

    init: function() {
        this.currentTime = utilityFunctions.getCurrentTime();
        this.timePreviousGameLoopStart = this.currentTime;
        this.timeLastGameCreationWasAttempted = this.currentTime;
    }
}