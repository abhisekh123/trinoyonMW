
const mainThreadStub = require('../mainthreadstub');
// const gameManager = require('../control/gamemanager');
const gameRoomAssetManager = require('../control/gameroomassetmanager');
const messageFactory = require('../../factory/messagefactory');
const aiUtility = require('../control/ai/aiutility');
const workerState = require('../state/workerstate');
// const utilityFunctions = require('../../utils/utilityfunctions');
// const environmentState = require('../../../dist/server/state/environmentstate');

module.exports = {
    

    respondGameJoinStatus: function(userIdList, joinStatus){
        const newMessageObject = messageFactory.getMessageObjectForUser();
        newMessageObject.players = userIdList;
        if(joinStatus){
            newMessageObject.type = 'request_game_admit_ack';
            
            // console.log('---returning:', newMessageObject);
            // console.log('player admitted successfully.');
        }else{
            // TODO
            newMessageObject.type = 'request_game_admit_nack';
        }

        mainThreadStub.postMessage(newMessageObject, '');
    },
    

    broadcastGameConfigToPlayers: function(gameRoom){
        const payload = {};
        // payload.playerIDList = [];
        payload.players = this.getGameConfigJSON(gameRoom);

        var playerArrayTeam1 = this.getActualPlayerIDListForGame(gameRoom, 1);
        var playerArrayTeam2 = this.getActualPlayerIDListForGame(gameRoom, 2);



        console.log('sending game config');
        // send config to players in team  1
        payload.playerIDList = playerArrayTeam1;
        var responseJSON = mainThreadStub.getResponseEmptyPacket('game_config', payload);
        mainThreadStub.postMessage(responseJSON, '');

        // send config to players in team  2
        payload.playerIDList = playerArrayTeam2;
        var responseJSON = mainThreadStub.getResponseEmptyPacket('game_config', payload);
        mainThreadStub.postMessage(responseJSON, '');

        // responseJSONString.players = this.getActualPlayerIDListForGame(gameRoom);
        // responseJSONString.update = gameRoom;
    },

    broadcastGameResultToPlayers: function(gameRoom){
        // console.log('broadcastGameResultToPlayers', JSON.stringify(gameRoom.statistics));
        const payload = {};
        payload.result = gameRoom.statistics;
        var playerArrayTeam1 = this.getActualPlayerIDListForGame(gameRoom, 1);
        var playerArrayTeam2 = this.getActualPlayerIDListForGame(gameRoom, 2);
        
        // console.log('sending game update');
        // send config to players in team  1
        payload.playerIDList = playerArrayTeam1;
        // console.log('sending game update to team 1', payload);
        var responseJSON = mainThreadStub.getResponseEmptyPacket('result', payload);
        mainThreadStub.postMessage(responseJSON, '');

        // send config to players in team  2
        payload.playerIDList = playerArrayTeam2;
        // console.log('sending game update to team 2', payload);
        var responseJSON = mainThreadStub.getResponseEmptyPacket('result', payload);
        mainThreadStub.postMessage(responseJSON, '');
    },

    broadcastGameUpdatesToPlayers: function(gameRoom){
        const payload = {};
        // payload.playerIDList = [];
        payload.players = this.getGameUpdateJSON(gameRoom);

        var playerArrayTeam1 = this.getActualPlayerIDListForGame(gameRoom, 1);
        var playerArrayTeam2 = this.getActualPlayerIDListForGame(gameRoom, 2);
        
        // console.log('sending game update');
        // send config to players in team  1
        payload.playerIDList = playerArrayTeam1;
        // console.log('sending game update to team 1', payload);
        var responseJSON = mainThreadStub.getResponseEmptyPacket('update', payload);
        mainThreadStub.postMessage(responseJSON, '');

        // send config to players in team  2
        payload.playerIDList = playerArrayTeam2;
        // console.log('sending game update to team 2', payload);
        var responseJSON = mainThreadStub.getResponseEmptyPacket('update', payload);
        mainThreadStub.postMessage(responseJSON, '');
    },


    /**
     * LOGICAL FUNCTIONS FOR BROADCAST
     */

    getGameUpdateJSON: function(gameRoom){
        // console.log('getGameUpdateJSON');
        const updatePacket = {
            // test: '123',
            gameStartTime: gameRoom.snapShot.gameStartTime,
            snapshotStartTime: gameRoom.snapShot.startTime,
            currentTime: gameRoom.snapShot.currentTime,
            eventsArray: gameRoom.snapShot.eventsArray,
            itemState: gameRoom.snapShot.itemState,
            statistics: gameRoom.statistics,
        };
        return updatePacket;
    },

    getGameConfigJSON: function(gameRoom){
        return gameRoom.snapShot.gameConfigArrayForPlayers;
    },

    /**
     * GET RECIPIENTS LIST
     */
    getActualPlayerIDListForGame: function(gameRoom, team){
        var playerArray = null;
        if(team == 1){
            playerArray = gameRoom.players_1;
        }else if(team == 2){
            playerArray = gameRoom.players_2;
        }else{
            console.log('ERROR: unknown team:', team);
            return [];
        }
        const playerIDList = [];

        // players 1
        for(var i = 0; i < playerArray.length; ++i){
            const player = playerArray[i];
            if(player.isAIDriven){
                continue;
            }

            playerIDList.push({
                id: player.userId,
                index: player.index
            });
        }

        return playerIDList;
    },

    /**
     * GET DATA TO BE SENT
     */

    updateBotAction: function(userMessageObject){
        console.log('update bot action:', userMessageObject);
        var userId = userMessageObject.userId;
        
        var userPlayerObject = workerState.userToPlayerMap[userId];

        if(userPlayerObject == null || userPlayerObject == undefined){
            console.error('user not found ', userMessageObject);
            return;
        }

        var botConfig = null;
        var gameRoom = null;

        for(var i = 0; i < userPlayerObject.botObjectList.length; ++i){ // search botObject
            if(userPlayerObject.botObjectList[i].id == userMessageObject.botId){
                botConfig = userPlayerObject.botObjectList[i];
                break;
            }
        }

        if(botConfig != null){ // if found
            
            if(botConfig.isActive == false){
                console.error('bot found but is not active:', botConfig);
                return;    
            }else{
                gameRoom = workerState.gameRoomArray[userPlayerObject.gameId];
            }
        }else{
            console.error('bot not found ', userMessageObject);
            return;
        }

        if(gameRoom != null){ // if found
            // console.log('update bot action:', userMessageObject);
            switch (userMessageObject.type) {
                case 'action':
                    aiUtility.goNearDesignatedPosition(
                        botConfig, 
                        userMessageObject.destinationPosition, 
                        'goto', 
                        gameRoom, 
                    );
                    break;
                case 'si':
                    aiUtility.processAbilityRequest(botConfig, gameRoom, userMessageObject.abilityIndex);
                    break;
                default:
                    break;
            }
            
            // console.log('botConfig after:', botConfig);
        }else{
            console.error('gameRoom not found ', userMessageObject);
            return;
        }
    },

    

    /**
     * PROCESS INCOMING MESSAGE
     */
    processIncomingMessages: function(){
        console.log('woreker@processIncomingMessages');
        var playerID = -1;
        for(var i = 0; i < mainThreadStub.messagebuffer.length; ++i){
            console.log(i + '>processIncomingMessages::' + mainThreadStub.messagebuffer[i]);
            var currentMessage = mainThreadStub.messagebuffer[i];
            if(currentMessage == null || currentMessage == undefined || currentMessage.type == undefined || currentMessage.type == null){
                continue;
            }
            switch(currentMessage.type){
                case 'action':
                case 'si':
                    // // console.log('process action');
                    this.updateBotAction(currentMessage);
                    break;
                case 'request_game_admit':
                    console.log('request game admit', currentMessage);
                    // var userId = currentMessage.userId;
                    // console.log(gameRoomAssetManager);
                    // console.log(messageFactory);
                    // gameRoomAssetManager.test();
                    gameRoomAssetManager.addUserToWaitingList(currentMessage);
                    
                    break;
                case 'client_reconnect':
                    var userId = currentMessage.userId;
                    workerState.processUserReconnectEvent(userId);
                    break;
                case 'request_game_exit':
                case 'client_disconnected':
                    // console.log('process action:', currentMessage.type);
                    // routine to send world details to main worker.
                    var userId = currentMessage.userId;
                    workerState.processUserConnectionDropEvent(userId);

                    // console.log('get exit request from client:' + userId);

                    // playerID = gameRoomAssetManager.getPlayerID(userId);
                    // if(playerID == null || playerID == undefined){
                    //     console.error('ERROR removing player from worker with userId:' + userId + ' Client already not existing.');
                    //     return;
                    // }
                    // this.removePlayer(userId);
                    // gameRoomAssetManager.removePlayer(userId);
                    break;
                default:
                    // console.log('ERROR@WebWorker:Received message with unknown type:' + currentMessage);
            }
        }

        mainThreadStub.messagebuffer.length = 0;
    },
}