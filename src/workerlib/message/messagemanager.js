
const mainThreadStub = require(__dirname + '/mainthreadstub');
const snapshotmanager = require('./state/snapshotmanager');
const gameManager = require('../control/gamemanager');
const playerManager = require('../control/playermanager');
const messageFactory = require('../../factory/messagefactory');

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
                    console.log('request game admit');
                    // var userId = currentMessage.userId;
                    playerManager.addUserToWaitingList(currentMessage);
                    
                    break;
                case 'request_game_exit':
                case 'client_disconnected':
                    // console.log('process action:', currentMessage.type);
                    // this.updateBotAction(currentMessage);
                    // routine to send world details to main worker.
                    var userId = currentMessage.userId;

                    // console.log('get exit request from client:' + userId);

                    playerID = playerManager.getPlayerID(userId);
                    if(playerID == null || playerID == undefined){
                        console.error('ERROR removing player from worker with userId:' + userId + ' Client already not existing.');
                        return;
                    }
                    this.removePlayer(userId);
                    playerManager.removePlayer(userId);
                    break;
                default:
                    // console.log('ERROR@WebWorker:Received message with unknown type:' + currentMessage);
            }
        }

        mainThreadStub.messagebuffer.length = 0;
    },

    respondGameJoinStatus: function(userIdList, joinStatus, gameId){
        const newMessageObject = messageFactory.getMessageObjectForUser();
        newMessageObject.recipients = userIdList;
        if(joinStatus){
            newMessageObject.type = 'request_game_admit_ack';
            
            // console.log('---returning:', newMessageObject);
            console.log('player admitted successfully.');
            newMessageObject.gameConfig = snapshotmanager.getGameConfig(gameId);
        }else{
            // TODO
            newMessageObject.type = 'request_game_admit_nack';
        }

        mainThreadStub.postMessage(newMessageObject, '');
    },
    broadcastGameUpdatesToPlayers: function(){
        var responseJSONString = mainThreadStub.getResponseEmptyPacket('update', this.latestSnapshot);
        mainThreadStub.postMessage(responseJSONString, '');
    },
}