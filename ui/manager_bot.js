
tg.bot = {};
tg.bot.userPlayerConfig = null;

tg.bot.reloadBots = function(playerConfigArray, playerSelfIndex, actionOnComplete) {
    console.log('start tg.bot.reloadBots');
    tg.bot.characters = {};

    tg.am.onLoadComplete = actionOnComplete;
    tg.am.totalAssetsToBeLoaded = 0;
    for (let i = 0; i < playerConfigArray.length; i++) {
        tg.am.totalAssetsToBeLoaded += playerConfigArray[i].botObjectList.length;
    }
    tg.am.totalAssetsLoaded_tillNow = 0;

    for (let i = 0; i < playerConfigArray.length; i++) {
        const playerBotArray = playerConfigArray[i].botObjectList;
        console.log('playerBotArray:', playerBotArray);
        if(i == playerSelfIndex){
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
    if(team != tg.bot.userPlayerConfig.team){ // enemy
        hpBarMaterial = tg.am.material_enemy_hpbar;
        hpBarContainerMaterial = tg.am.material_enemy_hpbarcontainer;
    } else { // fiendly
        if(playerID == tg.bot.userPlayerConfig.id){ // self
            hpBarMaterial = tg.am.material_self_hpbar;
            hpBarContainerMaterial = tg.am.material_self_hpbarcontainer;
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
        // // console.log(i + '->' + newMeshes[i].name);
        newMeshes[i].isPickable = false;
    }
    // var parentMesh = BABYLON.MeshBuilder.CreateBox(characterID, {
    //     height: tg.worldItems.uiConfig.playerDimensionBaseUnit,
    //     width: tg.worldItems.uiConfig.playerDimensionBaseUnit,
    //     depth: tg.worldItems.uiConfig.playerDimensionBaseUnit,
    // }, tg.scene, false, BABYLON.Mesh.FRONTSIDE);
    // parentMesh.material = tg.am.material_transparent;
    // parentMesh.material = tg.material_semitransparent_blue;
    // parentMesh.isPickable = true;
    // botObject = {};
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
    botObject.projectileShootY = characterConfig.projectileShootY * tg.worldItems.uiConfig.playerDimensionBaseUnit;
    botObject.projectileReceiveY = characterConfig.projectileReceiveY * tg.worldItems.uiConfig.playerDimensionBaseUnit;
    botObject.life = characterConfig.life;
    botObject.fullLife = characterConfig.life;
    botObject.team = team;
    botObject.playerID = playerID;
    botObject.timeTakenToCover1Tile = 1000 / characterConfig.speed; // in milliSeconds
    botObject.plannedPath = null;
    botObject.plannedPathTimeStamp = 0;
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

    // botObject.currentAnimation = 'goto';

    // animationGroups[characterConfig.idleAnimationIndex].play(true);
    tg.animationmanager.startCharacterAnimation(botObject, 'ready');

    const outputPlaneScale = characterConfig.headerScale;
    //data reporter
    var outputplane = BABYLON.Mesh.CreatePlane("outputplane" + characterID, 25, tg.scene, false);
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

    // var markerBox = BABYLON.MeshBuilder.CreateBox(characterID + 'markerBox', {
    //     height: markerHeight * 1/scale,
    //     width: tg.worldItems.uiConfig.playerDimensionBaseUnit * 1/scale,
    //     depth: tg.worldItems.uiConfig.playerDimensionBaseUnit * 1/scale,
    // }, tg.scene, false, BABYLON.Mesh.FRONTSIDE);
    // markerBox.position.y = 0;
    // markerBox.parent = botObject.controlMesh;
    // // console.log('markerMaterial:', markerMaterial);
    // markerBox.material = markerMaterial;
    botObject.weaponType = characterConfig.weaponType;
    // projectile mesh
    if(botObject.weaponType == 'melee'){
        botObject.projectile = null;
        botObject.isProjectileActive = false;
        botObject.projectileData = null;
    } else {
        var projectile = BABYLON.MeshBuilder.CreateBox("projectile_" + characterID, {
            height: tg.worldItems.uiConfig.playerDimensionBaseUnit / 20,
            width: tg.worldItems.uiConfig.playerDimensionBaseUnit / 20,
            depth: tg.worldItems.uiConfig.playerDimensionBaseUnit / 20
        }, tg.scene);
    
        projectile.position.x = positionParam.x;
        projectile.position.y = tg.worldItems.uiConfig.hiddenY;
        projectile.position.z = positionParam.z;
        projectile.material = tg.am.material_semitransparent_projectile;
    
        botObject.projectile = projectile;
        botObject.isProjectileActive = false;
        botObject.projectileData = {
            path: null,
            endTime: 0
        };
    }
    
    
    tg.am.updateNewAssetLoaded(1);
}

