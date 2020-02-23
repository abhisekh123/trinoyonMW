
tg.pv = {};

tg.pv.initPageViewManager = function() {
    tg.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // init GUI
    tg.UIConfig.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var playButton = BABYLON.GUI.Button.CreateSimpleButton("but1", "Play");
    playButton.width = "150px"
    playButton.height = "40px";
    playButton.color = "white";
    playButton.cornerRadius = 20;
    playButton.background = "green";

    playButton.onPointerUpObservable.add(function() {
        console.log('click play button.');
        tg.sendMessageToWS(tg.getEmptyMessagePacket('request_game_admit'));
    });
    tg.UIConfig.playButton = playButton;

    var exitGameButton = BABYLON.GUI.Button.CreateSimpleButton("but1", "Exit");
    exitGameButton.width = "150px";
    exitGameButton.height = "40px";
    exitGameButton.color = "white";
    exitGameButton.cornerRadius = 20;
    exitGameButton.background = "green";
    exitGameButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    exitGameButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    exitGameButton.onPointerUpObservable.add(function() {
        // tg.UIConfig.advancedTexture.removeControl(tg.UIConfig.exitGameButton);
        // showHomePage();
        tg.sendMessageToWS(tg.getEmptyMessagePacket('request_game_exit'));
    });
    tg.UIConfig.exitGameButton = exitGameButton;

    tg.showHomePage = showHomePage;
    tg.startGamePlay = startGamePlay;
    tg.showLandingPage = showLandingPage;
    tg.refreshAssetLoadedAlert = refreshAssetLoadedAlert;
}


