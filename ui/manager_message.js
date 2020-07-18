tg.message = {};

tg.message.latestMessages = [];
tg.message.firstMessage = null;
tg.message.isUIVisible = false;
tg.message.messageRecipients = 'team';

tg.message.messageInputKeyUp = function (element) {
    var textContent = element.value;
    var counterElement = $('.message-text-counter')[0];
    console.log(textContent);
    if(textContent.length > 128){
        element.value = element.value.substring( 0, 128 );
        counterElement.value = '128/128';
    } else {
        counterElement.value = textContent.length + '/128';
    }
}

tg.message.recipientSelectionUpdated = function () {
    var selectedIndex = $('.message-recipients')[0].selectedIndex;
    // console.log('selectedIndex:', selectedIndex);
    switch (selectedIndex) {
        case 0:
            tg.message.messageRecipients = 'team';
            break;
        case 1:
            tg.message.messageRecipients = 'all';
            break;
        default:
            break;
    }
    console.log('tg.message.messageRecipients:', tg.message.messageRecipients);
}

tg.message.init = function () {
    // alert('mm');
    var messageObject = null;
    for (var i = 0; i < tg.worldItems.uiConfig.maxMessageBufferSize; ++i) {
        messageObject = {
            next: null,
            message: null,
            time: null,
            sender: null,
            team: null
        };
        tg.message.latestMessages.push(messageObject);
        if (i == 0) {
            tg.message.firstMessage = messageObject;
        } else {
            tg.message.latestMessages[i - 1].next = messageObject;
        }
    }
    messageObject.next = tg.message.latestMessages[0];
};

tg.message.consumeMessage = function () {

};

tg.message.renderMessagesToUI = function () {

};

tg.message.showMessagesUI = function () {
    tg.message.isUIVisible = true;
};

tg.message.hideMessagesUI = function () {
    tg.message.isUIVisible = false;
};