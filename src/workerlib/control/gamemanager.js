
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
const routeManager = require('../route/routemanager');

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
            
            if(gameRoom.isActive == true){
                // console.log('process games id:', gameRoom.id);
                if((workerState.currentTime - gameRoom.gameStartTime) > this.worldConfig.matchMaxTimeDuration){
                    console.log('workerState.currentTime:', workerState.currentTime);
                    console.log('gameRoom.gameStartTime:', gameRoom.gameStartTime);
                    console.log('this.worldConfig.matchMaxTimeDuration:', this.worldConfig.matchMaxTimeDuration);
                    gameRoomManager.terminateGame(gameRoom);
                    continue;
                }
                // console.log('completed processing players.');
                gameRoomManager.processBuildings(gameRoom); // attack if enemy in range
                // console.log('completed processing buildings.');
                // priorities:
                // 1>perform actions
                // 2>help each other 
                // 3>go near hero bot
                gameRoomManager.processBots(gameRoom); 
                gameRoomManager.processPlayers(gameRoom); // send hero to new location of all bots are idle.

                // console.log('completed processing bots.');
                if(refreshVisibilityFlag == true){
                    gameRoomManager.refreshVisibility(gameRoom);
                }
            }
        }

        // console.log('process games end');
    },

    createNewBotGraph: function(gameRoom){
        console.log('createNewBotGraph start');
        var totalBotCount = 0;
        gameRoom.allBotObjects = [];
        var indexCounter = 0;
        // players 1
        for (var i = 0; i < gameRoom.players_1.length; ++i) {
            const player = gameRoom.players_1[i];
            
            totalBotCount += player.botObjectList.length;
            for (var j = 0; j < player.botObjectList.length; ++j) {
                gameRoom.allBotObjects.push(player.botObjectList[j]);
                player.botObjectList[j].globalIndex = indexCounter;
                ++indexCounter;
            }
        }

        // players 2
        for (var i = 0; i < gameRoom.players_2.length; ++i) {
            const player = gameRoom.players_2[i];
            totalBotCount += player.botObjectList.length;
            for (var j = 0; j < player.botObjectList.length; ++j) {
                gameRoom.allBotObjects.push(player.botObjectList[j]);
                player.botObjectList[j].globalIndex = indexCounter;
                ++indexCounter;
            }
        }

        console.log('total bot count:' + totalBotCount);

        gameRoom.botGraph = [];
        for(var i = 0; i < totalBotCount; ++i){ // row
            gameRoom.botGraph[i] = [];
            for(var j = 0; j < totalBotCount; ++j){ // col
                if(i == j){
                    continue;
                }
                var sourceBot = gameRoom.allBotObjects[i];
                var destinationBot = gameRoom.allBotObjects[j];
                if(sourceBot.team == destinationBot.team){
                    continue;
                }
                var distance = routeManager.getDistanceBetweenPoints(
                    sourceBot.position[0],
                    sourceBot.position[2],
                    destinationBot.position[0],
                    destinationBot.position[2],
                );
                gameRoom.botGraph[i][j] = {
                    distance: distance,
                    visibility: false,
                }
            }
        }
    },

    startNewGame: function(gameRoom, startTime) {
        console.log('starting new game room');
        // by this time all user admission is complete.
        gameRoom.gameStartTime = startTime;
        // ,,, reset ai players
        gameRoomAssetManager.resetAllBotPositionToStartingPosition(gameRoom);
        this.createNewBotGraph(gameRoom);
        // console.log(gameRoom);
        // utilityFunctions.printEntireObjectNeatyle(gameRoom);
        // console.log('gameRoom.buildingArray_1');
        // utilityFunctions.printEntireObjectNeatyle(gameRoom.buildingArray_1);
        // console.log('gameRoom.buildingArray_2');
        // utilityFunctions.printEntireObjectNeatyle(gameRoom.buildingArray_2);
        // console.log('gameRoom.players_1');
        // utilityFunctions.printEntireObjectNeatyle(gameRoom.players_1);
        // console.log('gameRoom.players_2');
        // utilityFunctions.printEntireObjectNeatyle(gameRoom.players_2);
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