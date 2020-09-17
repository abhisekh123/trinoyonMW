import * as WebSocket from 'ws';
const serverState = require('../state/serverstate');
// const environmentState = require('../state/environmentstate');
const dbManager = require('../persistance/dbmanager');
// const workermanager = require('../workermanager'); // somehow this doesnot work :(

// TODO: On user join : send status (queue status)

module.exports = {

    workerManager: null,
    init: function (workerManagerParam: any) {
        dbManager.init(serverState);
        this.workerManager = workerManagerParam;
        // for(var i = 0; i < environmentState.maxUserCount; ++i){
        //     var userObject = {
        //         isActive:false,
        //         ws:null
        //     };
        //     serverState.userArrey[i] = userObject;
        // }
    },

    getUserObject: async function (profile: any) {
        const user = await dbManager.findUser(profile.id);
        if (user) {
            // console.log('known user');
            return user;
        } else {
            // console.log('creating new user');
            const newUser = await dbManager.createNewUser(profile);
            return newUser;
        }
    },

    // sendMessageToUser: function (ws: WebSocket, messageObject: JSON) {
    //     ws.send(JSON.stringify(messageObject));
    // },

    getUserIndexFromWebsocket: function (wsParam: WebSocket) {
        return serverState.userMap.get(wsParam);
    },

    disconnectUser: function (userId: string) {
        
        if (serverState.users_server_state[userId].ws != null) {
            console.log('disconnectUser:', userId);
            serverState.users_server_state[userId].ws.close();
            serverState.users_server_state[userId].ws = null;

            serverState.users_server_state[userId].isOnline = false;
            var requestJSON = {
                type: 'client_disconnected',
                userId: userId
            };
            console.log(this.workerManager);
            // this.workermanager.postMessage()
            this.workerManager.postMessage(requestJSON);
        }
    },

    connectUser: function(userId: string, ws: WebSocket){
        serverState.users_server_state[userId].ws = ws;
        serverState.users_server_state[userId].isOnline = true;
    },

    isUserOnline: function(userId: string){
        if(serverState.users_server_state[userId].ws == null || serverState.users_server_state[userId].isOnline == false){
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


