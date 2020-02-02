
//top level : implements worker logic
const math_util = require(__dirname + '/../utils/misc_util');
const botroutemanager = require(__dirname + '/route/botroutemanager');
const snapshotmanager = require(__dirname + '/state/snapshotmanager');
const mainThreadStub = require(__dirname + '/mainthreadstub');
const playerManager = require(__dirname + '/control/playerManager');
const bot_route_utility = require('./route/botRouteUtility');
const workerstate = require('./state/workerstate');
// const bot_route_utility = require('./botRouteUtility');

//bots always ave instruction: guard, follow, go

module.exports = {
    lastTick: 0,
    refreshWorldInterval: workerstate.getWorldConfig().refreshWorldInterval, // refreshWorld() should run once every interval.
    processActionResolution: workerstate.getWorldConfig().processActionResolution, // for each refreshWorld() delta time will be broken into interval of this.
    simulationTicks:6,
    lastRefreshTimeStamp:0,
    deltaTimeForRefresh:0,
    maxRange:null,
    latestSnapshot:{},
    isStateUpdated:false,
    isGameRunning: true,
    

    maxBotCount: 0,
    maxBotPerPlayer: 0,
    maxPlayerCount: 0,
    // botArray: [],
    // botMap: {},

    initialiseConstantCache: function(){
    },


    sendSnapshotUpdateToMain: function(){
        var responseJSONString = mainThreadStub.getResponseEmptyPacket('update', this.latestSnapshot);
        mainThreadStub.postMessage(responseJSONString, '');
    },







    processNewMessages: function(){
        console.log('woreker@processNewMessages');
        var playerID = -1;
        for(var i = 0; i < mainThreadStub.messagebuffer.length; ++i){
            // // console.log(i + '>processNewMessages::' + mainThreadStub.messagebuffer[i]);
            var currentMessage = mainThreadStub.messagebuffer[i];
            if(currentMessage == null || currentMessage == undefined || currentMessage.type == undefined || currentMessage.type == null){
                continue;
            }
            switch(currentMessage.type){
                case 'action':
                    // // console.log('process action');
                    this.updateBotAction(currentMessage);
                    break;
                case 'request_game_admit':
                    console.log('request game admit');
                    var clientID = currentMessage.clientID;
                    var playerConfig = this.admitNewPlayer(clientID, false);
                    if(playerConfig != null){
                        currentMessage.type = 'request_game_admit_ack';
                        currentMessage = snapshotmanager.addSnapshot(currentMessage, playerConfig);
                        
                        // mainThreadStub.postMessage(currentMessage, '');
                        // this.refreshWorld();
                    }else{
                        currentMessage.type = 'request_game_admit_nack';
                        currentMessage.bots = [];
                        currentMessage.objects = {};
                        currentMessage.playerConfig = {};
                        // mainThreadStub.postMessage(currentMessage, '');
                    }
                    // console.log('---returning:', currentMessage);
                    console.log('player admitted successfully.');
                    mainThreadStub.postMessage(currentMessage, '');
                    break;
                case 'request_game_exit':
                case 'client_disconnected':
                    // console.log('process action:', currentMessage.type);
                    // this.updateBotAction(currentMessage);
                    // routine to send world details to main worker.
                    var clientID = currentMessage.clientID;

                    // console.log('get exit request from client:' + clientID);

                    playerID = playerManager.getPlayerID(clientID);
                    if(playerID == null || playerID == undefined){
                        console.error('ERROR removing player from worker with clientID:' + clientID + ' Client already not existing.');
                        return;
                    }
                    this.removePlayer(clientID);
                    playerManager.removePlayer(clientID);
                    break;
                default:
                    // console.log('ERROR@WebWorker:Received message with unknown type:' + currentMessage);
            }
        }

        mainThreadStub.messagebuffer.length = 0;
    },

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
        snapshotmanager.init();
        playerManager.init();
        this.maxPlayerCount = workerstate.getWorldConfig().commonConfig.maxPlayerCount;
        // console.log('init world @ worker logic. workerstate.getWorldConfig().commonConfig.maxBotCount:' + workerstate.getWorldConfig().commonConfig.maxBotCount);
        this.initialiseConstantCache();
        botroutemanager.prepareGrid();
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