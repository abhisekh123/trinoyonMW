
tg.notification = {};

tg.notification.currentState = 'idle';
tg.notification.payload = null;

tg.notification.hideNotification = function(){
    $('#notification-modal').hide();
};


tg.notification.updateLeaderBoard = function(persistant_server_state){
    if(!persistant_server_state || !persistant_server_state.weeklytopplayers || !persistant_server_state.weeklytopplayers.topPlayers){
        console.log('input doesnot contain top player list');
        return; 
    }

    const topPlayerList = persistant_server_state.weeklytopplayers.topPlayers;
    
    const leaderBoardHeader = document.getElementById('leaderboard-modal-header');
    leaderBoardHeader.innerHTML = persistant_server_state.weeklytopplayers.header;

    const tableElement = document.getElementById('leaderboard-table');
    tg.uu.populateTableWithJSONArray(topPlayerList, tableElement);
};

tg.notification.showNotification = function(type, message, payload){
    tg.notification.currentState = type;
    tg.notification.payload = payload;
    $('#notification-modal-content').text(message);
    $('#notification-modal').show();

    switch (type) {
        case 'challenge':
        case 'invite':
            $('#notification-modal-controls-acknowledgement').hide();
            $('#notification-modal-controls-choice').show();
            break;
        case 'rejectmatchmakingrequest':
        case 'mmrfull':
        case 'request_game_admit_nack':
        case 'mmralreadystarted':
        case 'textdialogue':
            $('#notification-modal-controls-acknowledgement').show();
            $('#notification-modal-controls-choice').hide();
        default:
            break;
    }
};

tg.notification.processAcknowledgementEvent = function(element){
    tg.notification.hideNotification();
};

tg.notification.processYesResponse = function(element){
    tg.notification.processUserReaction(true);
    tg.notification.hideNotification();
};

tg.notification.processNoResponse = function(element){
    tg.notification.processUserReaction(false);
    tg.notification.hideNotification();
};

tg.notification.processUserReaction = function(reactionFlag){
    switch (tg.notification.currentState) {
        case 'challenge':
        case 'invite':
            // console.log(tg.notification.payload);
            if(reactionFlag == true){ // accepted matchmaking request
                tg.message.acceptMatchmakingRequest(tg.notification.payload);
            } else { // rejected matchmaking request
                tg.message.rejectMatchmakingRequest(tg.notification.payload);
            }
            break;
    
        default:
            break;
    }
}

