const world_config = require(__dirname + '/../../../ui/world_config');

module.exports = {
    userArrey:[],//saves websocket objects
    userMap:new Map<WebSocket, any>(), // to get userArray index from websocket.

    userRequest:{},
    onlinePlayers:{},
    onlineUsers:{},
    workerHandle: null,

    setServerState: function(dataParam:any){
        this.gameState = dataParam;
    },
    
    getServerState: function() {
        return {
            userRequest: this.userRequest,
            onlinePlayers: this.onlinePlayers,
            onlineUsers: this.onlineUsers
        }
    },

    getWorldConfig: function(){
        return world_config;
    }
}