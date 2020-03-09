
const mainThreadStub = require('../mainthreadstub');
const snapshotmanager = require('../state/snapshotmanager');
// const gameManager = require('../control/gamemanager');
const gameRoomAssetManager = require('../control/gameroomassetmanager');
const messageFactory = require('../../factory/messagefactory');
// const utilityFunctions = require('../../utils/utilityfunctions');
// const environmentState = require('../../../dist/server/state/environmentstate');

module.exports = {
    processIncomingMessages: function(){
        console.log('woreker@processIncomingMessages');
        var playerID = -1;
        for(var i = 0; i < mainThreadStub.messagebuffer.length; ++i){
            // // console.log(i + '>processIncomingMessages::' + mainThreadStub.messagebuffer[i]);
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

    extractBotObjectConfigInformation: function(botObjectListParam){
        const configArray = [];
        // extract config information for each bot
        for(var i = 0; i < botObjectListParam.length; ++i){
            const configObject = {};
            configObject.id = botObjectListParam[i].id;
            configObject.type = botObjectListParam[i].type;
            configObject.position = botObjectListParam[i].position;
            configObject.rotation = botObjectListParam[i].rotation;
            configArray.push(configObject);
        }
        return configArray;
    },

    broadCompleteGameConfigToPlayers: function(gameRoom){
        const payload = {};
        payload.playerIDList = [];
        payload.players = [];

        for(var i = 0; i < gameRoom.players_1.length; ++i){
            const player = gameRoom.players_1[i];
            const playerConfig = {};
            playerConfig.id = player.id;
            playerConfig.team = player.team;
            playerConfig.botObjectList = this.extractBotObjectConfigInformation(player.botObjectList);
            payload.players.push(playerConfig);

            if(player.isAIDriven){
                continue;
            }
            payload.playerIDList.push({
                id: player.userId,
                index: i
            });
        }

        // players 2
        for(var i = 0; i < gameRoom.players_2.length; ++i){
            const player = gameRoom.players_2[i];
            const playerConfig = {};
            playerConfig.id = player.id;
            playerConfig.team = player.team;
            playerConfig.botObjectList = this.extractBotObjectConfigInformation(player.botObjectList);
            payload.players.push(playerConfig);

            if(player.isAIDriven){
                continue;
            }
            payload.playerIDList.push({
                id: player.userId,
                index: i
            });
        }

        var responseJSON = mainThreadStub.getResponseEmptyPacket('game_config', payload);
        // responseJSONString.players = this.getActualPlayerIDListForGame(gameRoom);
        // responseJSONString.update = gameRoom;

        console.log('sending game config');
        
        mainThreadStub.postMessage(responseJSON, '');
    },

    broadcastGameUpdatesToPlayers: function(gameRoom){
        var responseJSONString = mainThreadStub.getResponseEmptyPacket('update', this.latestSnapshot);
        responseJSONString.players = this.getActualPlayerIDListForGame(gameRoom);
        responseJSONString.update = this.getGameUpdateMessage(gameRoom);
        
        mainThreadStub.postMessage(responseJSONString, '');
    },

    getGameUpdateMessage: function(gameRoom){
        const updatePacket = {};
        return updatePacket;
    },

    getActualPlayerIDListForGame: function(gameRoom){
        const playerIDList = [];
        // players 1
        for(var i = 0; i < gameRoom.players_1.length; ++i){
            const player = gameRoom.players_1[i];
            if(player.isAIDriven){
                continue;
            }
            playerIDList.push(player.userId);
        }

        // players 2
        for(var i = 0; i < gameRoom.players_2.length; ++i){
            const player = gameRoom.players_2[i];
            if(player.isAIDriven){
                continue;
            }
            playerIDList.push(player.userId);
        }
        return playerIDList;
    },

    broadcastGameResultToPlayers: function(gameRoom){
        var responseJSONString = mainThreadStub.getResponseEmptyPacket('update', this.latestSnapshot);
        mainThreadStub.postMessage(responseJSONString, '');
    },
}