
// helper function to gameroommanager to provide/update different components of the game room.

const workerState = require('../state/workerstate');
var linkedList = require('../../utils/linkedlist');
const mainThreadStub = require('../mainthreadstub');
const utilityFunctions = require('../../utils/utilityfunctions');
const environmentState = require('../../../dist/server/state/environmentstate');

module.exports = {
    worldConfig: null,
    itemConfig: null,
    teamPrefferenceFlag: false,

    init: function(){
        // console.log('game room asset manager init');
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
        workerState.waitingUsersLinkedList = new linkedList();
    },


    canAdmitNewPlayer: function(){
        // TODO: add condition to check if server has started sutdown routine.
        const maxWaitingListSize = environmentState.maxGameCount * environmentState.maxPlayerPerTeam * 2;
        if(workerState.waitingUsersLinkedList.size < maxWaitingListSize){
            return true;
        } else {
            return false;
        }
    },

    addMMRUsersToWaitingList: function(userMessage) {
        // const userId = userMessage.userId;
        const mmrConfig = userMessage.mmrConfig;
        userMessage.players = [];

        for(var i = 0; i < environmentState.maxPlayerPerTeam; ++i){
            // check team 1
            if(mmrConfig.players_1[i] != null){
                userMessage.players.push(mmrConfig.players_1[i].id);
            }
            if(mmrConfig.players_2[i] != null){
                userMessage.players.push(mmrConfig.players_2[i].id);
            }
        }

        console.log('addUserToWaitingList mmr:', userMessage);

        if(this.canAdmitNewPlayer()){
            userMessage.timeWhenAddedToList = utilityFunctions.getCurrentTime();
            userMessage.sub = "mmr";
            workerState.waitingUsersLinkedList.add(userMessage);
            const estimatedTimeInSeconds = this.getPlayStartTimeEstimate();
            userMessage.estimatedTimeInSeconds = estimatedTimeInSeconds;
            userMessage.type = 'request_game_admit_ack';
            // mainThreadStub.postMessage(userMessage, '');
        } else {
            userMessage.type = 'request_game_admit_nack';
            // mainThreadStub.postMessage(userMessage, '');
        }
        mainThreadStub.postMessage(userMessage, '');
    },

    addUserToWaitingList: function(userMessage) {
        // const userId = userMessage.userId;
        userMessage.players = [userMessage.userId];
        console.log('addUserToWaitingList:', userMessage);

        if(this.canAdmitNewPlayer()){
            userMessage.timeWhenAddedToList = utilityFunctions.getCurrentTime();
            userMessage.sub = "individual";
            workerState.waitingUsersLinkedList.add(userMessage);
            const estimatedTimeInSeconds = this.getPlayStartTimeEstimate();
            userMessage.estimatedTimeInSeconds = estimatedTimeInSeconds;
            userMessage.type = 'request_game_admit_ack';
            // mainThreadStub.postMessage(userMessage, '');
        } else {
            userMessage.type = 'request_game_admit_nack';
            // mainThreadStub.postMessage(userMessage, '');
        }
        mainThreadStub.postMessage(userMessage, '');
    },

    getPlayStartTimeEstimate: function() {
        const gameMultiple = workerState.waitingUsersLinkedList.size / (environmentState.maxPlayerPerTeam * 2);
        return ((gameMultiple * workerState.minInterval_AttemptToStartNewGame) + 45000) / 1000; // estimate for seconds
        
    },

    /**
     * this method tries to admit as many waiting request possible to the input game room.
     */
    processWaitingUserAdmitRequests: function(gameRoom) {
        var response = false;

        // iterate through user list
        // TODO: is this validation needed?
        if(workerState.waitingUsersLinkedList.isEmpty()){
            console.log('no pending admit request.');
            return response;
        }
        // console.log('start processWaitingUserAdmitRequests');
        // workerState.waitingUsersLinkedList.printList();

        workerState.waitingUsersLinkedList.pointToHead();
        let currentNode = workerState.waitingUsersLinkedList.getCurrentNode();
        // let nextNode = null;

        // const gameMapPlayers = {};
        while(currentNode != null){ // search each request and try to admit to game.
            let admitResponse = null;
            if(currentNode.element.sub == 'mmr'){
                admitResponse = this.tryAdmitingNewMMRPlayersToGame(currentNode.element, gameRoom);
            }else{
                admitResponse = this.tryAdmitingNewPlayersToGame(currentNode.element, gameRoom);
            }
            
            if(!admitResponse){ // could not admit
                console.log('could not admit:', currentNode.element);
                // workerState.playerFitCache[currentNode.element.players.length] = false;
            }else{
                // admitted successfully. remove the current request node, move to next node.
                console.log('successfully admitted:', currentNode.element);
                currentNode = workerState.waitingUsersLinkedList.removeCurrentNode();
                
                response = true;
                continue;
            }
            // if(!workerState.playerFitCache[currentNode.element.players.length]){ // no point search
            //     console.log('!workerState.playerFitCache[currentNode.element.players.length');
            // } else {
            //     const admitResponse = this.tryAdmitingNewPlayersToGame(currentNode.element, gameRoom);
            //     if(!admitResponse){ // could not admit
            //         console.log('could not admit:', currentNode.element);
            //         workerState.playerFitCache[currentNode.element.players.length] = false;
            //     }else{
            //         // admitted successfully. remove the current request node, move to next node.
            //         console.log('successfully admitted:', currentNode.element);
            //         currentNode = workerState.waitingUsersLinkedList.removeCurrentNode();
                    
            //         response = true;
            //         continue;
            //     }
            // }
            currentNode = workerState.waitingUsersLinkedList.moveToNextNode();
            
        }

        // console.log('game room:', gameRoom);
        // console.log('returning:', response);
        return response;
    },


    tryAdmitingNewMMRPlayersToGame: function(admitRequest, gameRoom){
        console.log('tryAdmitingNewPlayersToGame:', admitRequest);
        const mmrConfig = admitRequest.mmrConfig;
        if(this.getEmptyPlayerSlotsInTeam(gameRoom.players_1) >= mmrConfig.players_1.length
            && this.getEmptyPlayerSlotsInTeam(gameRoom.players_2) >= mmrConfig.players_2.length){
                var player1Index = 0;
                var player2Index = 0;
                for(var i = 0; i < environmentState.maxPlayerPerTeam; ++i){
                    console.log('mmrConfig.players_1[i]:', mmrConfig.players_1[i]);
                    console.log('mmrConfig.players_2[i]:', mmrConfig.players_2[i]);
                    // check team 1
                    if(mmrConfig.players_1[i] != null){
                        while(gameRoom.players_1[player1Index].userId != null){
                            ++player1Index;
                        }
                        const selectedTeamPlayer = gameRoom.players_1[player1Index];
                        this.completePlayerAdmissionFormalities(selectedTeamPlayer, mmrConfig.players_1[i].id, mmrConfig.players_1[i].selection);
                    }
                    // check team 2
                    if(mmrConfig.players_2[i] != null){
                        while(gameRoom.players_2[player2Index].userId != null){
                            ++player2Index;
                        }
                        const selectedTeamPlayer = gameRoom.players_2[player2Index];
                        this.completePlayerAdmissionFormalities(selectedTeamPlayer, mmrConfig.players_2[i].id, mmrConfig.players_2[i].selection);
                    }

                }
            return true;
        } else {
            return false;
        }
    },

    tryAdmitingNewPlayersToGame: function(admitRequest, gameRoom){
        console.log('tryAdmitingNewPlayersToGame:', admitRequest);
        const usersToJoin = admitRequest.players;
        let selectedTeam = null;

        this.teamPrefferenceFlag = !this.teamPrefferenceFlag; // change the team prefference first.
        if(this.teamPrefferenceFlag){ // try adding to team 1 first
            if(this.getEmptyPlayerSlotsInTeam(gameRoom.players_1) >= usersToJoin.length){
                selectedTeam = gameRoom.players_1;
            } else {
                if(this.getEmptyPlayerSlotsInTeam(gameRoom.players_2) >= usersToJoin.length){
                    selectedTeam = gameRoom.players_2;
                }else{
                    return false;
                }
            }
        }else{ // try adding to team 2 first
            if(this.getEmptyPlayerSlotsInTeam(gameRoom.players_2) >= usersToJoin.length){
                selectedTeam = gameRoom.players_2;
            } else {
                if(this.getEmptyPlayerSlotsInTeam(gameRoom.players_1) >= usersToJoin.length){
                    selectedTeam = gameRoom.players_1;
                }else{
                    return false;
                }
            }
        }
        
        // let usersToJoinIndex = 0;
        // at this point we know that selected team has enough vacancy to accomodate all 'usersToJoin'
        var j = 0;
        for(var i = 0; i < usersToJoin.length; ++i){ // for each requested user
            
            let newUserToAdmit = usersToJoin[i];
            for(; j < environmentState.maxPlayerPerTeam;){ // search for the next empty slot
                const selectedTeamPlayer = selectedTeam[j];
                ++j;
                if(selectedTeamPlayer.userId == null){ // found an empty slot. admitting the new player.
                    this.completePlayerAdmissionFormalities(selectedTeamPlayer, newUserToAdmit, admitRequest.selection);
                    break;// process next player to join.
                }
            }
        }


        return true;
    },

    /**
     * update ds in the game regarding player admission.
     */
    completePlayerAdmissionFormalities: function(gameRoomPlayerConfig, userId, botSelection) {
        gameRoomPlayerConfig.userId = userId;
        gameRoomPlayerConfig.botList = botSelection.botList;
        gameRoomPlayerConfig.hero = botSelection.hero;

        gameRoomPlayerConfig.isConnected = true;
        gameRoomPlayerConfig.lastCommunication = workerState.currentTime;
        gameRoomPlayerConfig.isAIDriven = false;

        console.log('selectedTeamPlayer:', gameRoomPlayerConfig);
        this.setBotObjectAttributes(gameRoomPlayerConfig.hero, gameRoomPlayerConfig.botObjectList[0]); // rewrite the hero bot object with new hero config.
        for(var i = 0; i < gameRoomPlayerConfig.botList.length; ++i){
            this.setBotObjectAttributes(gameRoomPlayerConfig.botList[i], gameRoomPlayerConfig.botObjectList[i + 1]);
        }

        workerState.userToPlayerMap[userId] = gameRoomPlayerConfig;
        
    },

    resetPlayer: function(gameRoomPlayerConfig){
        if(gameRoomPlayerConfig.userId != null){
            workerState.userToPlayerMap[gameRoomPlayerConfig.userId] = null;
            gameRoomPlayerConfig.userId = null;
        }
        
        gameRoomPlayerConfig.isConnected = false;
        gameRoomPlayerConfig.lastCommunication = 0;
        gameRoomPlayerConfig.joinTime = 0;
        gameRoomPlayerConfig.isAIDriven = true;
    },


    /**
     * objects CRUD operation
     */

    getEmptyPlayerSlotsInTeam: function(players) {
        let freeSlot = 0;
        for(var j = 0; j < environmentState.maxPlayerPerTeam; ++j){ // Test if team 1 has vacancy.
            const currentPlayer = players[j];
            if(currentPlayer.userId == null){
                // aiPlayerArray.push(currentPlayer);
                ++freeSlot;
            }
            // if(freeSlot >= usersToJoin.length){
            //     break;
            // }
        }
        return freeSlot;
    },

    resetAllBotPositionToStartingPosition: function(gameRoom) {
        // players 1
        for(var i = 0; i < gameRoom.players_1.length; ++i){
            const player = gameRoom.players_1[i];
            // player.userId = null;
            // player.isConnected = true;
            player.lastCommunication = gameRoom.startTime;
            player.joinTime = gameRoom.startTime;
            // player.isAIDriven = true;
            this.resetAllBotsOfPlayerToStartingState(player, this.worldConfig.topBasePlayerPosition[i], Math.PI, gameRoom.gameStartTime);
        }

        // players 2
        for(var i = 0; i < gameRoom.players_2.length; ++i){
            const player = gameRoom.players_2[i];
            // player.userId = null;
            // player.isConnected = true;
            player.lastCommunication = gameRoom.startTime;
            player.joinTime = gameRoom.startTime;
            // player.isAIDriven = true;
            this.resetAllBotsOfPlayerToStartingState(player, this.worldConfig.bottomBasePlayerPosition[i], 0, gameRoom.gameStartTime);
        }
    },

    resetAllBotsOfPlayerToStartingState: function(player, position, rotation, gameStartTime){ // position : [x,z]
        var relativeY = 1;
        if(player.team == 2){
            relativeY = -1;
        }
        var relativePositionArray = [
            [0,0,0],
            [-1,0,0],
            [1,0,0],
            [-1,0,relativeY],
            [1,0,relativeY],
        ];
        for(var i = 0; i < player.botObjectList.length; ++i){
            player.botObjectList[i].position[0] = position[0] + relativePositionArray[i][0];
            player.botObjectList[i].position[2] = position[1] + relativePositionArray[i][2];

            // update respawn position for future use
            player.botObjectList[i].spawnPosition[0] = position[0] + relativePositionArray[i][0];
            player.botObjectList[i].spawnPosition[2] = position[1] + relativePositionArray[i][2];

            player.botObjectList[i].rotation = rotation;
            player.botObjectList[i].activityTimeStamp = gameStartTime;
            player.botObjectList[i].positionUpdateTimeStamp = gameStartTime;
        }
    },

    getGenericPlayerObject: function(playerIndex, playerTeam, gameId){
        var playerID = 'player_' + playerIndex;
        const playerObject = {
            id: playerID,
            index: playerIndex,
            userId: null,
            team: playerTeam,
            isConnected: false,
            gameId: gameId,
            lastCommunication: 0,
            joinTime: 0,
            botList: ['swordman', 'swordman', 'archer', 'archer'],
            hero: 'lion',
            botObjectList: [],
            isAIDriven: true,
        };

        playerObject.botObjectList.push(this.setBotObjectAttributes(playerObject.hero, {}));
        for(var i = 0; i < playerObject.botList.length; ++i){
            playerObject.botObjectList.push(this.setBotObjectAttributes(playerObject.botList[i], {}));
        }

        // setup id for each bot
        for(var i = 0; i < playerObject.botObjectList.length; ++i){
            playerObject.botObjectList[i].id = playerID + '_' + i;
            playerObject.botObjectList[i].team = playerTeam;
            playerObject.botObjectList[i].player = playerID;
            playerObject.botObjectList[i].index = i;
            playerObject.botObjectList[i].playerIndex = playerIndex;
        }

        return playerObject;
    },

    setBotObjectAttributes: function(botType, botObject){
        // const returnJSON = {};
        const botTypeItemConfig = this.itemConfig.items[botType];
        if(botTypeItemConfig == null || botTypeItemConfig == undefined){
            console.log('ERROR: no item config found for type:', botTypeItemConfig);
            return botObject;
        } // TODO: add else and set details for default type.

        // data related to bot type config.
        botObject.type = botType;

        botObject.attackinterval = botTypeItemConfig.attackinterval;
        botObject.attack = botTypeItemConfig.levelMap[0].attack;
        // botObject.attackTimestamp = 0;

        var botSpeed = botTypeItemConfig.levelMap[0].speed;
        var botLife = botTypeItemConfig.levelMap[0].life;

        botObject.life = botLife;
        botObject.fullLife = botLife;

        botObject.speed = botSpeed; //one tile per 1000 ms.
        // times are in miliseconds. but speed is in meter/second
        botObject.diagonalTime = utilityFunctions.roundTo2Decimal((1.414 * 1000) / botSpeed);
        botObject.adjacentTime = utilityFunctions.roundTo2Decimal((1 * 1000) / botSpeed);
        // botObject.strideDistance = botTypeItemConfig.strideDistance;
        // botObject.strideTime = botTypeItemConfig.strideTime;

        botObject.sight = botTypeItemConfig.sight;
        botObject.range = botTypeItemConfig.range;

        // botObject.residueTimeslice = 0;
        // botObject.deathTimestamp = 0;
        botObject.activityTimeStamp = 0;
        botObject.positionUpdateTimeStamp = 0;

        botObject.isActive = true;
        botObject.respawnTime = botTypeItemConfig.respawnTime;
        botObject.spawnPosition = [0, 0, 0];

        // botObject.visibleToEnemyCount = 0;

        // data related to game play runtime
        botObject.position = [0, 0, 0];
        botObject.rotation = 0;

        botObject.action = null;
        
        botObject.actionData = null;
        // botObject.deltaTime = 0;

        // botObject.totalDamageSinceSpawn = 0;
        // botObject.totalDamageSinceGameStart = 0;
        botObject.level = 0;
        botObject.levelMap = utilityFunctions.cloneObject(botTypeItemConfig.levelMap);
        botObject.ability = utilityFunctions.cloneObject(botTypeItemConfig.ability);
        for(var i = 0; i < botObject.ability.length; ++i){
            var abilityItem = botObject.ability[i];
            botObject[abilityItem.key] = this.worldConfig.constants.ABILITY_AVAILABLE;
        }
        return botObject;
    }


}