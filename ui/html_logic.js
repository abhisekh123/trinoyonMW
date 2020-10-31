/**
 * Mostly the calbacks to html events.
 */

tg.hl = {};
tg.hl.divFps = document.getElementById("fps");

tg.hl.addJoysticks = function () {
    // console.log('addJoysticks');
    tg.video.leftJoystickAngle = 0;
    tg.video.rightJoystickAngle = 0;
    let xAddPos = 0;
    let yAddPos = 0;
    let xAddRot = 0;
    let yAddRot = 0;
    let sideJoystickOffset = 50;
    let bottomJoystickOffset = -150;
    // let translateTransform;


    let leftThumbContainer = tg.hl.makeThumbArea("leftThumb", 2, "blue", null);
    leftThumbContainer.height = "200px";
    leftThumbContainer.width = "200px";
    leftThumbContainer.isPointerBlocker = true;
    leftThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    leftThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    leftThumbContainer.alpha = 0.4;
    leftThumbContainer.left = sideJoystickOffset;
    leftThumbContainer.top = bottomJoystickOffset;

    let leftInnerThumbContainer = tg.hl.makeThumbArea("leftInnterThumb", 4, "blue", null);
    leftInnerThumbContainer.height = "80px";
    leftInnerThumbContainer.width = "80px";
    leftInnerThumbContainer.isPointerBlocker = true;
    leftInnerThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    leftInnerThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;


    let leftPuck = tg.hl.makeThumbArea("leftPuck", 0, "blue", "blue");
    leftPuck.height = "60px";
    leftPuck.width = "60px";
    leftPuck.isPointerBlocker = true;
    leftPuck.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    leftPuck.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;


    leftThumbContainer.onPointerDownObservable.add(function (coordinates) {
        leftPuck.isVisible = true;
        leftPuck.floatLeft = coordinates.x - (leftThumbContainer._currentMeasure.width * .5) - sideJoystickOffset;
        leftPuck.left = leftPuck.floatLeft;
        leftPuck.floatTop = tg.pv.advancedTexture._canvas.height - coordinates.y - (leftThumbContainer._currentMeasure.height * .5) + bottomJoystickOffset;
        leftPuck.top = leftPuck.floatTop * -1;
        leftPuck.isDown = true;
        leftThumbContainer.alpha = 0.9;
        tg.video.leftJoystickActive = true;
    });

    leftThumbContainer.onPointerUpObservable.add(function (coordinates) {
        xAddPos = 0;
        yAddPos = 0;
        leftPuck.isDown = false;
        leftPuck.isVisible = false;
        leftThumbContainer.alpha = 0.4;
        tg.video.leftJoystickActive = false;
    });


    leftThumbContainer.onPointerMoveObservable.add(function (coordinates) {
        if (leftPuck.isDown) {
            xAddPos = coordinates.x - (leftThumbContainer._currentMeasure.width * .5) - sideJoystickOffset;
            yAddPos = tg.pv.advancedTexture._canvas.height - coordinates.y - (leftThumbContainer._currentMeasure.height * .5) + bottomJoystickOffset;
            leftPuck.floatLeft = xAddPos;
            leftPuck.floatTop = yAddPos * -1;
            leftPuck.left = leftPuck.floatLeft;
            leftPuck.top = leftPuck.floatTop;
            // console.log('leftThumbContainer: xAddRot:' + xAddRot + " yAddRot:" + (yAddRot * -1));
            var relativeX = coordinates.x - (leftThumbContainer._currentMeasure.width * .5) - sideJoystickOffset;;
            
            var relativeZ = tg.pv.advancedTexture._canvas.height - coordinates.y - (leftThumbContainer._currentMeasure.height * .5) + bottomJoystickOffset;
            var angle = Math.atan2(relativeZ, relativeX);
            // console.log('left angle:' + angle + ' , ' + relativeX + ' , ' + relativeZ);
            tg.video.leftJoystickAngle = Math.atan2(relativeZ, relativeX);
        }
    });

    tg.pv.advancedTexture.addControl(leftThumbContainer);
    leftThumbContainer.addControl(leftInnerThumbContainer);
    leftThumbContainer.addControl(leftPuck);
    leftPuck.isVisible = false;

    let rightThumbContainer = tg.hl.makeThumbArea("rightThumb", 2, "red", null);
    rightThumbContainer.height = "200px";
    rightThumbContainer.width = "200px";
    rightThumbContainer.isPointerBlocker = true;
    rightThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    rightThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    rightThumbContainer.alpha = 0.4;
    rightThumbContainer.left = -sideJoystickOffset;
    rightThumbContainer.top = bottomJoystickOffset;

    let rightInnerThumbContainer = tg.hl.makeThumbArea("rightInnterThumb", 4, "red", null);
    rightInnerThumbContainer.height = "80px";
    rightInnerThumbContainer.width = "80px";
    rightInnerThumbContainer.isPointerBlocker = true;
    rightInnerThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    rightInnerThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;


    let rightPuck = tg.hl.makeThumbArea("rightPuck", 0, "red", "red");
    rightPuck.height = "60px";
    rightPuck.width = "60px";
    rightPuck.isPointerBlocker = true;
    rightPuck.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    rightPuck.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;


    rightThumbContainer.onPointerDownObservable.add(function (coordinates) {
        rightPuck.isVisible = true;
        rightPuck.floatLeft = tg.pv.advancedTexture._canvas.width - coordinates.x - (rightThumbContainer._currentMeasure.width * .5) - sideJoystickOffset;
        rightPuck.left = rightPuck.floatLeft * -1;
        rightPuck.floatTop = tg.pv.advancedTexture._canvas.height - coordinates.y - (rightThumbContainer._currentMeasure.height * .5) + bottomJoystickOffset;
        rightPuck.top = rightPuck.floatTop * -1;
        rightPuck.isDown = true;
        rightThumbContainer.alpha = 0.9;
        tg.video.rightJoystickActive = true;
    });

    rightThumbContainer.onPointerUpObservable.add(function (coordinates) {
        xAddRot = 0;
        yAddRot = 0;
        rightPuck.isDown = false;
        rightPuck.isVisible = false;
        rightThumbContainer.alpha = 0.4;
        tg.video.rightJoystickActive = false;
    });


    rightThumbContainer.onPointerMoveObservable.add(function (coordinates) {
        if (rightPuck.isDown) {
            // console.log('coordinates:', coordinates);
            // console.log('_transformedPosition', rightThumbContainer._transformedPosition);
            xAddRot = tg.pv.advancedTexture._canvas.width - coordinates.x - (rightThumbContainer._currentMeasure.width * .5) - sideJoystickOffset;
            yAddRot = tg.pv.advancedTexture._canvas.height - coordinates.y - (rightThumbContainer._currentMeasure.height * .5) + bottomJoystickOffset;
            rightPuck.floatLeft = xAddRot * -1;
            rightPuck.floatTop = yAddRot * -1;
            rightPuck.left = rightPuck.floatLeft;
            rightPuck.top = rightPuck.floatTop;
            // console.log('rightThumbContainer: xAddRot:' + xAddRot + " yAddRot:" + xAddRot);
            var relativeX = tg.pv.advancedTexture._canvas.width - coordinates.x - (rightThumbContainer._currentMeasure.width * .5) - sideJoystickOffset;
            
            var relativeZ = tg.pv.advancedTexture._canvas.height - coordinates.y - (rightThumbContainer._currentMeasure.height * .5) + bottomJoystickOffset;
            var angle = Math.atan2(relativeZ, -relativeX);
            // console.log('right angle:' + angle + ' , ' + relativeX + ' , ' + relativeZ);
            tg.video.rightJoystickAngle = Math.atan2(relativeZ, -relativeX);
        }
    });

    //leftThumbContainer.left = 50;
    tg.pv.advancedTexture.addControl(rightThumbContainer);
    rightThumbContainer.addControl(rightInnerThumbContainer);
    rightThumbContainer.addControl(rightPuck);
    
    rightPuck.isVisible = false;

    tg.hl.rightThumbContainer = rightThumbContainer;
    tg.hl.leftThumbContainer = leftThumbContainer;
};

tg.hl.removeJoysticks = function () {
    tg.hl.rightThumbContainer.isVisible = false;
    tg.hl.leftThumbContainer.isVisible = false;
};

tg.hl.showJoysticks = function () {
    tg.hl.rightThumbContainer.isVisible = true;
    tg.hl.leftThumbContainer.isVisible = true;
};

tg.hl.makeThumbArea = function (name, thickness, color, background, curves) {
    let rect = new BABYLON.GUI.Ellipse();
    rect.name = name;
    rect.thickness = thickness;
    rect.color = color;
    rect.background = background;
    rect.paddingLeft = "0px";
    rect.paddingRight = "0px";
    rect.paddingTop = "0px";
    rect.paddingBottom = "0px";
    return rect;
}


$('#button-result-exit').click(function () {
    // console.log('clicked button-result-exit');
    $('#game-result-container').hide();
    tg.engine.dispose();
    tg.initVideo();
    tg.initWorld();
});

$('#button-home-start').click(function () {
    // console.log('clicked button-home-start');
    tg.network.requestGameAdmit();
});

$('#button-show-controls').click(function () {
    // console.log('clicked button-show-controls');
    tg.pn.showControls();
});

$('#button-show-leaderboard').click(function () {
    // console.log('clicked button-show-controls');
    $('.leaderboard-modal').show();
});

$('#button-hide-leaderboard').click(function () {
    // console.log('clicked button-show-controls');
    $('.leaderboard-modal').hide();
});

tg.hl.setLoaderHeaderText = function (textParam) {
    $('#load-indicator-header').html(textParam);
};

tg.hl.gameStartCountDownTickHandler = function () {
    $('#load-estimate-time-elapsed').html('Time elapsed ' + tg.uu.convertSecondsMMSS((tg.currentTime - tg.clockActionFlagObject.gameStartCountDownTickHandler.startTime) / 1000));
};

tg.hl.countDownHandler_idle = function () {
    // do nothing
    // console.log('countDownHandler_idle');
};

tg.hl.updateFooterIconImageForPlayerTeamBots = function () {
    const selfBots = tg.bot.userPlayerConfig.botObjectList;
    // console.log('start updateFooterIconImageForPlayerTeamBots:', selfBots);
    tg.bot.userBotIdMap = {};
    // tg.itemConfigs
    for (let j = 0; j < selfBots.length; j++) {
        let botConfig = selfBots[j];
        // console.log('botConfig.type', botConfig.type);
        const iconSource = tg.itemConfigs.items[botConfig.type].iconurl;
        // console.log('iconSource->', iconSource);
        $('#footer-image_' + j).attr('src', iconSource);
        // return;
        tg.bot.userBotIdMap['envelop_' + botConfig.id] = j;
        tg.bot.userBotIdMap[botConfig.id] = j;
    }
};

tg.hl.updateBotButtonLife = function (botIndex, botObject) {
    var lifePercentage = ((100 * botObject.life) / botObject.fullLife);
    if(lifePercentage < 0){
        lifePercentage = 0;
    }
    if(lifePercentage > 100){
        lifePercentage = 100;
    }
    var elementid = "#footer-bot-life_" + botIndex;
    var element = $(elementid);
    $('#footer-bot-life_' + botIndex)[0].style.width = lifePercentage + '%';
};

tg.hl.abilityButtonClick = function(abilityIndex){
    var botObject = tg.bot.userPlayerConfig.selectedBot;
    // var abilityConfig = botObject.ability[abilityIndex];
    tg.network.sendAbilityInstruction(botObject.id, abilityIndex);
}

tg.hl.selectBotButtonClick = function (botIndex) {
    tg.hl.selectSelfBot(botIndex, true);
};

tg.hl.selectSelfBot = function (botIndexParam, lookAtBot) {  
    // console.log('selectSelfBot:', botIndex);
    // alert('selectSelfBot');
    const botId = tg.bot.userPlayerConfig.botObjectList[botIndexParam].id;
    

    const botObject = tg.am.dynamicItems.bots[botId];
    if(!botObject || botObject.isActive == false){
        // bot is inactive, nothing to do
        return;
    }

    // tg.am.chosenMarker.position.x = 0;
    // tg.am.chosenMarker.position.y = 0;
    // tg.am.chosenMarker.position.z = 0;

    // // tg.am.cameraTarget.position.x = 0;
    // tg.am.chosenMarker.parent = botObject.controlMesh;
    
    if (tg.bot.userPlayerConfig.clearSelectionTimer != null || tg.bot.userPlayerConfig.selectedBot != null) {
        clearTimeout(tg.bot.userPlayerConfig.clearSelectionTimer);
    }

    if(tg.bot.userPlayerConfig.selectedBot != null){// selected already selected bot
        if(lookAtBot && tg.bot.userPlayerConfig.selectedBot.id == botObject.id){
            tg.am.cameraTarget.position.x = botObject.controlMesh.position.x;
            tg.am.cameraTarget.position.z = botObject.controlMesh.position.z;
        }    
    }

    tg.bot.userPlayerConfig.selectedBot = botObject;
    tg.cameraArc.radius = 250;
    tg.cameraArc.beta = 1.2;
    tg.cameraArc.lockedTarget = botObject.controlMesh;
    // tg.cameraArc.target = botObject.controlMesh;
    tg.audio.playItemEventAudio(botObject, 'select');

    tg.hl.clearAllFooterButtonSelection();

    // if(botIndexParam != 0){ // if any bot other than the hero is selects, then set timer to reset selection to hero
    //     tg.bot.userPlayerConfig.clearSelectionTimer = setTimeout(() => {
    //         tg.hl.clearSelfBotSelection();
    //     }, tg.worldItems.uiConfig.clearSelectionTimerInterval);
    // }

    // tg.bot.userPlayerConfig.clearSelectionTimer = setTimeout(() => {
    //     tg.hl.clearSelfBotSelection();
    // }, tg.worldItems.uiConfig.clearSelectionTimerInterval);
    
    // tg.bot.userPlayerConfig.team
    // tg.am.dynamicItems.bots[characterID]
    // botObject.id

    var botIndex = tg.bot.userBotIdMap[botObject.id];
    // console.log('pickResult.pickedMesh.name:', pickResult.pickedMesh.name);
    if(botIndex != null && botIndex != undefined){
        $("#game-footer-bot-selection_" + botIndex).removeClass("unselected-bot-footer-item");
        $("#game-footer-bot-selection_" + botIndex).addClass("selected-bot-footer-item");
    }

    tg.hl.updateRightColumnForNewBotSelection(botObject);

    document.getElementById("tc").focus();
};

tg.hl.diableFooterSelfBotIcon = function(id){
    tg.hl.disableDiv($("#" + id));
}

tg.hl.enableFooterSelfBotIcon = function(id){
    tg.hl.enableDiv($("#" + id));
}

tg.hl.disableDiv = function(element){
    element.addClass("disabled-element");
};

tg.hl.enableDiv = function(element){
    element.removeClass("disabled-element");
};

tg.hl.clearRightColumn = function(){
    tg.hl.resetAllRighColumnButton();
};

tg.hl.getHTMLElementByIndex = function(elementIndex, elementType){
    var prefix = '';
    switch (elementType) {
        case 'right-column-button':
            prefix = '#rightcolumn-button-';
            break;
        case 'right-column-image':
            prefix = '#rightcolumn-image-'
            break;
        default:
            break;
    }
    return $(prefix + elementIndex);
};

tg.hl.updateRightColumnForNewBotSelection = function(botObject){
    tg.hl.resetAllRighColumnButton();
    for(var i = 0; i < botObject.ability.length; ++i){
        var buttonElement = tg.hl.getHTMLElementByIndex(i, 'right-column-button');
        buttonElement.show();
        var abilityConfig = tg.itemConfigs.abilityConfig[botObject.ability[i].action];
        var imageElement = tg.hl.getHTMLElementByIndex(i, 'right-column-image');
        imageElement.attr('src', abilityConfig.iconurl);

        if(botObject[botObject.ability[i].key] == tg.worldItems.constants.ABILITY_AVAILABLE){
            tg.hl.enableDiv(buttonElement);
        } else {
            tg.hl.disableDiv(buttonElement);
        }
    }
}

tg.hl.resetAllRighColumnButton = function(){
    for(var i = 0; i < 4; ++i){
        var element = $("#rightcolumn-button-" + i);
        element.hide();

        element = $("#rightcolumn-image-" + i);
        element.attr('src', '');
    }
}


tg.hl.clearAllFooterButtonSelection = function(){
    for(var i = 0; i < 5; ++i){
        $("#game-footer-bot-selection_" + i).removeClass("selected-bot-footer-item");
        $("#game-footer-bot-selection_" + i).addClass("unselected-bot-footer-item");
    }
}

tg.hl.clearSelfBotSelection = function () {
    // console.log('clearSelfBotSelection');

    // tg.am.chosenMarker.parent = null;

    // tg.am.chosenMarker.position.x = 0;
    // tg.am.chosenMarker.position.y = tg.worldItems.uiConfig.hiddenY;
    // tg.am.chosenMarker.position.z = 0;

    // // tg.am.cameraTarget.position.x = 0;

    tg.bot.userPlayerConfig.selectedBot = null;
    tg.bot.userPlayerConfig.clearSelectionTimer = null;
    tg.hl.clearAllFooterButtonSelection();
    tg.hl.clearRightColumn();
    tg.hl.selectSelfBot(0, true);
    // tg.bot.userPlayerConfig.team
    // tg.am.dynamicItems.bots[characterID]
    // botObject.id
};


