/**
 * Mostly the calbacks to html events.
 */

tg.hl = {};
tg.hl.divFps = document.getElementById("fps");

// tg.hl.
console.log('sdf');
$('.button-home-start').click(function(){
    console.log('clicked button-home-start');
    tg.network.requestGameAdmit();
});

$('.bot-selection-option-container').click(function(element){
    element.preventDefault();
    var id = this.id;
    console.log('clicked bot-selection-option-container with id:', id);
    var elemntName = $('#' + id).attr('name');
    console.log('elemntName:', elemntName);
    // tg.network.requestGameAdmit();
    var rowCol = id.split('_')[1];
    var rowIndex = rowCol.split('-')[0];
    console.log(rowCol);
    var rowIdPrefix = "bot-image-tag_" + rowIndex;
    console.log(rowIdPrefix);
    $("[id^=" + rowIdPrefix + "]").hide();
    $('#bot-image-tag_' + rowCol).show();
    var currentElementImageSource = $("#botoptionimage_" + rowCol).attr('src');
    console.log(currentElementImageSource);
    $('#bot-selection-' + rowIndex).attr('src', currentElementImageSource);

    tg.botSelection.botList[rowIndex - 1] = elemntName;

    console.log(tg.botSelection);
});

tg.hl.setLoaderHeaderText = function(textParam){
    $('#load-indicator-header').html(textParam);
};

tg.hl.gameStartCountDownTickHandler = function(){
    $('#load-estimate-time-elapsed').html('Time elapsed ' + tg.uu.convertSecondsMMSS(tg.clockTimeElapsed / 1000));
};

tg.hl.countDownHandler_idle = function(){
    // do nothing
    console.log('countDownHandler_idle');
};

tg.hl.updateFooterIconImageForPlayerTeamBots = function(){
    const selfBots =  tg.bot.userPlayerConfig.botObjectList;
    console.log('start updateFooterIconImageForPlayerTeamBots:', selfBots);
    // tg.itemConfigs
    for (let j = 1; j < selfBots.length; j++) {
        let botConfig = selfBots[j];
        console.log('botConfig.type', botConfig.type);
        const iconSource = tg.itemConfigs.items[botConfig.type].iconurl;
        console.log('iconSource->', iconSource);
        $('#footer-image_' + j).attr('src', iconSource);
        // return;
    }
};

tg.hl.selectSelfBot = function(botIndex){
    console.log('selectSelfBot:', botIndex);
    // alert('selectSelfBot');
    const botId =  tg.bot.userPlayerConfig.botObjectList[botIndex].id;
    const botObject = tg.am.dynamicItems.bots[botId];
    tg.am.cameraTarget.position.x = botObject.controlMesh.position.x;
    tg.am.cameraTarget.position.z = botObject.controlMesh.position.z;

    
    // tg.am.chosenMarker.position.x = 0;
    tg.am.chosenMarker.position.y = 0;
    // tg.am.chosenMarker.position.z = 0;

    // // tg.am.cameraTarget.position.x = 0;
    // tg.am.chosenMarker.parent = botObject.controlMesh;
    tg.bot.userPlayerConfig.selectedBot = botObject;
    if(tg.bot.userPlayerConfig.clearSelectionTimer != null){
        clearTimeout(tg.bot.userPlayerConfig.clearSelectionTimer);
    }
    tg.bot.userPlayerConfig.clearSelectionTimer = setTimeout(() => {
        tg.hl.clearSelfBotSelection();
    }, tg.worldItems.uiConfig.clearSelectionTimerInterval);
    // tg.bot.userPlayerConfig.team
    // tg.am.dynamicItems.bots[characterID]
    // botObject.id
    document.getElementById("tc").focus();
};

tg.hl.clearSelfBotSelection = function(){
    console.log('clearSelfBotSelection');
    
    // tg.am.chosenMarker.parent = null;

    // tg.am.chosenMarker.position.x = 0;
    tg.am.chosenMarker.position.y = tg.worldItems.uiConfig.hiddenY;
    // tg.am.chosenMarker.position.z = 0;

    // // tg.am.cameraTarget.position.x = 0;
    
    tg.bot.userPlayerConfig.selectedBot = null;
    tg.bot.userPlayerConfig.clearSelectionTimer = null;
    // tg.bot.userPlayerConfig.team
    // tg.am.dynamicItems.bots[characterID]
    // botObject.id
};

