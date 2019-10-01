
import * as WebSocket from 'ws';
const world_config = require(__dirname + '/../../../data/world_config');

module.exports = {
    clientArrey:[],//saves websocket objects
    clientMap:new Map<WebSocket, any>(),
    maxClientCount:0,
    idCounter:0,

    init: function(){
        this.maxClientCount = world_config.commonConfig.maxClientCount;
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
                return i;
            }
        }
        return -1;
    },

    removeClient: function(wsParam: WebSocket){
        var clientID = this.clientMap.get(wsParam);
        if(clientID == null || clientID == undefined){
            console.error('ERROR: while removing client. ClientMap does not have any such record.');
        }else{
            this.clientMap.delete(wsParam);
            this.clientArrey[clientID].isActive = false;
            this.clientArrey[clientID].ws = null;
        }
        wsParam.close();
        return clientID;
    }
}