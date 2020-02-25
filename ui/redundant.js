

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


// tg.setCharacterPose = function (currentConfigParam) {
//     // // console.log('set character pose.');
//     if(currentConfigParam == undefined || currentConfigParam == null){
//         // console.log('currentConfigParam is invalid');
//         return;
//     }
//     // var currentConfig = tg.spriteAssets[tg.currentSelectedSprite].configuration;
//     tg.bodyMeshArray[0].position.x = currentConfigParam[0];
//     tg.bodyMeshArray[0].position.y = currentConfigParam[1];
//     tg.bodyMeshArray[0].position.z = currentConfigParam[2];

//     for (var i = 0; i < tg.bodyMeshArray.length; ++i) {
//     // for (var i =  tg.bodyMeshArray.length - 1; i > 0; --i) {
//         tg.bodyMeshArray[i].rotation.x = currentConfigParam[(i * 3) + 3];
//         tg.bodyMeshArray[i].rotation.y = currentConfigParam[(i * 3) + 4];
//         tg.bodyMeshArray[i].rotation.z = currentConfigParam[(i * 3) + 5];
//         // tg.bodyMeshArray[i].addRotation(
//         //     currentConfig[(i * 3) + 3],
//         //     currentConfig[(i * 3) + 4],
//         //     currentConfig[(i * 3) + 5]
//         // );
//         // tg.spriteAssets[0].configuration[(i * 3) + 6] = tg.bodyMeshArray[i].rotationQuaternion.w;
//     }
//     // console.log('done');
// };


// ---------------------------------------
// init_world



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


tg.findAnimPoseByIndex = function (index) {
    for (var i = 0; i < tg.spriteAssets.length; ++i) {
        var poseConfig = tg.spriteAssets[i];
        if (poseConfig.index == index) {
            return poseConfig;
        }
    }
    return null;
};



function createWorld() {
    tg.updateWorld = updateWorld;
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


tg.showMeshToVisiblePlane = function(meshParam, position){
    meshParam.position.y = tg.selectedObjectPointerMeshPositionY;
    // setTimeout(function(){ 
    //     meshParam.position.x = tg.selectedObjectPointerMeshPositionY_HIDE;
    //     meshParam.position.y = tg.selectedObjectPointerMeshPositionY_HIDE;
    //     meshParam.position.z = tg.selectedObjectPointerMeshPositionY_HIDE;
    //     }, 
    // tg.timeoutForGotoPointerDisappear);
}

tg.hideMeshFromVisiblePlane = function(meshParam){
    meshParam.position.y = tg.selectedObjectPointerMeshPositionY_HIDE;
    setTimeout(function(){ 
        meshParam.position.y = tg.selectedObjectPointerMeshPositionY_HIDE;
        }, 
    tg.timeoutForGotoPointerDisappear);
}

tg.worldCenterX = (worldItems.gridSide) * worldItems.playerDimensionBaseUnit / 2;
tg.worldCenterZ = (worldItems.gridSide) * worldItems.playerDimensionBaseUnit / 2;

