
/**
 * Top level logical function to retain lifecycle of webgl context.
 */

tg.world = {};

tg.world.startNewMatch = function(playerConfigArray, playerIndex){
    // reset game static objects
    tg.static.resetStaticItems();

    // clear old bots and load new bots
    tg.bot.reloadBots(playerConfigArray, playerIndex, 'show_match_page');
    
    tg.pn.showMatchStartingLoader();
};


tg.world.handleNewMatchStartReadyTrigger = function() {
    console.log('all assets loaded');
    tg.isGameLive = true;
    tg.pn.showMatchPage();
};

tg.world.handleNewMatchTerminatedTrigger = function() {
    tg.isGameLive = false;
};
