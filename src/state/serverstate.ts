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
    }
}