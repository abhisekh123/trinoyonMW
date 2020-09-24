
// const serverState = require('./state/serverstate');
import { request_message } from './factory/types';
const userManager = require('./control/usermanager');

module.exports = {
    serverState: null,
    init: function (serverState: any) {
        this.serverState = serverState;
    },
    sendMessageToRecipientByUserID: function (recipientUserId: string, messageString: string) {
        const userWebSocket = this.serverState.users_server_state[recipientUserId].ws;
        // userWebSocket.send(messageString);
        try {
            userWebSocket.send(messageString);
        } catch (error) {
            console.log(error);
        }
    },

    forewardToAllOnlineNonPlayingUser: function (requestJSON: any) {
        requestJSON.senderTeam = 0;
        requestJSON.senderUserId = requestJSON.userId;
        requestJSON.senderName = this.serverState.users_db_state[requestJSON.userId].firstName + ' ' + this.serverState.users_db_state[requestJSON.userId].lastName;
        
        // userWebSocket.send(messageString);
        var messageString = JSON.stringify(requestJSON);
        // serverState.user_id_list
        for(var i = 0; i < this.serverState.user_id_list.length; ++i){
            var userId = this.serverState.user_id_list[i];
            if(userManager.isUserOnline(userId)){
                const userWebSocket = this.serverState.users_server_state[userId].ws;
                try {
                    userWebSocket.send(messageString);
                } catch (error) {
                    console.log(error);
                }
            }    
        }
    },
    
}
