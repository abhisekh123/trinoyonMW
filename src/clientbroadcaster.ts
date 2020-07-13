
const serverState = require('./state/serverstate');

module.exports = {
    sendMessageToRecipientByUserID: function(recipientUserId: string, messageString: string){
        const userWebSocket = serverState.userIdToWSMap[recipientUserId].ws;
        userWebSocket.send(messageString); 
    },
    
}
