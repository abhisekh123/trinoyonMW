
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

    
    removePlayer: function(userId){
        const playerID = playerManager.getPlayerID(userId);
        // const playerConfig = playerManager.playerArray[playerID];
        const botStartIndex = playerID * this.maxBotPerPlayer;

        // // console.log('botStartIndex:' + botStartIndex);
        for(var j = 0; j < this.maxBotPerPlayer; ++j){
            // workerstate.botArray[j + botStartIndex].isActive = true;
            // workerstate.botArray[j + botStartIndex].teamColor = playerConfig.teamColor;
            workerstate.botArray[j + botStartIndex].isAIDriven = true;
        }
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

    addUserToWaitingList: function(userMessage){
        // const userId = userMessage.userId;
        userMessage.players = [userMessage.userId];
        console.log('addUserToWaitingList:', userMessage);

        if(this.canAdmitNewPlayer()){
            userMessage.timeWhenAddedToList = utilityFunctions.getCurrentTime();
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

        /**
         * userMessage{
         *      userId
         *      users: [userId]
         * }
         */
    },

    getPlayStartTimeEstimate: function() {
        const gameMultiple = workerState.waitingUsersLinkedList.size / (environmentState.maxPlayerPerTeam * 2);
        return ((gameMultiple * workerState.minInterval_AttemptToStartNewGame) + 45000) / 1000; // estimate for seconds
        
    },

    processWaitingUserAdmitRequests: function(gameRoom) {
        var response = false;

        // iterate through user list
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
            
            if(!workerState.playerFitCache[currentNode.element.players.length]){// no point search
                console.log('!workerState.playerFitCache[currentNode.element.players.length');
            } else {
                const admitResponse = this.tryAdmitingNewPlayersToGame(currentNode.element, gameRoom);
                if(!admitResponse){ // could not admit
                    console.log('could not admit:', currentNode.element);
                    workerState.playerFitCache[currentNode.element.players.length] = false;
                }else{
                    // admitted successfully. remove the current request node, move to next node.
                    console.log('successfully admitted:', currentNode.element);
                    currentNode = workerState.waitingUsersLinkedList.removeCurrentNode();
                    
                    response = true;
                    continue;
                }
            }
            currentNode = workerState.waitingUsersLinkedList.moveToNextNode();
            
        }

        // console.log('game room:', gameRoom);
        // console.log('returning:', response);
        return response;
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


    removePlayer: function(userId){
        var playerID = this.getPlayerID(userId);
        this.playerArray[playerID].isActive = false;
        this.playerMap[userId] = undefined;
        this.playerMap.delete(userId);
        return;
    },

    /**
     * update ds in the game regarding player admission.
     */
    completePlayerAdmissionFormalities: function(selectedTeamPlayer, newUserToAdmit, botSelection) {
        selectedTeamPlayer.userId = newUserToAdmit;
        selectedTeamPlayer.botList = botSelection.botList;
        selectedTeamPlayer.hero = botSelection.hero;

        selectedTeamPlayer.isConnected = true;
        selectedTeamPlayer.lastCommunication = 0;
        selectedTeamPlayer.isAIDriven = false;

        console.log('selectedTeamPlayer:', selectedTeamPlayer);
        this.setBotObjectAttributes(selectedTeamPlayer.hero, selectedTeamPlayer.botObjectList[0]); // rewrite the hero bot object with new hero config.
        for(var i = 0; i < selectedTeamPlayer.botList.length; ++i){
            this.setBotObjectAttributes(selectedTeamPlayer.botList[i], selectedTeamPlayer.botObjectList[i + 1]);
        }

        workerState.userToPlayerMap[newUserToAdmit] = selectedTeamPlayer;
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

    getGenericPlayerObject: function(playerID, playerTeam, gameId){
        const playerObject = {
            id: playerID,
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
        botObject.attack = botTypeItemConfig.attack;
        // botObject.attackTimestamp = 0;

        botObject.life = botTypeItemConfig.life;
        botObject.fullLife = botTypeItemConfig.life;

        botObject.speed = botTypeItemConfig.speed; //one tile per 1000 ms.
        // times are in miliseconds. but speed is in meter/second
        botObject.diagonalTime = utilityFunctions.roundTo2Decimal((1.414 * 1000) / botObject.speed);
        botObject.adjacentTime = utilityFunctions.roundTo2Decimal((1 * 1000) / botObject.speed);
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

        return botObject;
    }


}