
import * as WebSocket from 'ws';
const serverState = require('./serverstate');

// TODO: On client join : send status (queue status)

module.exports = {
    maxClientCount:10,
    idCounter:0,
    world_config: {},

    init: function(){
        this.world_config = serverState.getWorldConfig();
        this.maxClientCount = this.world_config.commonConfig.maxClientCount;
        // world_config.commonConfig.maxBotCount = world_config.commonConfig.maxClientCount * world_config.commonConfig.maxBotPerPlayer;
        for(var i = 0; i < this.maxClientCount; ++i){
            var clientObject = {
                isActive:false,
                ws:null
            };
            this.clientArrey[i] = clientObject;
        }
    },

    sendMessageToClient: function(ws:WebSocket, messageObject: JSON){
        ws.send(JSON.stringify(messageObject));
    },

    admitNewClient: function(wsParam: WebSocket){
        console.log('trying to admit new client');
        for(var i = 0; i < this.maxClientCount; ++i){
            if(!this.clientArrey[i].isActive){
                this.clientArrey[i].isActive = true;
                this.clientArrey[i].ws = wsParam;
                // let newID = clientregistry.getNewUniqueID();
                // let clientObject = {
                //     id:null,
                //     playerid:null,
                // };
                // clientObject.playerid = playerID;
                // clientObject.id = newID;

                this.clientMap.set(wsParam, i);
                console.log('successfully added new client:', i);
                return i;
            }
        }
        return -1;
    },

    removeClient: function(wsParam: WebSocket){
        var userId = this.clientMap.get(wsParam);
        if(userId == null || userId == undefined){
            console.error('ERROR: while removing client. ClientMap does not have any such record.');
        }else{
            this.clientMap.delete(wsParam);
            this.clientArrey[userId].isActive = false;
            this.clientArrey[userId].ws = null;
        }
        wsParam.close();
        return userId;
    }
}