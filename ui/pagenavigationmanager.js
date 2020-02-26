/**
 * Manages logic to decide which page should be shown next.
 * Uses pageviewmanager components.
 * handles page navigation request bu adding/removing corresponding components from UI
 */


tg.pn = {};

tg.pn.currentPage = null;


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
    tg.pv.setModalDimensionPercentage('30%', '30%');
    // tg.pv.advancedTexture.addControl(tg.pv.uiComponents.buttons.playButton);  
}

tg.pn.showGameStartCountDownPage = function(estimatedTimeInSeconds){
    console.log('show GameStartCountDown page');
    switch (tg.pn.currentPage) {
        case 'home':
            // tg.pv.advancedTexture.removeControl(tg.pv.loadingText);
            $("#load-indicator").hide();
            break;
    
        default:
            break;
    }
    tg.pn.currentPage = 'startcountdown';
    tg.hl.gameStartCountDownTickHandler(); // call method once to update html before rendering, to avoid glitch.
    // so that on each clock tick our custom method is also executed.
    tg.clockUpdateEventHandler_customActivity = tg.hl.gameStartCountDownTickHandler; 
    tg.resetClockTimeElapsed();
    $('#load-estimate').html(tg.uu.convertSecondsMMSS(estimatedTimeInSeconds));
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