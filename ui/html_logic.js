/**
 * Mostly the calbacks to html events.
 */

tg.hl = {};
tg.hl.divFps = document.getElementById("fps");

tg.hl.addJoysticks = function () {
    var joystickL = nipplejs.create({
        zone: document.getElementById('left-joystick'),
        mode: 'static',
        position: {
            left: '20%',
            top: '50%'
        },
        color: 'green',
        size: 200
    });

    var joystickR = nipplejs.create({
        zone: document.getElementById('right-joystick'),
        mode: 'static',
        position: {
            left: '80%',
            top: '50%'
        },
        color: 'red',
        size: 200
    });

    tg.video.leftJoystickAngle = 0;
    tg.video.rightJoystickAngle = 0;

    joystickL.on('move', function (evt, nipple) {
        // console.log("left move", nipple);
        tg.video.leftJoystickAngle = nipple.angle.radian;
    });
    joystickR.on('move', function (evt, nipple) {
        // console.log("right move");
        tg.video.rightJoystickAngle = nipple.angle.radian;
    });

    joystickL.on('start', function (evt, nipple) {
        // console.log("left start", nipple);

        tg.video.leftJoystickActive = true;
        // tg.video.rightJoystickActive = false;
    });
    joystickR.on('start', function (evt, nipple) {
        // console.log("right start");

        // tg.video.leftJoystickActive = false;
        tg.video.rightJoystickActive = true;
    });

    joystickL.on('end', function (evt, nipple) {
        // console.log("left end", nipple);

        tg.video.leftJoystickActive = false;
        // tg.video.rightJoystickActive = false;
    });
    joystickR.on('end', function (evt, nipple) {
        // console.log("right end");

        // tg.video.leftJoystickActive = false;
        tg.video.rightJoystickActive = false;
    });


    // tg.joystickL = joystickL;
    // tg.joystickR = joystickR;

    tg.joystickL = joystickL;
    tg.joystickR = joystickR;
};

tg.hl.removeJoysticks = function () {
    tg.joystickL.remove();
    tg.joystickR.remove();
};

// tg.hl.
console.log('sdf');
$('#button-result-exit').click(function () {
    console.log('clicked button-result-exit');
    tg.engine.dispose();
    tg.initVideo();
    tg.initWorld();
});

$('#button-home-start').click(function () {
    console.log('clicked button-home-start');
    tg.network.requestGameAdmit();
});

$('.bot-selection-option-container').click(function (element) {
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

tg.hl.updateResult = function (outCome, playerTeamPerformance, enemyTeamPerformance, playerTeamTowerCount, enemyTeamTowerCount) {
    $('#game-result-header').html(outCome);
    $('#team-owned-tower-count').html('Total tower owned count : ' + playerTeamTowerCount);
    $('#team-total-kill-count').html('Total enemy killed : ' + enemyTeamPerformance.death);
    $('#team-total-attack-damage').html('Total damage done to enemy : ' + playerTeamPerformance.damage);
    $('#enemy-owned-tower-count').html('Total tower owned count : ' + enemyTeamTowerCount);
    $('#enemy-total-kill-count').html('Total enemy killed : ' + playerTeamPerformance.death);
    $('#enemy-total-attack-damage').html('Total damage done to enemy : ' + enemyTeamPerformance.damage);
};

tg.hl.setLoaderHeaderText = function (textParam) {
    $('#load-indicator-header').html(textParam);
};

tg.hl.gameStartCountDownTickHandler = function () {
    $('#load-estimate-time-elapsed').html('Time elapsed ' + tg.uu.convertSecondsMMSS(tg.clockTimeElapsed / 1000));
};

tg.hl.countDownHandler_idle = function () {
    // do nothing
    console.log('countDownHandler_idle');
};

tg.hl.updateFooterIconImageForPlayerTeamBots = function () {
    const selfBots = tg.bot.userPlayerConfig.botObjectList;
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

tg.hl.selectSelfBot = function (botIndex) {
    console.log('selectSelfBot:', botIndex);
    // alert('selectSelfBot');
    const botId = tg.bot.userPlayerConfig.botObjectList[botIndex].id;
    const botObject = tg.am.dynamicItems.bots[botId];
    // tg.am.cameraTarget.position.x = botObject.controlMesh.position.x;
    // tg.am.cameraTarget.position.z = botObject.controlMesh.position.z;


    // tg.am.chosenMarker.position.x = 0;
    tg.am.chosenMarker.position.y = 0;
    // tg.am.chosenMarker.position.z = 0;

    // // tg.am.cameraTarget.position.x = 0;
    // tg.am.chosenMarker.parent = botObject.controlMesh;
    tg.bot.userPlayerConfig.selectedBot = botObject;
    if (tg.bot.userPlayerConfig.clearSelectionTimer != null) {
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

tg.hl.clearSelfBotSelection = function () {
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