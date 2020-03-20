
const mainThreadStub = require('../mainthreadstub');
const snapshotmanager = require('../state/snapshotmanager');
// const gameManager = require('../control/gamemanager');
const gameRoomAssetManager = require('../control/gameroomassetmanager');
const messageFactory = require('../../factory/messagefactory');
// const utilityFunctions = require('../../utils/utilityfunctions');
// const environmentState = require('../../../dist/server/state/environmentstate');

module.exports = {
    

    respondGameJoinStatus: function(userIdList, joinStatus){
        const newMessageObject = messageFactory.getMessageObjectForUser();
        newMessageObject.players = userIdList;
        if(joinStatus){
            newMessageObject.type = 'request_game_admit_ack';
            
            // console.log('---returning:', newMessageObject);
            console.log('player admitted successfully.');
            // newMessageObject.gameConfig = snapshotmanager.getGameConfig(gameId);
        }else{
            // TODO
            newMessageObject.type = 'request_game_admit_nack';
        }

        mainThreadStub.postMessage(newMessageObject, '');
    },

    // sendMessage: function(message){
    //     mainThreadStub.postMessage(message, '');
    // },
    // broadcastGameUpdatesToPlayers: function(){
    //     var responseJSONString = mainThreadStub.getResponseEmptyPacket('update', this.latestSnapshot);
    //     mainThreadStub.postMessage(responseJSONString, '');
    // },

    

    broadcastGameConfigToPlayers: function(gameRoom){
        const payload = {};
        // payload.playerIDList = [];
        payload.players = this.getGameConfigJSON(gameRoom);

        var playerArrayTeam1 = this.getActualPlayerIDListForGame(gameRoom, 1);
        var playerArrayTeam2 = this.getActualPlayerIDListForGame(gameRoom, 2);

        // for(var i = 0; i < gameRoom.players_1.length; ++i){
        //     const player = gameRoom.players_1[i];
        //     if(player.isAIDriven){
        //         continue;
        //     }
        //     payload.playerIDList.push({
        //         id: player.userId,
        //         index: i
        //     });
        // }

        // // players 2
        // for(var i = 0; i < gameRoom.players_2.length; ++i){
        //     const player = gameRoom.players_2[i];
        //     if(player.isAIDriven){
        //         continue;
        //     }
        //     payload.playerIDList.push({
        //         id: player.userId,
        //         index: i
        //     });
        // }

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

    broadcastGameUpdatesToPlayers: function(gameRoom){
        const payload = {};
        // payload.playerIDList = [];
        payload.players = this.getGameUpdateJSON(gameRoom);

        var playerArrayTeam1 = this.getActualPlayerIDListForGame(gameRoom, 1);
        var playerArrayTeam2 = this.getActualPlayerIDListForGame(gameRoom, 2);
        
        console.log('sending game update');
        // send config to players in team  1
        payload.playerIDList = playerArrayTeam1;
        var responseJSON = mainThreadStub.getResponseEmptyPacket('update', payload);
        mainThreadStub.postMessage(responseJSON, '');

        // send config to players in team  2
        payload.playerIDList = playerArrayTeam2;
        var responseJSON = mainThreadStub.getResponseEmptyPacket('update', payload);
        mainThreadStub.postMessage(responseJSON, '');
    },

    broadcastGameResultToPlayers: function(gameRoom){
        var responseJSONString = mainThreadStub.getResponseEmptyPacket('update', this.latestSnapshot);
        mainThreadStub.postMessage(responseJSONString, '');
    },

    /**
     * LOGICAL FUNCTIONS FOR BROADCAST
     */

    getGameUpdateJSON: function(gameRoom){
        const updatePacket = {
            gameStartTime: gameRoom.snapShot.gameStartTime,
            snapshotStartTime: gameRoom.snapShot.startTime,
            currentTime: gameRoom.snapShot.currentTime,
            eventsArray: gameRoom.snapShot.eventsArray,
            itemState: gameRoom.snapShot.itemState,
        };
        return updatePacket;
    },

    getGameConfigJSON: function(gameRoom){
        return gameRoom.snapShot.gameConfigArrayForPlayers;
    },

    /**
     * GET RECIPIENTS LIST
     */
    getActualPlayerIDListForGame: function(gameRoom, teamId){
        var playerArray = null;
        if(teamId == 1){
            playerArray = gameRoom.players_1;
        }else if(teamId == 2){
            playerArray = gameRoom.players_2;
        }else{
            console.log('ERROR: unknown teamId:', teamId);
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
                index: i
            });
        }

        return playerIDList;
    },

    /**
     * GET DATA TO BE SENT
     */




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
                case 'request_game_exit':
                case 'client_disconnected':
                    // console.log('process action:', currentMessage.type);
                    // this.updateBotAction(currentMessage);
                    // routine to send world details to main worker.
                    var userId = currentMessage.userId;

                    // console.log('get exit request from client:' + userId);

                    playerID = gameRoomAssetManager.getPlayerID(userId);
                    if(playerID == null || playerID == undefined){
                        console.error('ERROR removing player from worker with userId:' + userId + ' Client already not existing.');
                        return;
                    }
                    this.removePlayer(userId);
                    gameRoomAssetManager.removePlayer(userId);
                    break;
                default:
                    // console.log('ERROR@WebWorker:Received message with unknown type:' + currentMessage);
            }
        }

        mainThreadStub.messagebuffer.length = 0;
    },
}