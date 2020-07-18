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

    resultObject.playersPerTeam = resultObject.detailedPerformance.length / 2;
    resultObject.calculatedValues = [];

    if (tg.bot.userPlayerConfig.team == 1) {} else {
        // swap players ordering based on user team.
        for (var i = 0; i < resultObject.playersPerTeam; ++i) {
            tg.uu.swapArrayElements(resultObject.detailedPerformance, i, (i + resultObject.playersPerTeam));
            tg.uu.swapArrayElements(resultObject.calculatedValues, i, (i + resultObject.playersPerTeam));
            tg.uu.swapArrayElements(tg.bot.playerConfigArray, i, (i + resultObject.playersPerTeam));
        }
    }

    tg.resultObject = resultObject;



    resultObject.performance[1].kills = 0;
    resultObject.performance[1].buildingDestroyed = 0;
    resultObject.performance[2].kills = 0;
    resultObject.performance[2].buildingDestroyed = 0;

    for (var j = 0; j < 2; ++j) {
        for (var k = 0; k < resultObject.playersPerTeam; ++k) {
            var playerResultObject = null;
            var teamPerformanceObject = null;
            if (j == 1) { // team 2
                playerResultObject = resultObject.detailedPerformance[k + resultObject.playersPerTeam];
                teamPerformanceObject = resultObject.performance[2];
            } else { // team 1
                playerResultObject = resultObject.detailedPerformance[k];
                teamPerformanceObject = resultObject.performance[1];
            }

            var totalDamage = 0;
            var totalDeath = 0;
            var totalKills = 0;
            var totalBuildingsDestroyed = 0;

            for (var i = 0; i < playerResultObject.length; ++i) {
                totalDamage += playerResultObject[i].totalDamageSinceSpawn;
                totalDeath += playerResultObject[i].totalDeath;
                totalKills += playerResultObject[i].totalBotKill;
                totalBuildingsDestroyed += playerResultObject[i].totalBuildingDestroy;
            }

            resultObject.calculatedValues.push({
                totalDamage: totalDamage,
                totalDeath: totalDeath,
                totalKills: totalKills,
                totalBuildingsDestroyed: totalBuildingsDestroyed
            });

            teamPerformanceObject.kills += totalKills;
            teamPerformanceObject.buildingDestroyed += totalBuildingsDestroyed;
        }
    }



    var outCome = null;
    var playerTeamPerformance = null;
    var enemyTeamPerformance = null;
    var playerTeamTowerCount = null;
    var enemyTeamTowerCount = null;
    if (tg.bot.userPlayerConfig.team == resultObject.winningTeam) {
        outCome = 'VICTORY';
    } else {
        outCome = 'DEFEAT';
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

    $('.gr-header').html(outCome);


    // team summary
    var resultString = 'TEAM<br>Total Damage:' + playerTeamPerformance.damage.toFixed() + '<br>' +
        'Total Deaths:' + playerTeamPerformance.death + '<br>' +
        'Total Kills:' + playerTeamPerformance.kills + '<br>' +
        'Total Buildins Destroyed:' + playerTeamPerformance.buildingDestroyed + '<br>' +
        'Total Tower Owned:' + playerTeamTowerCount + '<br>';
    $('.gr-team-header').html(resultString);

    // enemy summary
    resultString = 'ENEMY<br>Total Damage:' + enemyTeamPerformance.damage.toFixed() + '<br>' +
        'Total Deaths:' + enemyTeamPerformance.death + '<br>' +
        'Total Kills:' + enemyTeamPerformance.kills + '<br>' +
        'Total Buildins Destroyed:' + enemyTeamPerformance.buildingDestroyed + '<br>' +
        'Total Tower Owned:' + enemyTeamTowerCount + '<br>';
    $('.gr-enemy-header').html(resultString);

    var playerSelfIndex = 0;
    var resultPlayerContainerArray = $('.result-player-container');
    if (tg.bot.userPlayerConfig.playerSelfIndex < resultObject.playersPerTeam) {
        playerSelfIndex = tg.bot.userPlayerConfig.playerSelfIndex;
    } else {
        playerSelfIndex = tg.bot.userPlayerConfig.playerSelfIndex - resultObject.playersPerTeam;
    }

    for(var i = 0; i < resultPlayerContainerArray.length; ++i){
        resultPlayerContainerArray[i].innerHTML = tg.bot.playerConfigArray[i].id;
    }
    var playerHTMLContainer = $('.border-team.result-player-container')[playerSelfIndex];
    playerHTMLContainer.innerHTML = 'YOU';
    tg.uu.viewSelectedPlayerResultDetails(playerHTMLContainer, tg.bot.userPlayerConfig.playerSelfIndex);
    // console.log(JSON.stringify(resultObject));

    // tg.hl.updateResult(outCome, playerTeamPerformance, enemyTeamPerformance, playerTeamTowerCount, enemyTeamTowerCount);
    tg.pn.showMatchResultPage();

    // $('#game-result-header').html(outCome);
    // $('#team-owned-tower-count').html('Total tower owned count : ' + playerTeamTowerCount);
    // $('#team-total-kill-count').html('Total enemy killed : ' + enemyTeamPerformance.death);
    // $('#team-total-attack-damage').html('Total damage done to enemy : ' + playerTeamPerformance.damage);
    // $('#enemy-owned-tower-count').html('Total tower owned count : ' + enemyTeamTowerCount);
    // $('#enemy-total-kill-count').html('Total enemy killed : ' + playerTeamPerformance.death);
    // $('#enemy-total-attack-damage').html('Total damage done to enemy : ' + enemyTeamPerformance.damage);
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
            for (var i = 0; i < botObject.ability.length; ++i) {
                var abilityObject = botObject.ability[i];
                if (botObject[abilityObject.key] != updateItemConfig[abilityObject.key]) {
                    tg.effect.processAbilityStateChangeEvent(botObject, updateItemConfig, i);
                    botObject[abilityObject.key] = updateItemConfig[abilityObject.key];
                }
            }
            var activeStateUpdated = false;
            if (botObject.isActive != updateItemConfig.isActive) {
                activeStateUpdated = true;
            }
            botObject.isActive = updateItemConfig.isActive;

            // if(updateItemConfig.action == 'fight'){
            //     console.log('updateParam:', updateParam);
            // }
            tg.ui3d.updateHPBarPercentage(botObject.hpBarConfig, ((100 * botObject.life) / botObject.fullLife));
            var botIndex = tg.bot.userBotIdMap[botObject.id];
            // console.log('pickResult.pickedMesh.name:', pickResult.pickedMesh.name);
            if (botIndex != null && botIndex != undefined) {
                tg.hl.updateBotButtonLife(botIndex, botObject);
                if (activeStateUpdated) {
                    if (botObject.isActive == true) {
                        tg.hl.enableFooterSelfBotIcon("game-footer-bot-selection_" + botIndex);
                    } else {
                        tg.hl.diableFooterSelfBotIcon("game-footer-bot-selection_" + botIndex);
                    }

                }
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
            $('#attack-team').html(updateParam.playerConfig.statistics.performance[1].damage.toFixed());
            $('#attack-enemy').html(updateParam.playerConfig.statistics.performance[2].damage.toFixed());
        } else {
            $('#tower-team').html(updateParam.playerConfig.statistics.towerCountTeam2);
            $('#tower-enemy').html(updateParam.playerConfig.statistics.towerCountTeam1);
            $('#kill-team').html(updateParam.playerConfig.statistics.performance[1].death);
            $('#kill-enemy').html(updateParam.playerConfig.statistics.performance[2].death);
            $('#attack-team').html(updateParam.playerConfig.statistics.performance[2].damage.toFixed());
            $('#attack-enemy').html(updateParam.playerConfig.statistics.performance[1].damage.toFixed());
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




tg.world.testResultRendering = function () {
    console.log('test result rendering');

    tg.world.processResult({
        "towerCountTeam1": 5,
        "towerCountTeam2": 5,
        "timeRemaining": 0,
        "performance": [{
                "death": null
            },
            {
                "death": 8,
                "damage": 2517.39375
            },
            {
                "death": 1,
                "damage": 2401.625
            }
        ],
        "detailedPerformance": [
            [{
                    "type": "lion",
                    "totalDamageSinceSpawn": 37.625,
                    "totalDamageSinceGameStart": 81.844375,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 1,
                    "levelHistory": [
                        [
                            1,
                            88904
                        ],
                        [
                            2,
                            126094
                        ],
                        [
                            3,
                            211562
                        ],
                        [
                            0,
                            215577
                        ],
                        [
                            1,
                            264811
                        ],
                        [
                            2,
                            268838
                        ],
                        [
                            3,
                            273357
                        ]
                    ]
                },
                {
                    "type": "swordman",
                    "totalDamageSinceSpawn": 13.5,
                    "totalDamageSinceGameStart": 38.75,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 2,
                    "levelHistory": [
                        [
                            0,
                            148199
                        ],
                        [
                            1,
                            223617
                        ],
                        [
                            0,
                            229654
                        ],
                        [
                            1,
                            349222
                        ]
                    ]
                },
                {
                    "type": "archer",
                    "totalDamageSinceSpawn": 0,
                    "totalDamageSinceGameStart": 379.25,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 2,
                    "levelHistory": [
                        [
                            1,
                            84877
                        ],
                        [
                            2,
                            87397
                        ],
                        [
                            3,
                            90909
                        ],
                        [
                            0,
                            209048
                        ],
                        [
                            1,
                            264311
                        ],
                        [
                            2,
                            267837
                        ],
                        [
                            3,
                            270845
                        ],
                        [
                            0,
                            331629
                        ]
                    ]
                },
                {
                    "type": "archer",
                    "totalDamageSinceSpawn": 28.75,
                    "totalDamageSinceGameStart": 214.5,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 1,
                    "levelHistory": [
                        [
                            1,
                            87397
                        ],
                        [
                            2,
                            88402
                        ],
                        [
                            3,
                            91917
                        ],
                        [
                            0,
                            219602
                        ],
                        [
                            1,
                            322593
                        ],
                        [
                            2,
                            325606
                        ]
                    ]
                },
                {
                    "type": "swordman",
                    "totalDamageSinceSpawn": 9,
                    "totalDamageSinceGameStart": 34.75,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 2,
                    "levelHistory": [
                        [
                            1,
                            138644
                        ],
                        [
                            0,
                            146185
                        ],
                        [
                            1,
                            223617
                        ],
                        [
                            0,
                            226636
                        ]
                    ]
                }
            ],
            [{
                    "type": "lion",
                    "totalDamageSinceSpawn": 162.70499999999998,
                    "totalDamageSinceGameStart": 162.70499999999998,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            62768
                        ],
                        [
                            2,
                            177365
                        ],
                        [
                            3,
                            218598
                        ]
                    ]
                },
                {
                    "type": "swordman",
                    "totalDamageSinceSpawn": 35,
                    "totalDamageSinceGameStart": 35,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            276872
                        ],
                        [
                            2,
                            284905
                        ],
                        [
                            3,
                            341690
                        ]
                    ]
                },
                {
                    "type": "swordman",
                    "totalDamageSinceSpawn": 38.5,
                    "totalDamageSinceGameStart": 38.5,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            277877
                        ],
                        [
                            2,
                            285907
                        ],
                        [
                            3,
                            340178
                        ]
                    ]
                },
                {
                    "type": "archer",
                    "totalDamageSinceSpawn": 332.25,
                    "totalDamageSinceGameStart": 332.25,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            61266
                        ],
                        [
                            2,
                            64279
                        ],
                        [
                            3,
                            68298
                        ]
                    ]
                },
                {
                    "type": "archer",
                    "totalDamageSinceSpawn": 369.75,
                    "totalDamageSinceGameStart": 369.75,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            60257
                        ],
                        [
                            2,
                            63272
                        ],
                        [
                            3,
                            66283
                        ]
                    ]
                }
            ],
            [{
                    "type": "lion",
                    "totalDamageSinceSpawn": 212.094375,
                    "totalDamageSinceGameStart": 212.094375,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            78851
                        ],
                        [
                            2,
                            103472
                        ],
                        [
                            3,
                            158260
                        ]
                    ]
                },
                {
                    "type": "swordman",
                    "totalDamageSinceSpawn": 87.5,
                    "totalDamageSinceGameStart": 87.5,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            126598
                        ],
                        [
                            2,
                            210557
                        ],
                        [
                            3,
                            238696
                        ]
                    ]
                },
                {
                    "type": "swordman",
                    "totalDamageSinceSpawn": 11,
                    "totalDamageSinceGameStart": 11,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            349726
                        ]
                    ]
                },
                {
                    "type": "archer",
                    "totalDamageSinceSpawn": 219.5,
                    "totalDamageSinceGameStart": 219.5,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            116038
                        ],
                        [
                            2,
                            163300
                        ],
                        [
                            3,
                            164810
                        ]
                    ]
                },
                {
                    "type": "archer",
                    "totalDamageSinceSpawn": 276,
                    "totalDamageSinceGameStart": 276,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            77848
                        ],
                        [
                            2,
                            95426
                        ],
                        [
                            3,
                            109505
                        ]
                    ]
                }
            ],
            [{
                    "type": "lion",
                    "totalDamageSinceSpawn": 167.125,
                    "totalDamageSinceGameStart": 167.125,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            60761
                        ],
                        [
                            2,
                            131114
                        ],
                        [
                            3,
                            193442
                        ]
                    ]
                },
                {
                    "type": "swordman",
                    "totalDamageSinceSpawn": 35,
                    "totalDamageSinceGameStart": 35,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            208038
                        ],
                        [
                            2,
                            219101
                        ],
                        [
                            3,
                            341186
                        ]
                    ]
                },
                {
                    "type": "archer",
                    "totalDamageSinceSpawn": 91,
                    "totalDamageSinceGameStart": 91,
                    "totalBotKill": 1,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            142665
                        ],
                        [
                            2,
                            217086
                        ],
                        [
                            3,
                            227137
                        ]
                    ]
                },
                {
                    "type": "archer",
                    "totalDamageSinceSpawn": 261,
                    "totalDamageSinceGameStart": 261,
                    "totalBotKill": 1,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            61767
                        ],
                        [
                            2,
                            66283
                        ],
                        [
                            3,
                            69301
                        ]
                    ]
                },
                {
                    "type": "swordman",
                    "totalDamageSinceSpawn": 411,
                    "totalDamageSinceGameStart": 411,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            61266
                        ],
                        [
                            2,
                            64279
                        ],
                        [
                            3,
                            68298
                        ]
                    ]
                }
            ],
            [{
                    "type": "lion",
                    "totalDamageSinceSpawn": 116.25,
                    "totalDamageSinceGameStart": 116.25,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            118052
                        ],
                        [
                            2,
                            124081
                        ],
                        [
                            3,
                            176362
                        ]
                    ]
                },
                {
                    "type": "swordman",
                    "totalDamageSinceSpawn": 16,
                    "totalDamageSinceGameStart": 16,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            298471
                        ]
                    ]
                },
                {
                    "type": "swordman",
                    "totalDamageSinceSpawn": 6,
                    "totalDamageSinceGameStart": 6,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": []
                },
                {
                    "type": "archer",
                    "totalDamageSinceSpawn": 189.75,
                    "totalDamageSinceGameStart": 189.75,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            102969
                        ],
                        [
                            2,
                            113523
                        ],
                        [
                            3,
                            116541
                        ]
                    ]
                },
                {
                    "type": "archer",
                    "totalDamageSinceSpawn": 129.5,
                    "totalDamageSinceGameStart": 141.5,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 1,
                    "levelHistory": [
                        [
                            1,
                            75831
                        ],
                        [
                            0,
                            79353
                        ],
                        [
                            1,
                            130611
                        ],
                        [
                            2,
                            133620
                        ],
                        [
                            3,
                            177866
                        ]
                    ]
                }
            ],
            [{
                    "type": "lion",
                    "totalDamageSinceSpawn": 186.25,
                    "totalDamageSinceGameStart": 186.25,
                    "totalBotKill": 1,
                    "totalBuildingDestroy": 1,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            75327
                        ],
                        [
                            2,
                            150213
                        ],
                        [
                            3,
                            153234
                        ]
                    ]
                },
                {
                    "type": "swordman",
                    "totalDamageSinceSpawn": 35,
                    "totalDamageSinceGameStart": 35,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            241711
                        ],
                        [
                            2,
                            342692
                        ],
                        [
                            3,
                            350229
                        ]
                    ]
                },
                {
                    "type": "swordman",
                    "totalDamageSinceSpawn": 40.25,
                    "totalDamageSinceGameStart": 40.25,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            162288
                        ],
                        [
                            2,
                            245232
                        ],
                        [
                            3,
                            340178
                        ]
                    ]
                },
                {
                    "type": "archer",
                    "totalDamageSinceSpawn": 298.5,
                    "totalDamageSinceGameStart": 298.5,
                    "totalBotKill": 4,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            83371
                        ],
                        [
                            2,
                            157256
                        ],
                        [
                            3,
                            159268
                        ]
                    ]
                },
                {
                    "type": "archer",
                    "totalDamageSinceSpawn": 407,
                    "totalDamageSinceGameStart": 407,
                    "totalBotKill": 0,
                    "totalBuildingDestroy": 0,
                    "totalDeath": 0,
                    "levelHistory": [
                        [
                            1,
                            84877
                        ],
                        [
                            2,
                            158765
                        ],
                        [
                            3,
                            159776
                        ]
                    ]
                }
            ]
        ],
        "winningTeam": 2
    });
};


