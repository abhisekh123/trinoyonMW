

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




tg.bot.startCharacterAnimation = function(characterConfig, currentAction, animationPlayFlag){
    if(animationPlayFlag == null || animationPlayFlag == undefined){
        animationPlayFlag = true;
    }
    var isCharacter = true;
    // var characterConfig = tg.characterConfig[id];
    var characterTypeConfig = itemConfigs.items[characterConfig.characterName];
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
                if(update.loosingTeam == tg.team){
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


tg.rm.initPathMap_old = function () {
    tg.rm.pathMap.right = {};
    tg.rm.pathMap.right.fullPath = [{
            x: 0.125,
            z: 0,
            timeFactor: 0.125,
        },
        {
            x: 0.25,
            z: 0,
            timeFactor: 0.25,
        },
        {
            x: 0.375,
            z: 0,
            timeFactor: 0.375,
        },
        {
            x: 0.5,
            z: 0,
            timeFactor: 0.5,
        },
        {
            x: 0.625,
            z: 0,
            timeFactor: 0.625,
        },
        {
            x: 0.75,
            z: 0,
            timeFactor: 0.75,
        },
        {
            x: 0.875,
            z: 0,
            timeFactor: 0.875,
        },
        {
            x: 1,
            z: 0,
            timeFactor: 1
        },
    ];
    tg.rm.pathMap.right.halfPath = [{
            x: 0.125,
            z: 0,
            timeFactor: 0.125,
        },
        {
            x: 0.25,
            z: 0,
            timeFactor: 0.25,
        },
        {
            x: 0.375,
            z: 0,
            timeFactor: 0.375,
        },
        {
            x: 0.5,
            z: 0,
            timeFactor: 0.5,
        },
    ];


    tg.rm.pathMap.left = {};
    tg.rm.pathMap.left.fullPath = [{
            x: -0.125,
            z: 0,
            timeFactor: 0.125,
        },
        {
            x: -0.25,
            z: 0,
            timeFactor: 0.25,
        },
        {
            x: -0.375,
            z: 0,
            timeFactor: 0.375,
        },
        {
            x: -0.5,
            z: 0,
            timeFactor: 0.5,
        },
        {
            x: -0.625,
            z: 0,
            timeFactor: 0.625,
        },
        {
            x: -0.75,
            z: 0,
            timeFactor: 0.75,
        },
        {
            x: -0.875,
            z: 0,
            timeFactor: 0.875,
        },
        {
            x: -1,
            z: 0,
            timeFactor: 1
        },
    ];
    tg.rm.pathMap.left.halfPath = [{
            x: -0.125,
            z: 0,
            timeFactor: 0.125,
        },
        {
            x: -0.25,
            z: 0,
            timeFactor: 0.25,
        },
        {
            x: -0.375,
            z: 0,
            timeFactor: 0.375,
        },
        {
            x: -0.5,
            z: 0,
            timeFactor: 0.5,
        },
    ];

    tg.rm.pathMap.up = {};
    tg.rm.pathMap.up.fullPath = [{
            x: 0,
            z: 0.125,
            timeFactor: 0.125,
        },
        {
            x: 0,
            z: 0.25,
            timeFactor: 0.25,
        },
        {
            x: 0,
            z: 0.375,
            timeFactor: 0.375,
        },
        {
            x: 0,
            z: 0.5,
            timeFactor: 0.5,
        },
        {
            x: 0,
            z: 0.625,
            timeFactor: 0.625,
        },
        {
            x: 0,
            z: 0.75,
            timeFactor: 0.75,
        },
        {
            x: 0,
            z: 0.875,
            timeFactor: 0.875,
        },
        {
            x: 0,
            z: 1,
            timeFactor: 1
        },
    ];
    tg.rm.pathMap.up.halfPath = [{
            x: 0,
            z: 0.125,
            timeFactor: 0.125,
        },
        {
            x: 0,
            z: 0.25,
            timeFactor: 0.25,
        },
        {
            x: 0,
            z: 0.375,
            timeFactor: 0.375,
        },
        {
            x: 0,
            z: 0.5,
            timeFactor: 0.5,
        },
    ];

    tg.rm.pathMap.down = {};
    tg.rm.pathMap.down.fullPath = [{
            x: 0,
            z: -0.125,
            timeFactor: 0.125,
        },
        {
            x: 0,
            z: -0.25,
            timeFactor: 0.25,
        },
        {
            x: 0,
            z: -0.375,
            timeFactor: 0.375,
        },
        {
            x: 0,
            z: -0.5,
            timeFactor: 0.5,
        },
        {
            x: 0,
            z: -0.625,
            timeFactor: 0.625,
        },
        {
            x: 0,
            z: -0.75,
            timeFactor: 0.75,
        },
        {
            x: 0,
            z: -0.875,
            timeFactor: 0.875,
        },
        {
            x: 0,
            z: -1,
            timeFactor: 1
        },
    ];
    tg.rm.pathMap.down.halfPath = [{
            x: 0,
            z: -0.125,
            timeFactor: 0.125,
        },
        {
            x: 0,
            z: -0.25,
            timeFactor: 0.25,
        },
        {
            x: 0,
            z: -0.375,
            timeFactor: 0.375,
        },
        {
            x: 0,
            z: -0.5,
            timeFactor: 0.5,
        },
    ];

    tg.rm.pathMap.right.up = tg.rm.getCurvedPath({
        x: 1,
        z: 0
    }, {
        x: 1,
        z: 1
    }, );
    tg.rm.pathMap.right.down = tg.rm.getCurvedPath({
        x: 1,
        z: 0
    }, {
        x: 1,
        z: -1
    }, );

    tg.rm.pathMap.left.up = tg.rm.getCurvedPath({
        x: -1,
        z: 0
    }, {
        x: -1,
        z: 1
    }, );
    tg.rm.pathMap.left.down = tg.rm.getCurvedPath({
        x: -1,
        z: 0
    }, {
        x: -1,
        z: -1
    }, );

    tg.rm.pathMap.up.right = tg.rm.getCurvedPath({
        x: 0,
        z: 1
    }, {
        x: 1,
        z: 1
    }, );
    tg.rm.pathMap.up.left = tg.rm.getCurvedPath({
        x: 0,
        z: 1
    }, {
        x: -1,
        z: 1
    }, );

    tg.rm.pathMap.down.right = tg.rm.getCurvedPath({
        x: 0,
        z: -1
    }, {
        x: 1,
        z: -1
    }, );
    tg.rm.pathMap.down.left = tg.rm.getCurvedPath({
        x: 0,
        z: -1
    }, {
        x: -1,
        z: -1
    }, );
};

var createScene = function () {
	var scene = new BABYLON.Scene(engine);

	var camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 6, 50, BABYLON.Vector3.Zero(), scene)
	camera.attachControl(canvas, true)
	var light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene)

    var box = BABYLON.MeshBuilder.CreateBox("box", {size: 2}, scene);
    var mat = new BABYLON.StandardMaterial("mat1", scene);
    
    var texture = new BABYLON.Texture("https://upload.wikimedia.org/wikipedia/commons/8/87/Alaskan_Malamute%2BBlank.png", scene);
    texture.hasAlpha = true;
	texture.getAlphaFromRGB = true;
    
    mat.diffuseTexture = texture;
    mat.emissiveTexture = texture;
    mat.disableLighting = true;

    var f = new BABYLON.Vector4(0,0, 1, 1);
	
	var options = {
		sideOrientation: BABYLON.Mesh.DOUBLESIDE, // FRONTSIDE, BACKSIDE, DOUBLESIDE
        frontUVs: f,
		backUVs: f,
        // updatable: false,
		width: 4,
		height: 4,
	}

    function makeMesh(x, z) {
        // var m = BABYLON.Mesh.CreatePlane('', 4, scene);
        var m = BABYLON.MeshBuilder.CreatePlane("", options, scene);
        m.position.copyFromFloats(x, 0, z);
        m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        m.material = mat;
        return m;
    }

    var meshes = []
    meshes.push(makeMesh(5, 5))
    meshes.push(makeMesh(5, -5))
    meshes.push(makeMesh(-5, 5))
    meshes.push(makeMesh(-5, -5))
    
    var b = camera.beta
    var a = 0
    scene.registerBeforeRender(function() {
        // a += 0.05
        // camera.beta = b + 0.5 * Math.sin(a)
    })

	return scene;
};
