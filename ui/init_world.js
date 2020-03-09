



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
    // console.log('tg.newRefreshFunction');
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
