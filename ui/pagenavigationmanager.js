/**
 * Manages logic to decide which page should be shown next.
 * Uses pageviewmanager components.
 * handles page navigation request bu adding/removing corresponding components from UI
 */


tg.pn = {};

tg.pn.currentPage = null;

tg.pn.showMatchStartingLoader = function(){
    console.log('showMatchStartingLoader. current page:', tg.pn.currentPage);
    switch (tg.pn.currentPage) {
        case 'startcountdown':
            // tg.pv.advancedTexture.removeControl(tg.pv.loadingText);
            $("#game-start-countdown").hide();
            tg.pv.refreshAssetLoadedAlert(0, 10);// reset loader percentage to 0.
            // $("#menu-home").hide();
            break;
    
        default:
            break;
    }

    tg.pn.currentPage = 'match-loading';
    tg.stopClock();
    tg.hl.setLoaderHeaderText('Prepare To Fight!');
    $("#load-indicator").show();
    tg.pv.setModalDimensionPercentage('50%', '90%');
};

tg.pn.showMatchResultPage = function(){
    console.log('showMatchPage');
    switch (tg.pn.currentPage) {
        case 'game-play':
            // tg.pv.advancedTexture.removeControl(tg.pv.loadingText);
            tg.hl.removeJoysticks();
            $("#footerrow").hide();
            $("#game-header-menu").hide();
            // $("#joystick-parent").hide();
            tg.pv.showModal();
            break;
    
        default:
            break;
    }
    $('#game-result-container').show();
    // tg.hl.setLoaderHeaderText('Prepare To Fight!');
    // $("#game-footer-menu").show();
    tg.pn.currentPage = 'game-result';
    // tg.pv.setModalDimensionPercentage('10%', '90%');
};

tg.pn.showMatchPage = function(){
    console.log('showMatchPage');
    switch (tg.pn.currentPage) {
        case 'match-loading':
            // tg.pv.advancedTexture.removeControl(tg.pv.loadingText);
            $("#load-indicator").hide();
            tg.pv.hideModal();
            break;
    
        default:
            break;
    }

    tg.stopClock();
    // tg.hl.setLoaderHeaderText('Prepare To Fight!');
    $("#footerrow").show();

    // tg.joystickL.add();
    // tg.joystickR.add();
    $("#game-header-menu").show();
    tg.hl.addJoysticks();
    // $("#joystick-parent").show();
    tg.pn.currentPage = 'game-play';
    // tg.pv.setModalDimensionPercentage('10%', '90%');
};

// display home page.
tg.pn.showHomePage = function(){
    console.log('showHomePage');
    switch (tg.pn.currentPage) {
        case 'landing':
            // tg.pv.advancedTexture.removeControl(tg.pv.loadingText);
            $("#load-indicator").hide();
            break;
    
        default:
            break;
    }
    tg.pn.currentPage = 'home';
    $("#menu-home").show();
    tg.pv.setModalDimensionPercentage('80%', '80%');
    tg.botSelection = {
        botList: ['swordman', 'swordman', 'swordman', 'swordman'],
        hero: 'lion',
    }
    // tg.pv.advancedTexture.addControl(tg.pv.uiComponents.buttons.playButton);  
}

tg.pn.showGameStartCountDownPage = function(estimatedTimeInSeconds){
    console.log('show GameStartCountDown page');
    switch (tg.pn.currentPage) {
        case 'home':
            // tg.pv.advancedTexture.removeControl(tg.pv.loadingText);
            $("#menu-home").hide();
            break;
    
        default:
            break;
    }
    tg.pn.currentPage = 'startcountdown';
    tg.hl.gameStartCountDownTickHandler(); // call method once to update html before rendering, to avoid glitch.
    // so that on each clock tick our custom method is also executed.
    tg.clockUpdateEventHandler_customActivity = tg.hl.gameStartCountDownTickHandler; 
    tg.resetClockTimeElapsed();
    $('#load-estimate').html('Estimated start time ' + tg.uu.convertSecondsMMSS(estimatedTimeInSeconds));
    tg.pv.setModalDimensionPercentage('50%', '90%');
    $("#game-start-countdown").show();
    
    
    // tg.pv.advancedTexture.addControl(tg.pv.loadingText);
}


tg.pn.showLandingPage = function(){
    console.log('show landing page');
    tg.pn.currentPage = 'landing';
    
    $("#load-indicator").show();
    tg.pv.setModalDimensionPercentage('50%', '90%');
    // tg.pv.advancedTexture.addControl(tg.pv.loadingText);
}


tg.pn.init = function() {
    tg.pv.init();
    tg.pv.showModal();
    tg.pn.showLandingPage();
};