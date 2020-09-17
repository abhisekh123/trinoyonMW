
tg.notification = {};

tg.notification.currentState = 'idle';

tg.notification.hideNotification = function(){
    $('#notification-modal').hide();
}

tg.notification.showNotification = function(type, message){
    $('#notification-modal-content').text(message);
    $('#notification-modal').show();

    switch (type) {
        case 'challenge':
        case 'invite':
            $('#notification-modal-controls-acknowledgement').hide();
            $('#notification-modal-controls-choice').show();
            break;
        case 'ack':
            $('#notification-modal-controls-acknowledgement').hide();
            $('#notification-modal-controls-choice').show();
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

