
//top level : implements worker logic

const gameManager = require('./control/gamemanager');
// const playerManager = require('./control/playermanager');
const messageManager = require('./message/messagemanager');
const workerState = require('./state/workerstate');
const utilityFunctions = require('../utils/utilityfunctions');
const routeManager = require('./route/routemanager');
const environmentState = require('../../dist/server/state/environmentstate');
const snapShotManager = require('./state/snapshotmanager');
// const environmentState = require('../../../dist/server/state/environmentstate');
// const bot_route_utility = require('./botRouteUtility');


module.exports = {
    worldConfig: null,

    engineLoop: function(){
        // console.log('=========>refreshWorld');
        // var messageList = mainThreadStub.messagebuffer;

        // game will be simulated till this time in the current iteration.
        var currentTime = utilityFunctions.getCurrentTime();
        var totalTimeToSimulate = currentTime - workerState.timePreviousGameLoopStart;
        // this will be incremented stepwise in the while loop.
        workerState.currentTime = workerState.timePreviousGameLoopStart;
        
        
        if(mainThreadStub.messagebuffer.length > 0){
            messageManager.processIncomingMessages();
        }

        if(totalTimeToSimulate > 0){ 
            // console.log('total time to simulate:', totalTimeToSimulate);
            // reset the snapshot objects for all game rooms
            for(var i = 0; i < environmentState.maxGameCount; ++i){ // intialise each game room
                const gameRoom = workerState.gameRoomArray[i];
                if(gameRoom.isActive == false){
                    continue;
                }
                // console.log('updating snapshot for gameRoom:', gameRoom);
                snapShotManager.startNewSnapshotLoop(
                    workerState.timePreviousGameLoopStart,
                    currentTime,
                    gameRoom
                );
                // console.log('completed updating snapshot for gameRoom:');
            }
        }


        // console.log('=========>refreshWorld2, totalTimeToSimulate:', totalTimeToSimulate);
        while (totalTimeToSimulate > 0){
            // console.log('--))start do loop with : remainingTimeForThisRefreshCycle = ' + remainingTimeForThisRefreshCycle);
            if (totalTimeToSimulate <= workerState.gameLoopInterval) {
                workerState.timeIntervalToSimulateInEachGame = totalTimeToSimulate;
                workerState.currentTime += totalTimeToSimulate;
                totalTimeToSimulate = 0;
            } else {
                workerState.currentTime += workerState.gameLoopInterval;
                totalTimeToSimulate -= workerState.gameLoopInterval;
                workerState.timeIntervalToSimulateInEachGame = workerState.gameLoopInterval;
            }

            // console.log('workerState.timeIntervalToSimulateInEachGame', workerState.timeIntervalToSimulateInEachGame);
            // for (var i = 0; i < this.maxBotCount; ++i) {
            //     if (workerstate.botArray[i].isActive == true) {
            //         this.processBot(i, timeSlice);
            //         // var botConfig = this.botArray[i];
            //     }
            //     // this.processBot(i, timeSlice); /// process all bots : active, inactive.
            // }
            
            gameManager.processGames(currentTime);
            console.log('end while loop, totalTimeToSimulate:', totalTimeToSimulate);
        } 
        workerState.timePreviousGameLoopStart = currentTime;
        workerState.currentTime = currentTime;
        
        for(var i = 0; i < environmentState.maxGameCount; ++i){ // intialise each game room
            const gameRoom = workerState.gameRoomArray[i];
            if(gameRoom.isActive == false){
                continue;
            }
            console.log('updating snapshot for gameRoom:', gameRoom.id);
            messageManager.broadcastGameUpdatesToPlayers(gameRoom);
            // console.log('completed updating snapshot for gameRoom:');
        }
        // messageManager.broadcastGameUpdatesToPlayers();
        // console.log('=========>refreshWorld23');
        gameManager.tryStartingNewGames();
        // console.log('=========>refreshWorld24');

        // time taken to compute current snapshot for each game
        // will be used to schedule next iteration of engine loop
        let timeElapsed = utilityFunctions.getCurrentTime() - workerState.timePreviousGameLoopStart;
        // // console.log('refreshWorld time duration:' + timeElapsed);
        if(timeElapsed > workerState.gameLoopInterval){
            setTimeout((()=>{this.engineLoop()}), 0);
        }else{
            setTimeout((()=>{this.engineLoop()}), workerState.gameLoopInterval - timeElapsed);
        }
    },

    
    init: function(){
        // console.log('1');
        workerState.init();
        // console.log('112');
        routeManager.init();
        // console.log('113');
        gameManager.init();
        // console.log('114');
        // messageManager.init();
        this.worldConfig = workerState.getWorldConfig();
        // console.log('2');
        this.maxBotPerPlayer = this.worldConfig.commonConfig.maxBotPerPlayer;
        this.maxBotCount = this.worldConfig.commonConfig.maxBotCount;
        if(this.maxBotCount != this.worldConfig.commonConfig.maxBotPerPlayer * this.worldConfig.commonConfig.maxPlayerCount){
            console.error('!!!!!!ERROR:this.maxBotCount != world_config.commonConfig.maxBotPerPlayer * world_config.commonConfig.maxPlayerCount');
        }
        // console.log('13');
        //populating world with bots
        // this.initializeWorldByPopulatingWithBots();
        // // console.log(workerstate);
        // // console.log("workerstate: %j", workerstate);
        
        // console.log('complete world init.');
        workerState.timePreviousGameLoopStart = utilityFunctions.getCurrentTime();
        this.isGameRunning = true;
        // this.engineLoop();
        setTimeout((()=>{this.engineLoop()}), workerState.gameLoopInterval);
        console.log('server is up and ready to serve the humanity.');
    },
};