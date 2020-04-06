
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
        // console.log('tg.world.updateWorld:', updateParam);
        const itemStateMap = updateParam.playerConfig.itemState;
        // if(updateParam.playerConfig.eventsArray.length>0){
        //     console.log('events:', updateParam.playerConfig.eventsArray);
        // }
        const itemKeyArray = tg.uu.getObjectKeys(itemStateMap);
        for (let index = 0; index < itemKeyArray.length; index++) {
            const updateItemKey = itemKeyArray[index];
            const updateItemConfig = itemStateMap[updateItemKey];
            const botObject = tg.am.dynamicItems.bots[updateItemKey];
            if(botObject == undefined){
                // console.log('unknown item:', updateItemKey);
                const buildingConfig = tg.am.staticItems.buildings[updateItemKey];
                buildingConfig.life = updateItemConfig.life;
                tg.ui3d.updateHPBarPercentage(buildingConfig.hpBarConfig, ((100 * buildingConfig.life) / buildingConfig.fullLife));
                continue;
            }
            // if(updateItemConfig.action == 'die'){
            //     console.log(botObject.id + ' !!die bot:', botObject.controlMesh.position);
            //     // botObject.controlMesh.position.y = tg.worldItems.uiConfig.hiddenY;
            // }

            // if(updateItemConfig.action == 'spawn'){
            //     console.log(botObject.id + ' +++ bot spawn:', botObject.controlMesh.position);
            //     botObject.controlMesh.position.y = 0;
            // }
            
            botObject.controlMesh.position.x = (updateItemConfig.position[0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit;
            botObject.controlMesh.position.z = (updateItemConfig.position[2] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit;
            botObject.life = updateItemConfig.life;
            tg.animationmanager.startCharacterAnimation(botObject, updateItemConfig.action);
            tg.ui3d.updateHPBarPercentage(botObject.hpBarConfig, ((100 * botObject.life) / botObject.fullLife));
        }
    }
};

tg.world.updateWorldDormant = function(updateParam){
};

