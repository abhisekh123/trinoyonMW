
const worldConfig = require(__dirname + '/../../../ui/world_config');
const itemConfig = require(__dirname + '/../../../ui/item_config');
const utilityFunctions = require('../../utils/utilityfunctions');

module.exports = {

    // game
    games: [],

    // players
    // players: null,
    waitingUsersLinkedList: null,
    userToPlayerMap: {},

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
    // player count cache to optimise when too many request.
    // if false for a given player count in previous search attempt, 
    // then no need to seach games again for other request with same player count.
    playerFitCache: { // will be reset by game start routine @ game manager.
        1: true,
        2: true,
        3: true,
    }, 

    // time
    timePreviousGameLoopStart: 0,
    gameLoopInterval: 500,
    timeLastGameCreationWasAttempted: 0,
    currentTime: 0,
    timeIntervalToSimulateInEachGame: 0, // time slice since last loop. Need to simulate each game for this interval.

    timeWhenLastAttemptWasMadeToProcessWaitingUsers: 0,
    minInterval_AttemptToProcessWaitingUsers: 5000, // in miliseconds
    timeWhenLastAttemptWasMadeToStartNewGame: 0,
    minInterval_AttemptToStartNewGame: 15000, // in miliseconds


    // methods
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