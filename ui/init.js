

function initClient(){
    console.log('initClient');
    
}

function entrypoint(){
    initClient();
    tg.nm.initNetworkManager();
    console.log('1');
    var packet = tg.getEmptyMessagePacket('init_ui');
    console.log(packet);
    tg.sendMessageToWS(packet);
}