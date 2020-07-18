import * as WebSocket from 'ws';
const serverState = require('../state/serverstate');
const environmentState = require('../state/environmentstate');
const dbManager = require('../persistance/dbmanager');

// TODO: On user join : send status (queue status)

module.exports = {

    init: function(){
        dbManager.init(serverState);
        // for(var i = 0; i < environmentState.maxUserCount; ++i){
        //     var userObject = {
        //         isActive:false,
        //         ws:null
        //     };
        //     serverState.userArrey[i] = userObject;
        // }
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

}