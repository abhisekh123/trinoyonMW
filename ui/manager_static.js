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
    console.log('positionParam:', positionParam);
    console.log('rotation:', rotation);
    console.log('scale:', scale);

    var hpBarMaterial = tg.am.material_neutral_hpbar;
    var hpBarContainerMaterial = tg.am.material_neutral_hpbarcontainer;
    var isFriendly = false;

    newMeshes[0].position.x = positionParam.x;
    newMeshes[0].position.y = positionParam.y;
    newMeshes[0].position.z = positionParam.z;
    newMeshes[0].scaling = new BABYLON.Vector3(scale, scale, scale);
    newMeshes[0].addRotation(rotation.rx, rotation.ry, rotation.rz);
    // console.log('loadStaticModel');
    // for (var i = 0; i < newMeshes.length; ++i) {
    //     // // console.log(i + '->' + newMeshes[i].name);
    //     newMeshes[i].isPickable = false;
    //     newMeshes[i].freezeWorldMatrix();
    // }

    var buildingTypeConfig = tg.itemConfigs.items[itemType];
    const buildingObject = {
        parentMesh: newMeshes[0],
        type: itemType,
        id: itemID,
        position: positionParam,
        life: buildingTypeConfig.life,
        fullLife: buildingTypeConfig.life,
        isActive: true,
        weaponType: buildingTypeConfig.weaponType,
        animations: buildingTypeConfig.animations
    };
    buildingObject.controlMesh = newMeshes[0];
    buildingObject.allMeshes = newMeshes;
    buildingObject.team = team;
    buildingObject.projectileShootY = buildingTypeConfig.projectileShootY * tg.worldItems.uiConfig.playerDimensionBaseUnit;
    buildingObject.projectileReceiveY = buildingTypeConfig.projectileReceiveY * tg.worldItems.uiConfig.playerDimensionBaseUnit;


    // marker mesh indicating team
    var residue = BABYLON.MeshBuilder.CreateBox("residue_enemy_" + itemID, {
        height: 2 * tg.worldItems.uiConfig.playerDimensionBaseUnit,
        width: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        depth: tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, tg.scene);

    residue.position.x = positionParam.x;
    if (isFriendly) {
        residue.position.y = tg.worldItems.uiConfig.hiddenY;
    } else {
        residue.position.y = 0;
    }

    residue.position.z = positionParam.z;
    residue.material = tg.am.material_semitransparent_red;
    // residue.freezeWorldMatrix();

    buildingObject.markerMeshTeamEnemy = residue;

    residue = BABYLON.MeshBuilder.CreateBox("residue_friendly_" + itemID, {
        height: 2 * tg.worldItems.uiConfig.playerDimensionBaseUnit,
        width: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        depth: tg.worldItems.uiConfig.playerDimensionBaseUnit
    }, tg.scene);

    residue.position.x = positionParam.x;
    if (isFriendly) {
        residue.position.y = 0;
    } else {
        residue.position.y = tg.worldItems.uiConfig.hiddenY;
    }
    residue.position.z = positionParam.z;
    residue.material = tg.am.material_semitransparent_blue;
    // residue.freezeWorldMatrix();
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
    // residue.freezeWorldMatrix();
    buildingObject.markerMeshTeamNeutral = residue;

    // projectile mesh

    // var mat = new BABYLON.StandardMaterial('material_projectile_' + itemID, tg.scene);
    // var projectileTexture = new BABYLON.Texture(buildingTypeConfig.projectile.image, tg.scene);
    // projectileTexture.hasAlpha = true;
    // projectileTexture.getAlphaFromRGB = true;

    // mat.diffuseTexture = projectileTexture;

    var f = new BABYLON.Vector4(
        buildingTypeConfig.projectile.uBottom,
        buildingTypeConfig.projectile.vBottom,
        buildingTypeConfig.projectile.uTop,
        buildingTypeConfig.projectile.vTop
    );

    var options = {
        sideOrientation: BABYLON.Mesh.DOUBLESIDE, // FRONTSIDE, BACKSIDE, DOUBLESIDE
        frontUVs: f,
        backUVs: f,
        // updatable: false,
        width: buildingTypeConfig.projectile.width,
        height: buildingTypeConfig.projectile.height,
    }

    var projectilePlane = BABYLON.MeshBuilder.CreatePlane('projectile_plane_' + itemID, options, tg.scene);
    projectilePlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    projectilePlane.material = tg.am.material_projectile_flame_arrow;

    // projectilePlane.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
    // projectilePlane.bakeCurrentTransformIntoVertices();

    // m.position.copyFromFloats(x, 0, z);
    projectilePlane.position.x = positionParam.x;
    projectilePlane.position.y = tg.worldItems.uiConfig.hiddenY;
    projectilePlane.position.z = positionParam.z;
    // projectile.material = tg.am.material_semitransparent_projectile;

    buildingObject.projectile = projectilePlane;
    buildingObject.isProjectileActive = false;
    buildingObject.projectileData = {
        path: null,
        endTime: 0,
        plane: projectilePlane,
        // texture: projectileTexture,
        uOffset: buildingTypeConfig.projectile.uOffset
    };

    // explosion sprite
    var explosionSprite = new BABYLON.Sprite("building_explosion_" + itemID, tg.am.sprite_manager_building_explosion);
    explosionSprite.position.x = positionParam.x;
    // projectilePlane.position.y = tg.worldItems.uiConfig.hiddenY;
    explosionSprite.position.y = 10;
    explosionSprite.position.z = positionParam.z;
    explosionSprite.isPickable = false;
    explosionSprite.width = 3 * tg.worldItems.uiConfig.playerDimensionBaseUnit;
    explosionSprite.height = 4 * tg.worldItems.uiConfig.playerDimensionBaseUnit;
    // sprite.angle = Math.PI/4;
    // sprite.invertU = -1;
    explosionSprite.cellIndex = 12;

    // explosionSprite.playAnimation(0, 15, true, 100);
    buildingObject.explosionData = {
        sprite: explosionSprite,
        start: 0,
        end: 12,
        delay: 150
    }
    

    //data reporter
    var outputplane = BABYLON.Mesh.CreatePlane("outputplane_" + itemID, 25, tg.scene, false);
    outputplane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
    outputplane.material = new BABYLON.StandardMaterial("outputplanematerial_" + itemID, tg.scene);

    var outputplaneTexture = new BABYLON.DynamicTexture("dynamictexture_" + itemID, 512, tg.scene, true);
    outputplane.material.diffuseTexture = outputplaneTexture;
    outputplane.material.specularColor = new BABYLON.Color3(0, 0, 0);
    outputplane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    outputplane.material.backFaceCulling = false;

    outputplaneTexture.drawText(itemID, null, 140, "bold 80px verdana", "white");
    // outputplaneTexture.drawText(positionParam.x + ',' + positionParam.z, null, 140, "bold 80px verdana", "white");

    outputplaneTexture.hasAlpha = true;
    outputplane.position.x = positionParam.x;
    outputplane.position.y = tg.worldItems.uiConfig.playerDimensionBaseUnit * 4 + newMeshes[0].position.y;
    outputplane.position.z = positionParam.z;
    // outputplane.parent = parentMesh;
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

    tg.audio.initGameDynamicObjectAudio(buildingObject, buildingTypeConfig);

    for (var i = 0; i < newMeshes.length; ++i) {
        // // console.log(i + '->' + newMeshes[i].name);
        newMeshes[i].isPickable = false;
        // newMeshes[i].freezeWorldMatrix();
        
    }

    tg.am.updateNewAssetLoaded(1);

    console.log('loadStaticModel end:', itemID);
};

tg.static.freezeStaticAssets = function(){
    for (let itemIndex = 0; itemIndex < tg.am.staticItems.buildingsArray.length; itemIndex++) {
        const staticItem = tg.am.staticItems.buildingsArray[itemIndex];
        for (let meshIndex = 0; meshIndex < staticItem.allMeshes.length; meshIndex++) {
            const meshItem = staticItem.allMeshes[meshIndex];
            meshItem.unfreezeWorldMatrix();
        }
    }
}


tg.static.updateBuildingTeam = function (buildingConfig, team) {
    buildingConfig.team = team;
    tg.ui3d.updatehpbarForNewTeam(buildingConfig.hpBarConfig, team);
    if (team == 0) {
        tg.ui3d.updateHPBarPercentage(buildingConfig.hpBarConfig, 0);
    } else {
        tg.ui3d.updateHPBarPercentage(buildingConfig.hpBarConfig, 100);
    }
    // update marker mesh
    if (team == 0) {
        buildingConfig.markerMeshTeamEnemy.position.y = tg.worldItems.uiConfig.hiddenY;
        buildingConfig.markerMeshTeamNeutral.position.y = 0;
        buildingConfig.markerMeshTeamFriendly.position.y = tg.worldItems.uiConfig.hiddenY;
        // explosionSprite.playAnimation(0, 15, true, 100);
        // buildingObject.explosionData = {
        //     sprite: explosionSprite,
        //     start: 0,
        //     end: 7,
        //     delay: 150
        // }
        tg.audio.playItemEventAudio(buildingConfig, 'destroy');
        
        buildingConfig.explosionData.sprite.playAnimation(
            buildingConfig.explosionData.start,
            buildingConfig.explosionData.end,
            false,
            buildingConfig.explosionData.delay
        );
    } else {
        if (team != tg.bot.userPlayerConfig.team) { // enemy
            buildingConfig.markerMeshTeamEnemy.position.y = 0;
            buildingConfig.markerMeshTeamNeutral.position.y = tg.worldItems.uiConfig.hiddenY;
            buildingConfig.markerMeshTeamFriendly.position.y = tg.worldItems.uiConfig.hiddenY;
        } else { // fiendly
            buildingConfig.markerMeshTeamEnemy.position.y = tg.worldItems.uiConfig.hiddenY;
            buildingConfig.markerMeshTeamNeutral.position.y = tg.worldItems.uiConfig.hiddenY;
            buildingConfig.markerMeshTeamFriendly.position.y = 0;
        }
        tg.audio.playItemEventAudio(buildingConfig, 'capture');
        
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
        function(
            newMeshes,
            // positionParam,
            // rotationParam,
            // scaleParam,
            particleSystems,
            skeletons,
            animationGroups
        ){
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

/**
 * Load ans preload assets
 * @param {*} actionOnComplete : action to be performed once all assets has been loadded
 */
tg.static.loadStaticAssets = function (actionOnComplete) {
    console.log('load gltf assets for static items.');
    var staticItemCount = 0;
    tg.am.onLoadComplete = actionOnComplete;

    tg.am.totalAssetsLoaded_tillNow = 0;

    // 2 is added to account for base meshes.
    tg.am.totalAssetsToBeLoaded = ((2 + tg.worldItems.defenceBottom.length + tg.worldItems.defenceTop.length) * 2); // gltf file + audio file

    tg.am.totalAssetsToBeLoaded += tg.audio.loadAudioAssets();
    tg.am.totalAssetsToBeLoaded += tg.am.preloadAssets();
    console.log('total asset to be loaded:' + tg.am.totalAssetsToBeLoaded);

    // defence team 1
    for (let index = 0; index < tg.worldItems.defenceTop.length; index++) {
        const element = tg.worldItems.defenceTop[index];
        tg.static.loadGLTFAssetFileForStaticMeshes(
            'tower_gloom', {
                x: (element[0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
                y: 0,
                z: (element[1] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
            }, {
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
        'defense_tower', {
            x: (tg.worldItems.topBase[0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
            y: 0,
            z: (tg.worldItems.topBase[1] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
        }, {
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
            'tower_gloom', {
                x: (element[0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
                y: 0,
                z: (element[1] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
            }, {
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
        'defense_tower', {
            x: (tg.worldItems.bottomBase[0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
            y: 0,
            z: (tg.worldItems.bottomBase[1] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit,
        }, {
            rx: 0,
            ry: 0,
            rz: 0
        },
        2,
        'base2',
        'base',
        2
    );
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
    // cameraTarget.material = tg.am.material_semitransparent_chosen;
    cameraTarget.material = tg.am.material_transparent;
    // cameraTarget.freezeWorldMatrix();
    // ground.material = materialGround;
    cameraTarget.isPickable = false;
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
    chosenMarker.isPickable = false;
    chosenMarker.material = tg.am.material_semitransparent_chosen;
    // ground.material = materialGround;
    tg.am.chosenMarker = chosenMarker;

    // bottom left (u,v) 0,0
    // top right (u,v) 1,1
    // (Utop_right, Vbottom_left, Ubottom_left, Vtop_right);
    // (Ubottom_left, Vtop_right, Utop_right, Vbottom_left);
    // (Utop_right, Vtop_right, Ubottom_left, Vbottom_left);
    var faceUV = new Array(6);
    faceUV[0] = new BABYLON.Vector4(0, 0, 1, 1);
    faceUV[1] = new BABYLON.Vector4(0, 0, 1, 1);

    // faceUV[2] = new BABYLON.Vector4(1, 1, 1, 1);
    // faceUV[2] = new BABYLON.Vector4(1, 1, 1, 0);
    // faceUV[2] = new BABYLON.Vector4(1, 1, 0, 1);
    // faceUV[2] = new BABYLON.Vector4(1, 1, 0, 0);
    // faceUV[2] = new BABYLON.Vector4(1, 0, 1, 1);
    // faceUV[2] = new BABYLON.Vector4(1, 0, 1, 0);
    // faceUV[2] = new BABYLON.Vector4(1, 0, 0, 1);
    // faceUV[2] = new BABYLON.Vector4(1, 0, 0, 0);
    // faceUV[2] = new BABYLON.Vector4(0, 1, 1, 1);
    // faceUV[2] = new BABYLON.Vector4(0, 1, 1, 0);
    // faceUV[2] = new BABYLON.Vector4(0, 1, 0, 1);
    // faceUV[2] = new BABYLON.Vector4(0, 1, 0, 0);
    faceUV[2] = new BABYLON.Vector4(0, 0, 1, 1);
    // faceUV[2] = new BABYLON.Vector4(0, 0, 1, 0);
    // faceUV[2] = new BABYLON.Vector4(0, 0, 0, 1);
    // faceUV[2] = new BABYLON.Vector4(0, 0, 0, 0);

    faceUV[3] = new BABYLON.Vector4(0, 0, 1, 1);
    faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);
    faceUV[5] = new BABYLON.Vector4(0, 0, 1, 1);

    var options = {
        width: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        height: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        depth: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        faceUV: faceUV
    };
    // tg.am.staticItems = {};
    tg.am.staticItems.boxes = []; // return;
    for (var i = 0; i < tg.worldItems.obstacles.length; ++i) {
        // var box = BABYLON.MeshBuilder.CreateBox("mesh_box" + i, {
        //     height: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        //     width: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        //     depth: tg.worldItems.uiConfig.playerDimensionBaseUnit,
        // }, tg.scene, false, BABYLON.Mesh.FRONTSIDE);
        var box = BABYLON.MeshBuilder.CreateBox("mesh_box" + i, options, tg.scene, false, BABYLON.Mesh.FRONTSIDE);

        box.position.x = (tg.worldItems.obstacles[i][0] + 0.5) * tg.worldItems.uiConfig.playerDimensionBaseUnit;
        box.position.y = (tg.worldItems.uiConfig.playerDimensionBaseUnit / 2.13);
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
};


