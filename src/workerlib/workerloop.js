
//top level : implements worker logic

const gameManager = require('./control/gamemanager');
const messageManager = require('./message/messagemanager');
const workerState = require('./state/workerstate');
// const bot_route_utility = require('./botRouteUtility');

//bots always ave instruction: guard, follow, go

module.exports = {


    processGames: function() {
        if(playerManager.connectedPlayerCount > 0 && this.isGameRunning){
            this.processPlayers();
            
            // console.log('=== completed processing players');
            var timeSlice;// processActionResolution;refreshWorldInterval
            var remainingTimeForThisRefreshCycle = this.deltaTimeForRefresh; // remainig time for current refresh cycle.
            
            // update building life cycle:
            for(var i = 0; i < workerstate.buildingArray.length; ++i){
                if(workerstate.buildingArray[i].life <= 0 && workerstate.buildingArray[i].isActive){ // bots that died in last cycle.
                    // this.processBot(i, timeSlice);
                    // var botConfig = this.botArray[i];
                    // // console.log('5');
                    // this.instructBot(workerstate.buildingArray[i], 'die', null);
                    if(workerstate.buildingArray[i].type == 'base'){
                        this.terminateGame(workerstate.buildingArray[i]);
                        this.refreshWorld();
                        // return;
                    }
                    // console.log('building:' + workerstate.buildingArray[i].id + ' DIED.');
                    workerstate.buildingArray[i].isActive = false;
                    var update = {};
                    update.action = 'die';
                    update.botType = workerstate.buildingArray[i].type;
                    update.x = workerstate.buildingArray[i].position.x;
                    update.z = workerstate.buildingArray[i].position.z;
                    this.latestSnapshot[workerstate.buildingArray[i].id] = update;
                    this.isStateUpdated = true;
                }
            }
            // update bot life cycle
            for(var i = 0; i < this.maxBotCount; ++i){
                if(workerstate.botArray[i].life <= 0 && workerstate.botArray[i].isActive){ // bots that died in last cycle.
                    // this.processBot(i, timeSlice);
                    // var botConfig = this.botArray[i];
                    // // console.log('6');
                    this.instructBot(workerstate.botArray[i], 'die', null);
                    // workerstate.botArray[i].isActive = false;
                    // console.log('bot:' + workerstate.botArray[i].id + ' DIED.');
                }
            }
            do{
                // console.log('--))start do loop with : remainingTimeForThisRefreshCycle = ' + remainingTimeForThisRefreshCycle);
                if(remainingTimeForThisRefreshCycle <= this.processActionResolution){
                    timeSlice = remainingTimeForThisRefreshCycle;
                    remainingTimeForThisRefreshCycle = 0;
                }else{
                    timeSlice = this.processActionResolution;
                    remainingTimeForThisRefreshCycle = remainingTimeForThisRefreshCycle - this.processActionResolution;
                }
                for(var i = 0; i < this.maxBotCount; ++i){
                    if(workerstate.botArray[i].isActive == true){
                        this.processBot(i, timeSlice);
                        // var botConfig = this.botArray[i];
                    }
                    // this.processBot(i, timeSlice); /// process all bots : active, inactive.
                }
                // // console.log('end do loop');
            }while(remainingTimeForThisRefreshCycle > 0);
        }
    },


    engineLoop: function(){
        // console.log('=========>refreshWorld');
        // var messageList = mainThreadStub.messagebuffer;
        if(mainThreadStub.messagebuffer.length > 0){
            this.processNewMessages();
        }
        if(this.isStateUpdated){
            this.latestSnapshot = {};
            this.isStateUpdated = false;
        }
        var currentTime = math_util.getCurrentTime();
        this.deltaTimeForRefresh = currentTime - this.lastLoopExecutionTimeStamp;
        this.lastLoopExecutionTimeStamp = currentTime;
        
        this.processGames();
        
        if(this.isStateUpdated){
            this.sendSnapshotUpdateToMain();
        }
        

        let timeElapsed = math_util.getCurrentTime() - this.lastLoopExecutionTimeStamp;
        // // console.log('refreshWorld time duration:' + timeElapsed);
        if(timeElapsed > this.refreshWorldInterval){
            setTimeout((()=>{this.engineLoop()}), 0);
        }else{
            setTimeout((()=>{this.engineLoop()}), this.refreshWorldInterval - timeElapsed);
        }
    },


    
    init: function(){
        gameManager.init();
        messageManager.init();
        workerState.init();

        
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