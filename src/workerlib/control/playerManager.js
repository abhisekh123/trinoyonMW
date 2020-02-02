
const world_config = require(__dirname + '/../../../ui/world_config');

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


    processPlayers: function(){
        // // console.log('process players.', playerManager.playerArrey);
        for(var playerIndex = 0, botIndex = 0; playerIndex < playerManager.playerArrey.length; ++playerIndex){
            const playerConfig = playerManager.playerArrey[playerIndex];
            // console.log('process player:', playerConfig.playerID);
            // skip inactive player and players controlled by real people
            if(!playerConfig.isActive || !playerConfig.isAIDriven){
                // TODO: Add logic to spawn new AI player / admit new player here.
                continue;
            }
            // check if commandar bot is still active
            // var botIndex = this.maxBotPerPlayer * playerIndex;
            // if(!workerstate.botArray[botIndex].isActive){
            //     playerConfig.isActive = false;
            //     continue;
            // }

            // if player is AI
            // // console.log('playerConfig.id:', playerConfig);
            var areAllBotsIdle = this.areAllBotsIdle(playerConfig);
            // console.log('areAllBotsIdle:', areAllBotsIdle);
            if(areAllBotsIdle){
                // all bots are idle. Loiter.
                var nearestTarget = this.findClosestPlayerOrTowerOrBase(playerConfig);
                // // console.log(playerConfig.id);
                // console.log('nearestTarget:', nearestTarget);
                if(nearestTarget == null){
                    return;
                }else{
                    var leaderConfig = workerstate.botMap[playerConfig.leaderBotID];
                    // // console.log(leaderConfig.payload.position);
                    // // console.log(nearestTarget.target);
                    var nearestPosition = botroutemanager.FindClosestWalkablePoint({x:nearestTarget.target[0], y:0, z:nearestTarget.target[1]});
                    var path = botroutemanager.findPath(
                        leaderConfig.payload.position[0], 
                        leaderConfig.payload.position[2], 
                        nearestPosition.x, 
                        nearestPosition.z);
                    // // console.log('path:', path);
                    // // console.log('4');
                    this.instructBot(leaderConfig, 'goto',
                    {
                        // botRotation: suitableEnemy.botRotation,
                        pathToEnemy: path,
                    });
                }
            }
        }
    },

    removePlayer: function(clientID){
        const playerID = playerManager.getPlayerID(clientID);
        const playerConfig = playerManager.playerArrey[playerID];
        const botStartIndex = playerID * this.maxBotPerPlayer;

        // // console.log('botStartIndex:' + botStartIndex);
        for(var j = 0; j < this.maxBotPerPlayer; ++j){
            workerstate.botArray[j + botStartIndex].isActive = true;
            workerstate.botArray[j + botStartIndex].teamColor = playerConfig.teamColor;
            workerstate.botArray[j + botStartIndex].isAIDriven = true;
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