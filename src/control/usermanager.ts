import * as WebSocket from 'ws';
// const serverState = require('../state/serverstate');
// const environmentState = require('../state/environmentstate');
const dbManager = require('../persistance/dbmanager');
// const workermanager = require('../workermanager'); // somehow this doesnot work :(

// TODO: On user join : send status (queue status)

module.exports = {
    serverState: null,
    workerManager: null,
    init: function (workerManagerParam: any, serverState: any) {
        this.workerManager = workerManagerParam;
        this.serverState = serverState;
        dbManager.init(this.serverState);
        // for(var i = 0; i < environmentState.maxUserCount; ++i){
        //     var userObject = {
        //         isActive:false,
        //         ws:null
        //     };
        //     serverState.userArrey[i] = userObject;
        // }
    },

    getUserObject: async function (profile: any) {
        // const user = await dbManager.findUser(profile.id);
        const user = this.serverState.users_db_state[profile.id];
        if (user == undefined || user == null) {
            // console.log('creating new user');
            const newUser = await dbManager.createNewUser(profile);
            return newUser;
        } else {
            // console.log('known user');
            return user;
        }
    },

    // sendMessageToUser: function (ws: WebSocket, messageObject: JSON) {
    //     ws.send(JSON.stringify(messageObject));
    // },

    getUserIndexFromWebsocket: function (wsParam: WebSocket) {
        return this.serverState.userMap.get(wsParam);
    },

    disconnectUser: function (userId: string) {
        
        if (this.serverState.users_server_state[userId].ws != null) {
            // console.log('disconnectUser:', userId);
            this.serverState.users_server_state[userId].ws.close();
            this.serverState.users_server_state[userId].ws = null;

            this.serverState.users_server_state[userId].isOnline = false;
            var requestJSON = {
                type: 'client_disconnected',
                userId: userId
            };
            // console.log(this.workerManager);
            // this.workermanager.postMessage()
            this.workerManager.postMessage(requestJSON);
        }
    },

    connectUser: function(userId: string, ws: WebSocket){
        this.serverState.users_server_state[userId].ws = ws;
        this.serverState.users_server_state[userId].isOnline = true;
        this.serverState.users_db_state[userId].lastLogin = this.serverState.serverTime;
        dbManager.updateUser(userId);
    },

    updatePlayerRecordFromGameResult: function(gameRoom: any){
        // console.log('updatePlayerRecordFromGameResult', gameRoom);
        const winningTeam = gameRoom.winningTeam;
        // update team 1 player configs
        for(let i = 0, j = 0; i < gameRoom.players_1.length; ++i){
            if(gameRoom.players_1[i].userId != null){
                const users_db_state = this.serverState.users_db_state[gameRoom.players_1[i].userId];
                if(users_db_state == null || users_db_state == undefined){
                    // user does not exist.
                    continue;
                }

                // player performance object
                const playerPerformanceObject = gameRoom.statistics.detailedPerformance[i];

                let totalDamage = 0;
                let totalDeath = 0;
                let totalKills = 0;
                let totalBuildingsDestroyed = 0;

                for (let j = 0; j < playerPerformanceObject.length; ++j) {
                    totalDamage += playerPerformanceObject[j].totalDamageSinceGameStart;
                    totalDeath += playerPerformanceObject[j].totalDeath;
                    totalKills += playerPerformanceObject[j].totalBotKill;
                    totalBuildingsDestroyed += playerPerformanceObject[j].totalBuildingDestroy;
                }

                if(winningTeam == 1){
                    users_db_state.totalwin += 1;
                    users_db_state.weeklywin += 1;
                } else {
                    users_db_state.totalloss += 1;
                    users_db_state.weeklyloss += 1;
                }

                users_db_state.tdeath += totalDeath;
                users_db_state.wdeath +=totalDeath ;
                users_db_state.tkill +=totalKills ;
                users_db_state.wkill += totalKills;
                users_db_state.tdestroy += totalBuildingsDestroyed;
                users_db_state.wdestroy += totalBuildingsDestroyed;

                users_db_state.tattack += totalDamage;
                users_db_state.wattack += totalDamage;

                dbManager.updateUser(gameRoom.players_1[i].userId);
            }
        }

        
    }, 

    

    // test: function() {
    //     console.log('test successful');
    //     alert(23);
    // },

    isUserOnline: function(userId: string){
        if(this.serverState.users_server_state[userId].ws == null || this.serverState.users_server_state[userId].isOnline == false){
            return false;
        }
        return true;
    },

    // updateWorkerWithNewUserConnection: function (userId: string) {
    //     var userState = serverState.users_server_state[userId].state;
    //     switch (userState) {
    //         case 'idle':

    //             break;
    //         case 'playing':
    //         case 'matchmaking':
    //             var requestJSON = {
    //                 type: 'client_reconnect',
    //                 userId: userId
    //             }
    //             workermanager.postMessage(requestJSON);
    //             break;
    //         default:
    //             break;
    //     }
    // }
}


