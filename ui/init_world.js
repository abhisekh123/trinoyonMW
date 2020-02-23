


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




function createAmbience() {
    
 
    var light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), tg.scene);
	light.diffuse = new BABYLON.Color3(1, 1, 1);
	light.specular = new BABYLON.Color3(1, 1, 1);
    light.groundColor = new BABYLON.Color3(1, 1, 1);

    tg.light2 = light;
    
    addStaticItems();

    tg.camera.target = tg.ground.position;
}



tg.newRefreshFunction = function() {
    console.log('tg.newRefreshFunction');
}

function entrypoint() {
    // tg.refreshUI = tg.newRefreshFunction;
    createAmbience();

    // tg.updateWorld = updateWorld;
    
    // showHomePage();
    // GUI
    // tg.initPageViewManager();

    // showLandingPage();

    // tg.scene.registerAfterRender(function () {
    //     tg.updateCharacterStateBeforeRender();
    // });
}
