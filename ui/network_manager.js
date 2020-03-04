
tg.nm = {};

tg.nm.requestGameAdmit = function() {
    var message = tg.getEmptyMessagePacket('request_game_admit');
    message.selection = tg.botSelection;
    tg.sendMessageToWS(message);
}
tg.nm.initNetworkManager = function() {
    console.log('initNetworkManager');
};