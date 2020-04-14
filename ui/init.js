

function initClient(){
    console.log('initClient');

    // initialise the clock with running status.
    tg.clockTickInterval = 1000;
    tg.clock = setInterval(tg.clockUpdateEventHandler, tg.clockTickInterval);
    tg.clockTimeElapsed = 0;

    tg.debugMode = false;
    // setTimeout(tg.stopClock, 4000);
}

tg.clockUpdateEventHandler = function() {
    // place holder
    // console.log('clock updated:', tg.clockTimeElapsed);
    tg.clockTimeElapsed += tg.clockTickInterval;
    tg.clockUpdateEventHandler_customActivity();
}

// this is the custom method which can be overridden to do custom activity for every clock tick.
tg.clockUpdateEventHandler_customActivity = function(){
    // do nothing
    // console.log('clockUpdateEventHandler_customActivity');
}

tg.resetClockTimeElapsed = function(){
    tg.clockTimeElapsed = 0;
}

tg.startClock = function() {
    if(tg.clockUpdateEventHandler != null || tg.clock != null){
        console.log('clock seems to be running already');
    }

    // tg.clockUpdateEventHandler = callBackFunction;
    tg.clock = setInterval(tg.clockUpdateEventHandler, tg.clockTickInterval);
}

tg.stopClock = function() {
    console.log('stopping the clock.');
    clearInterval(tg.clock);
    tg.clock = null;
    // tg.clockUpdateEventHandler = null;
}

tg.getDistanceBetweenPoints = function (startX, startZ, endX, endZ) {
    // check if all the coordinate values are within acceptable range(ie inside grid)
    if (startX < 0 || endX < 0 || startZ < 0 || endZ < 0
        || startX > tg.worldItems.gridSide 
        || endX > tg.worldItems.gridSide 
        || startZ > tg.worldItems.gridSide 
        || endZ > tg.worldItems.gridSide
    ) {
        return -1;
    }

    return tg.distanceMatrix[Math.abs(endX - startX)][Math.abs(endZ - startZ)];
}

function entrypoint(){
    initClient();
    tg.network.initNetworkManager();
    // console.log('1');
    var packet = tg.getEmptyMessagePacket('init_ui');
    console.log(packet);
    tg.sendMessageToWS(packet);
}


