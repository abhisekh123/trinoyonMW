
var exampleSocket;
var tg = {};
tg.socket = null;

function resizeCanvas() {
    var canvas = document.getElementById('tc');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

tg.updateWorld = function(param){
    
}

function initSystem(){
    // console.log('trying to connect to server via WS.');

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
    
    $.get('/ox', {type:'p'}, function (data, textStatus, jqXHR) {
        console.log('ox response', data);
        tg.connectToParent(data.data.u, data.data.k);
    });
    
}

tg.connectToParent = function(parentEndPoint, keyIdentifier){
    // parentEndPoint = window.location.hostname;
    console.log('parentEndPoint:', parentEndPoint);
    console.log('keyIdentifier:', keyIdentifier);
    tg.socket = new WebSocket(parentEndPoint, keyIdentifier);
    // if(window.location.port == ''){
    //     tg.socket = new WebSocket("wss://" + parentEndPoint, [keyIdentifier, "protocolTwo"]);
    // }else{
    //     tg.socket = new WebSocket("ws://" + parentEndPoint + ":" + window.location.port , [keyIdentifier, "protocolTwo"]);
    // }
    tg.socket.onopen = function (event) {
        console.log('connected to websocket server.');
        tg.sendMessageToWS(tg.getEmptyMessagePacket('init'));
    };

    tg.socket.onmessage = function (event) {
        // console.log('got message from server::' + event.data);
        const responseJSON = JSON.parse(event.data);
        if(responseJSON.type == 'update'){// message is game update
            console.log('processing update.', responseJSON);
            tg.updateWorld(responseJSON);
        }else if(responseJSON.type == 'game_config'){
            console.log('processing game_config.', responseJSON);
            tg.world.startNewMatch(responseJSON.playerConfig, responseJSON.playerIndex);
            // alert('could not join. game is full.');
        }else if(responseJSON.type == 'request_game_admit_nack'){
            // console.log('processing request_game_admit_nack.');
            alert('could not join. game is full.');
        }else if(responseJSON.type == 'request_game_admit_ack'){
            // console.log('processing request_game_admit_ack.');
            // tg.UIConfig.advancedTexture.removeControl(tg.UIConfig.playButton);
            // tg.startGamePlay(responseJSON);
            tg.pn.showGameStartCountDownPage(responseJSON.estimatedTimeInSeconds);
        }else if(responseJSON.type == 'ack_request_game_exit'){
            // console.log('processing ack_request_game_exit.');
            // tg.UIConfig.advancedTexture.removeControl(tg.UIConfig.exitGameButton);
            // tg.showHomePage();
            location.reload();
        }else if(responseJSON.type == 'request_game_world_reload'){
            // console.log('get request_game_world_reload from server.', responseJSON);
        }else{// message is code.
            var myFunction = eval(responseJSON.message);
            entrypoint();
        }
    };
}

tg.sendMessageToWS = function(message){
    tg.socket.send(JSON.stringify(message));
}


tg.getEmptyMessagePacket = function(type){
    var container = {};
    container.type = type;
    return container;
    // return JSON.stringify(container);
}

tg.getActionPacketJSON = function(type){
    var container = {};
    container.type = 'action';
    container.message = {};
    container.message.type = type;

    return container;
}

