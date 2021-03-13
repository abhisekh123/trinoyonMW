
const worldConfig = require(__dirname + '/../../../ui/world_config');
const itemConfig = require(__dirname + '/../../../ui/item_config');
const utilityFunctions = require('../../utils/utilityfunctions');

module.exports = {

    // game
    gameRoomArray: [],

    // players
    // players: null,
    waitingUsersLinkedList: null,
    userToPlayerMap: {}, // need to be removed
    userState: {

    },

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
    // playerFitCache: { // will be reset by game start routine @ game manager.
    //     1: true,
    //     2: true,
    //     3: true,
    // }, 

    // time
    timePreviousGameLoopStart: 0,
    gameLoopInterval: 600,
    gameLoopMaxTimeoutInterval: 500,
    timeLastGameCreationWasAttempted: 0,
    currentTime: 0,
    timeIntervalToSimulateInEachGame: 0, // time slice since last loop. Need to simulate each game for this interval.

    // timeWhenLastAttemptWasMadeToProcessWaitingUsers: 0,
    // minInterval_AttemptToProcessWaitingUsers: 5000, // in miliseconds
    timeWhenLastAttemptWasMadeToStartNewGame: 0,
    minInterval_AttemptToStartNewGame: 15000, // in miliseconds


    // methods
    getWorldConfig: function() {
        return worldConfig;
    },
    getItemConfig: function() {
        return itemConfig;
    },

    isUserPlayingNow: function(userId){
        var playerConfig = this.userToPlayerMap[userId];
        if(playerConfig == null || playerConfig == undefined){
            return false;
        } else {
            return true;
        }
    },

    processUserConnectionDropEvent: function(userId){
        var playerConfig = this.userToPlayerMap[userId];
        if(playerConfig == undefined || playerConfig == null){
            // console.log('user not playing. nothng to do for disconnect event');
            return;
        }
        playerConfig.isAIDriven = true;
        playerConfig.isConnected = false;
    },

    processUserReconnectEvent: function(userId){
        var playerConfig = this.userToPlayerMap[userId];
        if(playerConfig == undefined || playerConfig == null){
            // console.log('user not playing. nothng to do for disconnect event');
            return;
        }
        playerConfig.isAIDriven = false;
        playerConfig.isConnected = true;
        playerConfig.lastCommunication = this.currentTime;
        // TODO: send game config to player(incase browser page was refreshed ... tricky)
    },

    init: function() {
        this.currentTime = utilityFunctions.getCurrentTime();
        this.timePreviousGameLoopStart = this.currentTime;
        this.timeLastGameCreationWasAttempted = this.currentTime;
    }
}