

tg.playerDimensionBaseUnit = 10;
tg.cameraSavedPosition={};
tg.multiplier = 1;
tg.bodyMeshArray = [];

// input handle
// tg.selectedMesh = null;
// tg.previousClickTime = 0;
// tg.previousSelectedMesh = null;
// tg.previousClickType = tg.singleClickType;
tg.doubleClickDelta = 1000;
tg.minAcceptableSeperationBetweenDoubleClick = tg.playerDimensionBaseUnit * 1.3;
tg.timeoutForGotoPointerDisappear = tg.doubleClickDelta * 2.5;
tg.timeoutForBotSelect = tg.doubleClickDelta * 1.3;
tg.selectPointerTimerHandle = null;
tg.intraDoubleClickDistance = 3;

tg.selectedObjectPointerMeshPositionY = tg.playerDimensionBaseUnit / 2;
tg.selectedObjectPointerMeshPositionY_HIDE = -10 * tg.playerDimensionBaseUnit;

tg.clickTime = 0;
tg.pickedPosition = null;
tg.parentClick = {
    position:{
        x:0,
        y:0,
        z:0
    },
    gridCoordinate:{
        x:0,
        z:0
    },
    selectionConfig:null,
    characterID:null,
    time:0
};
tg.grandParentClick = {
    position:{
        x:0,
        y:0,
        z:0
    },
    gridCoordinate:{
        x:0,
        z:0
    },
    selectionConfig:null,
    characterID:null,
    time:0
};

tg.isGameLive = false;

/******* Add the create scene function ******/
var createScene = function () {
    tg.canvas = document.getElementById('tc'); // Get the canvas element 
    tg.engine = new BABYLON.Engine(tg.canvas, true); // Generate the BABYLON 3D engine

    // Create the scene space
    tg.scene = new BABYLON.Scene(tg.engine);
    // alert(tg.playerDimensionBaseUnit);
    tg.camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, 
        new BABYLON.Vector3(44.5 * tg.playerDimensionBaseUnit, 3 * tg.playerDimensionBaseUnit, 100 * tg.playerDimensionBaseUnit), tg.scene);
    
    // tg.camera = new BABYLON.FollowCamera("Camera", new BABYLON.Vector3(0, 10, -10), tg.scene);
    // //The goal distance of camera from target
	// tg.camera.radius = 30;
	
	// // The goal height of camera above local origin (centre) of target
	// tg.camera.heightOffset = 10;
	
	// // The goal rotation of camera around local origin (centre) of target in x y plane
	// tg.camera.rotationOffset = 0;
	
	// //Acceleration of camera in moving from current to goal position
	// tg.camera.cameraAcceleration = 0.005
	
	// //The speed at which acceleration is halted 
    // tg.camera.maxCameraSpeed = 10
    
    tg.camera.attachControl(tg.canvas, true);
    // tg.cameraSavedPosition.x = tg.camera.position.x;
    // tg.cameraSavedPosition.y = tg.camera.position.y;
    // tg.cameraSavedPosition.z = tg.camera.position.z;

    // Register a render loop to repeatedly render the scene
    tg.engine.runRenderLoop(function () { 
        tg.scene.render();
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () { 
        tg.engine.resize();
    });

    return tg.scene;
};

var createSceneStaticAssets = function(){

    var material_semitransparent_blue = new BABYLON.StandardMaterial('blue', tg.scene);
    material_semitransparent_blue.diffuseColor = BABYLON.Color3.Blue();
    material_semitransparent_blue.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material_semitransparent_blue.backFaceCulling = false;
    material_semitransparent_blue.needDepthPrePass = true;
    material_semitransparent_blue.alpha = 0.7;

    var material_semitransparent_red = new BABYLON.StandardMaterial('red', tg.scene);
    material_semitransparent_red.diffuseColor = BABYLON.Color3.Red();
    material_semitransparent_red.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material_semitransparent_red.backFaceCulling = false;
    material_semitransparent_red.needDepthPrePass = true;
    material_semitransparent_red.alpha = 0.5;

    var material_semitransparent_chosen = new BABYLON.StandardMaterial('chosen', tg.scene);
    material_semitransparent_chosen.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.9);
    material_semitransparent_chosen.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material_semitransparent_chosen.backFaceCulling = false;
    material_semitransparent_chosen.needDepthPrePass = true;
    material_semitransparent_chosen.alpha = 0.6;

    var material_character_parent = new BABYLON.StandardMaterial('material_character_parent', tg.scene);
    material_character_parent.diffuseColor = new BABYLON.Color3(0, 0, 0);
    material_character_parent.emissiveColor = new BABYLON.Color3(0, 0, 0);
    material_character_parent.backFaceCulling = false;
    material_character_parent.needDepthPrePass = true;
    material_character_parent.alpha = 0;

    tg.material_semitransparent_blue = material_semitransparent_blue;
    tg.material_semitransparent_red = material_semitransparent_red;
    tg.material_semitransparent_chosen = material_semitransparent_chosen;
    tg.material_character_parent = material_character_parent;
};



tg.setCharacterPose = function (currentConfigParam) {
    // // console.log('set character pose.');
    if(currentConfigParam == undefined || currentConfigParam == null){
        // console.log('currentConfigParam is invalid');
        return;
    }
    // var currentConfig = tg.spriteAssets[tg.currentSelectedSprite].configuration;
    tg.bodyMeshArray[0].position.x = currentConfigParam[0];
    tg.bodyMeshArray[0].position.y = currentConfigParam[1];
    tg.bodyMeshArray[0].position.z = currentConfigParam[2];

    for (var i = 0; i < tg.bodyMeshArray.length; ++i) {
    // for (var i =  tg.bodyMeshArray.length - 1; i > 0; --i) {
        tg.bodyMeshArray[i].rotation.x = currentConfigParam[(i * 3) + 3];
        tg.bodyMeshArray[i].rotation.y = currentConfigParam[(i * 3) + 4];
        tg.bodyMeshArray[i].rotation.z = currentConfigParam[(i * 3) + 5];
        // tg.bodyMeshArray[i].addRotation(
        //     currentConfig[(i * 3) + 3],
        //     currentConfig[(i * 3) + 4],
        //     currentConfig[(i * 3) + 5]
        // );
        // tg.spriteAssets[0].configuration[(i * 3) + 6] = tg.bodyMeshArray[i].rotationQuaternion.w;
    }
    // console.log('done');
};

tg.getGridCoordinateFromPointerPosition = function(position) {
    return {
        x:Math.round(position.x / tg.playerDimensionBaseUnit),
        z:Math.round(position.z / tg.playerDimensionBaseUnit)
    }
};
tg.getBotFromGridCoordinate = function(position) {
    for(var i = 0; i < tg.characterConfig.length; ++i){
        var characterConfig = tg.characterConfig[i];
        if(characterConfig.animation == 'idle'){
            var gridCoordinate = characterConfig.gridCoordinate;
            if(position.x == gridCoordinate.x && position.z == gridCoordinate.z){
                return characterConfig;
            }
        }
    }
    return null;
};
tg.isDoubleClick = function(){
    if((tg.clickTime - tg.parentClick.time) > tg.doubleClickDelta){
        return false;
    }
    if((Math.abs(tg.parentClick.position.x - tg.pickedPosition.x) > tg.minAcceptableSeperationBetweenDoubleClick) ){
        return false;
    }
    if((Math.abs(tg.parentClick.position.z - tg.pickedPosition.z) > tg.minAcceptableSeperationBetweenDoubleClick) ){
        return false;
    }
    return true;
};
tg.isPositionsClose = function(position1, position2, deltaDistance){
    if(Math.abs(position1.x - position2.x) > deltaDistance){
        return false;
    }
    if(Math.abs(position1.z - position2.z) > deltaDistance){
        return false;
    }
    return true;
};
tg.cloneClick = function(clickSource, clickDestination){
    clickDestination.position.x = clickSource.position.x;
    clickDestination.position.y = clickSource.position.y;
    clickDestination.position.z = clickSource.position.z;

    clickDestination.gridCoordinate.x = clickSource.gridCoordinate.x;
    clickDestination.gridCoordinate.z = clickSource.gridCoordinate.z;

    clickDestination.selectionConfig = clickSource.selectionConfig;
    clickDestination.characterID = clickSource.characterID;
    clickDestination.time = clickSource.time;
};

tg.clearClick = function(click){
    click.position.x = 0;
    click.position.y = 0;
    click.position.z = 0;
    click.gridCoordinate.x = 0;
    click.gridCoordinate.z = 0;
    click.selectionConfig = null;
    click.characterID = null;
    click.time = 0;
};
tg.populateClick = function(click, pickResult, gridCoordinate, selectedCharacterConfig, characterID){
    click.position.x = pickResult.pickedPoint.x;
    click.position.y = pickResult.pickedPoint.y;
    click.position.z = pickResult.pickedPoint.z;

    click.gridCoordinate.x = gridCoordinate.x;
    click.gridCoordinate.z = gridCoordinate.z;
    if(characterID == 'ground'){
        click.selectionConfig = null;
        click.characterID = null;
    }else{
        click.selectionConfig = selectedCharacterConfig;
        click.characterID = characterID;
    }
    click.time = tg.clickTime;
};
tg.setDestinationPointerMesh = function(position){
    tg.targetMarker.position.x = position.x;
    tg.targetMarker.position.z = position.z;
    tg.targetMarker.position.y = tg.selectedObjectPointerMeshPositionY;
};
tg.setSelectionPointerMeshTimer = function(pickedMeshID){
    tg.selectPointerTimerHandle = setTimeout(function(){
        if(pickedMeshID == 'ground'){
            tg.selectedMarker.parent = null;
        }else{
            tg.selectedMarker.parent = tg.worldItems.characterMap[pickedMeshID].parentMesh;
        }
        
        // tg.selectedObjectPointerMesh.position.x = position.x;
        // tg.selectedObjectPointerMesh.position.y = position.z;
        // tg.selectedObjectPointerMesh.position.y = tg.selectedObjectPointerMeshPositionY;
    }, 
    tg.timeoutForBotSelect);
};
tg.clearSelectionPointerMeshTimer = function(){
    clearTimeout(tg.selectPointerTimerHandle);
};
tg.setClearDestinationPointerMeshTimer = function(position){
    tg.selectPointerTimerHandle = setTimeout(function(){ 
        tg.targetMarker.position.y = tg.selectedObjectPointerMeshPositionY_HIDE;
        }, 
    tg.timeoutForGotoPointerDisappear);
};
tg.arePositionsInDifferentGrid = function(position1, position2){
    // var grid1 = tg.getGridCoordinateFromPointerPosition(position1);
    // var grid2 = tg.getGridCoordinateFromPointerPosition(position2);
    if(position1.x == position2.x && position1.z == position2.z){
        return false;
    }
    return true;
};
tg.getFloorPositionFromGrid = function(gridPosition){
    return {
        x:((gridPosition.x + 0.5) * tg.playerDimensionBaseUnit),
        z:((gridPosition.z + 0.5) * tg.playerDimensionBaseUnit),
    }
};

function initVideo(){
    // alert('initVideo');
    createScene(); //Call the createScene function
    createSceneStaticAssets();
    let picketPoint = null;

//     var el = document.getElementsByTagName("canvas")[0];
//   el.addEventListener("touchstart", handleStart, false);
//   el.addEventListener("touchend", handleEnd, false);
//   el.addEventListener("touchcancel", handleCancel, false);
//   el.addEventListener("touchmove", handleMove, false);
// https://developer.mozilla.org/en-US/docs/Web/API/Touch_events

    tg.scene.onPointerDown = function (evt) {
        // // console.log('pointer down.');
        if(!tg.isGameLive){
            // console.log('game not started yet.');
            return;
        }
        // We try to pick an object
        var pickResult = tg.scene.pick(this.pointerX, this.pointerY);
        
        if (pickResult.hit) {
            tg.pickedPosition = pickResult.pickedPoint;
            tg.clickTime = Date.now();
            var gridCoordinate = tg.getGridCoordinateFromPointerPosition(tg.pickedPosition);
            var pickedMeshID = pickResult.pickedMesh.id;
            // // console.log('grid coordinate:', gridCoordinate);
            // console.log(pickedMeshID);
            var pickedCharacterConfig = tg.worldItems.characterMap[pickedMeshID];
            if(pickedCharacterConfig == null || pickedCharacterConfig == undefined){
                // console.log('invalid character selected. exiting. character name:' + pickedMeshID);
                return;
            }
            if(pickedCharacterConfig.playerID != tg.userPlayerID){
                // console.log('character does not belong to user. skipping');
                return;
            }
            // tg.selectedMarker.position.x = pickedCharacterConfig.parentMesh.position.x;
            // tg.selectedMarker.position.y = pickedCharacterConfig.parentMesh.position.y;
            // tg.selectedMarker.position.z = pickedCharacterConfig.parentMesh.position.z;
            // if(pickedMeshID != 'ground'){
            //     tg.targetMarker
            //     tg.selectedMarker.position.y = worldItems.playerDimensionBaseUnit / 2;
            //     tg.selectedMarker.setParent(pickedCharacterConfig.parentMesh);
            // }else{
            //     tg.selectedMarker.position.y = tg.selectedObjectPointerMeshPositionY_HIDE;
            //     tg.selectedMarker.setParent(null);
            // }
            
            // tg.selectedMarker.parent = pickedCharacterConfig.parentMesh;
            // return;

            if(tg.isDoubleClick()){// double click
                tg.clearSelectionPointerMeshTimer();
                // if(tg.grandParentClick.selectionConfig != null){
                //     //clear all
                //     tg.clearClick(tg.parentClick);
                //     tg.clearClick(tg.grandParentClick);
                //     return;
                // }
                if(tg.grandParentClick.selectionConfig == null){
                    // no bot has been selected yet. No action. clear all.
                    tg.clearClick(tg.parentClick);
                    tg.clearClick(tg.grandParentClick);
                    return;
                }

                if(!tg.arePositionsInDifferentGrid(gridCoordinate, tg.grandParentClick.gridCoordinate)){
                    // nothing to do here. Clear record for double click. Last selection click becomes last click.
                    tg.cloneClick(tg.grandParentClick, tg.parentClick);
                    tg.clearClick(tg.grandParentClick);
                    return;
                }

                // request goto
                let packet = getActionPacketJSON('goto');
                packet.message.x = gridCoordinate.x;
                packet.message.z = gridCoordinate.z;
                // packet.message.x = Math.round(tg.target.position.x);
                // packet.message.z = Math.round(tg.target.position.z);
                
                // packet.message.target = tg.selectedMesh.name;
                packet.message.target = pickedMeshID;
                // packet.message.id = tg.meshNameToIDMap[tg.selectedMesh.name];
                packet.message.id = tg.grandParentClick.characterID;
                // console.log(packet);
                sendJSONMessageToWS(packet);
                tg.cloneClick(tg.grandParentClick, tg.parentClick);
                tg.clearClick(tg.grandParentClick);
                tg.setDestinationPointerMesh(tg.getFloorPositionFromGrid(gridCoordinate));
                tg.setClearDestinationPointerMeshTimer();
            }else{ // single click
                tg.setSelectionPointerMeshTimer(pickedMeshID);
                tg.cloneClick(tg.parentClick, tg.grandParentClick);
                tg.populateClick(tg.parentClick, pickResult, gridCoordinate, pickedCharacterConfig, pickedMeshID);
            }
        }
    };    
}

function entrypoint(){
    
    initVideo();
    sendMessageToWS(getEmptyMessagePacket('init_world'));
}