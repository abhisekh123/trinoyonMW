
tg.nm = {};

tg.nm.requestGameAdmit = function() {
    tg.sendMessageToWS(tg.getEmptyMessagePacket('request_game_admit'));
}
tg.nm.initNetworkManager = function() {
    console.log('initNetworkManager');
};