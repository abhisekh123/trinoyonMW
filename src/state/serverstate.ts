const world_config = require(__dirname + '/../../../ui/world_config');

module.exports = {
    state: 'stopped', // stopped -> startingup -> running -> shuttingdown
    // userArrey:[],//saves websocket objects

    users_db_state: {},
    users_server_state: {},
    users_worket_state: {},


    // wsMapToUserArrayIndex: new Map<WebSocket, number>(), // to get userArray index from websocket.
    // keyToWSMap: {},

    // userRequest:{},
    // onlinePlayers:{},
    // onlineUsers:{},
    workerHandle: null,

    setServerState: function(dataParam:any){
        this.gameState = dataParam;
    },
    
    getServerState: function() {
        return {
            // userRequest: this.userRequest,
            // onlinePlayers: this.onlinePlayers,
            onlineUsersCount: this.userArray.length
        }
    },

    getWorldConfig: function(){
        return world_config;
    }
}