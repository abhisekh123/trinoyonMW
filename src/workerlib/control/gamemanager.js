
// logical operation for lifecycle for all games.

const workerState = require('../state/workerstate');
const utilityFunctions = require('../../utils/utilityfunctions');
const gameRoomManager = require('./gameroommanager');
const gameRoomAssetManager = require('./gameroomassetmanager');
const environmentState = require('../../../dist/server/state/environmentstate');
const messageManager = require('../message/messagemanager');
const aiManager = require('./ai/aimanager');
const actionManager = require('./action/actionmanager');
const snapShotManager = require('../state/snapshotmanager');

module.exports = {
    worldConfig: null,
    // itemConfig: null,
    // this.maxPlayerCount = workerstate.getWorldConfig().commonConfig.maxPlayerCount;
    init: function(){
        // console.log('11q');
        this.worldConfig = workerState.getWorldConfig();
        // this.itemConfig = workerState.getItemConfig();
        // console.log('11r');
        aiManager.init();
        // console.log('11l');
        actionManager.init();
        // console.log('11t');
        // create refference world
        gameRoomAssetManager.init();
        // console.log('11v');
        gameRoomManager.init();
    },

    processGames: function(currentTimeParam) {
        var refreshVisibilityFlag = false;
        // console.log('process games start');
        //refresh visibility?
        if((workerState.currentTime - workerState.timeLastrefReshVisibilityWasAttempted) > workerState.refreshVisibilityInterval){
            workerState.timeLastrefReshVisibilityWasAttempted = workerState.currentTime;
            refreshVisibilityFlag = true;
        }

        // console.log(workerState.gameRoomArray);

        // will start asmany games possible for given waiting list and free game rooms.
        for(var i = 0; i < environmentState.maxGameCount; ++i){ // intialise each game room
            const gameRoom = workerState.gameRoomArray[i];
            // console.log('process games i:', i);
            
            if(gameRoom.isActive == true){

                if((workerState.currentTime - gameRoom.startTime) > this.worldConfig.matchMaxTimeDuration){
                    this.terminateGame(gameRoom);
                    continue;
                }

                gameRoomManager.processPlayers(gameRoom); // send hero to new location of all bots are idle.
                gameRoomManager.processBuildings(gameRoom); // attack if enemy in range
                // priorities:
                // 1>perform actions
                // 2>help each other 
                // 3>go near hero bot
                gameRoomManager.processBots(gameRoom); 

                if(refreshVisibilityFlag == true){
                    gameRoomManager.refreshVisibility(gameRoom);
                }
            }
        }

        // console.log('process games end');
    },


    startNewGame: function(gameRoom, startTime) {
        console.log('starting new game room');
        // by this time all user admission is complete.
        gameRoom.startTime = startTime;
        // ,,, reset ai players
        gameRoomAssetManager.resetAllBotPositionToStartingPosition(gameRoom);
        // console.log(gameRoom);
        // utilityFunctions.printEntireObjectNeatyle(gameRoom);
        gameRoom.isActive = true;
        snapShotManager.setNewSnapshotObject(gameRoom);
        messageManager.broadcastGameConfigToPlayers(gameRoom);
    },

    tryStartingNewGames: function() {
        // test time stamp to see if it is too early.
        const timeNow = utilityFunctions.getCurrentTime();
        if((timeNow - workerState.timeWhenLastAttemptWasMadeToStartNewGame) < workerState.minInterval_AttemptToStartNewGame){
            // too early. will try next time.
            // console.log('too early to tryStartingNewGames. doing nothing');
            return;
        }else{
            workerState.timeWhenLastAttemptWasMadeToStartNewGame = timeNow;
        }
        // console.log('processWaitingUserAdmitRequests');
        // iterate through user list
        if(workerState.waitingUsersLinkedList.isEmpty()){
            // console.log('no pending admit request.');
            return;
        }

        // find if there is any empty slot to start new game
        // let foundVacantGameRoom = false;
        // will start asmany games possible for given waiting list and free game rooms.
        for(var i = 0; i < environmentState.maxGameCount; ++i){ // intialise each game room
            const gameRoom = workerState.gameRoomArray[i];
            // console.log('<<' + i + '>>', gameRoom);

            if(gameRoom.isActive == false){
                console.log('found an empty gameroom. trying to start');

                workerState.playerFitCache["1"] = true;
                workerState.playerFitCache["2"] = true;
                workerState.playerFitCache["3"] = true;
                const admitResponse = gameRoomAssetManager.processWaitingUserAdmitRequests(gameRoom);
                if(admitResponse == false){
                    console.log('failed to admit players. skipping game start attempt for now.');
                    return;
                } else {
                    this.startNewGame(gameRoom, timeNow);
                }
                
                // break;
            }
        }
    },

    
    
}