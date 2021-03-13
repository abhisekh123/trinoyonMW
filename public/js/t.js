


var exampleSocket;
var tg = {};
tg.socket = null;

function resizeCanvas() {
    var canvas = document.getElementById('tc');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

};

tg.updateWorld = function (param) {

};

tg.self = {};
tg.self.userConfig = null;

tg.self.updateUserConfig = function(userConfig, persistant_server_state){

    tg.self.userConfig = userConfig;
    tg.self.userConfig.joinedMMR = false;
    tg.self.persistant_server_state = persistant_server_state;
    // tg.self.updateLeaderBoard(tg.self.persistant_server_state);
    // console.log('self userConfig:', tg.self.userConfig);
    $('#hg-player').text(tg.self.userConfig.firstName + ' ' + tg.self.userConfig.lastName);
};


function initSystem() {
    // console.log('trying to connect to server via WS.');

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();


    $.get('/ox', {
        type: 'p'
    }, function (data, textStatus, jqXHR) {
        console.log('ox response', data);
        tg.self.updateUserConfig(data.data.userConfig, data.data.persistant_server_state);
        tg.connectToParent(data.data.u, data.data.k);
    });
    // console.log($('#ad-iframe'));
    // $('#ad-iframe').on('load', function() {
    //     tg.iframeLoaded();
    // });
    // setTimeout((()=>{
    //     console.log('calling checktext');
    //     checktext();
    // }), 10000);

    // $(window).bind('beforeunload', function () {
    //     return 'Are you sure you want to leave?';
    // });
    // window.onbeforeunload = function(){
    //     tg.onAppExit();
    //     return 'Are you sure you want to leave?';
    //   };
    // $(window).bind('beforeunload', function(){
    //     myfun();
    //     return 'Are you sure you want to leave?';
    //   });
}

tg.onAppExit = function(){
    // Write your business logic here
    return 'Are you sure you want to leave?';
}


tg.connectToParent = function (parentEndPoint, keyIdentifier) {
    // parentEndPoint = window.location.hostname;
    // console.log('parentEndPoint:', parentEndPoint);
    // console.log('keyIdentifier:', keyIdentifier);
    tg.socket = new WebSocket(parentEndPoint, keyIdentifier);
    // if(window.location.port == ''){
    //     tg.socket = new WebSocket("wss://" + parentEndPoint, [keyIdentifier, "protocolTwo"]);
    // }else{
    //     tg.socket = new WebSocket("ws://" + parentEndPoint + ":" + window.location.port , [keyIdentifier, "protocolTwo"]);
    // }
    tg.socket.onopen = function (event) {
        // console.log('connected to websocket server.');
        tg.sendMessageToWS(tg.getEmptyMessagePacket('init'));
    };

    tg.socket.onmessage = function (event) {
        // console.log('got message from server::' + event.data);
        const responseJSON = JSON.parse(event.data);
        if (responseJSON.type == 'update') { // message is game update
            // console.log('processing update.', responseJSON);
            tg.updateWorld(responseJSON);
        } else if (responseJSON.type == 'message') {
            // console.log('processing message.', responseJSON);
            // tg.world.startNewMatch(responseJSON.playerConfig, responseJSON.playerIndex);
            tg.message.consumeMessage(responseJSON);
            // alert('could not join. game is full.');
        } else if (responseJSON.type == 'game_config') {
            console.log('processing game_config.', responseJSON);
            tg.world.startNewMatch(responseJSON.playerConfig, responseJSON.playerIndex);
            // alert('could not join. game is full.');
        } else if (responseJSON.type == 'result') {
            console.log('processing result.', responseJSON);
            tg.world.processResult(responseJSON.playerConfig);
            // tg.world.startNewMatch(responseJSON.playerConfig, responseJSON.playerIndex);
            // alert('could not join. game is full.');
        } else if (responseJSON.type == 'request_game_admit_nack') {
            // console.log('processing request_game_admit_nack.');
            // alert('could not join. game is full. please try after some time.');
            responseJSON.sub = 'request_game_admit_nack'
            tg.notification.showNotification(responseJSON.sub, "All game rooms full. Could not join you.", responseJSON);
        } else if (responseJSON.type == 'request_game_admit_ack') {
            // console.log('processing request_game_admit_ack.');
            // tg.UIConfig.advancedTexture.removeControl(tg.UIConfig.playButton);
            // tg.startGamePlay(responseJSON);
            tg.pn.showGameStartCountDownPage(responseJSON.estimatedTimeInSeconds);
        } else if (responseJSON.type == 'ack_request_game_exit') {
            // console.log('processing ack_request_game_exit.');
            // tg.UIConfig.advancedTexture.removeControl(tg.UIConfig.exitGameButton);
            // tg.showHomePage();
            location.reload();
        } else if (responseJSON.type == 'request_game_world_reload') {
            // console.log('get request_game_world_reload from server.', responseJSON);
        } else if (responseJSON.type == 'updateuserconfigfromresult') {
            console.log('get updateuserconfigfromresult from server.', responseJSON);
        } else if (responseJSON.type == 'textdialogue') {
            console.log('get updateuserconfigfromresult from server.', responseJSON);
            responseJSON.sub = 'textdialogue'
            tg.notification.showNotification(responseJSON.sub, responseJSON.payload.message, responseJSON);
        } else { // message is code.
            var myFunction = eval(responseJSON.message);
            entrypoint();
        }
    };
}

tg.sendMessageToWS = function (message) {
    tg.socket.send(JSON.stringify(message));
}


tg.getEmptyMessagePacket = function (type) {
    var container = {};
    container.type = type;
    return container;
    // return JSON.stringify(container);
};

tg.getActionPacketJSON = function (type) {
    var container = {};
    container.type = 'action';
    container.message = {};
    container.message.type = type;

    return container;
};


