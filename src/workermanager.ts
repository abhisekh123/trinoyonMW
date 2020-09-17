
const tinyworker = require("tiny-worker");
// const clientregistry = require('./state/clientstate');
const serverState = require('./state/serverstate');
const clientBroadcaster = require('./clientbroadcaster');
// const gameState = require('./state/gamestate');
import {request_message} from './factory/types';
 

/**
 * This file runs in main thread and manages communicagion and lifecycle of workers.
 */

module.exports = {

    startWorker: function(){
        serverState.workerHandle = new tinyworker(__dirname + '/worker_root.js');
        // this.postMessage('hi worker!');
        serverState.workerHandle.onmessage = this.processMessage;
    },
    
    /**
     * Process message from worker
     */
    processMessage: function (ev: MessageEvent) {
        // 
        let jsonData = ev.data;
        switch(jsonData.type){
            case 'update': // TODO : send update to main.
            case 'game_config': 
            
                // console.log(jsonData.type + '::', jsonData);
                var playerConfig = jsonData.payload.players;
                var playerIDList = jsonData.payload.playerIDList;
                var gameConfig = {
                    type: jsonData.type,
                    playerConfig,
                    playerIndex: -1
                };
                for (var i = 0; i < playerIDList.length; ++i){
                    gameConfig.playerIndex = playerIDList[i].index;
                    clientBroadcaster.sendMessageToRecipientByUserID(playerIDList[i].id, JSON.stringify(gameConfig));
                }
                break;
            case 'result':
                var playerConfig = jsonData.payload.result;
                var playerIDList = jsonData.payload.playerIDList;
                var gameConfig = {
                    type: jsonData.type,
                    playerConfig,
                    playerIndex: -1
                };
                for (var i = 0; i < playerIDList.length; ++i){
                    gameConfig.playerIndex = playerIDList[i].index;
                    clientBroadcaster.sendMessageToRecipientByUserID(playerIDList[i].id, JSON.stringify(gameConfig));
                }
                break;
            case 'request_game_admit_nack': // client has been granted admission to the game.
            case 'request_game_admit_ack': // client has been granted admission to the game.
                var userIdList = jsonData.players;
                console.log('get request_game_admit_ack for :' + userIdList);
                // let clientWS = clientregistry.clientArrey[userId].ws;
                // clientregistry.sendMessageToClient(clientWS, ev.data);
                for (var i = 0; i < userIdList.length; ++i){
                    clientBroadcaster.sendMessageToRecipientByUserID(userIdList[i], JSON.stringify(jsonData));
                }
                
                break;
            
                // console.log('message sent to cilent');
            default:
                // console.log('ERROR:@worker manager, got unknown message type:' , jsonData);
                break;
        }
        
        // worker.terminate();
    },

 
    
    postMessage: function(messageJSON: request_message){
        console.log('sending message to worker::' , messageJSON);
        try {
            serverState.workerHandle.postMessage(messageJSON);    
        } catch (error) {
            // console.log(error);
        }
        
    }
}

// tworker.onmessage = function (ev: MessageEvent) {
//     // console.log('1111222233333' + ev.data);
//     // worker.terminate();
// };
 
// tworker.postMessage("Hello World!");
