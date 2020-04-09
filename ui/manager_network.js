
tg.network = {};

tg.network.requestGameAdmit = function() {
    var message = tg.getEmptyMessagePacket('request_game_admit');
    message.selection = tg.botSelection;
    tg.sendMessageToWS(message);
};

tg.network.sendUserInstruction = function(destinationPosition) {
    var message = tg.getEmptyMessagePacket('action');
    
    message.botId = tg.bot.userPlayerConfig.selectedBot.id;
    message.destinationPosition = destinationPosition;
    tg.sendMessageToWS(message);
};

tg.network.initNetworkManager = function() {
    console.log('initNetworkManager');
};