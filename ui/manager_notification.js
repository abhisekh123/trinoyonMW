
tg.notification = {};

tg.notification.currentState = 'idle';

tg.notification.hideNotification = function(){
    $('#notification-modal').hide();
}

tg.notification.showNotification = function(type, message){
    switch (type) {
        case 'challenge':
        case 'invite':
            $('#notification-modal-content').text("You received a " + messageParam.sub + " request.");
            $('#notification-modal').show();
            $('#notification-modal-controls-acknowledgement').hide();
            $('#notification-modal-controls-choice').show();
            break;
    
        default:
            break;
    }
}

tg.notification.processAcknowledgementEvent = function(element){
    tg.notification.hideNotification();
}

tg.notification.processYesResponse = function(element){
    tg.notification.hideNotification();
}

tg.notification.processNoResponse = function(element){
    tg.notification.hideNotification();
}

