
tg.spriteRotation = 0.001;
tg.spriteDistance = tg.playerDimensionBaseUnit * 3;
tg.spritePositionY = tg.playerDimensionBaseUnit;
tg.spriteRestPositionY = -tg.playerDimensionBaseUnit * 3;
tg.spriteObjects = [];
tg.currentSelectedSprite = 0;
tg.spriteRotationUnit = 0.05;
tg.spriteMoveUnit = tg.playerDimensionBaseUnit / 40;
tg.spriteCount = 0;
tg.meshNameToIDMap = {};
tg.characterConfig = [];
tg.UIConfig = {};
tg.currentTime = Date.now();
tg.totalAssetsToBeLoaded = 0;
tg.totalAssetsLoaded_tillNow = 0;

function createWorld() {
    tg.updateWorld = updateWorld;
}

function updateWorld(jsonParam) {
    
    if(!tg.isGameLive){
        // console.log('updating world', jsonParam);
        // console.log('!tg.isGameLive. skipping.');
        return;
    }

    var refreshWorldInterval = worldItems.refreshWorldInterval;
    var refreshWorldPerIntervalUI = worldItems.refreshWorldPerIntervalUI;
    var animationPlayFlag = true;
    for (var meshID in jsonParam.payload) {
        if (meshID == null || meshID == undefined || jsonParam.payload[meshID] == undefined) {
            continue;
        }
        // search meshID from characterMap
        var meshConfig = worldItems.characterMap[meshID];
        if(meshConfig == null || meshConfig == undefined){// if not found
            // search meshID from staticObjectMap
            meshConfig = worldItems.staticObjectMap[meshID];
        }
        if(meshConfig == null || meshConfig == undefined){// if still not found.
            console.log('error. skipping update mesh with ID:', meshID);
            continue;
        }

        // // console.log('meshID:' + meshID);
        var update = jsonParam.payload[meshID];
        var parentMesh = meshConfig.parentMesh;
        var posX = (update.x + 0.5) * tg.playerDimensionBaseUnit;
        var posZ = (update.z + 0.5) * tg.playerDimensionBaseUnit;
        var rot = update.rot;
        if(rot == null || rot == undefined){
            rot = 0;
        }
        if(meshConfig.defaultRotation == null || meshConfig.defaultRotation == undefined){
            meshConfig.defaultRotation = 0;
        }
        switch(update.action){
            case'goto':
                var deltaX = posX - parentMesh.position.x;
                var deltaZ = posZ - parentMesh.position.z;
                for(var i = 0; i < refreshWorldPerIntervalUI; ++i){
                    var fraction = (i + 1) / refreshWorldPerIntervalUI;
                    meshConfig.intermediatePositionArray[i].position.x = parentMesh.position.x + (fraction * deltaX);
                    meshConfig.intermediatePositionArray[i].position.z = parentMesh.position.z + (fraction * deltaZ);
                    meshConfig.intermediatePositionArray[i].time = tg.currentTime + (fraction * refreshWorldInterval);
                }
                parentMesh.rotation.y = rot + meshConfig.defaultRotation;
                meshConfig.intermediatePositionArrayIndex = 0;
                animationPlayFlag = true;
                break;
            case 'idle':
                // console.log('IDLE:set position for character:' + meshID + ' at time:' + tg.currentTime);
                // console.log('x:' + posX + ' z:' + posZ);
                parentMesh.position.x = posX; // - tg.worldCenterX;
                parentMesh.position.z = posZ; // - tg.worldCenterZ;
                parentMesh.rotation.y = rot + meshConfig.defaultRotation;
                animationPlayFlag = true;
                break;
            case 'attack':
                // // console.log('set position for character:' + meshID + ' at time:' + tg.currentTime);
                // console.log('#$@[' + meshID + ']x:' + posX + ' z:' + posZ + '=@', tg.currentTime);
                parentMesh.position.x = posX; // - tg.worldCenterX;
                parentMesh.position.z = posZ; // - tg.worldCenterZ;
                parentMesh.rotation.y = rot + meshConfig.defaultRotation;
                animationPlayFlag = true;
                break;
            case 'die':
                // // console.log('dead item:', meshConfig);
                animationPlayFlag = false;
                break;
            case 'spawn':
                // console.log('^^^[' + meshID + ']x:' + posX + ' z:' + posZ + '=@', tg.currentTime);
                parentMesh.position.x = posX; // - tg.worldCenterX;
                parentMesh.position.z = posZ; // - tg.worldCenterZ;
                parentMesh.rotation.y = rot + meshConfig.defaultRotation;
                animationPlayFlag = false;
                break;
            case 'over':
                if(update.loosingTeam == tg.teamID){
                    alert('You won!');
                }else{
                    alert('Your team was defeated');
                }
                alert('==========game over. loosing team is:' + update.loosingTeam);
                location.reload();
            default:
                console.log('ERROR:Unknown action:' + meshID + ' for character:' + meshConfig.id);
        }
        

        tg.startCharacterAnimation(meshConfig, jsonParam.payload[meshID].action, animationPlayFlag);
    }
};

tg.startCharacterAnimation = function(characterConfig, currentAction, animationPlayFlag){
    if(animationPlayFlag == null || animationPlayFlag == undefined){
        animationPlayFlag = true;
    }
    var isCharacter = true;
    // var characterConfig = tg.characterConfig[id];
    var characterTypeConfig = itemConfigs.characters[characterConfig.characterName];
    if(characterTypeConfig == null ||characterConfig == undefined){
        isCharacter = false;
    }
    switch(currentAction){
        case'goto':
            if(!isCharacter){
                break;
            }
            characterConfig.action = 'goto';
            if(characterConfig.currentAnimation != characterTypeConfig.runAnimationIndex){
                characterConfig.animationGroups[characterConfig.currentAnimation].reset();
                characterConfig.animationGroups[characterConfig.currentAnimation].stop();
                characterConfig.animationGroups[characterTypeConfig.runAnimationIndex].play(animationPlayFlag);
                characterConfig.currentAnimation = characterTypeConfig.runAnimationIndex;
            }
            break;
        case 'idle':
            if(!isCharacter){
                break;
            }
            characterConfig.action = 'idle';
            if(characterConfig.currentAnimation != characterTypeConfig.idleAnimationIndex){
                characterConfig.animationGroups[characterConfig.currentAnimation].reset();
                characterConfig.animationGroups[characterConfig.currentAnimation].stop();
                characterConfig.animationGroups[characterTypeConfig.idleAnimationIndex].play(animationPlayFlag);
                characterConfig.currentAnimation = characterTypeConfig.idleAnimationIndex;
            }
            break;
        case 'attack':
            if(!isCharacter){
                break;
            }
            characterConfig.action = 'attack';
            if(characterConfig.currentAnimation != characterTypeConfig.attackAnimationIndex){
                characterConfig.animationGroups[characterConfig.currentAnimation].reset();
                characterConfig.animationGroups[characterConfig.currentAnimation].stop();
                characterConfig.animationGroups[characterTypeConfig.attackAnimationIndex].play(animationPlayFlag);
                characterConfig.currentAnimation = characterTypeConfig.attackAnimationIndex;
            }
            break;
        case 'die':
            if(!isCharacter){
                // break;
                // characterConfig.residue.position.x = positionParam.x;
                characterConfig.residue.position.y = tg.playerDimensionBaseUnit;
                // characterConfig.residue.position.z = positionParam.z;
            }else{
                if(characterConfig.currentAnimation != characterTypeConfig.dieAnimationIndex){
                    characterConfig.animationGroups[characterConfig.currentAnimation].reset();
                    characterConfig.animationGroups[characterConfig.currentAnimation].stop();
                    characterConfig.animationGroups[characterTypeConfig.dieAnimationIndex].play(animationPlayFlag);
                    characterConfig.currentAnimation = characterTypeConfig.dieAnimationIndex;
                }
            }
            characterConfig.action = 'die';
            
            tg.hideMeshFromVisiblePlane(characterConfig.parentMesh);
            break;
        case 'spawn':
            if(!isCharacter){
                break;
            }
            characterConfig.action = 'spawn';
            if(characterConfig.currentAnimation != characterTypeConfig.idleAnimationIndex){
                characterConfig.animationGroups[characterConfig.currentAnimation].reset();
                characterConfig.animationGroups[characterConfig.currentAnimation].stop();
                characterConfig.animationGroups[characterTypeConfig.idleAnimationIndex].play(animationPlayFlag);
                characterConfig.currentAnimation = characterTypeConfig.idleAnimationIndex;
            }
            tg.showMeshToVisiblePlane(characterConfig.parentMesh);
            break;
        default:
            // console.log('ERROR:Unknown action:' + currentAction + ' for character:' + characterConfig.id);
    }
    // characterConfig.animation = animationName;
    // characterConfig.isAnimated = true;
    // characterConfig.animStartTime = Date.now();
    // characterConfig.gridCoordinate = tg.getGridCoordinateFromPointerPosition(characterConfig.mesh.position);
};

tg.hideMeshFromVisiblePlane = function(meshParam){
    meshParam.position.y = tg.selectedObjectPointerMeshPositionY_HIDE;
    setTimeout(function(){ 
        meshParam.position.y = tg.selectedObjectPointerMeshPositionY_HIDE;
        }, 
    tg.timeoutForGotoPointerDisappear);
}


tg.showMeshToVisiblePlane = function(meshParam, position){
    meshParam.position.y = tg.selectedObjectPointerMeshPositionY;
    // setTimeout(function(){ 
    //     meshParam.position.x = tg.selectedObjectPointerMeshPositionY_HIDE;
    //     meshParam.position.y = tg.selectedObjectPointerMeshPositionY_HIDE;
    //     meshParam.position.z = tg.selectedObjectPointerMeshPositionY_HIDE;
    //     }, 
    // tg.timeoutForGotoPointerDisappear);
}

tg.updateCharacterStateBeforeRender = function () {
    tg.currentTime = Date.now();
    // var refreshWorldInterval = worldItems.refreshWorldInterval;
    var refreshWorldPerIntervalUI = worldItems.refreshWorldPerIntervalUI;
    for (var characterID in worldItems.characterMap) {
        if(characterID == 'refference' || characterID == 'ground'){
            continue;
        }
        // check if the property/key is defined in the object itself, not in parent
        if (worldItems.characterMap.hasOwnProperty(characterID)) {           
            // // console.log(key, dictionary[key]);
            var characterConfig = worldItems.characterMap[characterID];
            var parentMesh = characterConfig.parentMesh;
            switch(characterConfig.action){
                case'goto':
                    for(var i = characterConfig.intermediatePositionArrayIndex; i < refreshWorldPerIntervalUI; ++i){
                        if(tg.currentTime < characterConfig.intermediatePositionArray[i].time){
                            // no need to proceed further.
                            break;
                        }else{
                            if((i + 1) == refreshWorldPerIntervalUI){
                                // processed all movement steps. updating action.
                                characterConfig.action = 'idle';
                            }
                        }
                        // // console.log('set position for character:' + characterID + ' at time:' + tg.currentTime);
                        // // console.log(characterConfig.intermediatePositionArray[i].position);
                        parentMesh.position.x = characterConfig.intermediatePositionArray[i].position.x; // - tg.worldCenterX;
                        parentMesh.position.z = characterConfig.intermediatePositionArray[i].position.z; // - tg.worldCenterZ;
                        // so that in next refresh cycle, calculation starts here.
                        characterConfig.intermediatePositionArrayIndex = i; 
                    }
                    break;
                case 'idle':
                case 'die':
                case 'attack':
                case 'spawn':
                    break;
                default:
                    // console.log('ERROR:Unknown action:' + characterConfig.action + ' for character:' + characterConfig.id);
            }
        }
    }

};

function createAmbience() {
    tg.worldCenterX = (worldItems.gridSide) * worldItems.playerDimensionBaseUnit / 2;
    tg.worldCenterZ = (worldItems.gridSide) * worldItems.playerDimensionBaseUnit / 2;
 
    var light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), tg.scene);
	light.diffuse = new BABYLON.Color3(1, 1, 1);
	light.specular = new BABYLON.Color3(1, 1, 1);
    light.groundColor = new BABYLON.Color3(1, 1, 1);

    tg.light2 = light;
    
    addStaticItems();

    tg.camera.target = tg.ground.position;

    // init GUI
    tg.UIConfig.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var playButton = BABYLON.GUI.Button.CreateSimpleButton("but1", "Play");
    playButton.width = "150px"
    playButton.height = "40px";
    playButton.color = "white";
    playButton.cornerRadius = 20;
    playButton.background = "green";

    playButton.onPointerUpObservable.add(function() {
        console.log('click play button.');
        sendMessageToWS(getEmptyMessagePacket('request_game_admit'));
    });
    tg.UIConfig.playButton = playButton;

    var exitGameButton = BABYLON.GUI.Button.CreateSimpleButton("but1", "Exit");
    exitGameButton.width = "150px";
    exitGameButton.height = "40px";
    exitGameButton.color = "white";
    exitGameButton.cornerRadius = 20;
    exitGameButton.background = "green";
    exitGameButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    exitGameButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    exitGameButton.onPointerUpObservable.add(function() {
        // tg.UIConfig.advancedTexture.removeControl(tg.UIConfig.exitGameButton);
        // showHomePage();
        sendMessageToWS(getEmptyMessagePacket('request_game_exit'));
    });
    tg.UIConfig.exitGameButton = exitGameButton;

    tg.showHomePage = showHomePage;
    tg.startGamePlay = startGamePlay;
    tg.showLandingPage = showLandingPage;
    tg.refreshAssetLoadedAlert = refreshAssetLoadedAlert;
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
    // console.log('load gltf assets');
    var staticItemCount = 0;
    tg.totalAssetsToBeLoaded = 2 + worldItems.defenceBottom.length 
        + worldItems.defenceTop.length + worldItems.characters.length;
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
    for (let index = 0; index < worldItems.characters.length; index++) {
        var characterItem = worldItems.characters[index];
        var characterConfig = itemConfigs.characters[characterItem.type];
        loadCharacters(
            characterItem,
            characterConfig,
        );
    }
}

function loadCharacters(
    characterItem,
    characterConfig
){
    BABYLON.SceneLoader.ImportMesh(
        '',
        'static/model/' + characterConfig.model + '/',
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


function processLoadedModel (
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
    var characterConfig = itemConfigs.characters[characterName];
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

function loadGLTFAssetFile(filenameParam, positionParam, rotationParam, scaleParam, itemID, type) {
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

function loadStaticModel(
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

    var buildingConfig = itemConfigs.buildings[itemType];

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


function showLandingPage(){
    var originalContent = "Loading assets... \n 0% loaded.";
    var text1 = new BABYLON.GUI.TextBlock();
    text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
    text1.textWrapping = true;
    text1.text = originalContent;
    text1.color = "white";
    text1.fontSize = 24;
    text1.width = "30%";
    tg.advancedTexture.addControl(text1);
    tg.advancedTexture_text = text1;
}
function refreshAssetLoadedAlert(assetsAlreadyLoaded, totalAssetsToBeLoaded){
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

// display home page.
function showHomePage(){
    // console.log('showHomePage');
    tg.UIConfig.advancedTexture.addControl(tg.UIConfig.playButton);  
}

// display gameplay page.
function startGamePlay(gameJSON){
    tg.UIConfig.advancedTexture.addControl(tg.UIConfig.exitGameButton); 
    var playerConfig = gameJSON.playerConfig;
    tg.playerID = playerConfig.playerID;
    tg.teamID = playerConfig.teamID;
    tg.isGameLive = true;

    // console.log('startGamePlay:', gameJSON);
    let characters = gameJSON.bots;
    for (let i = 0; i < characters.length; ++i) {
        var characterID = characters[i].id;
        var characterConfig = worldItems.characterMap[characterID];
        var parentMesh = characterConfig.parentMesh;
        // var posX = (characters[i].x + 0.5) * tg.playerDimensionBaseUnit;
        // var posZ = (characters[i].z + 0.5) * tg.playerDimensionBaseUnit;
        parentMesh.position.x = (characters[i].x + 0.5) * tg.playerDimensionBaseUnit;
        // parentMesh.position.y = characters[i].payload.position.y;
        parentMesh.position.z = (characters[i].z + 0.5) * tg.playerDimensionBaseUnit;
        if(characters[i].ry == null || characters[i].ry == undefined){
            characters[i].ry = 0;
        }
        parentMesh.rotation.x = 0;
        parentMesh.rotation.y = characters[i].ry;

        if(characters[i].playerID == tg.playerID && characters[i].isLeader){
            tg.camera.lockedTarget = parentMesh;
        }
        characterConfig.life = characters[i].life;
        characterConfig.isActive = characters[i].isActive;
        tg.startCharacterAnimation(characterConfig, characters[i].action, false);
    }
    // // console.log(gameJSON.objects);
    let objects = gameJSON.objects;
    for (let i = 0; i < objects.length; ++i) {
        var objectID = objects[i].id;
        // life
        // is active
        // var buildingTypeConfig = itemConfigs.buildings[itemType];
        var buildingConfig = worldItems.staticObjectMap[objectID];

        // worldItems.staticObjectMap[itemID] = {};
        // worldItems.staticObjectMap[itemID].id = itemID;
        // worldItems.staticObjectMap[itemID].controlMesh = newMeshes[0];
        // worldItems.staticObjectMap[itemID].position = positionParam;
        buildingConfig.life = objects[i].life;
        buildingConfig.team = objects[i].team;
        buildingConfig.isActive = objects[i].isActive;
    }
}

tg.findAnimPoseByIndex = function (index) {
    for (var i = 0; i < tg.spriteAssets.length; ++i) {
        var poseConfig = tg.spriteAssets[i];
        if (poseConfig.index == index) {
            return poseConfig;
        }
    }
    return null;
};

function entrypoint() {
    tg.worldItems = worldItems;
    tg.playerDimensionBaseUnit = worldItems.playerDimensionBaseUnit;
    createAmbience();

    tg.updateWorld = updateWorld;
    // showHomePage();
    // GUI
    tg.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    showLandingPage();

    tg.scene.registerAfterRender(function () {
        tg.updateCharacterStateBeforeRender();
    });
}
