
// logical operation for lifecycle for all games.

const workerState = require('../state/workerstate');
const utilityFunctions = require('../../utils/utilityfunctions');
const gameRoomManager = require('./gameroommanager');
const gameRoomAssetManager = require('./gameroomassetmanager');
const environmentState = require('../../../dist/server/state/environmentstate');
const messageManager = require('../message/messagemanager');
const aiManager = require('./ai/aimanager');

module.exports = {
    worldConfig: null,
    // itemConfig: null,
    // this.maxPlayerCount = workerstate.getWorldConfig().commonConfig.maxPlayerCount;
    init: function(){

        this.worldConfig = workerState.getWorldConfig();
        // this.itemConfig = workerState.getItemConfig();

        aiManager.init();
        
        // create refference world
        gameRoomAssetManager.init();
        gameRoomManager.init();
    },

    processGames: function() {
        // will start asmany games possible for given waiting list and free game rooms.
        for(var i = 0; i < environmentState.maxGameCount; ++i){ // intialise each game room
            const gameRoom = workerState.games[i];
            // console.log('<<' + i + '>>', gameRoom);

            if(gameRoom.isActive == true){
                if((gameRoom.startTime - workerState.currentTime) < this.worldConfig.matchMaxTimeDuration){
                    this.terminateGame(gameRoom);
                    continue;
                }

                gameRoomManager.processPlayers(gameRoom);
                gameRoomManager.processBuildings(gameRoom);
                gameRoomManager.processBots(gameRoom);
            }
        }
    },

    terminateGame(gameRoom){
        gameRoomManager.resetGame(gameRoom);


        // old code
        var loosingTeam = itemConfigParam.team;
        var update = {};
        update.action = 'over';
        update.loosingTeam = loosingTeam;
        update.x = 0;
        update.z = 0;
        this.latestSnapshot[itemConfigParam.id] = update;
        this.isStateUpdated = true;
        // this.isGameRunning = false;
        this.sendSnapshotUpdateToMain();

        // reset game
        gameRoomAssetManager.reset();

        for (let index = 0; index < workerstate.getWorldConfig().characters.length; index++) {
            const characterConfig = workerstate.getWorldConfig().characters[index];
            var botObject = workerstate.botArray[index];
            botObject.payload.position[0] = characterConfig.position.x;
            botObject.payload.position[2] = characterConfig.position.z;
            botObject.life = characterConfig.life;
        }
        
        for (let index = 0; index < workerstate.buildingArray.length; index++) {
            var buildingType = workerstate.buildingArray[index].type;
            var buildingItemConfig = workerstate.getItemConfig().buildings[buildingType];
            workerstate.buildingArray[i].life = buildingItemConfig.life;;
            workerstate.buildingArray[i].isActive = true;
        }
    },


    startNewGame: function(gameRoom, startTime) {
        console.log('starting new game room');
        // by this time all user admission is complete.
        gameRoom.startTime = startTime;
        // ,,, reset ai players
        gameRoomAssetManager.resetAllBotPositionToStartingPosition(gameRoom);
        // console.log(gameRoom);
        utilityFunctions.printEntireObjectNeatyle(gameRoom);
        gameRoom.isActive = true;

        messageManager.broadCompleteGameConfigToPlayers(gameRoom);
    },

    tryStartingNewGame: function() {
        // test time stamp to see if it is too early.
        const timeNow = utilityFunctions.getCurrentTime();
        if((timeNow - workerState.timeWhenLastAttemptWasMadeToStartNewGame) < workerState.minInterval_AttemptToStartNewGame){
            // too early. will try next time.
            // console.log('too early to tryStartingNewGame. doing nothing');
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
            const gameRoom = workerState.games[i];
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