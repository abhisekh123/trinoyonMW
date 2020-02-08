
//top level : implements worker logic

const gameManager = require('./control/gamemanager');
const playerManager = require('./control/playermanager');
const messageManager = require('./message/messagemanager');
const workerState = require('./state/workerstate');
const utilityFunctions = require('../utils/utilityfunctions');
const routeManager = require('./route/routemanager');
// const bot_route_utility = require('./botRouteUtility');

//bots always ave instruction: guard, follow, go

module.exports = {

    engineLoop: function(){
        // console.log('=========>refreshWorld');
        // var messageList = mainThreadStub.messagebuffer;
        workerState.currentTime = utilityFunctions.getCurrentTime();
        
        workerState.timeIntervalToSimulateInEachGame = workerState.currentTime - workerState.timePreviousGameLoopStart;
        workerState.timePreviousGameLoopStart = workerState.currentTime;
        if(mainThreadStub.messagebuffer.length > 0){
            messageManager.processIncomingMessages();
        }
        
        gameManager.processGames();
        
        messageManager.broadcastGameUpdatesToPlayers();
        playerManager.processWaitingUserAdmitRequests();

        let timeElapsed = math_util.getCurrentTime() - this.lastLoopExecutionTimeStamp;
        // // console.log('refreshWorld time duration:' + timeElapsed);
        if(timeElapsed > this.refreshWorldInterval){
            setTimeout((()=>{this.engineLoop()}), 0);
        }else{
            setTimeout((()=>{this.engineLoop()}), this.refreshWorldInterval - timeElapsed);
        }
    },


    
    init: function(){
        workerState.init();
        routeManager.init();
        gameManager.init();
        messageManager.init();
        
        
        this.maxBotPerPlayer = workerstate.getWorldConfig().commonConfig.maxBotPerPlayer;
        this.maxBotCount = workerstate.getWorldConfig().commonConfig.maxBotCount;
        if(this.maxBotCount != workerstate.getWorldConfig().commonConfig.maxBotPerPlayer * workerstate.getWorldConfig().commonConfig.maxPlayerCount){
            console.error('!!!!!!ERROR:this.maxBotCount != world_config.commonConfig.maxBotPerPlayer * world_config.commonConfig.maxPlayerCount');
        }

        //populating world with bots
        this.initializeWorldByPopulatingWithBots();
        // // console.log(workerstate);
        // // console.log("workerstate: %j", workerstate);
        this.isGameRunning = true;
        this.engineLoop();

        // console.log('complete world init.');
    },
};