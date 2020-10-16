
export {};

const world_config = require(__dirname + '/../../../ui/world_config');
const environmentState = require('./environmentstate');
const clientBroadcaster = require('../clientbroadcaster');

const utilityFunctions = require(__dirname + '/../../../src/utils/utilityfunctions');

module.exports = {
    state: 'stopped', // stopped -> startingup -> running -> shuttingdown
    // userArrey:[],//saves websocket objects

    users_db_state: {},
    users_server_state: {},

    persistant_server_state: {},
    // users_worket_state: {},

    user_matchMaking_rooms: [],
    // user_game_rooms: [],
    user_id_list: [],
    serverstate_id_list: [],
    serverTime: 0,
    mmrLifeSpan: 99 * 1000, // 99 seconds


    // wsMapToUserArrayIndex: new Map<WebSocket, number>(), // to get userArray index from websocket.
    // keyToWSMap: {},

    // userRequest:{},
    // onlinePlayers:{},
    // onlineUsers:{},
    workerManager: null,
    userManager: null,
    updateMMRIntervalHandle: null,

    init: function(workerManagerParam: any, userManager: any){
        this.workerManager = workerManagerParam;
        this.userManager = userManager;

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
        this.updateMMRIntervalHandle = setInterval(this.wakeServerStateDaemon.bind(this), 2000);
    },

    wakeServerStateDaemon: function(){
        this.serverTime = utilityFunctions.getCurrentTime();
        this.sendMMRUpdateToPlayers();
    },

    getMMRConfig: function(mmrParam: any){
        const mmrConfig: any = {
            players_1: [],
            players_2: [],
            
        }

        let areAllPlayersReady = true;
        let totalPlayerCount = 0;

        for(var i = 0; i < environmentState.maxPlayerPerTeam; ++i){
            // check team 1
            if(mmrParam.players_1[i] != null){
                mmrConfig.players_1[i] = {
                    id: mmrParam.players_1[i].id,
                    lastName: mmrParam.players_1[i].lastName,
                    firstName: mmrParam.players_1[i].firstName,
                    selection: mmrParam.players_1[i].selection,
                    isMMRReady: mmrParam.players_1[i].isMMRReady
                }
                if(mmrParam.players_1[i].isMMRReady == false){
                    areAllPlayersReady = false;
                }
                ++totalPlayerCount;
            } else {
                mmrConfig.players_1[i] = null;
            }
            // check team 2
            if(mmrParam.players_2[i] != null){
                mmrConfig.players_2[i] = {
                    id: mmrParam.players_2[i].id,
                    lastName: mmrParam.players_2[i].lastName,
                    firstName: mmrParam.players_2[i].firstName,
                    selection: mmrParam.players_2[i].selection,
                    isMMRReady: mmrParam.players_2[i].isMMRReady
                }
                if(mmrParam.players_2[i].isMMRReady == false){
                    areAllPlayersReady = false;
                }
                ++totalPlayerCount;
            } else {
                mmrConfig.players_2[i] = null;
            }
        }

        // console.log(mmrConfig);
        if(totalPlayerCount < 2){
            areAllPlayersReady = false;
        }

        mmrConfig.areAllPlayersReady = areAllPlayersReady;
        return mmrConfig;
    },

    sendMMRUpdateToPlayers: function(){
        
        for(var i = 0; i < environmentState.maxMatchMakingRoomCount; ++i){
            const mmr = this.user_matchMaking_rooms[i];

            if(mmr.isActive == true){
                // console.log('sendMMRUpdateToPlayers:', i);

                if(this.serverTime - mmr.creationTime > this.mmrLifeSpan){
                    // console.log('mmr lifespan expired.');
                    this.deallocateMatchMakingRoom(i);
                    continue;
                }

                const mmrConfig = this.getMMRConfig(mmr);
                mmrConfig.timeRemaining = Math.round((this.mmrLifeSpan - (this.serverTime - mmr.creationTime)) / 1000);
                const mmrUpdateString = JSON.stringify({type:'message', sub:'mmrupdate', message:mmrConfig});
                // console.log('mmrUpdateString:', mmrUpdateString);
                for(var j = 0; j < environmentState.maxPlayerPerTeam; ++j){
                    // check team 1
                    if(mmr.players_1[j] != null){
                        clientBroadcaster.sendMessageToRecipientByUserID(mmr.players_1[j].id, mmrUpdateString);
                    }
                    // check team 2
                    if(mmr.players_2[j] != null){
                        clientBroadcaster.sendMessageToRecipientByUserID(mmr.players_2[j].id, mmrUpdateString);
                    }
                }
                
                // TODO: add check if all plears are ready
                if(mmrConfig.areAllPlayersReady == true){
                    // all players are ready.
                    this.evolveMatchMakingRoom(i, mmrConfig);
                }
            }
        }

        // console.log('mmr update');
    },

    notifyPlayerMatchmakingRoomAdmit: function(userId: any) {
        const userObject = this.users_server_state[userId];
        const requestJSONParam: any = {};
        requestJSONParam.type = 'message';
        requestJSONParam.sub = 'mmradmit';
        requestJSONParam.team = userObject.team;
        requestJSONParam.mmrIndex = userObject.mmrIndex;
        // console.log('notifyPlayerMatchmakingRoomAdmit requestJSONParam:', requestJSONParam);
        clientBroadcaster.sendMessageToRecipientByUserID(
            userId, JSON.stringify(requestJSONParam)
        );
    },

    notifyPlayerMatchmakingRoomExpel: function(userId: any) {
        const requestJSONParam: any = {};
        requestJSONParam.sub = 'mmrexpel';
        requestJSONParam.type = 'message';
        // console.log('notifyPlayerMatchmakingRoomExpel requestJSONParam:', requestJSONParam);
        clientBroadcaster.sendMessageToRecipientByUserID(
            userId, JSON.stringify(requestJSONParam)
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

    processUserSelectionUpdateForMMR: function(messageJSONParam: any) {
        // console.log('got selection update for:', messageJSONParam.payload.senderId);
        const requesterUserObject = this.users_server_state[messageJSONParam.payload.senderId];
        requesterUserObject.selection = messageJSONParam.payload.selection;
    },

    // processLeaveMMRRequest: function(messageJSONParam: any) {
    //     const requesterUserObject = this.users_server_state[messageJSONParam.payload.senderId];
    //     requesterUserObject.selection = messageJSONParam.payload.selection;
    // },

    processMMRReadyRequest: function(messageJSONParam: any) {
        const requesterUserObject = this.users_server_state[messageJSONParam.payload.senderId];
        requesterUserObject.isMMRReady = true;
    },

    admitPlayerToMatchmakingRoom: function(messageJSONParam: any, mmrIndex: number, team: number){
        const requesterUserObject = this.users_server_state[messageJSONParam.payload.senderId];
        if(requesterUserObject.mmrIndex != null){
            this.removePlayerFromMatchmakingRoom(requesterUserObject);
        }
        requesterUserObject.isMMRReady = false;
        // check if already in any mmr
        // console.log('admitPlayerToMatchmakingRoom:', messageJSONParam);
        // console.log('team:', team);
        var mmr = this.user_matchMaking_rooms[mmrIndex];
        let playerArray = null;

        if(team == 1){
            if(mmr.team1PlayerCount < environmentState.maxPlayerPerTeam){
                ++mmr.team1PlayerCount;
                playerArray = mmr.players_1;
            } else { // no empty slot in the given team
                return false;
            }
        } else {
            if(mmr.team2PlayerCount < environmentState.maxPlayerPerTeam){
                ++mmr.team2PlayerCount;
                playerArray = mmr.players_2;
            } else { // no empty slot in the given team
                return false;
            }
        }
        // const requesterUserObject = this.users_server_state[messageJSONParam.payload.recipientId];
        
        requesterUserObject.selection = messageJSONParam.payload.selection;
        requesterUserObject.mmrIndex = mmrIndex;
        requesterUserObject.team = team;

        for(var i = 0; i < environmentState.maxPlayerPerTeam; ++i){
            // check team 1
            if(playerArray[i] == null){
                playerArray[i] = requesterUserObject;
                break;
            }
        }

        // console.log('after admit:', mmr);
        this.notifyPlayerMatchmakingRoomAdmit(messageJSONParam.payload.senderId);
        // notify player admit update
        return true;
    },


    // if a person sends challenge/invite and is not already member of a matchmaking room
    // then create a new matchmaking room
    allocateNewGameRoomIfNeeded: function(messageJSONParam: any){ 
        // console.log('allocateNewGameRoomIfNeeded');
        const requesterUserObject = this.users_server_state[messageJSONParam.payload.senderId];
        if(requesterUserObject.mmrIndex == null){ // allocate new mmr
            for(var i = 0; i < environmentState.maxMatchMakingRoomCount; ++i){
                if(this.user_matchMaking_rooms[i].isActive == false){ // found unused game room
                    this.user_matchMaking_rooms[i].isActive = true;
                    this.user_matchMaking_rooms[i].creationTime = this.serverTime;
                    this.admitPlayerToMatchmakingRoom(messageJSONParam, i, 1);
                    
                    this.user_matchMaking_rooms[i].players_1[0] = requesterUserObject;
                    
                    break;
                }
            }
        }

        return requesterUserObject;
    },

    removePlayerFromMatchmakingRoom: function(messageJSONParam: any){
        const joineeUserObject = this.users_server_state[messageJSONParam.payload.senderId];
        if(joineeUserObject.mmrIndex == null){
            // user seems to be already removed from matchmaking room
            return;
        }
        const requesterMatchmakingRoom = this.user_matchMaking_rooms[joineeUserObject.mmrIndex];
        
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

        joineeUserObject.mmrIndex = null;
        this.notifyPlayerMatchmakingRoomExpel(messageJSONParam.payload.senderId);

        // if all players left the room.
        if(requesterMatchmakingRoom.team1PlayerCount == 0 && requesterMatchmakingRoom.team2PlayerCount == 0){
            requesterMatchmakingRoom.isActive = false;
        }
    },


    deallocateMatchMakingRoom: function(index: number){
        var matchRoom = this.user_matchMaking_rooms[index];
        matchRoom.isActive = false;

        // console.log('deallocateMatchMakingRoom:', index);

        // matchRoom.owner = null;
        for(var i = 0; i < environmentState.maxPlayerPerTeam; ++i){
            if(matchRoom.players_1[i] != null){
                matchRoom.players_1[i].mmrIndex = null;
                this.notifyPlayerMatchmakingRoomExpel(matchRoom.players_1[i].id);
            }
            if(matchRoom.players_2[i] != null){
                matchRoom.players_2[i].mmrIndex = null;
                this.notifyPlayerMatchmakingRoomExpel(matchRoom.players_2[i].id);
            }
            matchRoom.players_1[i] = null;
            matchRoom.players_2[i] = null;
        }
        matchRoom.team1PlayerCount = 0;
        matchRoom.team2PlayerCount = 0;
    },

    evolveMatchMakingRoom: function(index: number, mmrConfigParam: any){
        // console.log('evolveMatchMakingRoom:', index);
        // TOD communicate with workers to queue matchmaking room
        // const mmrthis.user_matchMaking_rooms[index];
        const requestJSON: any = {};
        requestJSON.type = 'request_game_admit_mmr';
        requestJSON.mmrConfig = mmrConfigParam;
        this.workerManager.postMessage(requestJSON);

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


