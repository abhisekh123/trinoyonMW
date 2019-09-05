"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tinyworker = require("tiny-worker");
const clientregistry = require('./serverlib/clientRegistry');
const gameState = require('./gamestate');
// tworker.onmessage = function (ev: MessageEvent) {
//     console.log('1111222233333' + ev.data);
//     // worker.terminate();
// };
// tworker.postMessage("Hello World!");
module.exports = {
    workerRegister: {},
    startWorker: function () {
        this.workerRegister.workerObject = new tinyworker(__dirname + '/worker.js');
        // this.postMessage('hi worker!');
        this.workerRegister.workerObject.onmessage = this.processMessage;
    },
    /**
     * Process message from worker
     */
    processMessage: function (ev) {
        // 
        let jsonData = ev.data;
        switch (jsonData.type) {
            case 'update': // relay latest snapshot to all clients.
                // console.log('-->update from worker::' , ev.data);
                for (var i = 0; i < clientregistry.clientArrey.length; ++i) {
                    if (clientregistry.clientArrey[i].isActive) {
                        var ws = clientregistry.clientArrey[i].ws;
                        clientregistry.sendMessageToClient(ws, ev.data);
                    }
                }
                gameState.setGameBotState(ev.data);
                break;
            case 'request_game_admit_ack': // client has been granted admission to the game.
                var clientID = jsonData.clientID;
                console.log('get request_game_admit_ack from :' + clientID);
                let clientWS = clientregistry.clientArrey[clientID].ws;
                clientregistry.sendMessageToClient(clientWS, ev.data);
                break;
            default:
                console.log('ERROR:@worker manager, got unknown message type:', jsonData);
                break;
        }
        // worker.terminate();
    },
    postMessage: function (messageJSON) {
        console.log('sending message to worker::', messageJSON);
        this.workerRegister.workerObject.postMessage(messageJSON);
    }
};
//# sourceMappingURL=workermanager.js.map