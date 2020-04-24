
tg.static = {};

tg.static.loadStaticModel = function (
    newMeshes,
    positionParam,
    rotation,
    scale,
    itemID,
    itemType,
    team
) {
    console.log('loadStaticModel:', itemID);

    var hpBarMaterial = tg.am.material_neutral_hpbar;
    var hpBarContainerMaterial = tg.am.material_neutral_hpbarcontainer;
    var isFriendly = false;

    newMeshes[0].position.x = positionParam.x;
    newMeshes[0].position.y = positionParam.y;
    newMeshes[0].position.z = positionParam.z;
    newMeshes[0].scaling = new BABYLON.Vector3(scale, scale, scale);
    newMeshes[0].addRotation(rotation.rx, rotation.ry, rotation.rz);
    // console.log('loadStaticModel');
    for (var i = 0; i < newMeshes.length; ++i) {
        // // console.log(i + '->' + newMeshes[i].name);
        newMeshes[i].isPickable = false;
        newMeshes[i].freezeWorldMatrix();
    }

    var buildingTypeConfig = tg.itemConfigs.items[itemType];
    const buildingObject = {
        parentMesh: newMeshes[0],
        type: itemType,
        id: itemID,
        position: positionParam,
        life: buildingTypeConfig.life,
        fullLife: buildingTypeConfig.life,
        isActive: true,
    };
    buildingObject.controlMesh = newMeshes[0];
    buildingObject.team = team;
    buildingObject.projectileShootY = buildingTypeConfig.projectileShootY;
    buildingObject.projectileReceiveY = buildingTypeConfig.projectileReceiveY;


    // marker mesh indicating team
    var residue = BABYLON.MeshBuilder.CreateBox("residue_enemy_" + itemID, {
        height: 2 * tg.worldItems.uiConfig.playerDimensionBaseUnit,
        width: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        depth: tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, tg.scene);

    residue.position.x = positionParam.x;
    if(isFriendly){
        residue.position.y = tg.worldItems.uiConfig.hiddenY;
    } else {
        residue.position.y = 0;
    }
    
    residue.position.z = positionParam.z;
    residue.material = tg.am.material_semitransparent_red;
    residue.freezeWorldMatrix();

    buildingObject.markerMeshTeamEnemy = residue;

    residue = BABYLON.MeshBuilder.CreateBox("residue_friendly_" + itemID, {
        height: 2 * tg.worldItems.uiConfig.playerDimensionBaseUnit,
        width: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        depth: tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, tg.scene);

    residue.position.x = positionParam.x;
    if(isFriendly){
        residue.position.y = 0;
    } else {
        residue.position.y = tg.worldItems.uiConfig.hiddenY;
    }
    residue.position.z = positionParam.z;
    residue.material = tg.am.material_semitransparent_blue;
    residue.freezeWorldMatrix();
    buildingObject.markerMeshTeamFriendly = residue;

    residue = BABYLON.MeshBuilder.CreateBox("residue_neutral_" + itemID, {
        height: 2 * tg.worldItems.uiConfig.playerDimensionBaseUnit,
        width: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        depth: tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, tg.scene);

    residue.position.x = positionParam.x;
    residue.position.y = tg.worldItems.uiConfig.hiddenY;
    residue.position.z = positionParam.z;
    residue.material = tg.am.material_semitransparent_chosen;
    residue.freezeWorldMatrix();
    buildingObject.markerMeshTeamNeutral = residue;

    // projectile mesh
    var projectile = BABYLON.MeshBuilder.CreateBox("projectile_" + itemID, {
        height: tg.worldItems.uiConfig.playerDimensionBaseUnit / 10,
        width: tg.worldItems.uiConfig.playerDimensionBaseUnit / 10,
        depth: tg.worldItems.uiConfig.playerDimensionBaseUnit / 10
    }, tg.scene);

    projectile.position.x = positionParam.x;
    projectile.position.y = tg.worldItems.uiConfig.hiddenY;
    projectile.position.z = positionParam.z;
    projectile.material = tg.am.material_semitransparent_towerprojectile;
    projectile.freezeWorldMatrix();

    buildingObject.projectile = projectile;
    buildingObject.isProjectileActive = false;
    buildingObject.projectileData = {
        path: null,
        endTime: 0
    };

    // //data reporter
    // var outputplane = BABYLON.Mesh.CreatePlane("outputplane_" + itemID, 25, tg.scene, false);
    // outputplane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
    // outputplane.material = new BABYLON.StandardMaterial("outputplanematerial_" + itemID, tg.scene);

    // var outputplaneTexture = new BABYLON.DynamicTexture("dynamictexture_" + itemID, 512, tg.scene, true);
    // outputplane.material.diffuseTexture = outputplaneTexture;
    // outputplane.material.specularColor = new BABYLON.Color3(0, 0, 0);
    // outputplane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    // outputplane.material.backFaceCulling = false;
    
    // outputplaneTexture.drawText(positionParam.x + ',' + positionParam.z, null, 140, "bold 80px verdana", "white");

    // outputplaneTexture.hasAlpha = true;
    // outputplane.position.x = positionParam.x;
    // outputplane.position.y = tg.worldItems.uiConfig.playerDimensionBaseUnit * 4 + newMeshes[0].position.y;
    // outputplane.position.z = positionParam.z;
    // // outputplane.parent = parentMesh;
    // outputplane.freezeWorldMatrix();


    var hpBarConfig = tg.ui3d.gethpbar(itemID, hpBarMaterial, hpBarContainerMaterial);
    buildingObject.hpBarConfig = hpBarConfig;
    // hpBarConfig.healthBarContainer.parent = botObject.controlMesh;
    // hpBarConfig.healthBarContainer.position.x = positionParam.x;
    // hpBarConfig.healthBarContainer.position.y = tg.worldItems.uiConfig.playerDimensionBaseUnit * 3 + newMeshes[0].position.y;
    // hpBarConfig.healthBarContainer.position.z = positionParam.z;

    hpBarConfig.healthBarContainer.scaling = new BABYLON.Vector3(
        buildingTypeConfig.hpBarScale, 
        buildingTypeConfig.hpBarScale, 
        buildingTypeConfig.hpBarScale
    );
    hpBarConfig.healthBarContainer.position.x = positionParam.x;
    hpBarConfig.healthBarContainer.position.y = buildingTypeConfig.hpBarPositionY;
    hpBarConfig.healthBarContainer.position.z = positionParam.z;

    // buildingObject.headerBoard = outputplane;

    tg.am.staticItems.buildings[itemID] = buildingObject;
    tg.am.staticItems.buildingsArray.push(buildingObject);

    tg.am.updateNewAssetLoaded(1);

    console.log('loadStaticModel end:', itemID);
};


tg.static.updateBuildingTeam = function(buildingConfig, team){
    buildingConfig.team = team;
    tg.ui3d.updatehpbarForNewTeam(buildingConfig.hpBarConfig, team);
    if(team == 0){
        tg.ui3d.updateHPBarPercentage(buildingConfig.hpBarConfig, 0);
    }else{
        tg.ui3d.updateHPBarPercentage(buildingConfig.hpBarConfig, 100);
    }
    // update marker mesh
    if(team == 0){
        buildingConfig.markerMeshTeamEnemy.position.y = tg.worldItems.uiConfig.hiddenY;
        buildingConfig.markerMeshTeamNeutral.position.y = 0;
        buildingConfig.markerMeshTeamFriendly.position.y = tg.worldItems.uiConfig.hiddenY;
    }else{
        if(team != tg.bot.userPlayerConfig.team){ // enemy
            buildingConfig.markerMeshTeamEnemy.position.y = 0;
            buildingConfig.markerMeshTeamNeutral.position.y = tg.worldItems.uiConfig.hiddenY;
            buildingConfig.markerMeshTeamFriendly.position.y = tg.worldItems.uiConfig.hiddenY;
        } else { // fiendly
            buildingConfig.markerMeshTeamEnemy.position.y = tg.worldItems.uiConfig.hiddenY;
            buildingConfig.markerMeshTeamNeutral.position.y = tg.worldItems.uiConfig.hiddenY;
            buildingConfig.markerMeshTeamFriendly.position.y = 0;
        }
    }
};


tg.static.loadGLTFAssetFileForStaticMeshes = function (
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
            tg.static.loadStaticModel(
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

tg.static.loadGLTFAssetsForStaticItems = function (actionOnComplete) {
    console.log('load gltf assets for static items.');
    var staticItemCount = 0;
    tg.am.onLoadComplete = actionOnComplete;

    // 2 is added to account for base meshes.
    tg.am.totalAssetsToBeLoaded = 2 + tg.worldItems.defenceBottom.length + tg.worldItems.defenceTop.length;

    tg.am.totalAssetsLoaded_tillNow = 0;

    // defence team 1
    for (let index = 0; index < tg.worldItems.defenceTop.length; index++) {
        const element = tg.worldItems.defenceTop[index];
        tg.static.loadGLTFAssetFileForStaticMeshes(
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
    tg.static.loadGLTFAssetFileForStaticMeshes(
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
        tg.static.loadGLTFAssetFileForStaticMeshes(
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
    tg.static.loadGLTFAssetFileForStaticMeshes(
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
};

tg.static.resetStaticItems = function () {
    console.log('tg.static.resetStaticItems()');
};


/**
 * create the world. These are the items that are always retained/reused in each game.
 */
tg.static.addStaticItems = function () {
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
    ground.freezeWorldMatrix();

    // cameraTarget
    var cameraTarget = BABYLON.MeshBuilder.CreateBox("cameraTarget", {
        height: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        width: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        depth: tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, tg.scene);
    // so that all position are positive and it is easier to map 
    // ground position from ai grid position.
    cameraTarget.position.x = tg.worldItems.gridSide * tg.worldItems.uiConfig.playerDimensionBaseUnit / 2;
    cameraTarget.position.y = tg.worldItems.uiConfig.playerDimensionBaseUnit / 2;
    cameraTarget.position.z = tg.worldItems.gridSide * tg.worldItems.uiConfig.playerDimensionBaseUnit / 2;
    // ground.isPickable = true;
    cameraTarget.material = tg.am.material_semitransparent_chosen;
    // cameraTarget.freezeWorldMatrix();
    // ground.material = materialGround;
    tg.am.cameraTarget = cameraTarget;

    tg.camera.lockedTarget = tg.am.cameraTarget;
    // tg.camera2.lockedTarget = tg.am.ground;

    // chosenMarker
    var chosenMarker = BABYLON.MeshBuilder.CreateBox("chosenMarker", {
        height: tg.worldItems.uiConfig.playerDimensionBaseUnit / 4,
        width: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        depth: tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, tg.scene);
    // so that all position are positive and it is easier to map 
    // ground position from ai grid position.
    chosenMarker.position.x = 0;
    chosenMarker.position.y = tg.worldItems.uiConfig.hiddenY;
    chosenMarker.position.z = 0;
    // ground.isPickable = true;
    chosenMarker.material = tg.am.material_semitransparent_chosen;
    // ground.material = materialGround;
    tg.am.chosenMarker = chosenMarker;

    // tg.am.staticItems = {};
    tg.am.staticItems.boxes = [];// return;
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
        box.freezeWorldMatrix();
        // box.material = groundMaterial;
        tg.am.staticItems.boxes.push(box);

        // //data reporter
        // var outputplane = BABYLON.Mesh.CreatePlane("box_" + i, 5, tg.scene, false);
        // outputplane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
        // outputplane.material = new BABYLON.StandardMaterial("boxmaterial_" + i, tg.scene);
        // // outputplane.material = tg.am.material_friend_hpbar;
        // // outputplane.position = new BABYLON.Vector3(0, 0, 25);
        // // outputplane.scaling.y = 0.4;

        // var outputplaneTexture = new BABYLON.DynamicTexture("boxdynamictexture_" + i, 128, tg.scene, true);
        // outputplane.material.diffuseTexture = outputplaneTexture;
        // outputplane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        // outputplane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        // outputplane.material.backFaceCulling = false;

        // //outputplaneTexture.getContext().clearRect(0, 140, 512, 512);
        // // outputplaneTexture.drawText(itemID, null, 140, "bold 80px verdana", "white");
        // // console.log(box.position.x + ',' + box.position.z);
        // outputplaneTexture.drawText(box.position.x + ',' + box.position.z, 0, 30, "bold 20px verdana", "white");

        // // outputplaneTexture.hasAlpha = true;
        // outputplane.position.x = box.position.x;
        // outputplane.position.y = tg.worldItems.uiConfig.playerDimensionBaseUnit / 2 + box.position.y;
        // outputplane.position.z = box.position.z;
        // // console.log('box' + i + ':', box.position);
        // // console.log('outputplane' + i + ':', outputplane.position);
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

