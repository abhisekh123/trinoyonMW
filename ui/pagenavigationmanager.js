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