/**
 * init world and init persistant 3D components
 */


/******* Add the create scene function ******/
function createScene() {
    tg.canvas = document.getElementById('tc'); // Get the canvas element 
    tg.engine = new BABYLON.Engine(tg.canvas, true); // Generate the BABYLON 3D engine

    // Create the scene space
    tg.scene = new BABYLON.Scene(tg.engine);

    // Register a render loop to repeatedly render the scene
    tg.engine.runRenderLoop(function () { 
        tg.refreshUI();
        tg.scene.render();
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () { 
        tg.engine.resize();
    });

    return tg.scene;
};

tg.refreshUI = function(){
    //placeholder function.will be replaced by other methods.
    console.log('refreshUI');
    
}

function initialiseCamera() {
    // tg.camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, 
    //     new BABYLON.Vector3(44.5 * tg.playerDimensionBaseUnit, 3 * tg.playerDimensionBaseUnit, 100 * tg.playerDimensionBaseUnit), tg.scene);
    
    // Parameters: name, position, scene
    tg.camera = new BABYLON.FollowCamera("Camera", new BABYLON.Vector3(0, 10, -10), tg.scene);
    // //The goal distance of camera from target
	tg.camera.radius = 90;
	
	// // The goal height of camera above local origin (centre) of target
	tg.camera.heightOffset = 55;
	
	// // The goal rotation of camera around local origin (centre) of target in x y plane
	tg.camera.rotationOffset = 0;
	
	// //Acceleration of camera in moving from current to goal position
	// tg.camera.cameraAcceleration = 0.002
	
	// //The speed at which acceleration is halted 
    // tg.camera.maxCameraSpeed = 5
    
    tg.camera.attachControl(tg.canvas, true);

    // tg.camera2 = new BABYLON.ArcRotateCamera("camera2",  3 * Math.PI / 8, 3 * Math.PI / 8, 400, new BABYLON.Vector3(0, 10, -10), tg.scene);
    // tg.camera2.attachControl(tg.canvas, true);
    // tg.camera2.position = new BABYLON.Vector3(0, 500, 500);
    // // Two Viewports
    // tg.camera.viewport = new BABYLON.Viewport(0, 0, 1, 1);
    // tg.camera2.viewport = new BABYLON.Viewport(0, 0.8, 0.2, 0.2);

    // tg.scene.activeCameras.push(tg.camera);
    // tg.scene.activeCameras.push(tg.camera2);
}


function initUI(){
    // alert('initVideo');
    createScene(); //Call the createScene function
    initialiseCamera();
    // createTextures();
}

function entrypoint(){
    
    initUI();
    initInput();
    tg.sendMessageToWS(tg.getEmptyMessagePacket('init_world'));
}