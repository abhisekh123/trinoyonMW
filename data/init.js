

function initInputListeners(){
    // alert('initInputListeners');
    // var canvas = document.getElementById('tc');
    // canvas.addEventListener('click', (event) => {
    //     var pos = {
    //         x: event.clientX,
    //         y: event.clientY
    //     };
    //     console.log('canvas click', pos);
    // });

    sendMessageToWS(getEmptyMessagePacket('init_video'));
}

function entrypoint(){
    initInputListeners();
}