import * as WebSocket from 'ws';
const serverState = require('../state/serverstate');
// const environmentState = require('../state/environmentstate');
const dbManager = require('../persistance/dbmanager');
const workermanager = require('../workermanager');

// TODO: On user join : send status (queue status)

module.exports = {

    init: function () {
        dbManager.init(serverState);
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

    sendMessageToUser: function (ws: WebSocket, messageObject: JSON) {
        ws.send(JSON.stringify(messageObject));
    },

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
            workermanager.postMessage(requestJSON);
        }
    },

    updateWorkerWithNewUserConnection: function (userId: string) {
        var userState = serverState.users_server_state[userId].state;
        switch (userState) {
            case 'idle':

                break;
            case 'playing':
            case 'matchmaking':
                var requestJSON = {
                    type: 'client_reconnect',
                    userId: userId
                }
                workermanager.postMessage(requestJSON);
                break;
            default:
                break;
        }
    }
}


