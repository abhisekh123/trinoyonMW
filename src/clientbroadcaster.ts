
const serverState = require('./state/serverstate');

module.exports = {
    sendMessageToRecipientByUserID: function(recipientUserId: string, messageString: string){
        const userWebSocket = serverState.users_server_state[recipientUserId].ws;
        userWebSocket.send(messageString); 
    },
    
}
