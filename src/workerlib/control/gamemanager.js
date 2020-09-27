
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

    processGames: function() {

        // console.log(workerState.gameRoomArray);

        // will start asmany games possible for given waiting list and free game rooms.
        for(var i = 0; i < environmentState.maxGameCount; ++i){ // intialise each game room
            const gameRoom = workerState.gameRoomArray[i];
            
            if(gameRoom.isActive == true){
                var timeElapsed = workerState.currentTime - gameRoom.gameStartTime;
                gameRoom.timeElapsed = timeElapsed;
                console.log('process games id:' + gameRoom.id + ' time elapsed:' + timeElapsed / 1000);
                if(timeElapsed > this.worldConfig.matchMaxTimeDuration){
                    console.log('terminating game at:workerState.currentTime = ', workerState.currentTime);
                    console.log('gameRoom.gameStartTime:', gameRoom.gameStartTime);
                    console.log('this.worldConfig.matchMaxTimeDuration:', this.worldConfig.matchMaxTimeDuration);
                    gameRoom.statistics.timeRemaining = 0;
                    gameRoomManager.terminateGame(gameRoom);
                    continue;
                } else {
                    gameRoom.statistics.timeRemaining = this.worldConfig.matchMaxTimeDuration - timeElapsed;
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
                
            }
        }

        // console.log('process games end');
    },

    createNewProximityGraph: function(gameRoom){
        // console.log('============================================');
        // console.log('============================================');
        // console.log('============================================');
        // console.log('createNewProximityGraph start');
        // console.log('============================================');
        // console.log('============================================');
        // console.log('============================================');
        // var totalItemCount = 0;
        gameRoom.allBotObjects = [];
        gameRoom.allBuildingObjects = [];
        gameRoom.allDynamicObjects = [];
        var indexCounter = 0;
        // players 1
        for (var i = 0; i < gameRoom.players_1.length; ++i) {
            const player = gameRoom.players_1[i];
            
            // totalItemCount += player.botObjectList.length;
            for (var j = 0; j < player.botObjectList.length; ++j) {
                gameRoom.allBotObjects.push(player.botObjectList[j]);
                gameRoom.allDynamicObjects.push(player.botObjectList[j]);
                player.botObjectList[j].globalIndex = indexCounter;
                ++indexCounter;
            }
        }

        // players 2
        for (var i = 0; i < gameRoom.players_2.length; ++i) {
            const player = gameRoom.players_2[i];
            // totalItemCount += player.botObjectList.length;
            for (var j = 0; j < player.botObjectList.length; ++j) {
                gameRoom.allBotObjects.push(player.botObjectList[j]);
                gameRoom.allDynamicObjects.push(player.botObjectList[j]);
                player.botObjectList[j].globalIndex = indexCounter;
                ++indexCounter;
            }
        }

        // indexCounter = 0;
        for (var i = 0; i < gameRoom.buildingArray_1.length; ++i) {
            var buildingConfig = gameRoom.buildingArray_1[i];
            gameRoom.allBuildingObjects.push(buildingConfig);
            gameRoom.allDynamicObjects.push(buildingConfig);
            buildingConfig.globalIndex = indexCounter;
            ++indexCounter;
            // ++totalItemCount;
        }

        for (var i = 0; i < gameRoom.buildingArray_2.length; ++i) {
            var buildingConfig = gameRoom.buildingArray_2[i];
            gameRoom.allBuildingObjects.push(buildingConfig);
            gameRoom.allDynamicObjects.push(buildingConfig);
            buildingConfig.globalIndex = indexCounter;
            ++indexCounter;
            // ++totalItemCount;
        }

        // console.log('total bot count:' + totalBotCount);

        gameRoom.proximityGraph = [];
        var distance = 0;
        for(var i = 0; i < indexCounter; ++i){ // row
            gameRoom.proximityGraph[i] = [];
            var sourceConfig = gameRoom.allDynamicObjects[i];
            for(var j = 0; j < indexCounter; ++j){ // col
                var destinationConfig = gameRoom.allDynamicObjects[j];
                if(sourceConfig.team == destinationConfig.team || i == j){
                    distance = this.worldConfig.gridSide + 1;
                } else {
                    distance = routeManager.getDistanceBetweenPoints(
                        sourceConfig.position[0],
                        sourceConfig.position[2],
                        destinationConfig.position[0],
                        destinationConfig.position[2],
                    );
                }
                // console.log('i:', i);
                // console.log('j:', j);
                // console.log('distance:', distance);
                gameRoom.proximityGraph[i][j] = {
                    distance: distance,
                    visibility: false,
                }
            }
        }
        // console.log('gameRoom.proximityGraph.length:', gameRoom.proximityGraph.length);
    },

    startNewGame: function(gameRoom, startTime) {
        console.log('starting new game room');
        // by this time all user admission is complete.
        gameRoom.gameStartTime = startTime;
        gameRoom.timeElapsed = 0;
        // ,,, reset ai players
        gameRoomAssetManager.resetAllBotPositionToStartingPosition(gameRoom);
        this.createNewProximityGraph(gameRoom);
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
        this.setNewStatisticsObject(gameRoom);
        
        snapShotManager.setNewSnapshotObject(gameRoom);
        messageManager.broadcastGameConfigToPlayers(gameRoom);

        console.log('game started:', workerState.userToPlayerMap);
    },

    setNewStatisticsObject: function(gameRoom){
        gameRoom.statistics = {
            towerCountTeam1: this.worldConfig.defenceTop.length,
            towerCountTeam2: this.worldConfig.defenceBottom.length,
            timeRemaining: this.worldConfig.matchMaxTimeDuration,
            performance: [
                {},// dummy entry so that array index match with team number (1 and 2)
                { // team 1 stats
                    death: 0, // total number of bot death
                    damage: 0 // total damage dealt to opposing team
                },
                { // team 2 stats
                    death: 0, 
                    damage: 0
                }
            ]
        }

        var detailedPerformance = [];

        for (var i = 0; i < gameRoom.players_1.length; ++i) {
            const playerConfig = gameRoom.players_1[i];
            var playerEntry = [];
            for (var j = 0; j < playerConfig.botObjectList.length; ++j) {
                var botObject = playerConfig.botObjectList[j];
                var botEntry = {
                    type: botObject.type,
                    totalDamageSinceSpawn: 0,
                    totalDamageSinceGameStart: 0,
                    totalBotKill: 0,
                    totalBuildingDestroy: 0,
                    totalDeath: 0,
                    levelHistory: [],
                }
                playerEntry.push(botEntry);
            }
            detailedPerformance.push(playerEntry);
        }
        // console.log('completed processing bot action for team 1');

        // players 2
        // console.log('start processing bot action for team 2');
        for (var i = 0; i < gameRoom.players_2.length; ++i) {
            const playerConfig = gameRoom.players_1[i];
            var playerEntry = [];
            for (var j = 0; j < playerConfig.botObjectList.length; ++j) {
                var botObject = playerConfig.botObjectList[j];
                var botEntry = {
                    type: botObject.type,
                    totalDamageSinceSpawn: 0,
                    totalDamageSinceGameStart: 0,
                    totalBotKill: 0,
                    totalBuildingDestroy: 0,
                    totalDeath: 0,
                    levelHistory: [],
                }
                playerEntry.push(botEntry);
            }
            detailedPerformance.push(playerEntry);
        }

        gameRoom.statistics.detailedPerformance = detailedPerformance;
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

                // workerState.playerFitCache["1"] = true;
                // workerState.playerFitCache["2"] = true;
                // workerState.playerFitCache["3"] = true;
                // workerState.playerFitCache["4"] = true;
                // workerState.playerFitCache["5"] = true;
                const admitResponse = gameRoomAssetManager.processWaitingUserAdmitRequests(gameRoom);
                if(admitResponse == false){
                    console.log('failed to admit players. skipping game start attempt for now.');
                    return;
                } else {
                    this.startNewGame(gameRoom, timeNow);
                }
                
                // break;
            }

            // TODO: would work without this also.
            if(workerState.waitingUsersLinkedList.isEmpty()){
                // console.log('no pending admit request.');
                break;
            }
        }
    },

    
    
}