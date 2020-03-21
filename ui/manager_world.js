
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
    tg.updateWorld = tg.world.updateWorld;
};

tg.world.handleNewMatchTerminatedTrigger = function() {
    tg.isGameLive = false;
    tg.updateWorld = tg.world.updateWorldDormant;
};

tg.world.updateWorld = function(updateParam){
    // console.log('tg.world.updateWorld:', updateParam);
    if(tg.isGameLive == true){
        const itemStateMap = updateParam.playerConfig.itemState;
        const itemKeyArray = tg.uu.getObjectKeys(itemStateMap);
        for (let index = 0; index < itemKeyArray.length; index++) {
            const updateItemKey = itemKeyArray[index];
            const botItem = tg.am.dynamicItems.bots[updateItemKey];
            if(botItem == undefined){
                // console.log('unknown item:', updateItemKey);
                continue;
            }
            const updateItemConfig = itemStateMap[updateItemKey];
            botItem.controlMesh.position.x = updateItemConfig.position[0];
            botItem.controlMesh.position.z = updateItemConfig.position[2];
            botItem.life = updateItemConfig.life;
        }
    }
};

tg.world.updateWorldDormant = function(updateParam){
};

