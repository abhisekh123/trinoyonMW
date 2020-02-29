/**
 * manage assets related to gameplay: 3D assets, audio, etc
 */

tg.am = {};

tg.am.onLoadCompleteActionHandler = function() {
    switch (tg.am.onLoadComplete) {
        case 'show_home_page':
            // if (tg.isGameLive == false) {
            //     tg.showHomePage();
            // }
            tg.pn.showHomePage();
            break;
    
        default:
            break;
    }
}


tg.am.loadCharacters = function (
    characterItem,
    characterConfig
) {
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
            // console.log('load character with id:' + characterItem.id);
            tg.am.processLoadedModel(newMeshes,
                particleSystems,
                skeletons,
                animationGroups, {
                    x: (characterItem.position.x + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
                    y: 0,
                    z: (characterItem.position.z + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
                },
                // 61,
                characterConfig.scale,
                characterConfig.idleAnimationIndex,
                characterItem.rotation,
                characterItem.type,
                characterItem.id,
                characterConfig.team,
                characterConfig.playerID
            );
            // engine.hideLoadingUI();
        }
    );
}


tg.am.processLoadedModel = function (
    newMeshes,
    particleSystems,
    skeletons,
    animationGroups,
    positionParam,
    scale,
    animationIndex,
    rotationParam,
    characterName,
    characterID,
    team,
    playerID
) {
    // console.log('--------->' + characterName);
    var characterConfig = tg.itemConfigs.items[characterName];
    if (characterConfig == null || characterConfig == undefined) {
        console.error('character config is empty. exiting. character name:' + characterName);
        return;
    }
    // console.log('skeleton count:::' + skeletons.length);
    // console.log('newMeshes count:' + newMeshes.length);

    for (var i = 0; i < newMeshes.length; ++i) {
        // // console.log(i + '->' + newMeshes[i].name);
        newMeshes[i].isPickable = false;
    }
    // console.log('animationGroups count:' + animationGroups.length);
    // scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);
    // var skeleton = skeletons[0];
    var parentMesh = BABYLON.MeshBuilder.CreateBox(characterID, {
        height: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        width: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        depth: tg.worldItems.uiConfig.playerDimensionBaseUnit,
    }, tg.scene, false, BABYLON.Mesh.FRONTSIDE);
    parentMesh.material = tg.material_character_parent;
    // parentMesh.material = tg.material_semitransparent_blue;
    // parentMesh.isPickable = true;
    worldItems.characterMap[characterID] = {};
    worldItems.characterMap[characterID].parentMesh = parentMesh;
    worldItems.characterMap[characterID].characterName = characterName;
    worldItems.characterMap[characterID].controlMesh = newMeshes[0];
    worldItems.characterMap[characterID].currentAnimation = characterConfig.idleAnimationIndex;
    worldItems.characterMap[characterID].animationGroups = animationGroups;
    worldItems.characterMap[characterID].defaultRotation = Math.PI;
    worldItems.characterMap[characterID].intermediatePositionArray = [];
    worldItems.characterMap[characterID].intermediatePositionArrayIndex = 0;
    worldItems.characterMap[characterID].action = 'idle';
    worldItems.characterMap[characterID].life = characterConfig.life;
    worldItems.characterMap[characterID].team = team;
    worldItems.characterMap[characterID].playerID = playerID;
    // var refreshWorldInterval = worldItems.refreshWorldInterval;
    var refreshWorldPerIntervalUI = worldItems.refreshWorldPerIntervalUI;
    for (var i = 0; i < refreshWorldPerIntervalUI; ++i) {
        worldItems.characterMap[characterID].intermediatePositionArray[i] = {
            position: {
                x: 0,
                y: 0,
                z: 0
            },
            time: 0
        }
    }
    // for (const index of characterConfig.bannedMeshes) {
    //     newMeshes[index].isVisible = false;
    // }
    if (newMeshes.length > 9) {
        newMeshes[9].isVisible = false;
    }

    newMeshes[0].scaling = new BABYLON.Vector3(scale, scale, scale);
    newMeshes[0].parent = parentMesh;

    parentMesh.position.x = positionParam.x;
    parentMesh.position.y = 0;
    parentMesh.position.z = positionParam.z;
    parentMesh.addRotation(rotationParam.rx, rotationParam.ry, rotationParam.rz);

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
    outputplane.parent = parentMesh;


    ++tg.am.totalAssetsLoaded_tillNow;
    tg.pv.refreshAssetLoadedAlert(tg.am.totalAssetsLoaded_tillNow, tg.am.totalAssetsToBeLoaded);
}








tg.am.loadStaticModel = function (
    newMeshes,
    positionParam,
    rotation,
    scale,
    itemID,
    itemType,
    team
) {
    console.log('loadStaticModel:', itemID);
    if(itemID == 'base2'){
        console.log('...');
    }
    newMeshes[0].position.x = positionParam.x;
    newMeshes[0].position.y = positionParam.y;
    newMeshes[0].position.z = positionParam.z;
    newMeshes[0].scaling = new BABYLON.Vector3(scale, scale, scale);
    newMeshes[0].addRotation(rotation.rx, rotation.ry, rotation.rz);
    // console.log('loadStaticModel');
    for (var i = 0; i < newMeshes.length; ++i) {
        // // console.log(i + '->' + newMeshes[i].name);
        newMeshes[i].isPickable = false;
    }

    var buildingTypeConfig = tg.itemConfigs.items[itemType];
    const buildingObject = {
        parentMesh: newMeshes[0],
        type: itemType,
        id: itemID,
        position: positionParam,
        life: buildingTypeConfig.life,
        isActive: true,
    };

    // mesh that remains when the building gets destroyed
    var residue = BABYLON.MeshBuilder.CreateBox("residue_" + itemID, {
        height: 2 * tg.worldItems.uiConfig.playerDimensionBaseUnit,
        width: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        depth: tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, tg.scene);

    residue.position.x = positionParam.x;
    residue.position.y = tg.worldItems.uiConfig.hiddenY;
    residue.position.z = positionParam.z;
    residue.material = tg.am.material_semitransparent_red;

    buildingObject.residue = residue;

    //data reporter
    var outputplane = BABYLON.Mesh.CreatePlane("outputplane_" + itemID, 25, tg.scene, false);
    outputplane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
    outputplane.material = new BABYLON.StandardMaterial("outputplanematerial_" + itemID, tg.scene);
    // outputplane.position = new BABYLON.Vector3(0, 0, 25);
    // outputplane.scaling.y = 0.4;

    var outputplaneTexture = new BABYLON.DynamicTexture("dynamictexture_" + itemID, 512, tg.scene, true);
    outputplane.material.diffuseTexture = outputplaneTexture;
    outputplane.material.specularColor = new BABYLON.Color3(0, 0, 0);
    outputplane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    outputplane.material.backFaceCulling = false;

    //outputplaneTexture.getContext().clearRect(0, 140, 512, 512);
    outputplaneTexture.drawText(itemID, null, 140, "bold 80px verdana", "white");

    outputplaneTexture.hasAlpha = true;
    outputplane.position.x = positionParam.x;
    outputplane.position.y = tg.worldItems.uiConfig.playerDimensionBaseUnit * 4 + newMeshes[0].position.y;
    outputplane.position.z = positionParam.z;
    // outputplane.parent = parentMesh;

    buildingObject.headerBoard = outputplane;

    tg.am.staticItems.buildings[itemID] = buildingObject;

    ++tg.am.totalAssetsLoaded_tillNow;
    tg.pv.refreshAssetLoadedAlert(tg.am.totalAssetsLoaded_tillNow, tg.am.totalAssetsToBeLoaded);

    if(tg.am.totalAssetsLoaded_tillNow >= tg.am.totalAssetsToBeLoaded){
        tg.am.onLoadCompleteActionHandler();
    }
    console.log('loadStaticModel end:', itemID);
}


tg.am.loadGLTFAssetFileForStaticMeshes = function (
        filenameParam,
        positionParam,
        rotationParam,
        scaleParam,
        itemID,
        type,
        team
    ) {
    BABYLON.SceneLoader.ImportMesh(
        '',
        'static/model/' + filenameParam + '/',
        'scene.gltf',
        tg.scene,
        (
            newMeshes,
            particleSystems,
            skeletons,
            animationGroups
        ) => {
            console.log('inner function', filenameParam);
            // this.meshes = newMeshes;
            tg.am.loadStaticModel(
                newMeshes,
                positionParam,
                rotationParam,
                scaleParam,
                itemID,
                type,
                team
            );
        }
    );
}

tg.am.loadGLTFAssetsForStaticItems = function (actionOnComplete) {
    console.log('load gltf assets for static items.');
    var staticItemCount = 0;
    tg.am.onLoadComplete = actionOnComplete;
    tg.am.staticItems.buildings = {};

    // 2 is added to account for base meshes.
    tg.am.totalAssetsToBeLoaded = 2 + tg.worldItems.defenceBottom.length + tg.worldItems.defenceTop.length;

    tg.am.totalAssetsLoaded_tillNow = 0;

    // defence team 1
    for (let index = 0; index < tg.worldItems.defenceTop.length; index++) {
        const element = tg.worldItems.defenceTop[index];
        tg.am.loadGLTFAssetFileForStaticMeshes(
            'tower_gloom',
            {
                x: (element[0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
                y: 0,
                z: (element[1] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
            },
            {
                rx: 0,
                ry: Math.PI,
                rz: 0
            },
            0.05,
            ('tower' + staticItemCount),
            'tower',
            1
        );
        ++staticItemCount;
    }

    // base team 1
    tg.am.loadGLTFAssetFileForStaticMeshes(
        // 'shinto_shrine',
        'defense_tower',
        {
            x: (tg.worldItems.topBase[0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
            y: 0,
            z: (tg.worldItems.topBase[1] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
        },
        {
            rx: 0,
            ry: Math.PI,
            rz: 0
        },
        2,
        'base1',
        'base',
        1
    );


    // defence team 2
    for (let index = 0; index < tg.worldItems.defenceBottom.length; index++) {
        const element = tg.worldItems.defenceBottom[index];
        tg.am.loadGLTFAssetFileForStaticMeshes(
            'tower_gloom', 
            {
                x: (element[0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
                y: 0,
                z: (element[1] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
            },
            {
                rx: 0,
                ry: 0,
                rz: 0
            },
            0.05,
            ('tower' + staticItemCount),
            'tower',
            2
        );
        ++staticItemCount;
    }

    // base team 2
    tg.am.loadGLTFAssetFileForStaticMeshes(
        // 'shinto_shrine',
        'defense_tower',
        {
            x: (tg.worldItems.bottomBase[0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
            y: 0,
            z: (tg.worldItems.bottomBase[1] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
        },
        {
            rx: 0,
            ry: 0,
            rz: 0
        },
        2,
        'base2',
        'base',
        2
    );    

    // load characters
    // for (let index = 0; index < worldItems.characters.length; index++) {
    //     var characterItem = worldItems.characters[index];
    //     var characterConfig = itemConfigs.items[characterItem.type];
    //     loadCharacters(
    //         characterItem,
    //         characterConfig,
    //     );
    // }
}

tg.am.createMaterials = function () {
    console.log('creating materials');

    // material for crates
    var boxMaterial = new BABYLON.StandardMaterial("material_box", tg.scene);

    boxMaterial.diffuseTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);
    boxMaterial.specularTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);
    boxMaterial.emissiveTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);
    boxMaterial.ambientTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);

    tg.am.boxMaterial = boxMaterial;
    // material for ground
    var groundMaterial = new BABYLON.StandardMaterial("material_ground", tg.scene);

    groundMaterial.diffuseTexture = new BABYLON.Texture("static/img/stone_floor6.jpg", tg.scene);
    groundMaterial.diffuseTexture.uScale = tg.worldItems.gridSide / 2;
    groundMaterial.diffuseTexture.vScale = tg.worldItems.gridSide / 2;

    tg.am.groundMaterial = groundMaterial;


    // var materialGround = new BABYLON.StandardMaterial('ground_test', tg.scene);
    // materialGround.diffuseColor = new BABYLON.Color3(90/255, 90/255, 90/255);
    // materialGround.emissiveColor = new BABYLON.Color3(90/255, 90/255, 90/255);
    // materialGround.alpha = 0.5;

    var material_semitransparent_blue = new BABYLON.StandardMaterial('material_semitransparent_blue', tg.scene);
    material_semitransparent_blue.diffuseColor = BABYLON.Color3.Blue();
    material_semitransparent_blue.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material_semitransparent_blue.backFaceCulling = false;
    material_semitransparent_blue.needDepthPrePass = true;
    material_semitransparent_blue.alpha = 0.7;

    tg.am.material_semitransparent_blue = material_semitransparent_blue;

    var material_semitransparent_red = new BABYLON.StandardMaterial('material_semitransparent_red', tg.scene);
    material_semitransparent_red.diffuseColor = BABYLON.Color3.Red();
    material_semitransparent_red.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material_semitransparent_red.backFaceCulling = false;
    material_semitransparent_red.needDepthPrePass = true;
    material_semitransparent_red.alpha = 0.5;

    tg.am.material_semitransparent_red = material_semitransparent_red;

    var material_semitransparent_chosen = new BABYLON.StandardMaterial('material_semitransparent_chosen', tg.scene);
    material_semitransparent_chosen.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.9);
    material_semitransparent_chosen.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material_semitransparent_chosen.backFaceCulling = false;
    material_semitransparent_chosen.needDepthPrePass = true;
    material_semitransparent_chosen.alpha = 0.6;

    tg.am.material_semitransparent_chosen = material_semitransparent_chosen;

    var material_transparent = new BABYLON.StandardMaterial('material_transparent', tg.scene);
    material_transparent.diffuseColor = new BABYLON.Color3(0, 0, 0);
    material_transparent.emissiveColor = new BABYLON.Color3(0, 0, 0);
    material_transparent.backFaceCulling = false;
    material_transparent.needDepthPrePass = true;
    material_transparent.alpha = 0;

    tg.am.material_transparent = material_transparent;

    // tg.material_semitransparent_blue = material_semitransparent_blue;
    // tg.material_semitransparent_red = material_semitransparent_red;
    // tg.material_semitransparent_chosen = material_semitransparent_chosen;
    // tg.material_character_parent = material_character_parent;

    console.log('complete creating materials');
}

/**
 * create the world. These are the items that are always retained/reused in each game.
 */
tg.am.addStaticItems = function () {
    // ground
    var ground = BABYLON.MeshBuilder.CreateBox("ground", {
        height: 2,
        width: tg.worldItems.gridSide * tg.worldItems.uiConfig.playerDimensionBaseUnit,
        depth: tg.worldItems.gridSide * tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, tg.scene);
    // so that all position are positive and it is easier to map 
    // ground position from ai grid position.
    ground.position.x = tg.worldItems.gridSide * tg.worldItems.uiConfig.playerDimensionBaseUnit / 2;
    ground.position.y = -1;
    ground.position.z = tg.worldItems.gridSide * tg.worldItems.uiConfig.playerDimensionBaseUnit / 2;
    ground.isPickable = true;
    ground.material = tg.am.groundMaterial;
    // ground.material = materialGround;
    tg.am.ground = ground;
    tg.camera.lockedTarget = tg.am.ground;

    tg.am.staticItems = {};
    tg.am.staticItems.boxes = [];
    for (var i = 0; i < tg.worldItems.obstacles.length; ++i) {
        var box = BABYLON.MeshBuilder.CreateBox("mesh_box" + i, {
            height: tg.worldItems.uiConfig.playerDimensionBaseUnit,
            width: tg.worldItems.uiConfig.playerDimensionBaseUnit,
            depth: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        }, tg.scene, false, BABYLON.Mesh.FRONTSIDE);
        box.position.x = (tg.worldItems.obstacles[i][0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit;
        box.position.y = tg.worldItems.uiConfig.playerDimensionBaseUnit / 2;
        box.position.z = (tg.worldItems.obstacles[i][1] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit;
        box.isPickable = false;
        box.material = tg.am.boxMaterial;
        // box.material = groundMaterial;
        tg.am.staticItems.boxes.push(box);
    }

    tg.am.markerMeshes = {};
    // selected box
    var selectedMarker = BABYLON.MeshBuilder.CreateBox('mesh_selectedMarker', {
        height: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        width: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        depth: tg.worldItems.uiConfig.playerDimensionBaseUnit,
    }, tg.scene, false, BABYLON.Mesh.FRONTSIDE);
    // selectedMarker.position.x = (10 + 0.5) * worldItems.playerDimensionBaseUnit;
    // selectedMarker.position.y = worldItems.playerDimensionBaseUnit / 2;
    // selectedMarker.position.z = (10 + 0.5) * worldItems.playerDimensionBaseUnit;
    selectedMarker.position.x = 0;
    selectedMarker.position.y = tg.worldItems.uiConfig.hiddenY;
    selectedMarker.position.z = 0;

    selectedMarker.isPickable = false;
    selectedMarker.material = tg.am.material_semitransparent_chosen;

    tg.am.markerMeshes.selectedMarker = selectedMarker;

    // target box
    var targetMarker = BABYLON.MeshBuilder.CreateBox('targetMarker', {
        height: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        width: tg.worldItems.uiConfig.playerDimensionBaseUnit / 2,
        depth: tg.worldItems.uiConfig.playerDimensionBaseUnit / 2,
    }, tg.scene, false, BABYLON.Mesh.FRONTSIDE);
    targetMarker.position.x = 0;
    targetMarker.position.y = tg.worldItems.uiConfig.hiddenY;
    targetMarker.position.z = 0;
    targetMarker.isPickable = false;
    targetMarker.material = tg.am.material_semitransparent_blue;

    tg.am.targetMarker = targetMarker;
}

tg.am.init = function(){
    tg.am.createMaterials();
    tg.am.addStaticItems();
    tg.am.loadGLTFAssetsForStaticItems('show_home_page');
}