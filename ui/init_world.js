



function createAmbience() {
    
 
    var light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), tg.scene);
	light.diffuse = new BABYLON.Color3(1, 1, 1);
	light.specular = new BABYLON.Color3(1, 1, 1);
    light.groundColor = new BABYLON.Color3(1, 1, 1);

    tg.light2 = light;

    // tg.camera.target = tg.am.ground.position;
}



// custom function exevuted in render loop.
tg.newRefreshFunction = function() {
    
    if(tg.isGameLive == true){
        var gridSide = tg.worldItems.gridSide * tg.worldItems.uiConfig.playerDimensionBaseUnit;
        
        if ((tg.input.keyMap["s"] || tg.input.keyMap["S"])) {
            console.log('w');
            tg.am.cameraTarget.position.z += tg.worldItems.uiConfig.cameraTargetMovementStep;
            if(tg.am.cameraTarget.position.z > gridSide){
                tg.am.cameraTarget.position.z = gridSide;
            }
        };

        if ((tg.input.keyMap["w"] || tg.input.keyMap["W"])) {
            console.log('s');
            tg.am.cameraTarget.position.z -= tg.worldItems.uiConfig.cameraTargetMovementStep;
            if(tg.am.cameraTarget.position.z < 0){
                tg.am.cameraTarget.position.z = 0;
            }
        };

        if ((tg.input.keyMap["d"] || tg.input.keyMap["D"])) {
            console.log('a');
            tg.am.cameraTarget.position.x -= tg.worldItems.uiConfig.cameraTargetMovementStep;
            if(tg.am.cameraTarget.position.x < 0){
                tg.am.cameraTarget.position.x = 0;
            }
        };
        if ((tg.input.keyMap["a"] || tg.input.keyMap["A"])) {
            console.log('d');
            tg.am.cameraTarget.position.x += tg.worldItems.uiConfig.cameraTargetMovementStep;
            if(tg.am.cameraTarget.position.x > gridSide){
                tg.am.cameraTarget.position.x = gridSide;
            }
        };

        
    }
}

function entrypoint() {
    tg.refreshUI = tg.newRefreshFunction;
    tg.pn.init();
    createAmbience();
    tg.am.init();

    // tg.scene.registerAfterRender(function () {
    //     tg.updateCharacterStateBeforeRender();
    // });

    tg.isGameLive = false;
}
