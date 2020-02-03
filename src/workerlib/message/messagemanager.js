
const mainThreadStub = require(__dirname + '/mainthreadstub');
const snapshotmanager = require('./state/snapshotmanager');

module.exports = {
    processNewMessages: function(){
        console.log('woreker@processNewMessages');
        var playerID = -1;
        for(var i = 0; i < mainThreadStub.messagebuffer.length; ++i){
            // // console.log(i + '>processNewMessages::' + mainThreadStub.messagebuffer[i]);
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
                    var clientID = currentMessage.clientID;
                    var playerConfig = this.admitNewPlayer(clientID, false);
                    if(playerConfig != null){
                        currentMessage.type = 'request_game_admit_ack';
                        currentMessage = snapshotmanager.addSnapshot(currentMessage, playerConfig);
                        
                        // mainThreadStub.postMessage(currentMessage, '');
                        // this.refreshWorld();
                    }else{
                        currentMessage.type = 'request_game_admit_nack';
                        currentMessage.bots = [];
                        currentMessage.objects = {};
                        currentMessage.playerConfig = {};
                        // mainThreadStub.postMessage(currentMessage, '');
                    }
                    // console.log('---returning:', currentMessage);
                    console.log('player admitted successfully.');
                    mainThreadStub.postMessage(currentMessage, '');
                    break;
                case 'request_game_exit':
                case 'client_disconnected':
                    // console.log('process action:', currentMessage.type);
                    // this.updateBotAction(currentMessage);
                    // routine to send world details to main worker.
                    var clientID = currentMessage.clientID;

                    // console.log('get exit request from client:' + clientID);

                    playerID = playerManager.getPlayerID(clientID);
                    if(playerID == null || playerID == undefined){
                        console.error('ERROR removing player from worker with clientID:' + clientID + ' Client already not existing.');
                        return;
                    }
                    this.removePlayer(clientID);
                    playerManager.removePlayer(clientID);
                    break;
                default:
                    // console.log('ERROR@WebWorker:Received message with unknown type:' + currentMessage);
            }
        }

        mainThreadStub.messagebuffer.length = 0;
    },
}