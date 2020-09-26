
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
    updateMMRIntervalHandle: null,

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
        this.updateMMRIntervalHandle = setInterval(this.sendMMRUpdateToPlayers.bind(this), 2000);
    },

    getMMRConfig: function(mmrParam: any){
        const mmrConfig: any = {
            players_1: [],
            players_2: [],
        }

        for(var i = 0; i < environmentState.maxPlayerPerTeam; ++i){
            // check team 1
            if(mmrParam.players_1[i] != null){
                mmrParam.players_1[i] = {
                    id: mmrParam.players_1[i].id,
                    lastName: mmrParam.players_1[i].lastName,
                    firstName: mmrParam.players_1[i].firstName,
                    selection: mmrParam.players_1[i].selection
                }
            } else {
                mmrConfig.players_1[i] = null;
            }
            // check team 2
            if(mmrParam.players_2[i] != null){
                mmrParam.players_2[i] = {
                    id: mmrParam.players_2[i].id,
                    lastName: mmrParam.players_2[i].lastName,
                    firstName: mmrParam.players_2[i].firstName,
                    selection: mmrParam.players_2[i].selection
                }
            } else {
                mmrConfig.players_2[i] = null;
            }
        }

        return mmrConfig;
    },

    sendMMRUpdateToPlayers: function(){
        for(var i = 0; i < environmentState.maxMatchMakingRoomCount; ++i){
            if(this.user_matchMaking_rooms[i].isActive == true){
                const mmr = this.user_matchMaking_rooms[i];
                const mmrConfig = this.getMMRConfig(mmr);
                const mmrUpdateString = JSON.stringify({type:'message', sub:'mmrupdate', message:mmrConfig});
                
                for(var i = 0; i < environmentState.maxPlayerPerTeam; ++i){
                    // check team 1
                    if(mmr.players_1[i] != null){
                        clientBroadcaster.sendMessageToRecipientByUserID(mmr.players_1[i].id, mmrUpdateString);
                    }
                    // check team 2
                    if(mmr.players_2[i] != null){
                        clientBroadcaster.sendMessageToRecipientByUserID(mmr.players_2[i].id, mmrUpdateString);
                    }
                }
            }
        }

        // console.log('mmr update');
    },

    notifyPlayerMatchmakingRoomAdmit: function(requestJSONParam: any) {
        requestJSONParam.type = 'message';
        requestJSONParam.sub = 'mmradmit';
        console.log('notifyPlayerMatchmakingRoomAdmit requestJSONParam:', requestJSONParam);
        clientBroadcaster.sendMessageToRecipientByUserID(
            requestJSONParam.payload.senderId, JSON.stringify(requestJSONParam)
        );
    },

    notifyPlayerMatchmakingRoomExpel: function(requestJSONParam: any) {
        requestJSONParam.sub = 'mmrexpel';
        requestJSONParam.type = 'message';
        console.log('notifyPlayerMatchmakingRoomExpel requestJSONParam:', requestJSONParam);
        clientBroadcaster.sendMessageToRecipientByUserID(
            requestJSONParam.payload.senderId, JSON.stringify(requestJSONParam)
        );
    },


    findEmptySlotInTeam: function(team: number, mmrParam: any){
        let players = null;
        if(team == 1){
            players = mmrParam.players_1;
        } else {
            players = mmrParam.players_2;
        }

        for(var i = 0; i < environmentState.maxPlayerPerTeam; ++i){
            if(players[i] == null){
                return i;
            }
        }
        return -1; // no empty slot
    },
    // searchUserFromMatchmakingRoom

    admitPlayerToMatchmakingRoom: function(messageJSONParam: any, mmrIndex: number, team: number){
        console.log('admitPlayerToMatchmakingRoom:', messageJSONParam);
        var mmr = this.user_matchMaking_rooms[mmrIndex];
        if(team == 1){
            if(mmr.team1PlayerCount < environmentState.maxPlayerPerTeam){
                ++mmr.team1PlayerCount;
            } else { // no empty slot in the given team
                return false;
            }
        } else {
            if(mmr.team2PlayerCount < environmentState.maxPlayerPerTeam){
                ++mmr.team2PlayerCount;
            } else { // no empty slot in the given team
                return false;
            }
        }
        // const requesterUserObject = this.users_server_state[messageJSONParam.payload.recipientId];
        const requesterUserObject = this.users_server_state[messageJSONParam.payload.senderId];
        requesterUserObject.selection = messageJSONParam.payload.selection;
        requesterUserObject.matchmakingRoomIndex = mmrIndex;
        this.notifyPlayerMatchmakingRoomAdmit(messageJSONParam);
        // notify player admit update
        return true;
    },


    // if a person sends challenge/invite and is not already member of a matchmaking room
    // then create a new matchmaking room
    allocateNewGameRoomIfNeeded: function(messageJSONParam: any){ 
        console.log('allocateNewGameRoomIfNeeded');
        const requesterUserObject = this.users_server_state[messageJSONParam.payload.senderId];
        if(requesterUserObject.matchmakingRoomIndex == null){
            for(var i = 0; i < environmentState.maxMatchMakingRoomCount; ++i){
                if(this.user_matchMaking_rooms[i].isActive == false){ // found unused game room
                    this.user_matchMaking_rooms[i].isActive = true;
                    this.admitPlayerToMatchmakingRoom(messageJSONParam, i);
                    
                    this.user_matchMaking_rooms[i].players_1[0] = requesterUserObject;
                    
                    break;
                }
            }
        }
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
                    break;
                }
            }
            // check team 2
            if(requesterMatchmakingRoom.players_2[i] != null){
                if(requesterMatchmakingRoom.players_2[i].id == joineeUserObject.id){ // found match
                    requesterMatchmakingRoom.players_2[i] = null;
                    --requesterMatchmakingRoom.team2PlayerCount;
                    break;
                }
            }
        }

        joineeUserObject.matchmakingRoomIndex = null;
        this.notifyPlayerMatchmakingRoomExpel(messageJSONParam);

        // if all players left the room.
        if(requesterMatchmakingRoom.team1PlayerCount == 0 && requesterMatchmakingRoom.team2PlayerCount == 0){
            requesterMatchmakingRoom.isActive = false;
        }
    },


    deallocateMatchMakingRoom: function(index: number){
        var matchRoom = this.user_matchMaking_rooms[index];
        matchRoom.isActive = false;
        // matchRoom.owner = null;
        for(var i = 0; i < environmentState.maxPlayerPerTeam; ++i){
            matchRoom.players_1[i] = null;
            matchRoom.players_2[i] = null;
        }
        matchRoom.team1PlayerCount = 0;
        matchRoom.team2PlayerCount = 0;
    },

    evolveMatchMakingRoom: function(index: number){
        // TOD communicate with workers to queue matchmaking room
        this.deallocateMatchMakingRoom(index);
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


