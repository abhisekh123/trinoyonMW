
// operation related to maintaining datastructure for game rooms.

const workerState = require('../state/workerstate');
const utilityFunctions = require('../../utils/utilityfunctions');
const environmentState = require('../../../dist/server/state/environmentstate');
const gameRoomAssetManager = require('./gameroomassetmanager');

module.exports = {
    worldConfig: null,
    itemConfig: null,

    init: function() {
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
        this.initialiseRooms();
    },

    /**
     * game progress / refresh
     */

    processPlayers: function(gameRoom){
        // // console.log('process players.', playerManager.playerArray);
        for(var playerIndex = 0, botIndex = 0; playerIndex < playerManager.playerArray.length; ++playerIndex){
            const playerConfig = playerManager.playerArray[playerIndex];
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
                    var leaderConfig = workerState.botMap[playerConfig.leaderBotID];
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
    
    initialiseRooms: function(){
        for(var i = 0; i < environmentState.maxGameCount; ++i){ // intialise each game room
            const gameRoom = {};
            gameRoom.buildings_1 = utilityFunctions.cloneObject(
                utilityFunctions.getObjectValues(workerState.buildingMap_1)
            );
            gameRoom.buildings_2 = utilityFunctions.cloneObject(
                utilityFunctions.getObjectValues(workerState.buildingMap_2)
            );
            gameRoom.isActive = false;
            gameRoom.players_1 = [];
            gameRoom.players_2 = [];
            for(var j = 0; j < environmentState.maxPlayerPerTeam; ++j){ // populate room with generic players of team 1.
                var team = 1;
                var playerId = 'player_' + j;
                gameRoom.players_1.push(gameRoomAssetManager.getGenericPlayerObject(playerId, team, i));
            }
            for(var j = environmentState.maxPlayerPerTeam; j < (environmentState.maxPlayerPerTeam * 2); ++j){ // populate room with generic players of team 2.
                var team = 2;
                var playerId = 'player_' + j;
                gameRoom.players_2.push(gameRoomAssetManager.getGenericPlayerObject(playerId, team, i));
            }
            gameRoom.startTime = null;
            workerState.games[i] = gameRoom;
        }
        
    },

    resetGame: function(gameRoom) {
        // const gameRoom = workerState.games(indexParam);
        // gameRoom.isActive = false;
        // gameRoom.startTime = null;

        // building 1
        for(var i = 0; i < gameRoom.buildings_1.length; ++i){
            const building = gameRoom.buildings_1[i];
            building.life = workerState.buildingMap_1[building.id].life;
            building.isActive = true;
        }

        // building 2
        for(var i = 0; i < gameRoom.buildings_2.length; ++i){
            const building = gameRoom.buildings_2[i];
            building.life = workerState.buildingMap_2[building.id].life;
            building.isActive = true;
        }

        // players 1
        for(var i = 0; i < gameRoom.players_1.length; ++i){
            const player = gameRoom.players_1[i];
            player.userId = null;
            player.isConnected = false;
            player.lastCommunication = 0;
            player.joinTime = 0;
            player.isAIDriven = true;
        }

        // players 2
        for(var i = 0; i < gameRoom.players_2.length; ++i){
            const player = gameRoom.players_2[i];
            player.userId = null;
            player.isConnected = false;
            player.lastCommunication = 0;
            player.joinTime = 0;
            player.isAIDriven = true;
        }

    }
}