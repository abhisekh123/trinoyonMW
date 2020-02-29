
// logical operation for game lifecycle

const workerState = require('../state/workerstate');
const utilityFunctions = require('../../utils/utilityfunctions');
const gameRoomManager = require('./gameroommanager');
const gameRoomAssetManager = require('./gameroomassetmanager');
const environmentState = require('../../../dist/server/state/environmentstate');
const messageManager = require('../message/messagemanager');

module.exports = {
    // this.maxPlayerCount = workerstate.getWorldConfig().commonConfig.maxPlayerCount;
    init: function(){
        // create refference world
        gameRoomAssetManager.init();
        gameRoomManager.init();
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
        // by this time all user admission is complete.
        gameRoom.startTime = startTime;
        // ,,, reset ai players
        gameRoomAssetManager.resetAllBotPositionToStartingPosition(gameRoom);
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

            if(gameRoom.isActive = false){
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

    processGames: function() {
        if(gameRoomAssetManager.connectedPlayerCount > 0 && this.isGameRunning){
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
    
    

    initializeWorldByPopulatingWithBots: function(){
        // // console.log('gameRoomAssetManager.playerArrey:', gameRoomAssetManager.playerArrey);
        for (let index = 0; index < workerstate.getWorldConfig().characters.length; index++) {
            const characterConfig = workerstate.getWorldConfig().characters[index];
            var botType = characterConfig.type;
            var botItemConfig = workerstate.getItemConfig().characters[botType];
            // // console.log('characterConfig.playerID:', characterConfig.playerID);
            var playerConfig = gameRoomAssetManager.playerArrey[characterConfig.playerID - 1];

            if(characterConfig.isLeader){
                playerConfig.leaderBotID = characterConfig.id;
            }else{
                playerConfig.botIDList.push(characterConfig.id);
            }

            var botObject = {
                timeelapsedincurrentaction:0,
                isActive:true,
                isAIDriven:false,
                id:characterConfig.id,
                isLeader: characterConfig.isLeader,
                shotfired:0,
                botRouteIndex:0,
                targetbotid:null,
                // currentweapon:botItemConfig.attachmentmesh[0],
                nextweapon:null,
                backupinstruction:null,
                // weaponinventory:botItemConfig.attachmentmesh,
                life:botItemConfig.life,
                attack: botItemConfig.attack,
                attackinterval: botItemConfig.attackinterval,
                spawnDuration: botItemConfig.spawnDuration,
                damageincurred:0,
                speed: botItemConfig.speed,
                range: botItemConfig.range,
                engagedEnemyTarget: null,
                engagedEnemyType: null,
                type: 'bot',
                botType: botType,
                team:characterConfig.team,
                playerID:characterConfig.playerID,
                botIndex: index,
                instruction: {
                    type: 'idle'
                },
                // currentBot.instruction.type = 'idle',
                payload:{
                    teamColor:playerConfig.teamColor,
                    type:botType,
                    // team:characterConfig.team,
                    position:[
                        characterConfig.position.x, 
                        characterConfig.position.y, 
                        characterConfig.position.z
                    ],
                    rotation:0,
                },
            };
            // // console.log('admitting new bot at initialization:', botObject.payload.position);
            workerstate.botArray[index] = botObject;
            workerstate.botMap[characterConfig.id] = botObject;
            this.admitNewBot(index);
        }
    },
    
}