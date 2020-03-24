
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
        console.log('tg.world.updateWorld:', updateParam);
        const itemStateMap = updateParam.playerConfig.itemState;
        const itemKeyArray = tg.uu.getObjectKeys(itemStateMap);
        for (let index = 0; index < itemKeyArray.length; index++) {
            const updateItemKey = itemKeyArray[index];
            const updateItemConfig = itemStateMap[updateItemKey];
            const botItem = tg.am.dynamicItems.bots[updateItemKey];
            if(botItem == undefined){
                // console.log('unknown item:', updateItemKey);
                const buildingConfig = tg.am.staticItems.buildings[updateItemKey];
                buildingConfig.life = updateItemConfig.life;
                tg.ui3d.updateHPBarPercentage(buildingConfig.hpBarConfig, ((100 * buildingConfig.life) / buildingConfig.fullLife));
                continue;
            }
            
            botItem.controlMesh.position.x = updateItemConfig.position[0] * tg.worldItems.uiConfig.playerDimensionBaseUnit;
            botItem.controlMesh.position.z = updateItemConfig.position[2] * tg.worldItems.uiConfig.playerDimensionBaseUnit;
            botItem.life = updateItemConfig.life;
            tg.ui3d.updateHPBarPercentage(botItem.hpBarConfig, ((100 * botItem.life) / botItem.fullLife));
        }
    }
};

tg.world.updateWorldDormant = function(updateParam){
};

