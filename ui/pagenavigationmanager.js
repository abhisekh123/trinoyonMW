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
            tg.pv.advancedTexture.removeControl(tg.pv.loadingText);
            break;
    
        default:
            break;
    }
    tg.pn.currentPage = 'home';
    
    tg.pv.advancedTexture.addControl(tg.pv.uiComponents.buttons.playButton);  
}



tg.pn.showLandingPage = function(){
    tg.pn.currentPage = 'landing';
    tg.pv.advancedTexture.addControl(tg.pv.loadingText);
}


tg.pn.init = function() {
    tg.pv.init();
    tg.pn.showLandingPage();
};