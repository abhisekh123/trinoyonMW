const world_config = require(__dirname + '/../../../ui/world_config');

module.exports = {
    clientRequest:{},
    onlinePlayers:{},
    onlineClients:{},

    setServerState: function(dataParam:any){
        this.gameState = dataParam;
    },
    
    getServerState: function() {
        return {
            clientRequest: this.clientRequest,
            onlinePlayers: this.onlinePlayers,
            onlineClients: this.onlineClients
        }
    },

    getWorldConfig: function(){
        return world_config;
    }
}