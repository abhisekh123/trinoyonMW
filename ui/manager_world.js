
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

tg.world.getBuildingOrBot = function(idParam){
    const configObject = tg.am.dynamicItems.bots[idParam];
    if(configObject == undefined){
        // console.log('unknown item:', updateItemKey);
        configObject = tg.am.staticItems.buildings[idParam];
        // continue;
    }
    if(configObject == undefined){
        return null;
    } else {
        return configObject;
    }
}

tg.world.updateWorld = function(updateParam){
    // console.log('tg.world.updateWorld:', updateParam);
    if(tg.isGameLive == true){
        // console.log('tg.world.updateWorld:', updateParam);
        const itemStateMap = updateParam.playerConfig.itemState;
        const eventsArray = updateParam.playerConfig.eventsArray;
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
            // if(updateItemConfig.action == 'fight'){
            //     console.log('updateParam:', updateParam);
            // }
            tg.ui3d.updateHPBarPercentage(botObject.hpBarConfig, ((100 * botObject.life) / botObject.fullLife));
        }

        for (let index = 0; index < eventsArray.length; index++) {
            if(eventsArray[index].event == 'attack'){
                // console.log('attack event', eventsArray[index]);
                
                var sourceConfig = tg.world.getBuildingOrBot(eventsArray[index].id);
                var destinationConfig = tg.world.getBuildingOrBot(eventsArray[index].tid);
                console.log('set projectile position for:', sourceConfig.id);
                if(sourceConfig == null || destinationConfig == null){
                    console.log('sourceConfig == null || destinationConfig == null');
                    continue;
                }

                sourceConfig.projectile.position.x = sourceConfig.controlMesh.position.x;
                sourceConfig.projectile.position.y = tg.worldItems.uiConfig.playerDimensionBaseUnit / 2;
                sourceConfig.projectile.position.z = sourceConfig.controlMesh.position.z;

                sourceConfig.isProjectileActive = true;
                console.log('source position:', sourceConfig.controlMesh.position);
                console.log('destination position:', destinationConfig.controlMesh.position);

                var pathData = tg.world.planProjectilePath(
                    sourceConfig.controlMesh.position.x,
                    sourceConfig.controlMesh.position.z,
                    destinationConfig.controlMesh.position.x,
                    destinationConfig.controlMesh.position.z,
                );
                console.log('tg.currentTime:', tg.currentTime);
                console.log('pathData:', pathData);
                var endTime = tg.currentTime;
                if(pathData.length > 0){
                    endTime = pathData[pathData.length - 1].time;
                }
                
                sourceConfig.projectileData.path = pathData;
                sourceConfig.projectileData.endTime = endTime;
            }
        }
    }
};

tg.world.planProjectilePath = function(startX, startZ, endX, endZ){
    var distance = tg.getDistanceBetweenPoints(
        getGridPositionFromFloorPosition(startX), 
        getGridPositionFromFloorPosition(startZ), 
        getGridPositionFromFloorPosition(endX), 
        getGridPositionFromFloorPosition(endZ)
    );
    // console.log('distance before:', distance);
    distance = getFloorPositionFromGridPosition(distance);
    // console.log('distance after:', distance);

    if(distance > 0){
        console.log('distance > 0');
    }

    var factorX = (endX - startX) / distance;
    var factorZ = (endZ - startZ) / distance;
    var projectilePath = [];
    var time = tg.currentTime;
    
    for(var pathRunner = 0; pathRunner < distance;){
        var projectilePathElement = {
            x: (startX + (pathRunner * factorX)),
            z: (startZ + (pathRunner * factorZ)),
            time: time
        }
        projectilePath.push(projectilePathElement);
        pathRunner += tg.worldItems.uiConfig.projectilePathDistanceResolution;
        time += tg.worldItems.uiConfig.projectilePathTimeResolution;
    }

    return projectilePath;
}

tg.world.updateWorldDormant = function(updateParam){
};

