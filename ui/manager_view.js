tg.view = {};

tg.view.processMMRUpdate = function (updateParam) {
    console.log('got mmr update:', updateParam);

    const enemyElementList = $('.hg-matchmaking-enemy-player-container');
    const teamElementList = $('.hg-matchmaking-team-player-container');
    const userId = tg.self.userConfig.id;

    let teamUpdate = null;
    let enemyUpdate = null;

    if(tg.self.userConfig.team == 1){
        teamUpdate = updateParam.message.players_1;
        enemyUpdate = updateParam.message.players_2;
    } else {
        enemyUpdate = updateParam.message.players_1;
        teamUpdate = updateParam.message.players_2;
    }

    for(var i = 0, elementIndex = 0; i < teamUpdate.length; ++i){
        if(teamUpdate[i] != null && teamUpdate[i].id == userId){
            continue;
        }

        const parentElement = teamElementList[elementIndex];
        
        const unknownPlayerContainer = $(parentElement).find('.unknown-player-container')[0];
        const joinedPlayerContainer = $(parentElement).find('.joined-player-container')[0];

        if(teamUpdate[i] == null){
            $(unknownPlayerContainer).show();
            $(joinedPlayerContainer).hide();
        } else {
            $(unknownPlayerContainer).hide();
            $(joinedPlayerContainer).show();
            $(joinedPlayerContainer).find('.hg-matchmaking-player-name')[0].innerHTML = teamUpdate[i].firstName;
            tg.view.updateBotImages(teamUpdate[i], joinedPlayerContainer, '.hg-bot-image');
        }
        ++elementIndex;
    }

    for(var j = 0; j < enemyUpdate.length; ++j){
        const parentElement = enemyElementList[j];
        
        const unknownPlayerContainer = $(parentElement).find('.unknown-player-container')[0];
        const joinedPlayerContainer = $(parentElement).find('.joined-player-container')[0];

        if(enemyUpdate[j] == null){
            $(unknownPlayerContainer).show();
            $(joinedPlayerContainer).hide();
        } else {
            $(unknownPlayerContainer).hide();
            $(joinedPlayerContainer).show();
            $(joinedPlayerContainer).find('.hg-matchmaking-player-name')[0].innerHTML = enemyUpdate[j].firstName;
            tg.view.updateBotImages(enemyUpdate[j], joinedPlayerContainer, '.hg-bot-image');
        }
    }

    // // alert('change:' + botIndex);
    // var imageElementList = parentElement.find('.hg-bot-image');
    // if(botIndex == 0){
    //     // requested hero change
    // } else { // swap bots
    //     if(tg.botSelection.botList[botIndex - 1] == 'swordman'){
    //         tg.botSelection.botList[botIndex - 1] = 'archer';
    //     } else {
    //         tg.botSelection.botList[botIndex - 1] = 'swordman';
    //     }
    //     imageElement[0].src = tg.uu.getIconURLFromType('item', tg.botSelection.botList[botIndex - 1]);
    // }

    // tg.uu.displaySelectedBotDetails(parentElement.parent().parent(), botIndex);

    // tg.uu.markSelectedItem(selectedBotContainerList, botIndex);

    // if(tg.self.userConfig.joinedMMR){
    //     tg.message.mmrSelectionChangeUpdate();
    // }
}

tg.view.updateBotImages = function(updateParam, parentElement, querySelector) {
    var imageElementList = $(parentElement).find(querySelector);
    for(var j = 0; j < updateParam.selection.botList.length; ++j){
        imageElementList[j + 1].src = tg.uu.getIconURLFromType('item', updateParam.selection.botList[j]);
    }
}

tg.view.processMMRExpel = function (updateParam) {
    $('#enemy-player-container-parent').hide();
    $('#team-player-container-parent').hide();
    $('#matchmaking-footer-container').hide();
    $('#gameplay-footer-container').show();
}

tg.view.processMMRAdmit = function (updateParam) {
    $('#enemy-player-container-parent').show();
    $('#team-player-container-parent').show();
    $('#matchmaking-footer-container').show();
    $('#gameplay-footer-container').hide();
    $('#button-home-ready').attr("disabled", false);
}
