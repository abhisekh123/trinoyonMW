



tg.createAmbience = function() {
    
 
    var light2 = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), tg.scene);
	light2.diffuse = new BABYLON.Color3(1, 1, 1);
	light2.specular = new BABYLON.Color3(1, 1, 1);
    light2.groundColor = new BABYLON.Color3(1, 1, 1);

    tg.light2 = light2;

    var light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0,0,0), tg.scene);
    light.diffuse = new BABYLON.Color3(1, 1, 1);
//     light.specular = new BABYLON.Color3(1, 1, 1);
//     light.groundColor = new BABYLON.Color3(1, 1, 1);
    light.position.y = 600;
    light.range = 1000;

    tg.light = light;

    tg.light.parent = tg.camera;

    var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000 * tg.worldItems.uiConfig.playerDimensionBaseUnit, tg.scene);
    skybox.position = new BABYLON.Vector3(((tg.worldItems.gridSide - 1) / 2) * tg.worldItems.uiConfig.playerDimensionBaseUnit, 
        0, 
        ((tg.worldItems.gridSide - 1) / 2) * tg.worldItems.uiConfig.playerDimensionBaseUnit
    );
    // var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    // skyboxMaterial.backFaceCulling = false;
    // skyboxMaterial.disableLighting = true;
    skybox.material = tg.material_sky;
    skybox.freezeWorldMatrix();
    skybox.isPickable = false;
    tg.skybox = skybox;
};


tg.initialiseAngleMatrix = function() {
    var angleMatrix = new Array();
    // for each point in the grid, find seq of points forming straight line from point (x,z) to (26, 26)
    for(var i = 0; i < tg.worldItems.uiConfig.neighbourhoodBoxSide; ++i){ // x axis
        angleMatrix[i] = new Array();
        for(var j = 0; j < tg.worldItems.uiConfig.neighbourhoodBoxSide; ++j){ // z axis
            if(i==tg.worldItems.maxRange && j==tg.worldItems.maxRange){
                angleMatrix[i][j] = 0;
                continue;
            }
            
            // angle with positive z axis(away from camera). negetive for left side(x < 0)
            angleMatrix[i][j] = roundTo2Decimal(Math.atan2((i - tg.worldItems.maxRange), (j - tg.worldItems.maxRange))); 
        }
    }
    tg.angleMatrix = angleMatrix;
};

tg.initialiseDistanceMatrix = function() {
    var distanceMatrix = new Array(tg.worldItems.gridSide);
    for(var i = 0; i < tg.worldItems.gridSide; ++i){ // x axis
        distanceMatrix[i] = new Array(tg.worldItems.gridSide);
        for(var k = 0; k < tg.worldItems.gridSide; ++k){ // z axis
            distanceMatrix[i][k] = roundTo2Decimal(Math.sqrt(Math.pow(i, 2) + Math.pow(k, 2)));
        }
    }
    tg.distanceMatrix = distanceMatrix;
};


// custom function exevuted in render loop.
tg.newRefreshFunction = function() {
    tg.currentTime = getCurrentTime ();
    // tg.hl.divFps.innerHTML = tg.engine.getFps().toFixed() + " fps";

    // if ((tg.input.keyMap["s"] || tg.input.keyMap["S"])) {
    //     tg.video.moveCameraStraight(1);
    // };

    // if ((tg.input.keyMap["w"] || tg.input.keyMap["W"])) {
    //     tg.video.moveCameraStraight(-1);
    // };

    // if ((tg.input.keyMap["d"] || tg.input.keyMap["D"])) {
    //     tg.video.moveCameraSideway(1);
    // };
    // if ((tg.input.keyMap["a"] || tg.input.keyMap["A"])) {
    //     tg.video.moveCameraSideway(-1);
    // };

    // if ((tg.input.keyMap["q"] || tg.input.keyMap["Q"])) {
    //     tg.video.cameraRotate(-1);
    // };

    // if ((tg.input.keyMap["e"] || tg.input.keyMap["E"])) {
    //     tg.video.cameraRotate(1);
    // };

    // // go near
    // if ((tg.input.keyMap["r"] || tg.input.keyMap["R"])) {
    //     tg.video.cameraZoom(-1);
    // };

    // // go away
    // if ((tg.input.keyMap["f"] || tg.input.keyMap["F"])) {
    //     tg.video.cameraZoom(1);
    // };
    
    if(tg.isGameLive == true){
        // tg.sprite.refresh();

        if(tg.bot.userPlayerConfig.selectedBot != null){
            tg.am.chosenMarker.position.x = tg.bot.userPlayerConfig.selectedBot.controlMesh.position.x;
            tg.am.chosenMarker.position.z = tg.bot.userPlayerConfig.selectedBot.controlMesh.position.z;
        }

        if(tg.video.leftJoystickActive){
            tg.video.cameraPan(tg.video.leftJoystickAngle);
        }
        if(tg.video.rightJoystickActive){
            tg.video.cameraChangeView(tg.video.rightJoystickAngle);
        }
        
        if ((tg.input.keyMap["s"] || tg.input.keyMap["S"])) {
            tg.video.moveCameraStraight(1);
        };

        if ((tg.input.keyMap["w"] || tg.input.keyMap["W"])) {
            tg.video.moveCameraStraight(-1);
        };

        if ((tg.input.keyMap["d"] || tg.input.keyMap["D"])) {
            tg.video.moveCameraSideway(1);
        };
        if ((tg.input.keyMap["a"] || tg.input.keyMap["A"])) {
            tg.video.moveCameraSideway(-1);
        };

        if ((tg.input.keyMap["q"] || tg.input.keyMap["Q"])) {
            tg.video.cameraRotate(-1);
        };

        if ((tg.input.keyMap["e"] || tg.input.keyMap["E"])) {
            tg.video.cameraRotate(1);
        };

        // go near
        if ((tg.input.keyMap["r"] || tg.input.keyMap["R"])) {
            tg.video.cameraZoom(-1);
        };

        // go away
        if ((tg.input.keyMap["f"] || tg.input.keyMap["F"])) {
            tg.video.cameraZoom(1);
        };

        for(var i = 0; i < tg.am.dynamicItems.botsArray.length; ++i){
            // if(tg.am.dynamicItems.botsArray[i].isProjectileActive && tg.am.dynamicItems.botsArray[i].plannedPath != null){
            //     console.log('bot had movement and active projectile:', tg.am.dynamicItems.botsArray[i].id);
            // }
            // update bot projectile
            if(tg.am.dynamicItems.botsArray[i].isProjectileActive){
                tg.updateProjectileState(tg.am.dynamicItems.botsArray[i]);
            }
            if(tg.am.dynamicItems.botsArray[i].plannedPath != null){
                tg.updateBotPosition(tg.am.dynamicItems.botsArray[i]);
            }else{
                // console.log('planned path is null for bot:', tg.am.dynamicItems.botsArray[i].id);
            }
        }
        for(var i = 0; i < tg.am.staticItems.buildingsArray.length; ++i){
            if(tg.am.staticItems.buildingsArray[i].isProjectileActive){
                tg.updateProjectileState(tg.am.staticItems.buildingsArray[i]);
            }
            
        }
        
    }
};

tg.calculateCameraMovementSteps = function() {
    var angle = (tg.camera.rotationOffset / 180) * Math.PI;
    var cosValue = Math.cos(angle);
    var sinValue = Math.sin(angle);

    tg.worldItems.uiConfig.sideX = -tg.worldItems.uiConfig.cameraTargetMovementStep * cosValue;
    tg.worldItems.uiConfig.sideZ = tg.worldItems.uiConfig.cameraTargetMovementStep * sinValue;
    tg.worldItems.uiConfig.forewardX = tg.worldItems.uiConfig.cameraTargetMovementStep * sinValue;
    tg.worldItems.uiConfig.forewardZ = tg.worldItems.uiConfig.cameraTargetMovementStep * cosValue;
};

tg.updateBotPosition = function(configParam) {
    // console.log('updateBotPosition for:', configParam.id);
    // console.log('tg.currentTime:', tg.currentTime);
    
    if(tg.moveMeshAlongPath(configParam.controlMesh, configParam.plannedPath) == true){
        // console.log('setting path to null for bot:', configParam.id);
        configParam.plannedPath = null;
        tg.animationmanager.startCharacterAnimation(configParam, 'ready');
    }
    // if(configParam.id == "player_0_0"){
    //     console.log('configParam.controlMesh.position:', configParam.controlMesh.position);
    // }
};

tg.updateProjectileState = function(configParam) {
    // console.log('updateProjectileState for:', configParam.id);
    // console.log('tg.currentTime:', tg.currentTime);
    if(configParam.isProjectileActive == true && configParam.projectileData.endTime < tg.currentTime){
        // console.log('clear projectile position for:', configParam.id);
        configParam.isProjectileActive = false;
        configParam.projectile.position.y = tg.worldItems.uiConfig.hiddenY;
        return;
    }
    if(tg.moveMeshAlongPath(configParam.projectile, configParam.projectileData.path) == true){
        configParam.isProjectileActive = false;
        configParam.projectile.position.y = tg.worldItems.uiConfig.hiddenY;
    }
};

tg.moveMeshAlongPath = function(meshParam, pathParam){
    // console.log('moveMeshAlongPath');
    for(var i = 0; i < pathParam.length; ++i){
        if(pathParam[i].time > tg.currentTime){
            // console.log('update mesh position for:', meshParam.id);
            meshParam.position.x = pathParam[i].x;
            meshParam.position.y = pathParam[i].y;
            meshParam.position.z = pathParam[i].z;
            // var axis = new BABYLON.Vector3(0, 1, 0);
            // // axis.normalize();
            // var quaternion = new BABYLON.Quaternion.RotationAxis(axis, pathParam[i].rotation);
            // meshParam.rotationQuaternion = quaternion;
            tg.world.rotateMesh(
                new BABYLON.Vector3(0, 1, 0), 
                meshParam, 
                pathParam[i].rotation
            );
            // meshParam.rotation.y = pathParam[i].rotation;
            return false;
        }
    }
    return true; // mesh completed movement
};

tg.initWorld = function(){
    tg.worldItems.calculatedGridSide = tg.worldItems.gridSide * tg.worldItems.uiConfig.playerDimensionBaseUnit;
    tg.am.init();
    tg.createAmbience();
    
    tg.pn.init();
    tg.message.init();
    tg.refreshUI = tg.newRefreshFunction;
    
    // console.log('tg.rm.pathMap:', tg.rm.pathMap);

    // tg.scene.registerAfterRender(function () {
    //     tg.updateCharacterStateBeforeRender();
    // });

    tg.isGameLive = false;
};

function entrypoint() {
    tg.initialiseAngleMatrix();
    tg.initialiseDistanceMatrix();
    tg.rm.init();
    tg.initWorld();
};
