
tg.bot = {};


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
    teamId
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
            // animationIndexParam
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
                // characterConfig.scale,
                // characterConfig.idleAnimationIndex,
                // botConfig.rotation,
                // botConfig.type,
                // botConfig.id,
                botConfig,
                teamId,
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
    // scale,
    // animationIndex,
    // rotationParam,
    // characterName,
    // characterID,
    botConfig,
    team,
    playerID
) {
    console.log('start tg.bot.processLoadedModel');
    const rotationParam = botConfig.rotation;
    const characterName = botConfig.type;
    const characterID = botConfig.id;
    
    // console.log('--------->' + characterName);
    var characterConfig = tg.itemConfigs.items[characterName];
    if (characterConfig == null || characterConfig == undefined) {
        console.error('character config is empty. exiting. character name:' + characterName);
        return;
    }

    const scale = characterConfig.scale;
    const animationIndex = characterConfig.idleAnimationIndex;


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

    // botObject.parentMesh = parentMesh;
    botObject.characterName = characterName;
    botObject.controlMesh = newMeshes[0];
    botObject.currentAnimation = characterConfig.idleAnimationIndex;
    botObject.animationGroups = animationGroups;
    botObject.defaultRotation = Math.PI;
    botObject.intermediatePositionArray = [];
    botObject.intermediatePositionArrayIndex = 0;
    botObject.action = 'idle';
    botObject.life = characterConfig.life;
    botObject.team = team;
    botObject.playerID = playerID;
    // var refreshWorldInterval = worldItems.refreshWorldInterval;
    var refreshWorldPerIntervalUI = worldItems.refreshWorldPerIntervalUI;
    for (var i = 0; i < refreshWorldPerIntervalUI; ++i) {
        botObject.intermediatePositionArray[i] = {
            position: {
                x: 0,
                y: 0,
                z: 0
            },
            time: 0
        }
    }

    tg.am.dynamicItems.bots[characterID] = botObject;

    // for (const index of characterConfig.bannedMeshes) {
    //     newMeshes[index].isVisible = false;
    // }
    if (newMeshes.length > 9) {
        newMeshes[9].isVisible = false;
    }

    newMeshes[0].scaling = new BABYLON.Vector3(scale, scale, scale);
    // newMeshes[0].parent = parentMesh;

    botObject.controlMesh.position.x = positionParam.x;
    botObject.controlMesh.position.y = 0;
    botObject.controlMesh.position.z = positionParam.z;
    botObject.controlMesh.addRotation(0, rotationParam, 0);
    // parentMesh.position.x = positionParam.x;
    // parentMesh.position.y = 0;
    // parentMesh.position.z = positionParam.z;
    // parentMesh.addRotation(rotationParam.rx, rotationParam.ry, rotationParam.rz);

    animationGroups[characterConfig.idleAnimationIndex].play(true);
    // animationGroups[animationIndex].play(true);
    // // console.log('skeleton.animations:', skeleton.animations);

    //data reporter
    var outputplane = BABYLON.Mesh.CreatePlane("outputplane" + characterID, 25, tg.scene, false);
    outputplane.isPickable = false;
    outputplane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
    outputplane.material = new BABYLON.StandardMaterial("outputplane" + characterID, tg.scene);
    // outputplane.position = new BABYLON.Vector3(0, 0, 25);
    // outputplane.scaling.y = 0.4;

    var outputplaneTexture = new BABYLON.DynamicTexture("dynamictexture" + characterID, 512, tg.scene, true);
    outputplane.material.diffuseTexture = outputplaneTexture;
    outputplane.material.specularColor = new BABYLON.Color3(0, 0, 0);
    outputplane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    outputplane.material.backFaceCulling = false;

    //outputplaneTexture.getContext().clearRect(0, 140, 512, 512);
    outputplaneTexture.drawText(characterID, null, 140, "bold 80px verdana", "white");

    outputplaneTexture.hasAlpha = true;
    outputplane.position.y = tg.worldItems.uiConfig.playerDimensionBaseUnit * 1.2;
    outputplane.parent = botObject.controlMesh;

    botObject.outputplane = outputplane;

    tg.am.updateNewAssetLoaded(1);
}

