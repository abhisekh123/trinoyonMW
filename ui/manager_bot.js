tg.bot = {};
tg.bot.userPlayerConfig = null;

tg.bot.reloadBots = function (playerConfigArray, playerSelfIndex, actionOnComplete) {
    console.log('start tg.bot.reloadBots');
    tg.bot.characters = {};

    tg.am.onLoadComplete = actionOnComplete;
    tg.am.totalAssetsToBeLoaded = 0;
    for (let i = 0; i < playerConfigArray.length; i++) {
        tg.am.totalAssetsToBeLoaded += (playerConfigArray[i].botObjectList.length * 2); // gltf file + audio file
    }
    tg.am.totalAssetsLoaded_tillNow = 0;

    tg.am.initialiseBotMetaDataFactory(playerConfigArray);

    for (let i = 0; i < playerConfigArray.length; i++) {
        const playerBotArray = playerConfigArray[i].botObjectList;
        console.log('playerBotArray:', playerBotArray);
        if (i == playerSelfIndex) {
            tg.bot.userPlayerConfig = playerConfigArray[i];
            tg.bot.userPlayerConfig.selectedBot = null;
            tg.bot.userPlayerConfig.clearSelectionTimer = null;
            tg.hl.updateFooterIconImageForPlayerTeamBots();

        }
        for (let j = 0; j < playerBotArray.length; j++) {
            let botConfig = playerBotArray[j];
            tg.bot.loadCharacters(botConfig, playerConfigArray[i].id, playerConfigArray[i].team);
            // return;
        }
    }
};

tg.bot.loadCharacters = function (
    botConfig,
    playerID,
    team
) {
    // const characterName = botConfig.type;
    console.log('start tg.bot.loadCharacters');
    // console.log('--------->' + characterName);
    var characterConfig = tg.itemConfigs.items[botConfig.type];

    BABYLON.SceneLoader.ImportMesh(
        '',
        'static/model/' + characterConfig.file + '/',
        "scene.gltf",
        tg.scene,
        // processLoadedModel
        function (newMeshes,
            particleSystems,
            skeletons,
            animationGroups,
        ) {
            console.log('load character with id:' + botConfig.id);
            tg.bot.processLoadedModel(newMeshes,
                particleSystems,
                skeletons,
                animationGroups, {
                    x: (botConfig.position[0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
                    y: 0,
                    z: (botConfig.position[2] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
                },
                botConfig,
                team,
                playerID
            );
        }
    );
}


tg.bot.processLoadedModel = function (
    newMeshes,
    particleSystems,
    skeletons,
    animationGroups,
    positionParam,
    botConfig,
    team,
    playerID
) {
    console.log('start tg.bot.processLoadedModel');
    const rotationParam = botConfig.rotation;
    const characterName = botConfig.type;
    const characterID = botConfig.id;

    var hpBarMaterial = null;
    var hpBarContainerMaterial = null;
    var isSelfBot = false;
    if (team != tg.bot.userPlayerConfig.team) { // enemy
        hpBarMaterial = tg.am.material_enemy_hpbar;
        hpBarContainerMaterial = tg.am.material_enemy_hpbarcontainer;
    } else { // fiendly
        if (playerID == tg.bot.userPlayerConfig.id) { // self
            hpBarMaterial = tg.am.material_self_hpbar;
            hpBarContainerMaterial = tg.am.material_self_hpbarcontainer;
            isSelfBot = true;
        } else { // team
            hpBarMaterial = tg.am.material_friend_hpbar;
            hpBarContainerMaterial = tg.am.material_friend_hpbarcontainer;
        }
    }

    // console.log('--------->' + characterName);
    var characterConfig = tg.itemConfigs.items[characterName];
    if (characterConfig == null || characterConfig == undefined) {
        console.error('character config is empty. exiting. character name:' + characterName);
        return;
    }

    const scale = characterConfig.scale;


    for (var i = 0; i < newMeshes.length; ++i) {
        // console.log(i + '->' + newMeshes[i].isPickable);
        newMeshes[i].isPickable = false;
    }

    var botLevelMap = characterConfig.levelMap[0];
    var botSpeed = botLevelMap.speed;
    var botLife = botLevelMap.life;


    const botObject = {};
    botObject.id = characterID;
    // botObject.parentMesh = parentMesh;
    botObject.type = characterName;
    botObject.controlMesh = newMeshes[0];
    botObject.animationGroups = animationGroups;
    botObject.defaultRotation = Math.PI;
    botObject.intermediatePositionArray = [];
    botObject.intermediatePositionArrayIndex = 0;
    botObject.animationAction = 'goto'; // initialise action.
    botObject.animations = characterConfig.animations;
    botObject.level = 0;
    botObject.projectileShootY = characterConfig.projectileShootY * tg.worldItems.uiConfig.playerDimensionBaseUnit;
    botObject.projectileReceiveY = characterConfig.projectileReceiveY * tg.worldItems.uiConfig.playerDimensionBaseUnit;
    botObject.life = botLife;
    botObject.fullLife = botLife;
    botObject.team = team;
    botObject.playerID = playerID;
    botObject.timeTakenToCover1Tile = 1000 / botSpeed; // in milliSeconds
    botObject.plannedPath = null;
    botObject.plannedPathTimeStamp = 0;

    botObject.levelMap = tg.uu.getObjectClone(characterConfig.levelMap);
    botObject.ability = tg.uu.getObjectClone(characterConfig.ability);
    for (var i = 0; i < characterConfig.ability.length; ++i) {
        var abilityItem = characterConfig.ability[i];
        botObject[abilityItem.key] = tg.worldItems.constants.ABILITY_AVAILABLE;
    }

    var hpBarConfig = tg.ui3d.gethpbar(characterID, hpBarMaterial, hpBarContainerMaterial);
    botObject.hpBarConfig = hpBarConfig;
    // botObject.controlMesh.scaling = new BABYLON.Vector3(1/scale, 1/scale, 1/scale);
    hpBarConfig.healthBarContainer.scaling = new BABYLON.Vector3(
        characterConfig.hpBarScale,
        characterConfig.hpBarScale,
        characterConfig.hpBarScale
    );
    hpBarConfig.healthBarContainer.parent = botObject.controlMesh;
    hpBarConfig.healthBarContainer.position.y = characterConfig.hpBarPositionY;


    tg.am.dynamicItems.bots[characterID] = botObject;
    tg.am.dynamicItems.botsArray.push(botObject);

    for (var i = 0; i < characterConfig.bannedMeshes.length; ++i) {
        newMeshes[characterConfig.bannedMeshes[i]].isVisible = false;
    }
    // if (newMeshes.length > 9) {
    //     newMeshes[9].isVisible = false;
    // }

    newMeshes[0].scaling = new BABYLON.Vector3(scale, scale, scale);
    // newMeshes[0].parent = parentMesh;

    botObject.controlMesh.position.x = positionParam.x;
    botObject.controlMesh.position.y = 0;
    botObject.controlMesh.position.z = positionParam.z;
    botObject.controlMesh.addRotation(0, rotationParam, 0);

    if (isSelfBot == true) {
        var envelopMesh = BABYLON.MeshBuilder.CreateBox('envelop_' + characterID, {
            height: tg.worldItems.uiConfig.playerDimensionBaseUnit,
            width: tg.worldItems.uiConfig.playerDimensionBaseUnit,
            depth: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        }, tg.scene, false, BABYLON.Mesh.FRONTSIDE);
        // parentMesh.material = tg.am.material_transparent;
        envelopMesh.material = tg.am.material_transparent;
        envelopMesh.position.y = (tg.worldItems.uiConfig.playerDimensionBaseUnit / 2) * (1 / characterConfig.scale);
        envelopMesh.isPickable = true;
        botObject.envelopMesh = envelopMesh;
        envelopMesh.scaling = new BABYLON.Vector3(
            1 / characterConfig.scale,
            1 / characterConfig.scale,
            1 / characterConfig.scale
        );
        envelopMesh.parent = botObject.controlMesh;
    }


    // botObject.currentAnimation = 'goto';

    // animationGroups[characterConfig.idleAnimationIndex].play(true);
    tg.animationmanager.startCharacterAnimation(botObject, 'ready');

    const outputPlaneScale = characterConfig.headerScale;
    //data reporter
    var outputplane = BABYLON.Mesh.CreatePlane("outputplane" + characterID, characterConfig.headerSize, tg.scene, false);
    outputplane.scaling = new BABYLON.Vector3(outputPlaneScale, outputPlaneScale, outputPlaneScale);
    outputplane.isPickable = false;
    outputplane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
    outputplane.material = new BABYLON.StandardMaterial("outputplane" + characterID, tg.scene);
    outputplane.position = new BABYLON.Vector3(0, characterConfig.headerPositionY, 0);
    // outputplane.scaling.y = 0.4;

    var outputplaneTexture = new BABYLON.DynamicTexture("dynamictexture" + characterID, 512, tg.scene, true);
    outputplane.material.diffuseTexture = outputplaneTexture;
    outputplane.material.specularColor = new BABYLON.Color3(0, 0, 0);
    outputplane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    outputplane.material.backFaceCulling = false;
    outputplane.material.freeze();

    //outputplaneTexture.getContext().clearRect(0, 140, 512, 512);
    outputplaneTexture.drawText(characterID, null, 140, "bold 80px verdana", "white");

    outputplaneTexture.hasAlpha = true;
    // outputplane.position.y = tg.worldItems.uiConfig.playerDimensionBaseUnit * 1.2;
    outputplane.parent = botObject.controlMesh;

    botObject.outputplane = outputplane;

    // bot rank plane
    var f = new BABYLON.Vector4(0, 0, 1, 1);

    var options = {
        sideOrientation: BABYLON.Mesh.DOUBLESIDE, // FRONTSIDE, BACKSIDE, DOUBLESIDE
        frontUVs: f,
        backUVs: f,
        // updatable: false,
        width: characterConfig.headerSize / 5,
        height: characterConfig.headerSize / 5,
    }

    var rankPlane = BABYLON.MeshBuilder.CreatePlane('rank_plane_' + characterID, options, tg.scene);
    rankPlane.scaling = new BABYLON.Vector3(outputPlaneScale, outputPlaneScale, outputPlaneScale);
    rankPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    rankPlane.material = tg.am.material_plane_rank0;

    rankPlane.position = new BABYLON.Vector3(-(characterConfig.headerPositionY / 3), characterConfig.headerPositionY * 1.5, 0);
    rankPlane.parent = botObject.controlMesh;
    botObject.rankPlane = rankPlane;
    // botObject.projectileData = {
    //     path: null,
    //     endTime: 0,
    //     plane: rankPlane,
    //     // texture: projectileTexture,
    //     uOffset: characterConfig.projectile.uOffset
    // };


    botObject.weaponType = characterConfig.weaponType;
    tg.bot.addMetaDataToBot(botObject, characterConfig, characterID, positionParam);
    // projectile mesh
    // if (botObject.weaponType == 'melee') {

    // } else {

    //     // var mat = new BABYLON.StandardMaterial('material_projectile_' + characterID, tg.scene);
    //     // var projectileTexture = new BABYLON.Texture(characterConfig.projectile.image, tg.scene);
    //     // projectileTexture.hasAlpha = true;
    //     // projectileTexture.getAlphaFromRGB = true;

    //     // mat.diffuseTexture = projectileTexture;


    // }

    tg.audio.initGameDynamicObjectAudio(botObject, characterConfig);
    console.log(botObject.ability);

    tg.am.updateNewAssetLoaded(1);
};

// add additional data/asset to the botconfig based on bot type
tg.bot.addMetaDataToBot = function (botObject, characterConfig, characterID, positionParam) {
    // populate character type assets
    console.log('tg.bot.addMetaDataToBot:', characterID);
    switch (botObject.type) {
        case 'lion':
            botObject.projectile = null;
            botObject.isProjectileActive = false;
            botObject.projectileData = null;
            break;
        case 'swordman':
            botObject.projectile = null;
            botObject.isProjectileActive = false;
            botObject.projectileData = null;
            break;
        case 'archer':

            var faceUV = new BABYLON.Vector4(
                characterConfig.projectile.uBottom,
                characterConfig.projectile.vBottom,
                characterConfig.projectile.uTop,
                characterConfig.projectile.vTop
            );

            var options = {
                sideOrientation: BABYLON.Mesh.DOUBLESIDE, // FRONTSIDE, BACKSIDE, DOUBLESIDE
                frontUVs: faceUV,
                backUVs: faceUV,
                // updatable: false,
                width: characterConfig.projectile.width,
                height: characterConfig.projectile.height,
            }

            var projectilePlane = BABYLON.MeshBuilder.CreatePlane('projectile_plane_' + characterID, options, tg.scene);
            projectilePlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
            projectilePlane.material = tg.am.material_projectile_flame_arrow;

            // console.log('=======->' + projectilePlane.isPickable);

            // projectilePlane.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
            // projectilePlane.bakeCurrentTransformIntoVertices();

            projectilePlane.position.x = positionParam.x;
            projectilePlane.position.y = tg.worldItems.uiConfig.hiddenY;
            projectilePlane.position.z = positionParam.z;
            // projectile.material = tg.am.material_semitransparent_projectile;
            projectilePlane.isPickable = false;

            botObject.projectile = projectilePlane;
            botObject.isProjectileActive = false;
            botObject.projectileData = {
                path: null,
                endTime: 0,
                plane: projectilePlane,
                // texture: projectileTexture,
                uOffset: characterConfig.projectile.uOffset
            };
            break;

        default:
            console.log('unknown bot type:', botObject.type);
            break;
    }

    // populate ability specific asset
    for (var k = 0; k < botObject.ability.length; ++k) {
        var abilityObject = botObject.ability[k];
        var abilityConfig = tg.itemConfigs.abilityConfig[abilityObject.action];
        switch (abilityObject.action) {
            case 'retreat':
                // metaDataRequirement[characterConfig.ability[k].action]++;
                tg.effect.addAbilityEffectPlane(abilityObject, characterID, positionParam, abilityConfig);
                var abilityEffectPlane = abilityObject[abilityConfig.metaData.key];
                abilityEffectPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
                abilityEffectPlane.scaling = new BABYLON.Vector3(
                    1 / characterConfig.scale,
                    1 / characterConfig.scale,
                    1 / characterConfig.scale
                );
                abilityObject.visibleY = (tg.worldItems.uiConfig.playerDimensionBaseUnit) / characterConfig.scale;
                
                break;
            case 'sheild':
                tg.effect.addAbilityEffectPlane(abilityObject, characterID, positionParam, abilityConfig);
                var abilityEffectPlane = abilityObject[abilityConfig.metaData.key];
                abilityEffectPlane.addRotation(Math.PI / 2, 0, 0);
                // abilityEffectPlane.bakeCurrentTransformIntoVertices();
                abilityObject.visibleY = (tg.worldItems.uiConfig.playerDimensionBaseUnit / 2) / characterConfig.scale;

                // abilityEffectPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
                // abilityEffectPlane.scaling = new BABYLON.Vector3(
                //     1 / characterConfig.scale,
                //     1 / characterConfig.scale,
                //     1 / characterConfig.scale
                // );

                // abilityEffectPlane.position.y = abilityObject.visibleY;
                break;
            case 'scorch':
                tg.effect.addAbilityEffectPlane(abilityObject, characterID, positionParam, abilityConfig);
                var abilityEffectPlane = abilityObject[abilityConfig.metaData.key];
                abilityEffectPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
                break;
            case 'pulse':
                tg.effect.addAbilityEffectSprite(abilityObject, characterID, positionParam, abilityConfig);
                break;
            default:
                break;
        }
    }

};

tg.bot.changeLevel = function (botConfig, level) {
    // console.log(level + '->change level event:', botConfig);
    botConfig.level = level;
    var botLevelMap = botConfig.levelMap[level];
    var botSpeed = botLevelMap.speed;
    var botLife = botLevelMap.life;

    botConfig.fullLife = botLife;
    botConfig.timeTakenToCover1Tile = 1000 / botSpeed; // in milliSeconds

    switch (level) {
        case 0:
            botConfig.rankPlane.material = tg.am.material_plane_rank0;
            break;
        case 1:
            botConfig.rankPlane.material = tg.am.material_plane_rank1;
            break;
        case 2:
            botConfig.rankPlane.material = tg.am.material_plane_rank2;
            break;
        case 3:
            botConfig.rankPlane.material = tg.am.material_plane_rank3;
            break;
        default:
            console.error('ERROR: Unknown level:' + level + ' for bot:' + botConfig.id);
            break;
    }
};