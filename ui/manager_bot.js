
tg.bot = {};
tg.bot.selfOwnedBots = null;

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
            tg.bot.selfOwnedBots = playerBotArray;
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
    // const animationIndex = characterConfig.idleAnimationIndex;


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
    botObject.characterName = characterName;
    botObject.controlMesh = newMeshes[0];
    // botObject.currentAnimation = characterConfig.idleAnimationIndex;
    botObject.animationGroups = animationGroups;
    botObject.defaultRotation = Math.PI;
    botObject.intermediatePositionArray = [];
    botObject.intermediatePositionArrayIndex = 0;
    botObject.animationAction = 'goto'; // initialise action.
    botObject.animations = characterConfig.animations;
    botObject.life = characterConfig.life;
    botObject.fullLife = characterConfig.life;
    botObject.team = team;
    botObject.playerID = playerID;

    var hpBarConfig = tg.ui3d.gethpbar(characterID);
    botObject.hpBarConfig = hpBarConfig;
    // botObject.controlMesh.scaling = new BABYLON.Vector3(1/scale, 1/scale, 1/scale);
    hpBarConfig.healthBarContainer.parent = botObject.controlMesh;
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

    //outputplaneTexture.getContext().clearRect(0, 140, 512, 512);
    outputplaneTexture.drawText(characterID, null, 140, "bold 80px verdana", "white");

    outputplaneTexture.hasAlpha = true;
    // outputplane.position.y = tg.worldItems.uiConfig.playerDimensionBaseUnit * 1.2;
    outputplane.parent = botObject.controlMesh;

    botObject.outputplane = outputplane;



    tg.am.updateNewAssetLoaded(1);
}


// https://www.babylonjs-playground.com/#KTGKUQ#7
// Start all animations on given targets
// @param - loop defines if animations must loop
// @param - speedRatio defines the ratio to apply to animation speed (1 by default)
// @param - from defines the from key (optional)
// @param - to defines the to key (optional)
// @param - isAdditive defines the additive state for the resulting animatables (optional)
// @returns - the current animation group
// alert(animationGroups.length); // 8 
// animationGroups.forEach(function (animationGroup) {
//     animationGroup.start(false, 1, 131 / 30, 160 / 30);
// });
// alert(animationGroups[0].from); 0
// alert(animationGroups[0].to); 6.9
// alert(animationGroups[0].speedRatio);
// animationGroups[0].start(true,10,5,6,false);
// scene.createDefaultCameraOrLight(true, true, true);
// scene.createDefaultEnvironment();
// currentScene.animationGroups[0].start(true,1,5,6);
// currentScene.animationGroups[0].stop()
// currentScene.animationGroups[0].reset()