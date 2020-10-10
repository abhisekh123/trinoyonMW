tg.message = {};

tg.message.latestMessages = [];
// tg.message.firstMessage = null;
tg.message.newestMessageIndex = 0;
tg.message.isUIVisible = false;
tg.message.messageRecipients = 'team';

tg.message.state = {
    requestedUsers: [

    ],
    incomingRequests: [

    ],
    messageSent: false,
    messageSentTime: 0,
};



tg.message.messageInputKeyUp = function (element, event) {
    var textContent = element.value;
    var counterElement = $('.message-text-counter')[0];
    // console.log('textContent:', event);
    if (event.key.toString().toLowerCase() === 'enter') {
        // Cancel the default action, if needed
        event.preventDefault();
        tg.message.sendMessage();
    }
    
    if (textContent.length > 128) {
        element.value = element.value.substring(0, 128);
        counterElement.value = '128/128';
    } else {
        counterElement.value = textContent.length + '/128';
    }

};

tg.message.testUserIds = [{
        name: 'user12',
        id: 12
    },
    {
        name: 'user34',
        id: 34
    },
    {
        name: 'user54',
        id: 54
    }
];

tg.message.autoResetUI = function () {
    if (tg.message.state.messageSent == true) {
        if ((tg.currentTime - tg.message.state.messageSentTime) > 2000) {
            tg.message.state.messageSent = false;
            $('.container-send-message-button').removeClass("disabled-element");
        }
    }

}


tg.message.recipientSelectionUpdated = function (element) {
    // var selectedIndex = $('.message-recipients')[0].selectedIndex;
    // console.log('selectedIndex:', element.value);
    tg.message.messageRecipients = element.value;
    // console.log('tg.message.messageRecipients:', tg.message.messageRecipients);
};

tg.message.acceptMatchmakingRequest = function (messajeJSONParam) {

    // var sendPacket = {
    //     senderId: tg.self.userConfig.id,
    //     recipientId: messajeJSONParam.userId,
    //     selection: tg.botSelection,
    // };

    messajeJSONParam.senderId = tg.self.userConfig.id;
    messajeJSONParam.recipientId = messajeJSONParam.userId;
    messajeJSONParam.selection = tg.botSelection;

    tg.network.sendMatchmakingInstruction('acceptmatchmakingrequest', messajeJSONParam);
};

tg.message.rejectMatchmakingRequest = function (messajeJSONParam) {

    var sendPacket = {
        senderId: tg.self.userConfig.id,
        recipientId: messajeJSONParam.userId
    };

    tg.network.sendMatchmakingInstruction('rejectmatchmakingrequest', sendPacket);
};

tg.message.invitePlayer = function (index) {
    var oldestMessageArrayIndex = tg.uu.getNextArrayIndex(tg.message.newestMessageIndex, 1, tg.message.latestMessages);
    var messageArrayIndex = (oldestMessageArrayIndex + index) % tg.message.latestMessages.length;
    var messageObject = tg.message.latestMessages[messageArrayIndex];
    // console.log('invite:', messageObject);

    var senderId = tg.self.userConfig.id;
    var recipientId = messageObject.userId;

    var sendPacket = {
        senderId: senderId,
        recipientId: recipientId,
        selection: tg.botSelection,
    };

    tg.network.sendMatchmakingInstruction('invite', sendPacket);
};

tg.message.mmrSelectionChangeUpdate = function () {
    var sendPacket = {
        senderId: tg.self.userConfig.id,
        selection: tg.botSelection,
    };
    tg.network.sendMatchmakingInstruction('mmrselectionchange', sendPacket);
};


tg.message.readyMMR = function(){
    var sendPacket = {
        senderId: tg.self.userConfig.id,
    };
    tg.network.sendMatchmakingInstruction('mmrready', sendPacket);
    $('#button-home-ready').attr("disabled", true);
}

tg.message.leaveMMR = function(){
    var sendPacket = {
        senderId: tg.self.userConfig.id,
    };
    tg.network.sendMatchmakingInstruction('mmrleave', sendPacket);
}

tg.message.challengePlayer = function (index) {
    var oldestMessageArrayIndex = tg.uu.getNextArrayIndex(tg.message.newestMessageIndex, 1, tg.message.latestMessages);
    var messageArrayIndex = (oldestMessageArrayIndex + index) % tg.message.latestMessages.length;
    var messageObject = tg.message.latestMessages[messageArrayIndex];
    // console.log('challenge:', messageObject);

    var senderId = tg.self.userConfig.id;
    var recipientId = messageObject.userId;

    var sendPacket = {
        senderId: senderId,
        recipientId: recipientId,
        selection: tg.botSelection,
    };

    tg.network.sendMatchmakingInstruction('challenge', sendPacket);
};

tg.message.sendMessage = function () {
    // var sendPacket = {
    //     recipients: tg.message.messageRecipients,
    //     message: $('.message-input')[0].value,
    //     serverTime: 10000343242390847,
    //     messageTime: tg.uu.getRandom(0, 10000343242390847),
    // };

    var sendPacket = {
        // recipients: tg.message.messageRecipients,
        message: $('.message-input')[0].value,
        // serverTime: 10000343242390847,
        // messageTime: tg.uu.getRandom(0, 10000343242390847),
    };

    $('.container-send-message-button').addClass("disabled-element");
    tg.message.state.messageSent = true;
    tg.message.state.messageSentTime = tg.currentTime;

    // console.log('sendPacket:', sendPacket);

    // test code start
    // sendPacket.senderName = tg.message.testUserIds[tg.uu.getRandom(0, tg.message.testUserIds.length - 1)].name;
    // sendPacket.senderUserId = tg.message.testUserIds[tg.uu.getRandom(0, tg.message.testUserIds.length - 1)].id;
    // sendPacket.senderTeam = tg.self.userConfig.team;

    // tg.message.consumeMessage(sendPacket);
    tg.network.sendTextMessage(sendPacket);
}


tg.message.consumeMessage = function (messageParam) {
    // console.log('consume message:', messageParam);

    switch (messageParam.sub) {
        case 'text':
            // replace oldest message with the new message.
            var oldestMessageArrayIndex = tg.uu.getNextArrayIndex(tg.message.newestMessageIndex, 1, tg.message.latestMessages);

            var messageObject = tg.message.latestMessages[oldestMessageArrayIndex];

            messageObject.message = messageParam.payload.message;
            messageObject.time = messageParam.serverTime - messageParam.messageTime;
            messageObject.sender = messageParam.senderName;
            messageObject.team = messageParam.senderTeam;
            messageObject.isValid = true;
            messageObject.userId = messageParam.userId;

            tg.message.newestMessageIndex = oldestMessageArrayIndex;
            // switch (tg.pn.currentPage) {
            //     case value:
            //         break;
            //     default:
            //         break;
            // }
            tg.message.renderMessagesToUI();
            break;

        case 'invite':
        case 'challenge':
            tg.notification.showNotification(messageParam.sub, "You received a " + messageParam.sub + " request.", messageParam);
            break;
        case 'mmrfull':
            tg.notification.showNotification(messageParam.sub, "Could not join. Team is already at full capacity.", messageParam);
            break;
        case 'mmralreadystarted':
            tg.notification.showNotification(messageParam.sub, "Could not join. Match is already started.", messageParam);
            break;
        case 'mmrupdate':
            tg.view.processMMRUpdate(messageParam);
            break;
        case 'mmrexpel':
            tg.self.userConfig.joinedMMR = false;
            tg.self.userConfig.team = null;
            tg.self.userConfig.mmrIndex = null;
            tg.view.processMMRExpel(messageParam);
            break;
        case 'mmradmit':
            tg.self.userConfig.joinedMMR = true;
            tg.self.userConfig.team = messageParam.team;
            tg.self.userConfig.mmrIndex = messageParam.mmrIndex;
            tg.view.processMMRAdmit(messageParam);
            break;
        case 'rejectmatchmakingrequest':
            tg.notification.showNotification(messageParam.sub, "Your matchmaking request is rejected by the player.", messageParam);
            break;

        default:
            break;
    }

};

tg.message.renderMessagesToUI = function () {
    var senderNameElementArray = $('.message-sender-name');
    var messageTextElementArray = $('.message-item-body');
    var inviteButtonElementArray = $('.invite-button-container');
    var challengeButtonElementArray = $('.challenge-button-container');
    var oldestMessageArrayIndex = tg.uu.getNextArrayIndex(tg.message.newestMessageIndex, 1, tg.message.latestMessages);
    for (var i = 0, j = tg.message.latestMessages.length - 1; i < tg.message.latestMessages.length; ++i, --j) {
        var messageObject = tg.message.latestMessages[oldestMessageArrayIndex];
        $(inviteButtonElementArray[j]).removeClass('hidden-element');
        $(challengeButtonElementArray[j]).removeClass('hidden-element');
        if (messageObject.isValid == true) {
            messageTextElementArray[j].innerHTML = messageObject.message;
            var className = '';
            switch (messageObject.team) {
                case 0:
                    className = 'text-neutral';
                    break;
                case 1:
                    className = 'text-team';
                    break;
                case 2:
                    className = 'text-enemy';
                    break;
                default:
                    break;
            }
            senderNameElementArray[j].innerHTML = '<p class="' + className + '">' + messageObject.sender + '</p>';
        } else {
            $(inviteButtonElementArray[j]).addClass('hidden-element');
            $(challengeButtonElementArray[j]).addClass('hidden-element');
        }
        oldestMessageArrayIndex = tg.uu.getNextArrayIndex(oldestMessageArrayIndex, 1, tg.message.latestMessages);

        // add remove class to set color to name

    }
};

tg.message.toggleMessagesUI = function (element) {
    var arrowElement = $(element).children()[0];
    // toggle visibility flag
    tg.message.isUIVisible = !tg.message.isUIVisible;
    if (tg.message.isUIVisible) {
        $(arrowElement).removeClass('down');
        $(arrowElement).addClass('up');
        $('.message-list-container').show();
    } else {
        $(arrowElement).removeClass('up');
        $(arrowElement).addClass('down');
        $('.message-list-container').hide();
    }

    // console.log('tg.message.isUIVisible:' + tg.message.isUIVisible);
};

tg.message.getMeassageTableRowElement = function (type) {
    var returnElement = null;
    switch (type) {
        case 'empty':

            break;
        case 'message':

            break;
        case 'invite':

            break;
        case 'update':

            break;
        default:
            break;
    }
    return returnElement;
};



tg.message.init = function () {
    // alert('mm');
    var messageObject = null;
    for (var i = 0; i < tg.worldItems.uiConfig.maxMessageBufferSize; ++i) {
        messageObject = {
            // next: null,
            message: null,
            time: null,
            sender: null,
            team: null,
            isValid: false,
        };
        tg.message.latestMessages.push(messageObject);

        // if (i == 0) {
        //     tg.message.firstMessage = messageObject;
        // } else {
        //     tg.message.latestMessages[i - 1].next = messageObject;
        // }

        $("#message-list-table").find('tbody')
            .append($('<tr>')
                .append($('<td>')
                    .append($('<div>') // individual message container
                        .append($('<div>')
                            // .attr('src', 'img.png')
                            .append('<div class="message-sender-name"><p class="text-enemy"></p></div>')
                            .append('<div class="invite-button-container hidden-element"><button class="btn-invite menu-text" onclick="tg.message.invitePlayer(' + (tg.worldItems.uiConfig.maxMessageBufferSize - (i + 1)) + ')">invite</button></div>')
                            .append('<div class="challenge-button-container hidden-element"><button class="btn-challenge menu-text" onclick="tg.message.challengePlayer(' + (tg.worldItems.uiConfig.maxMessageBufferSize - (i + 1)) + ')">challenge</button></div>')
                            .addClass("message-item-header")
                        )
                        .append($('<div>')
                            // .attr('src', 'img.png')
                            .text('')
                            .addClass("message-item-body")
                        )
                        // .addClass("message-item-container")
                        .addClass("border-top")
                    )
                )
            );
    }
    tg.message.newestMessageIndex = tg.message.latestMessages.length - 1;
};