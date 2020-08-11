
export {};

const world_config = require(__dirname + '/../../../ui/world_config');
const environmentState = require('./environmentstate');

module.exports = {
    state: 'stopped', // stopped -> startingup -> running -> shuttingdown
    // userArrey:[],//saves websocket objects

    users_db_state: {},
    users_server_state: {},
    users_worket_state: {},

    user_matchMaking_rooms: [],
    user_game_rooms: [],
    user_id_list: [],


    // wsMapToUserArrayIndex: new Map<WebSocket, number>(), // to get userArray index from websocket.
    // keyToWSMap: {},

    // userRequest:{},
    // onlinePlayers:{},
    // onlineUsers:{},
    workerHandle: null,

    init: function(){
        var players_1: any[] = [];
        var players_2: any[] = [];

        for(var i = 0; i < environmentState.maxPlayerPerTeam; ++i){
            players_1[i] = null;
            players_2[i] = null;
        }

        for(var i = 0; i < environmentState.maxMatchMakingRoomCount; ++i){
            this.user_matchMaking_rooms[i] = {
                isActive: false,
                creationTime: 0,
                team1PlayerCount: 0,
                team2PlayerCount: 0,
                players_1: players_1,
                players_2: players_2,
            }
        }
    },

    clearMatchMakingRoom: function(index: number){
        var matchRoom = this.user_matchMaking_rooms[index];
        for(var i = 0; i < environmentState.maxPlayerPerTeam; ++i){
            matchRoom.players_1[i] = null;
            matchRoom.players_2[i] = null;
        }
    },

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