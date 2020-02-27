
const workerState = require('../state/workerstate');
var linkedList = require('../../utils/linkedlist');
const utilityFunctions = require('../../utils/utilityfunctions');
const environmentState = require('../../../dist/server/state/environmentstate');

module.exports = {
    worldConfig: null,
    itemConfig: null,

    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
        // var tmpColorIndex = 100;
        // this.maxPlayerCount = world_config.players.length;
        // for(var i = 0; i < this.maxPlayerCount; ++i){
        //     var playerObject = {
        //         isActive:true, // is false if commandar has died
        //         isAIDriven:true,
        //         opponentAI:null,
        //         teamColor : this.getNewPlayerColor(),
        //         leaderBotID: null,
        //         teamID: world_config.players[i].teamID,
        //         playerID: world_config.players[i].playerID,
        //         botIDList: []
        //     };
        //     this.playerArray[i] = playerObject;
        // }
        workerState.waitingUsersLinkedList = new linkedList();
    },


    processPlayers: function(){
        // // console.log('process players.', playerManager.playerArray);
        for(var playerIndex = 0, botIndex = 0; playerIndex < playerManager.playerArray.length; ++playerIndex){
            const playerConfig = playerManager.playerArray[playerIndex];
            // console.log('process player:', playerConfig.playerID);
            // skip inactive player and players controlled by real people
            if(!playerConfig.isActive || !playerConfig.isAIDriven){
                // TODO: Add logic to spawn new AI player / admit new player here.
                continue;
            }
            // check if commandar bot is still active
            // var botIndex = this.maxBotPerPlayer * playerIndex;
            // if(!workerstate.botArray[botIndex].isActive){
            //     playerConfig.isActive = false;
            //     continue;
            // }

            // if player is AI
            // // console.log('playerConfig.id:', playerConfig);
            var areAllBotsIdle = this.areAllBotsIdle(playerConfig);
            // console.log('areAllBotsIdle:', areAllBotsIdle);
            if(areAllBotsIdle){
                // all bots are idle. Loiter.
                var nearestTarget = this.findClosestPlayerOrTowerOrBase(playerConfig);
                // // console.log(playerConfig.id);
                // console.log('nearestTarget:', nearestTarget);
                if(nearestTarget == null){
                    return;
                }else{
                    var leaderConfig = workerState.botMap[playerConfig.leaderBotID];
                    // // console.log(leaderConfig.payload.position);
                    // // console.log(nearestTarget.target);
                    var nearestPosition = botroutemanager.FindClosestWalkablePoint({x:nearestTarget.target[0], y:0, z:nearestTarget.target[1]});
                    var path = botroutemanager.findPath(
                        leaderConfig.payload.position[0], 
                        leaderConfig.payload.position[2], 
                        nearestPosition.x, 
                        nearestPosition.z);
                    // // console.log('path:', path);
                    // // console.log('4');
                    this.instructBot(leaderConfig, 'goto',
                    {
                        // botRotation: suitableEnemy.botRotation,
                        pathToEnemy: path,
                    });
                }
            }
        }
    },

    removePlayer: function(userId){
        const playerID = playerManager.getPlayerID(userId);
        const playerConfig = playerManager.playerArray[playerID];
        const botStartIndex = playerID * this.maxBotPerPlayer;

        // // console.log('botStartIndex:' + botStartIndex);
        for(var j = 0; j < this.maxBotPerPlayer; ++j){
            workerstate.botArray[j + botStartIndex].isActive = true;
            workerstate.botArray[j + botStartIndex].teamColor = playerConfig.teamColor;
            workerstate.botArray[j + botStartIndex].isAIDriven = true;
        }
    },

    getPlayerID: function(userId){
        return this.playerMap.get(userId);
    },

    canAdmitNewPlayer: function(){
        const maxWaitingListSize = environmentState.maxGameCount * environmentState.maxPlayerPerTeam * 2;
        if(workerState.waitingUsersLinkedList.size < maxWaitingListSize){
            return true;
        } else {
            return false;
        }
    },

    addUserToWaitingList: function(userMessage){
        // const userId = userMessage.userId;
        if(this.canAdmitNewPlayer()){
            userMessage.timeWhenAddedToList = utilityFunctions.getCurrentTime();
            userMessage.players = [userMessage.userId];
            workerState.waitingUsersLinkedList.add(userMessage);
            const estimatedTimeInSeconds = this.getPlayStartTimeEstimate();
            userMessage.estimatedTimeInSeconds = estimatedTimeInSeconds;
            userMessage.type = 'request_game_admit_ack';
            mainThreadStub.postMessage(userMessage, '');
        } else {
            userMessage.type = 'request_game_admit_nack';
            mainThreadStub.postMessage(userMessage, '');
        }
        

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
        // test time stamp to see if it is too early.
        // const timeNow = utilityFunctions.getCurrentTime();
        // const successfullyAdmittedRequestIndexArray = [];
        // if((timeNow - workerState.timeWhenLastAttemptWasMadeToProcessWaitingUsers) < workerState.minInterval_AttemptToProcessWaitingUsers){
        //     // too early. will try next time.
        //     // console.log('too early to processWaitingUserAdmitRequests. doing nothing');
        //     return;
        // }else{
        //     workerState.timeWhenLastAttemptWasMadeToProcessWaitingUsers = timeNow;
        // }
        // console.log('processWaitingUserAdmitRequests');
        // iterate through user list
        if(workerState.waitingUsersLinkedList.isEmpty()){
            // console.log('no pending admit request.');
            return false;
        }
        console.log('start processWaitingUserAdmitRequests');
        workerState.waitingUsersLinkedList.printList();

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
                    workerState.playerFitCache[currentNode.element.players.length] = false;
                }else{
                    // admitted successfully. remove the request.
                    currentNode = workerState.waitingUsersLinkedList.removeCurrentNode();
                    continue;
                }
            }
            currentNode = workerState.waitingUsersLinkedList.moveToNextNode();
            

            

            // if(admittedPlayerArray != null){ // group addmitted users wrt game
            //     for(var i = 0; i < admittedPlayerArray.length; ++i){
            //         const gameId = admittedPlayerArray[i].gameId;
            //         if(gameMapPlayers[gameId] == undefined){
            //             gameMapPlayers[gameId] = [];
            //         }
            //         gameMapPlayers[gameId].push(admittedPlayerArray[i].userId);
            //     }
            //     successfullyAdmittedRequestIndexArray.push(workerState.waitingUsersLinkedList.getCurrentNodeIndex());
            // } else {
            //     workerState.playerFitCache[currentNode.element.players.length] = false;
            // }

            
        }

        // assuming successfullyAdmittedRequestIndexArray will have values in the increasing order
        // so that it is safe to remove items from linked list by traversing successfullyAdmittedRequestIndexArray
        // in the reverse order.
        // if(successfullyAdmittedRequestIndexArray.length > 0){ // remove processed request from the request list
        //     for(var i = successfullyAdmittedRequestIndexArray.length - 1; i >= 0; --i){
        //         // workerState.waitingUsersLinkedList.getElementAtIndex(successfullyAdmittedRequestIndexArray[i]);
        //         workerState.waitingUsersLinkedList.removeFrom(successfullyAdmittedRequestIndexArray[i]);
        //     }
        // }

        // for each game updated, send game snapshot to newly admitted players:
        // const updatedGameArray = utilityFunctions.getObjectKeys(gameMapPlayers);
        // for(var i = 0; i < updatedGameArray.length; ++i){
        //     var gameId = updatedGameArray[i];
        //     var userIdList = gameMapPlayers[gameId];
        //     messgeM.respondGameJoinStatus(userIdList, true, gameId)
        // }
    },

    tryAdmitingNewPlayersToGame: function(admitRequest, gameRoom){
        const usersToJoin = admitRequest.users;
        let selectedTeam = null;

        if(this.getEmptyPlayerSlotsInTeam(gameRoom.players_1) >= usersToJoin.length){
            selectedTeam = gameRoom.players_1;
        } else {
            if(this.getEmptyPlayerSlotsInTeam(gameRoom.players_2) >= usersToJoin.length){
                selectedTeam = gameRoom.players_2;
            }else{
                return false;
            }
        }
        // let usersToJoinIndex = 0;
        // at this point we know that selected team has enough vacancy to accomodate all 'usersToJoin'
        var j = 0;
        for(var i = 0; i < usersToJoin.length; ++i){ // for each requested user
            
            let newUserToAdmit = usersToJoin[i];
            for(; j < environmentState.maxPlayerPerTeam; ++j){ // search for the next empty slot
                const selectedTeamPlayer = selectedTeam[j];
                if(selectedTeamPlayer.userId == null){ // found an empty slot. admitting the new player.
                    this.completePlayerAdmissionFormalities(selectedTeamPlayer, newUserToAdmit);
                    break;// process next player to join.
                }
            }
        }
    },

    /**
     * update ds in the game regarding player admission.
     */
    completePlayerAdmissionFormalities: function(selectedTeamPlayer, newUserToAdmit) {
        selectedTeamPlayer.userId = newUserToAdmit.id;
        selectedTeamPlayer.botList = newUserToAdmit.botList;
        selectedTeamPlayer.hero = newUserToAdmit.hero;
    },

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

    tryAdmitingNewPlayersOld: function(admitRequest, gameRoom){
        // const userId = admitRequest.userId;
        
        let newestSuitableGameStartTime = 0;
        let chosenPlayers = null;
        for(var i = 0; i < environmentState.maxGameCount; ++i){ // search each game room
            const aiPlayerArray = [];
            const gameRoom = workerState.games[i];
            const currentGameStartTime = gameRoom.startTime;

            if(gameRoom.isActive == false){ // skip inactive games.
                continue;
            }
            
            let freeSlot = 0;
            // vacancy means game player which has never been owned by any player since start.
            for(var j = 0; j < environmentState.maxPlayerPerTeam; ++j){ // Test if team 1 has vacancy.
                const currentPlayer = gameRoom.players_1[j];
                if(currentPlayer.userId == null){
                    aiPlayerArray.push(currentPlayer);
                    ++freeSlot;
                }
                if(freeSlot >= usersToJoin.length){
                    break;
                }
            }

            if(freeSlot >= usersToJoin.length){
                if(currentGameStartTime > newestSuitableGameStartTime){
                    newestSuitableGameStartTime = currentGameStartTime;
                    chosenPlayers = aiPlayerArray;
                    continue;
                }
            }
            aiPlayerArray.length = 0;// reset the array
            freeSlot = 0;
            for(var j = 0; j < 5; ++j){ // Test if team 1 has vacancy.
                const currentPlayer = gameRoom.players_2[j];
                if(currentPlayer.userId == null){
                    aiPlayerArray.push(currentPlayer);
                    ++freeSlot;
                }
                if(freeSlot >= usersToJoin.length){
                    break;
                }
            }

            if(freeSlot >= usersToJoin.length){
                if(currentGameStartTime > newestSuitableGameStartTime){
                    newestSuitableGameStartTime = currentGameStartTime;
                    chosenPlayers = aiPlayerArray;
                    continue;
                }
            }
        }
        
        if(chosenPlayers != null){
            this.admitUserToGame(usersToJoin, chosenPlayers);
            return chosenPlayers;
        } else {
            return null; // let calling function know that there is no 
        }
    },

    admitUsersToGame: function(usersToJoin, chosenPlayers){
        if(usersToJoin.length != chosenPlayers.length){
            console.log('ERROR: usersToJoin.length != chosenPlayers.length.');
            return;
        }

        const timeNow = utilityFunctions.getCurrentTime();

        for(var j = 0; j < usersToJoin.length; ++j){
            const player = chosenPlayers[j];
            player.userId = usersToJoin[j];
            player.isConnected = true;
            player.lastCommunication = timeNow;
            player.joinTime = timeNow;
            player.isAIDriven = false;

            workerState.userToPlayerMap[usersToJoin[j]] = {
                playerId: player.id,
                gameId: player.gameId
            };
        }
    },

    removePlayer: function(userId){
        var playerID = this.getPlayerID(userId);
        this.playerArray[playerID].isActive = false;
        this.playerMap[userId] = undefined;
        this.playerMap.delete(userId);
        --this.connectedPlayerCount;
        return;
    },
    

    reset: function(){
        this.playerMap = {};
        this.init();
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

        botObjectList.push(this.getBotObject(playerObject.hero));
        for(var i = 0; i < playerObject.botList.length; ++i){
            botObjectList.push(this.getBotObject(playerObject.botList[i]));
        }

        return playerObject;
    },

    getBotObject: function(botType){
        const returnJSON = {};
        const botTypeItemConfig = this.itemConfig.items[botType];
        if(botTypeItemConfig == null || botTypeItemConfig == undefined){
            console.log('ERROR: no item config found for type:', botTypeItemConfig);
            return returnJSON;
        }

        returnJSON.attackinterval = botTypeItemConfig.attackinterval;
        returnJSON.attack = botTypeItemConfig.attack;
        returnJSON.life = botTypeItemConfig.life;
        returnJSON.speed = botTypeItemConfig.speed; //one tile per 1000 ms.
        returnJSON.strideDistance = botTypeItemConfig.strideDistance;
        returnJSON.strideTime = botTypeItemConfig.strideTime;
        returnJSON.sight = botTypeItemConfig.sight;
        returnJSON.range = botTypeItemConfig.range;
    }
}