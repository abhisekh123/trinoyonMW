

tg.message = {};

tg.message.latestMessages = [];
tg.message.firstMessage = null;
tg.message.isUIVisible = false;

tg.message.init = function(){
    // alert('mm');
    var messageObject = null;
    for(var i = 0; i < tg.worldItems.uiConfig.maxMessageBufferSize; ++i){
        messageObject = {
            next: null,
            message: null,
            time: null,
            sender: null,
            team: null
        };
        tg.message.latestMessages.push(messageObject);
        if(i==0){
            tg.message.firstMessage = messageObject;
        } else {
            tg.message.latestMessages[i - 1].next = messageObject;
        }
    }
    messageObject.next = tg.message.latestMessages[0];
};

tg.message.consumeMessage = function(){

};

tg.message.renderMessagesToUI = function(){

};

tg.message.showMessagesUI = function(){
    tg.message.isUIVisible = true;
};

tg.message.hideMessagesUI = function(){
    tg.message.isUIVisible = false;
};

