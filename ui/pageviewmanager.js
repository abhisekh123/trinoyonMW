/**
 * Manages UI assets like text, buttons, etc
 */
tg.pv = {};

 // html code
// Get the <span> element that closes the modal
// tg.pv.span = document.getElementsByClassName("close")[0];
// tg.pv.modal = document.getElementById("myModal");

// When the user clicks on <span> (x), close the modal
// tg.pv.span.onclick = function() {
//     tg.pv.modal.style.display = "none";
//   }

 // babylon code



tg.pv.init = function() {
    tg.pv.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    tg.pv.createButtons();
    // tg.pv.showLandingPage();
    tg.pv.createTexts();
}

tg.pv.createTexts = function(){
    var loadingText = new BABYLON.GUI.TextBlock();
    loadingText.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
    loadingText.textWrapping = true;
    loadingText.text = "Loading assets... \n 0% loaded.";
    loadingText.color = "white";
    loadingText.fontSize = 24;
    loadingText.width = "30%";
    // tg.advancedTexture.addControl(loadingText);
    tg.pv.loadingText = loadingText;
}

tg.pv.refreshAssetLoadedAlert = function (assetsAlreadyLoaded, totalAssetsToBeLoaded) {
    var loaderText = document.getElementById("loader-text");  
    var loaderBar = document.getElementById("loader-bar");  
    if (assetsAlreadyLoaded >= totalAssetsToBeLoaded) {
        var loadedPercentage = 100;
        loaderBar.style.width = loadedPercentage + '%'; 
        loaderText.innerHTML = loadedPercentage * 1  + '% loaded...';
    } else {
        var loadedPercentage = Math.round((assetsAlreadyLoaded / totalAssetsToBeLoaded) * 100);
        loaderBar.style.width = loadedPercentage + '%'; 
        loaderText.innerHTML = loadedPercentage * 1  + '% loaded...';
    }
}


tg.pv.createButtons = function(){
    // play button
    tg.pv.uiComponents = {};
    tg.pv.uiComponents.buttons = {};
    // init GUI
    // tg.UIConfig.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var playButton = BABYLON.GUI.Button.CreateSimpleButton("button_play", "Play");
    playButton.width = "150px"
    playButton.height = "40px";
    playButton.color = "white";
    playButton.cornerRadius = 5;
    playButton.background = "black";

    playButton.onPointerUpObservable.add(function() {
        console.log('click play button.');
        // tg.network.requestGameAdmit();
        // Get the modal
        
        tg.pv.modal.style.display = "block";
    });
    tg.pv.uiComponents.buttons.playButton = playButton;


    // exit button
    var exitGameButton = BABYLON.GUI.Button.CreateSimpleButton("button_exit", "Exit");
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
    tg.pv.uiComponents.buttons.exitGameButton = exitGameButton;
}


tg.pv.showModal = function() {
    $("#menu-modal").show();
}
tg.pv.hideModal = function(){
    $("#menu-modal").hide();
}

tg.pv.setModalDimensionPercentage = function(height, width){ // both input should be string.
    $("#menu-modal").width(width);
    $("#menu-modal").height(height);
}
