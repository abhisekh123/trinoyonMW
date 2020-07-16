import * as WebSocket from 'ws';
const serverState = require('../state/serverstate');
const environmentState = require('../state/environmentstate');
const dbManager = require('../persistance/dbmanager');

// TODO: On user join : send status (queue status)

module.exports = {

    init: function(){
        dbManager.init(serverState);
        for(var i = 0; i < environmentState.maxUserCount; ++i){
            var userObject = {
                isActive:false,
                ws:null
            };
            serverState.userArrey[i] = userObject;
        }
    },

    getUserObject: async function(profile: any){
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

    sendMessageToUser: function(ws:WebSocket, messageObject: JSON){
        ws.send(JSON.stringify(messageObject));
    },

    getUserIndexFromWebsocket: function(wsParam: WebSocket) {
        return serverState.userMap.get(wsParam);
    },

    admitNewUser: function(wsParam: WebSocket){
        console.log('trying to admit new user');
        for(var i = 0; i < environmentState.maxUserCount; ++i){
            if(!serverState.userArrey[i].isActive == false){
                serverState.userArrey[i].isActive = true;
                serverState.userArrey[i].ws = wsParam;

                // serverState.wsMapToUserArrayIndex.[wsParam] = i;
                console.log('successfully added new user:', i);
                return i;
            }
        }
        return -1;
    },

    removeUser: function(wsParam: WebSocket){
        var userIndex = this.userMap.get(wsParam);
        if(userIndex == null || userIndex == undefined){
            console.error('ERROR: while removing user. userMap does not have any such record.');
            return null;
        }else{
            this.userMap.delete(wsParam);
            this.userArrey[userIndex].isActive = false;
            this.userArrey[userIndex].ws = null;
        }
        wsParam.close();
        return userIndex;
    }
}