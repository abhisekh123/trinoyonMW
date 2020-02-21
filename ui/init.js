

function initInputListeners(){
    tg.sendMessageToWS(tg.getEmptyMessagePacket('init_video'));
}

function entrypoint(){
    initInputListeners();
    tg.testNetworkMethod();
}