



function createAmbience() {
    
 
    var light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), tg.scene);
	light.diffuse = new BABYLON.Color3(1, 1, 1);
	light.specular = new BABYLON.Color3(1, 1, 1);
    light.groundColor = new BABYLON.Color3(1, 1, 1);

    tg.light2 = light;

    // tg.camera.target = tg.am.ground.position;
};


function initialiseAngleMatrix() {
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

function initialiseDistanceMatrix() {
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
    tg.hl.divFps.innerHTML = tg.engine.getFps().toFixed() + " fps";

    // console.log(tg.currentTime);
    if(tg.isGameLive == true){
        var gridSide = tg.worldItems.gridSide * tg.worldItems.uiConfig.playerDimensionBaseUnit;

        if(tg.bot.userPlayerConfig.selectedBot != null){
            tg.am.chosenMarker.position.x = tg.bot.userPlayerConfig.selectedBot.controlMesh.position.x;
            tg.am.chosenMarker.position.z = tg.bot.userPlayerConfig.selectedBot.controlMesh.position.z;
        }
        
        if ((tg.input.keyMap["s"] || tg.input.keyMap["S"])) {
            tg.am.cameraTarget.parent = null;
            console.log('w');
            tg.am.cameraTarget.position.z += tg.worldItems.uiConfig.cameraTargetMovementStep;
            if(tg.am.cameraTarget.position.z > gridSide){
                tg.am.cameraTarget.position.z = gridSide;
            }
        };

        if ((tg.input.keyMap["w"] || tg.input.keyMap["W"])) {
            tg.am.cameraTarget.parent = null;
            console.log('s');
            tg.am.cameraTarget.position.z -= tg.worldItems.uiConfig.cameraTargetMovementStep;
            if(tg.am.cameraTarget.position.z < 0){
                tg.am.cameraTarget.position.z = 0;
            }
        };

        if ((tg.input.keyMap["d"] || tg.input.keyMap["D"])) {
            tg.am.cameraTarget.parent = null;
            console.log('a');
            tg.am.cameraTarget.position.x -= tg.worldItems.uiConfig.cameraTargetMovementStep;
            if(tg.am.cameraTarget.position.x < 0){
                tg.am.cameraTarget.position.x = 0;
            }
        };
        if ((tg.input.keyMap["a"] || tg.input.keyMap["A"])) {
            tg.am.cameraTarget.parent = null;
            console.log('d');
            tg.am.cameraTarget.position.x += tg.worldItems.uiConfig.cameraTargetMovementStep;
            if(tg.am.cameraTarget.position.x > gridSide){
                tg.am.cameraTarget.position.x = gridSide;
            }
        };

        for(var i = 0; i < tg.am.dynamicItems.botsArray.length; ++i){
            if(tg.am.dynamicItems.botsArray[i].isProjectileActive){
                tg.updateProjectileState(tg.am.dynamicItems.botsArray[i]);
            }
            
        }
        for(var i = 0; i < tg.am.staticItems.buildingsArray.length; ++i){
            if(tg.am.staticItems.buildingsArray[i].isProjectileActive){
                tg.updateProjectileState(tg.am.staticItems.buildingsArray[i]);
            }
            
        }
        
    }
};

tg.updateProjectileState = function(configParam) {
    console.log('updateProjectileState for:', configParam.id);
    console.log('tg.currentTime:', tg.currentTime);
    if(configParam.projectileData.endTime < tg.currentTime){
        console.log('clear projectile position for:', configParam.id);
        configParam.isProjectileActive = false;
        configParam.projectile.position.y = tg.worldItems.uiConfig.hiddenY;
        return;
    }
    for(var i = 0; i < configParam.projectileData.path.length; ++i){
        if(configParam.projectileData.path[i].time > tg.currentTime){
            console.log('update projectile position for:', configParam.id);
            configParam.projectile.position.x = configParam.projectileData.path[i].x;
            configParam.projectile.position.z = configParam.projectileData.path[i].z;
            break;
        }
    }
};

function entrypoint() {
    tg.refreshUI = tg.newRefreshFunction;
    initialiseAngleMatrix();
    initialiseDistanceMatrix();
    tg.pn.init();
    createAmbience();
    tg.am.init();
    tg.rm.init();
    console.log('tg.rm.pathMap:', tg.rm.pathMap);

    // tg.scene.registerAfterRender(function () {
    //     tg.updateCharacterStateBeforeRender();
    // });

    tg.isGameLive = false;
}
