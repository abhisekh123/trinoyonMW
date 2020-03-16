
/**
 * Top level logical function to retain lifecycle of webgl context.
 */

tg.world = {};

// reset world and load characters based on current match configuration
tg.world.startNewMatch = function(playerConfigArray, playerIndex){
    // reset game static objects
    tg.static.resetStaticItems();

    // clear old bots and load new bots
    tg.bot.reloadBots(playerConfigArray, playerIndex, 'show_match_page');
    
    tg.pn.showMatchStartingLoader();
};

// method that triggers when all the assets for the current match has been loaded.
tg.world.handleNewMatchStartReadyTrigger = function() {
    console.log('all assets loaded');
    tg.isGameLive = true;
    tg.pn.showMatchPage();
};

tg.world.handleNewMatchTerminatedTrigger = function() {
    tg.isGameLive = false;
};
