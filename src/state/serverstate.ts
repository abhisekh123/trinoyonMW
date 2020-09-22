
export {};

const world_config = require(__dirname + '/../../../ui/world_config');
const environmentState = require('./environmentstate');
const clientBroadcaster = require('../clientbroadcaster');

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
                // owner: null,
                // ownerTeam: null,
            }
        }
    },

    // if a person sends challenge/invite and is not already member of a matchmaking room
    // then create a new matchmaking room
    allocateNewGameRoomIfNeeded: function(messageJSONParam: any){ 
        const requesterUserObject = this.users_server_state[messageJSONParam.payload.senderId];
        if(requesterUserObject.matchmakingRoomIndex == null){
            for(var i = 0; i < environmentState.maxMatchMakingRoomCount; ++i){
                if(this.user_matchMaking_rooms[i].isActive == false){ // found unused game room
                    this.user_matchMaking_rooms[i].isActive = true;
                    requesterUserObject.matchmakingRoomIndex = i;
                    this.user_matchMaking_rooms[i].players_1[0] = requesterUserObject;
                    this.notifyPlayerMatchmakingRoomAdmit(messageJSONParam);
                    break;
                }
            }
        }
    },

    notifyPlayerMatchmakingRoomAdmit: function(requestJSONParam: any) {
        console.log('notifyPlayerMatchmakingRoomAdmit requestJSONParam:', requestJSONParam);
        clientBroadcaster.sendMessageToRecipientByUserID(
            requestJSONParam.payload.recipientId, JSON.stringify(requestJSONParam)
        );
    },

    notifyPlayerMatchmakingRoomExpel: function(requestJSONParam: any) {
        console.log('notifyPlayerMatchmakingRoomExpel requestJSONParam:', requestJSONParam);
        clientBroadcaster.sendMessageToRecipientByUserID(
            requestJSONParam.payload.recipientId, JSON.stringify(requestJSONParam)
        );
    },

    removePlayerFromMatchmakingRoom: function(messageJSONParam: any){
        const joineeUserObject = this.users_server_state[messageJSONParam.payload.senderId];
        if(joineeUserObject.matchmakingRoomIndex == null){
            // user seems to be already removed from matchmaking room
            return;
        }
        const requesterMatchmakingRoom = this.user_matchMaking_rooms[joineeUserObject.matchmakingRoomIndex];

        
        
        for(var i = 0; i < environmentState.maxPlayerPerTeam; ++i){
            // check team 1
            if(requesterMatchmakingRoom.players_1[i] != null){
                if(requesterMatchmakingRoom.players_1[i].id == joineeUserObject.id){ // found match
                    requesterMatchmakingRoom.players_1[i] = null;
                    --requesterMatchmakingRoom.team1PlayerCount;
                }
            }
            // check team 2
            if(requesterMatchmakingRoom.players_2[i] != null){
                if(requesterMatchmakingRoom.players_2[i].id == joineeUserObject.id){ // found match
                    requesterMatchmakingRoom.players_2[i] = null;
                    --requesterMatchmakingRoom.team2PlayerCount;
                }
            }
        }

        joineeUserObject.matchmakingRoomIndex = null;
    },

    // searchUserFromMatchmakingRoom

    admitPlayerToMatchmakingRoom: function(messageJSONParam: any){
        console.log('admitPlayerToMatchmakingRoom:', messageJSONParam);
        const requesterUserObject = this.users_server_state[messageJSONParam.payload.recipientId];
        const joineeUserObject = this.users_server_state[messageJSONParam.payload.senderId];
    },

    clearMatchMakingRoom: function(index: number){
        var matchRoom = this.user_matchMaking_rooms[index];
        matchRoom.isActive = false;
        // matchRoom.owner = null;
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