



tg.bm.loadCharacters = function (
    characterItem,
    characterConfig
){
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
            processLoadedModel(newMeshes,
                particleSystems,
                skeletons,
                animationGroups, 
                {
                    x: (characterItem.position.x + 0.5) * worldItems.playerDimensionBaseUnit,
                    y: 0,
                    z: (characterItem.position.z + 0.5) * worldItems.playerDimensionBaseUnit,
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


tg.bm.processLoadedModel = function(
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
    var characterConfig = itemConfigs.items[characterName];
    if(characterConfig == null || characterConfig == undefined){
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
        height: tg.playerDimensionBaseUnit,
        width: tg.playerDimensionBaseUnit,
        depth: tg.playerDimensionBaseUnit,
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
    for(var i = 0; i < refreshWorldPerIntervalUI; ++i){
        worldItems.characterMap[characterID].intermediatePositionArray[i] = {
            position:{
                x:0,
                y:0,
                z:0
            },
            time:0
        }
    }
    // for (const index of characterConfig.bannedMeshes) {
    //     newMeshes[index].isVisible = false;
    // }
    if(newMeshes.length > 9){
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
    outputplane.position.y = tg.playerDimensionBaseUnit * 1.2;
    outputplane.parent = parentMesh;


    ++tg.totalAssetsLoaded_tillNow;
    tg.refreshAssetLoadedAlert(tg.totalAssetsLoaded_tillNow, tg.totalAssetsToBeLoaded);
}

tg.bm.loadGLTFAssetFile = function(filenameParam, positionParam, rotationParam, scaleParam, itemID, type) {
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
          // console.log('inner function');
          this.meshes = newMeshes;
          loadStaticModel(
            newMeshes,
            particleSystems,
            skeletons,
            animationGroups,
            positionParam, rotationParam, scaleParam, itemID, type
          );
        }
      );
}

tg.bm.loadStaticModel = function(
    newMeshes,
    particleSystems,
    skeletons,
    animationGroups,
    positionParam,
    rotation,
    scale,
    itemID,
    itemType
  ) {
    console.log('loadStaticModel');
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

    var buildingConfig = itemConfigs.items[itemType];

    worldItems.staticObjectMap[itemID] = {};
    worldItems.staticObjectMap[itemID].parentMesh = newMeshes[0];
    worldItems.staticObjectMap[itemID].type = itemType;
    // worldItems.staticObjectMap[itemID].id = itemID;
    worldItems.staticObjectMap[itemID].controlMesh = newMeshes[0];
    worldItems.staticObjectMap[itemID].position = positionParam;
    worldItems.staticObjectMap[itemID].life = buildingConfig.life;
    worldItems.staticObjectMap[itemID].isActive = true;

    var residue = BABYLON.MeshBuilder.CreateBox("residue" + itemID, {
        height: 2 * tg.playerDimensionBaseUnit,  
        width: tg.playerDimensionBaseUnit,
        depth: tg.playerDimensionBaseUnit
    }, tg.scene);

    residue.position.x = positionParam.x;
    residue.position.y = -2 * tg.playerDimensionBaseUnit;
    residue.position.z = positionParam.z;
    residue.material = tg.material_semitransparent_red;

    worldItems.staticObjectMap[itemID].residue = residue;

    //data reporter
	var outputplane = BABYLON.Mesh.CreatePlane("outputplane" + itemID, 25, tg.scene, false);
	outputplane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
	outputplane.material = new BABYLON.StandardMaterial("outputplanematerial" + itemID, tg.scene);
	// outputplane.position = new BABYLON.Vector3(0, 0, 25);
	// outputplane.scaling.y = 0.4;

	var outputplaneTexture = new BABYLON.DynamicTexture("dynamictexture" + itemID, 512, tg.scene, true);
	outputplane.material.diffuseTexture = outputplaneTexture;
	outputplane.material.specularColor = new BABYLON.Color3(0, 0, 0);
	outputplane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
	outputplane.material.backFaceCulling = false;

    //outputplaneTexture.getContext().clearRect(0, 140, 512, 512);
	outputplaneTexture.drawText(itemID, null, 140, "bold 80px verdana", "white");

    outputplaneTexture.hasAlpha = true;
    outputplane.position.x = newMeshes[0].position.x;
    outputplane.position.y = tg.playerDimensionBaseUnit * 4 + newMeshes[0].position.y;
    outputplane.position.z = newMeshes[0].position.z;
    // outputplane.parent = parentMesh;

    ++tg.totalAssetsLoaded_tillNow;
    tg.refreshAssetLoadedAlert(tg.totalAssetsLoaded_tillNow, tg.totalAssetsToBeLoaded);
}


tg.bm.refreshAssetLoadedAlert = function(assetsAlreadyLoaded, totalAssetsToBeLoaded){
    if(assetsAlreadyLoaded >= totalAssetsToBeLoaded){
        // tg.advancedTexture.dispose();
        tg.advancedTexture_text.text = "";
        if(tg.isGameLive == false){
            tg.showHomePage();
        }
    }else{
        tg.advancedTexture_text.text = "Loading assets... \n " 
            + Math.round((assetsAlreadyLoaded / totalAssetsToBeLoaded) * 100) 
            + "% loaded.";
    }
}

function addStaticItems(){
    var boxMaterial = new BABYLON.StandardMaterial("box", tg.scene);

    boxMaterial.diffuseTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);
    boxMaterial.specularTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);
    boxMaterial.emissiveTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);
    boxMaterial.ambientTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);

    var groundMaterial = new BABYLON.StandardMaterial("box", tg.scene);

    groundMaterial.diffuseTexture = new BABYLON.Texture("static/img/stone_floor6.jpg", tg.scene);

    groundMaterial.diffuseTexture.uScale = worldItems.gridSide / 2;
	groundMaterial.diffuseTexture.vScale = worldItems.gridSide / 2;

    var materialGround = new BABYLON.StandardMaterial('ground_test', tg.scene);
    materialGround.diffuseColor = new BABYLON.Color3(90/255, 90/255, 90/255);
    materialGround.emissiveColor = new BABYLON.Color3(90/255, 90/255, 90/255);
    // materialGround.alpha = 0.5;

    // ground
    var ground = BABYLON.MeshBuilder.CreateBox("ground", {
        height: 2,  
        width: worldItems.gridSide * tg.playerDimensionBaseUnit,
        depth: worldItems.gridSide * tg.playerDimensionBaseUnit
    }, tg.scene);
    ground.position.x = worldItems.gridSide * worldItems.playerDimensionBaseUnit / 2;
    ground.position.y = -1;
    ground.position.z = worldItems.gridSide * worldItems.playerDimensionBaseUnit / 2;
    ground.isPickable = true;
    ground.material = groundMaterial;
    // ground.material = materialGround;
    tg.ground = ground;
    tg.camera.lockedTarget = tg.ground;

    for(var i = 0; i < worldItems.obstacles.length; ++i){
        var box = BABYLON.MeshBuilder.CreateBox("box" + i, {
            height: tg.playerDimensionBaseUnit,
            width: tg.playerDimensionBaseUnit,
            depth: tg.playerDimensionBaseUnit,
        }, tg.scene, false, BABYLON.Mesh.FRONTSIDE);
        box.position.x = (worldItems.obstacles[i][0] + 0.5) * worldItems.playerDimensionBaseUnit;
        box.position.y = worldItems.playerDimensionBaseUnit / 2;
        box.position.z = (worldItems.obstacles[i][1] + 0.5) * worldItems.playerDimensionBaseUnit;
        box.isPickable = false;
        box.material = boxMaterial;
        // box.material = groundMaterial;
    }

    // selected box
    var selectedMarker = BABYLON.MeshBuilder.CreateBox('selectedMarker', {
        height: tg.playerDimensionBaseUnit,
        width: tg.playerDimensionBaseUnit,
        depth: tg.playerDimensionBaseUnit,
    }, tg.scene, false, BABYLON.Mesh.FRONTSIDE);
    // selectedMarker.position.x = (10 + 0.5) * worldItems.playerDimensionBaseUnit;
    // selectedMarker.position.y = worldItems.playerDimensionBaseUnit / 2;
    // selectedMarker.position.z = (10 + 0.5) * worldItems.playerDimensionBaseUnit;
    selectedMarker.position.x = 0;
    selectedMarker.position.y = 0;
    selectedMarker.position.z = 0;
    
    selectedMarker.isPickable = false;
    selectedMarker.material = tg.material_semitransparent_chosen;

    tg.selectedMarker = selectedMarker;

    // target box
    var targetMarker = BABYLON.MeshBuilder.CreateBox('targetMarker', {
        height: tg.playerDimensionBaseUnit,
        width: tg.playerDimensionBaseUnit / 2,
        depth: tg.playerDimensionBaseUnit / 2,
    }, tg.scene, false, BABYLON.Mesh.FRONTSIDE);
    targetMarker.position.x = (20 + 0.5) * worldItems.playerDimensionBaseUnit;
    targetMarker.position.y = worldItems.playerDimensionBaseUnit / 2;
    targetMarker.position.z = (20 + 0.5) * worldItems.playerDimensionBaseUnit;
    targetMarker.isPickable = false;
    targetMarker.material = tg.material_semitransparent_blue;
    tg.targetMarker = targetMarker;

    loadGLTFAssets();
}

function loadGLTFAssets() {
    console.log('load gltf assets');
    var staticItemCount = 0;
    // tg.totalAssetsToBeLoaded = 2 + worldItems.defenceBottom.length 
    //     + worldItems.defenceTop.length + worldItems.characters.length;
    tg.totalAssetsToBeLoaded = 2 + worldItems.defenceBottom.length 
        + worldItems.defenceTop.length;

    tg.totalAssetsLoaded_tillNow = 0;
    
    loadGLTFAssetFile(
        // 'shinto_shrine',
        'defense_tower',
        {
            x: (worldItems.topBase[0] + 0.5) * worldItems.playerDimensionBaseUnit,
            y: 0,
            z: (worldItems.topBase[1] + 0.5) * worldItems.playerDimensionBaseUnit,
        }, {rx: 0, ry: Math.PI, rz: 0}, 2, 'base1', 'base'
    );
    loadGLTFAssetFile(
        // 'shinto_shrine',
        'defense_tower',
        {
            x: (worldItems.bottomBase[0] + 0.5) * worldItems.playerDimensionBaseUnit,
            y: 0,
            z: (worldItems.bottomBase[1] + 0.5) * worldItems.playerDimensionBaseUnit,
        }, {rx: 0, ry: 0, rz: 0}, 2, 'base2', 'base'
    );

    for (let index = 0; index < worldItems.defenceBottom.length; index++) {
        const element = worldItems.defenceBottom[index];
        loadGLTFAssetFile(
            'tower_gloom',
            {
                x: (element[0] + 0.5) * worldItems.playerDimensionBaseUnit,
                y: 0,
                z: (element[1] + 0.5) * worldItems.playerDimensionBaseUnit,
            }, {rx: 0, ry: Math.PI, rz: 0}, 0.05, ('tower' + staticItemCount), 'tower'
        );
        ++staticItemCount;
    }
    for (let index = 0; index < worldItems.defenceTop.length; index++) {
        const element = worldItems.defenceTop[index];
        loadGLTFAssetFile(
            'tower_gloom',
            {
                x: (element[0] + 0.5) * worldItems.playerDimensionBaseUnit,
                y: 0,
                z: (element[1] + 0.5) * worldItems.playerDimensionBaseUnit,
            }, {rx: 0, ry: Math.PI, rz: 0}, 0.05, ('tower' + staticItemCount), 'tower'
        );
        ++staticItemCount;
    }

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



