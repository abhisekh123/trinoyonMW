
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
    console.log('trying to connect to server via WS.');

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();

    // tg.socket = new WebSocket("ws://" + window.location.hostname + ":8999", ["protocolOne", "protocolTwo"]);
    tg.socket = new WebSocket("wss://" + window.location.hostname + ":443", ["protocolOne", "protocolTwo"]);
    tg.socket.onopen = function (event) {
        console.log('connected to websocket server.');
        sendMessageToWS(getEmptyMessagePacket('init'));
    };

    tg.socket.onmessage = function (event) {
        // console.log('got message from server::' + event.data);
        const responseJSON = JSON.parse(event.data);
        if(responseJSON.type == 'update'){// message is game update
            console.log('processing update.');
            tg.updateWorld(responseJSON);
        }else if(responseJSON.type == 'request_game_admit_nack'){
            console.log('processing request_game_admit_nack.');
            alert('could not join. game is full.');
        }else if(responseJSON.type == 'request_game_admit_ack'){
            console.log('processing request_game_admit_ack.');
            tg.UIConfig.advancedTexture.removeControl(tg.UIConfig.playButton);
            tg.startGamePlay(responseJSON);
        }else if(responseJSON.type == 'ack_request_game_exit'){
            console.log('processing ack_request_game_exit.');
            tg.UIConfig.advancedTexture.removeControl(tg.UIConfig.exitGameButton);
            tg.showHomePage();
        }else if(responseJSON.type == 'request_game_world_reload'){
            console.log('get request_game_world_reload from server.', responseJSON);
        }else{// message is code.
            var myFunction = eval(responseJSON.message);
            entrypoint();
        }
    };
}

function sendMessageToWS(message){
    tg.socket.send(message);
}

function sendJSONMessageToWS(message){
    tg.socket.send(JSON.stringify(message));
}

function getEmptyMessagePacket(type){
    var container = {};
    container.type = type;

    return JSON.stringify(container);
}

function getActionPacketJSON(type){
    var container = {};
    container.type = 'action';
    container.message = {};
    container.message.type = type;

    return container;
}

