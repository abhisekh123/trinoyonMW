
const world_config = require(__dirname + '/../../data/world_config');

module.exports = {
    playerArrey: [],//saves websocket objects
    connectedPlayerCount: 0,
    playerMap: {},
    maxPlayerCount: 0,
    // botColor: world_config.commonConfig.botColor,
    // selfColor: world_config.commonConfig.selfColor,
    botColor: [1, 1, 1],
    selfColor: [1, 1, 1],

    // processAIPlayers: function(){
    //     for(var i = 0; i < this.maxPlayerCount; ++i){
    //         var currentPlayer = this.playerArrey[i];
    //         if(currentPlayer.isAIDriven == false && currentPlayer.isActive == true && currentPlayer.opponentAI == null){
    //             // needs to be assigned opponentAI
    //         }
    //     }
    // },
    getPlayerByTeamID: function(teamID){
        for(var i = 0; i < this.maxPlayerCount; ++i){
            if(this.playerArrey[i].teamID == teamID){
                return this.playerArrey[i];
            }
        }
        return null;
    },

    init: function(){
        // var tmpColorIndex = 100;
        this.maxPlayerCount = world_config.players.length;
        for(var i = 0; i < this.maxPlayerCount; ++i){
            var playerObject = {
                isActive:true, // is false if commandar has died
                isAIDriven:true,
                opponentAI:null,
                teamColor : this.getNewPlayerColor(),
                leaderBotID: null,
                teamID: world_config.players[i].teamID,
                playerID: world_config.players[i].playerID,
                botIDList: []
            };
            this.playerArrey[i] = playerObject;
        }
    },

    getPlayerID: function(clientID){
        return this.playerMap.get(clientID);
    },

    getNewPlayerColor(){
        // var color = this.selfColor;
        // var color = [1,1,1];
        // while(color == this.selfColor || color == this.botColor){
        //     // color = '#' + Math.floor(Math.random() * 16777215).toString(16);// random color
        //     color = [
        //         Math.floor(Math.random() * 100) / 100,
        //         Math.floor(Math.random() * 100) / 100,
        //         Math.floor(Math.random() * 100) / 100,
        //     ];
        // }
        // // console.log('tmp');
        // var tmp = Math.random();
        // // console.log(tmp);
        // tmp = Math.floor(tmp * 100) / 100;
        // // console.log(tmp);
        // tmp = Math.floor(Math.random() * 100) / 100;
        // // console.log(tmp);
        var color = [
            Math.floor(Math.random() * 100) / 100,
            Math.floor(Math.random() * 100) / 100,
            Math.floor(Math.random() * 100) / 100,
        ];
        // // console.log('generated color:' + color);
        return color;
    },

    admitNewPlayer: function(clientID){
        // console.log('player manager------>try admitNewPlayer');
        for(var i = 0; i < this.maxPlayerCount; ++i){
            if(this.playerArrey[i].isAIDriven){
                this.playerArrey[i].isActive = true;
                this.playerArrey[i].isAIDriven = false;
                this.playerArrey[i].clientID = clientID;
                // this.playerArrey[i].teamColor = this.getNewPlayerColor();
                // let newID = clientregistry.getNewUniqueID();
                // let clientObject = {
                //     id:null,
                //     playerid:null,
                // };
                // clientObject.playerid = playerID;
                // clientObject.id = newID;

                this.playerMap[clientID] = i;
                // return this.playerArrey[i];
                ++this.connectedPlayerCount;
                return this.playerArrey[i];
            }
        }
        return null;
    },

    removePlayer: function(clientID){
        var playerID = this.getPlayerID(clientID);
        this.playerArrey[playerID].isActive = false;
        this.playerMap[clientID] = undefined;
        this.playerMap.delete(clientID);
        --this.connectedPlayerCount;
        return;
    },

    reset: function(){
        this.playerMap = {};
        this.init();
    }
}