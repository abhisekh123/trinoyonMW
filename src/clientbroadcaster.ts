
const serverState = require('./state/serverstate');
import { request_message } from './factory/types';
const userManager = require('./control/usermanager');

module.exports = {
    sendMessageToRecipientByUserID: function (recipientUserId: string, messageString: string) {
        const userWebSocket = serverState.users_server_state[recipientUserId].ws;
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
        requestJSON.senderName = serverState.users_db_state[requestJSON.userId].firstName + ' ' + serverState.users_db_state[requestJSON.userId].lastName;
        
        // userWebSocket.send(messageString);
        var messageString = JSON.stringify(requestJSON);
        // serverState.user_id_list
        for(var i = 0; i < serverState.user_id_list.length; ++i){
            var userId = serverState.user_id_list[i];
            if(userManager.isUserOnline(userId)){
                const userWebSocket = serverState.users_server_state[userId].ws;
                try {
                    userWebSocket.send(JSON.stringify(requestJSON));
                } catch (error) {
                    console.log(error);
                }
            }    
        }
    },
    
}
