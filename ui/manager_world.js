/**
 * Top level logical function to retain lifecycle of webgl context.
 */

tg.world = {};

// reset world and load characters based on current match configuration
tg.world.startNewMatch = function (playerConfigArray, playerIndex) {
    // reset game static objects
    tg.static.resetStaticItems();

    // clear old bots and load new bots
    tg.bot.reloadBots(playerConfigArray, playerIndex, 'show_match_page');
    tg.world.updateBuildingTeamMarker();
    tg.pn.showMatchStartingLoader();
};

tg.world.processResult = function (resultObject) {
    tg.isGameLive = false;
    tg.updateWorld = tg.world.updateWorldDormant;

    var outCome = null;
    var playerTeamPerformance = null;
    var enemyTeamPerformance = null;
    var playerTeamTowerCount = null;
    var enemyTeamTowerCount = null;
    if (tg.bot.userPlayerConfig.team == resultObject.winningTeam) {
        outCome = 'victory';
    } else {
        outCome = 'defeat';
    }

    if (tg.bot.userPlayerConfig.team == 1) {
        playerTeamPerformance = resultObject.performance[1];
        playerTeamTowerCount = resultObject.towerCountTeam1;
        enemyTeamTowerCount = resultObject.towerCountTeam2;
        enemyTeamPerformance = resultObject.performance[2];
    } else {
        playerTeamPerformance = resultObject.performance[2];
        playerTeamTowerCount = resultObject.towerCountTeam2;
        enemyTeamTowerCount = resultObject.towerCountTeam1;
        enemyTeamPerformance = resultObject.performance[1];
    }

    tg.hl.updateResult(outCome, playerTeamPerformance, enemyTeamPerformance, playerTeamTowerCount, enemyTeamTowerCount);
    tg.pn.showMatchResultPage();
};


tg.world.updateBuildingTeamMarker = function () {
    console.log('updateBuildingTeamMarker');
    for (var i = 0; i < tg.am.staticItems.buildingsArray.length; ++i) {
        var buildingConfig = tg.am.staticItems.buildingsArray[i];
        tg.static.updateBuildingTeam(buildingConfig, buildingConfig.team);
    }

};

// method that triggers when all the assets for the current match has been loaded.
tg.world.handleNewMatchStartReadyTrigger = function () {
    console.log('all assets loaded');
    // tg.sprite.test();
    tg.isGameLive = true;

    // Initialise camera settings.
    const botId = tg.bot.userPlayerConfig.botObjectList[0].id;
    const botObject = tg.am.dynamicItems.bots[botId];
    tg.am.cameraTarget.position.x = botObject.controlMesh.position.x;
    tg.am.cameraTarget.position.z = botObject.controlMesh.position.z;
    if (tg.bot.userPlayerConfig.team == 1) {
        tg.camera.rotationOffset = 180;
    } else {
        tg.camera.rotationOffset = 0;
    }
    tg.calculateCameraMovementSteps();

    tg.pn.showMatchPage();
    tg.updateWorld = tg.world.updateWorld;

};

tg.world.handleNewMatchTerminatedTrigger = function () {
    tg.isGameLive = false;
    tg.updateWorld = tg.world.updateWorldDormant;
};

tg.world.getBuildingOrBot = function (idParam) {
    var configObject = tg.am.dynamicItems.bots[idParam];
    if (configObject == undefined) {
        // console.log('unknown item:', updateItemKey);
        configObject = tg.am.staticItems.buildings[idParam];
        // continue;
    }
    if (configObject == undefined) {
        return null;
    } else {
        return configObject;
    }
};

// this is called as timeout with random interval to make the attacks more realistic.
tg.world.processAttackEvent = function (sourceConfig, destinationConfig, eventsArrayItem) {
    tg.audio.playItemEventAudio(sourceConfig, 'attack');

    if (sourceConfig.type != 'base' && sourceConfig.type != 'tower') {
        sourceConfig.plannedPath = null;
        tg.animationmanager.startCharacterAnimation(sourceConfig, eventsArrayItem.event);
        tg.world.rotateMesh(
            new BABYLON.Vector3(0, 1, 0),
            sourceConfig.controlMesh,
            roundTo2Decimal(Math.atan2(
                (destinationConfig.controlMesh.position.x - sourceConfig.controlMesh.position.x),
                (destinationConfig.controlMesh.position.z - sourceConfig.controlMesh.position.z)
            ))
        );
    } else {
        console.log('building attack event:', eventsArrayItem);
    }

    // if (sourceConfig.projectile == null) { // source config has melee attack
    //     continue;
    // }


    // console.log('process attack:', sourceConfig);
    if (sourceConfig.weaponType != 'melee') {
        sourceConfig.isProjectileActive = true;
        sourceConfig.projectile.position.x = sourceConfig.controlMesh.position.x;
        sourceConfig.projectile.position.y = tg.worldItems.uiConfig.playerDimensionBaseUnit / 2;
        sourceConfig.projectile.position.z = sourceConfig.controlMesh.position.z;

        var pathData = tg.world.planProjectilePath(
            sourceConfig.controlMesh.position.x,
            sourceConfig.controlMesh.position.z,
            destinationConfig.controlMesh.position.x,
            destinationConfig.controlMesh.position.z,
            sourceConfig.projectileShootY,
            destinationConfig.projectileReceiveY
        );
        // console.log('sourceConfig.id:', sourceConfig.id);
        // console.log('tg.currentTime:', tg.currentTime);
        // console.log('pathData:', pathData);
        var endTime = tg.currentTime;
        if (pathData.length > 0) {
            endTime = pathData[pathData.length - 1].time;
        }

        sourceConfig.projectileData.path = pathData;
        sourceConfig.projectileData.endTime = endTime;
    }
};

tg.world.updateWorld = function (updateParam) {
    // console.log('tg.world.updateWorld:', updateParam);
    if (tg.isGameLive == true) {
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
            if (botObject == undefined) {
                // console.log('building item:', updateItemKey);
                const buildingConfig = tg.am.staticItems.buildings[updateItemKey];
                // if(updateItemKey == 'tower7'){
                //     console.log('building item:', buildingConfig);
                //     console.log('building updateItemConfig:', updateItemConfig);
                // }

                buildingConfig.life = updateItemConfig.life;
                tg.ui3d.updateHPBarPercentage(buildingConfig.hpBarConfig, ((100 * buildingConfig.life) / buildingConfig.fullLife));
                continue;
            }

            if (tg.debugMode == true) {
                botObject.controlMesh.position.x = (updateItemConfig.position[0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit;
                botObject.controlMesh.position.z = (updateItemConfig.position[2] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit;
            } else {
                if (updateItemConfig.action == 'march' || updateItemConfig.action == 'goto') {
                    // console.log('updateItemConfig:', updateItemConfig);
                    // if(updateItemConfig.actionData == null || updateItemConfig.actionData.pathTimeStamp == undefined){
                    //     console.log('updateItemConfig:', updateItemConfig);
                    // }
                    if (botObject.plannedPathTimeStamp != updateItemConfig.actionData.pathTimeStamp) {
                        // path was updated. so need fresh planning.
                        botObject.plannedPath = tg.rm.planBotRoute(botObject, updateItemConfig);
                        botObject.plannedPathTimeStamp = updateItemConfig.actionData.pathTimeStamp;
                        tg.animationmanager.startCharacterAnimation(botObject, updateItemConfig.action);
                        tg.audio.playItemEventAudio(botObject, 'goto');
                        // console.log('completed setting planned path for bot:', botObject.id);
                    }
                    // } else if(updateItemConfig.action == 'attack'){

                } else {
                    botObject.controlMesh.position.x = (updateItemConfig.position[0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit;
                    botObject.controlMesh.position.z = (updateItemConfig.position[2] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit;
                }
            }

            botObject.life = updateItemConfig.life;

            // if(updateItemConfig.action == 'fight'){
            //     console.log('updateParam:', updateParam);
            // }
            tg.ui3d.updateHPBarPercentage(botObject.hpBarConfig, ((100 * botObject.life) / botObject.fullLife));
            var botIndex = tg.bot.userBotIdMap[botObject.id];
            // console.log('pickResult.pickedMesh.name:', pickResult.pickedMesh.name);
            if(botIndex != null && botIndex != undefined){
                tg.hl.updateBotButtonLife(botIndex, botObject);
            }
        }

        for (let index = 0; index < eventsArray.length; index++) {
            if (eventsArray[index].event == 'attack') {
                // console.log('attack event', eventsArray[index].id);

                var sourceConfig = tg.world.getBuildingOrBot(eventsArray[index].id);

                var destinationConfig = tg.world.getBuildingOrBot(eventsArray[index].tid);
                // console.log('set projectile position for:', sourceConfig.id);
                if (sourceConfig == null || destinationConfig == null) {
                    // console.log('sourceConfig == null || destinationConfig == null');
                    continue;
                }

                var randomInterval = tg.uu.getRandom(0, 400);
                setTimeout(tg.world.processAttackEvent, randomInterval, sourceConfig, destinationConfig, eventsArray[index]);

                // tg.audio.playItemEventAudio(sourceConfig, 'attack');

                // if (sourceConfig.type != 'base' && sourceConfig.type != 'tower') {
                //     sourceConfig.plannedPath = null;
                //     tg.animationmanager.startCharacterAnimation(sourceConfig, eventsArray[index].event);
                //     tg.world.rotateMesh(
                //         new BABYLON.Vector3(0, 1, 0),
                //         sourceConfig.controlMesh,
                //         roundTo2Decimal(Math.atan2(
                //             (destinationConfig.controlMesh.position.x - sourceConfig.controlMesh.position.x),
                //             (destinationConfig.controlMesh.position.z - sourceConfig.controlMesh.position.z)
                //         ))
                //     );
                // } else {
                //     console.log('building attack event:', eventsArray[index]);
                // }

                // // if (sourceConfig.projectile == null) { // source config has melee attack
                // //     continue;
                // // }


                // // console.log('process attack:', sourceConfig);
                // if (sourceConfig.weaponType != 'melee') {
                //     sourceConfig.isProjectileActive = true;
                //     sourceConfig.projectile.position.x = sourceConfig.controlMesh.position.x;
                //     sourceConfig.projectile.position.y = tg.worldItems.uiConfig.playerDimensionBaseUnit / 2;
                //     sourceConfig.projectile.position.z = sourceConfig.controlMesh.position.z;

                //     var pathData = tg.world.planProjectilePath(
                //         sourceConfig.controlMesh.position.x,
                //         sourceConfig.controlMesh.position.z,
                //         destinationConfig.controlMesh.position.x,
                //         destinationConfig.controlMesh.position.z,
                //         sourceConfig.projectileShootY,
                //         destinationConfig.projectileReceiveY
                //     );
                //     // console.log('sourceConfig.id:', sourceConfig.id);
                //     // console.log('tg.currentTime:', tg.currentTime);
                //     // console.log('pathData:', pathData);
                //     var endTime = tg.currentTime;
                //     if (pathData.length > 0) {
                //         endTime = pathData[pathData.length - 1].time;
                //     }

                //     sourceConfig.projectileData.path = pathData;
                //     sourceConfig.projectileData.endTime = endTime;
                // }

            } else if (eventsArray[index].event == 'cteam') { // building change team event.
                // console.log('cteam event', eventsArray[index].id);
                var sourceConfig = tg.world.getBuildingOrBot(eventsArray[index].id);
                // sourceConfig.team = eventsArray[index].team;
                tg.static.updateBuildingTeam(sourceConfig, eventsArray[index].team);
            } else if (eventsArray[index].event == 'clevel') { // bot level change event.
                // console.log('cteam event', eventsArray[index].id);
                var sourceConfig = tg.world.getBuildingOrBot(eventsArray[index].id);
                // sourceConfig.team = eventsArray[index].team;
                if (sourceConfig.type != 'base' && sourceConfig.type != 'tower') {
                    tg.bot.changeLevel(sourceConfig, eventsArray[index].level);
                    tg.audio.playItemEventAudio(sourceConfig, 'levelup');
                } else {
                    // tg.static.updateBuildingTeam(sourceConfig, eventsArray[index].team);
                }

            } else { // die and spawn
                var sourceConfig = tg.world.getBuildingOrBot(eventsArray[index].id);
                // console.log('event:' + eventsArray[index].event + ' for bot:' + eventsArray[index].id);
                tg.animationmanager.startCharacterAnimation(sourceConfig, eventsArray[index].event);

                // if event is for dynamic object(bot), clear any goto action(if present)
                if (sourceConfig.type != 'base' && sourceConfig.type != 'tower') {
                    sourceConfig.plannedPath = null;
                    sourceConfig.controlMesh.position.x = (eventsArray[index].position[0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit;
                    sourceConfig.controlMesh.position.z = (eventsArray[index].position[2] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit;
                }
            }
        }

        // update score
        $('#header-clock-cell').html(tg.uu.convertSecondsMMSS(updateParam.playerConfig.statistics.timeRemaining / 1000));
        if (tg.bot.userPlayerConfig.team == 1) {
            $('#tower-team').html(updateParam.playerConfig.statistics.towerCountTeam1);
            $('#tower-enemy').html(updateParam.playerConfig.statistics.towerCountTeam2);
            $('#kill-team').html(updateParam.playerConfig.statistics.performance[2].death);
            $('#kill-enemy').html(updateParam.playerConfig.statistics.performance[1].death);
            $('#attack-team').html(updateParam.playerConfig.statistics.performance[1].damage);
            $('#attack-enemy').html(updateParam.playerConfig.statistics.performance[2].damage);
        } else {
            $('#tower-team').html(updateParam.playerConfig.statistics.towerCountTeam2);
            $('#tower-enemy').html(updateParam.playerConfig.statistics.towerCountTeam1);
            $('#kill-team').html(updateParam.playerConfig.statistics.performance[1].death);
            $('#kill-enemy').html(updateParam.playerConfig.statistics.performance[2].death);
            $('#attack-team').html(updateParam.playerConfig.statistics.performance[2].damage);
            $('#attack-enemy').html(updateParam.playerConfig.statistics.performance[1].damage);
        }

    }
};

// tg.world.refreshWorld = function(){

// }

tg.world.rotateMesh = function (axis, meshParam, angle, projectileMesh) {
    // axis.normalize();
    var quaternion = new BABYLON.Quaternion.RotationAxis(axis, angle);
    meshParam.rotationQuaternion = quaternion;
};

tg.world.planProjectilePath = function (startX, startZ, endX, endZ, startY, endY) {
    var distance = tg.getDistanceBetweenPoints(
        getGridPositionFromFloorPosition(startX),
        getGridPositionFromFloorPosition(startZ),
        getGridPositionFromFloorPosition(endX),
        getGridPositionFromFloorPosition(endZ)
    );
    // console.log('distance before:', distance);
    distance = getFloorPositionFromGridPosition(distance);
    // console.log('distance after:', distance);

    // if(distance > 0){
    //     console.log('distance > 0');
    // }

    var factorX = (endX - startX) / distance;
    var factorZ = (endZ - startZ) / distance;
    var factorY = (endY - startY) / distance;
    var projectilePath = [];
    var time = tg.currentTime;

    for (var pathRunner = 0; pathRunner < distance;) {
        var projectilePathElement = {
            x: (startX + (pathRunner * factorX)),
            y: (startY + (pathRunner * factorY)),
            z: (startZ + (pathRunner * factorZ)),
            time: time,
            rotation: 0
        }
        projectilePath.push(projectilePathElement);
        pathRunner += tg.worldItems.uiConfig.projectilePathDistanceResolution;
        time += tg.worldItems.uiConfig.projectilePathTimeResolution;
    }

    return projectilePath;
}

tg.world.updateWorldDormant = function (updateParam) {};