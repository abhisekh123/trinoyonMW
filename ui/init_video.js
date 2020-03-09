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


    // tg.cameraSavedPosition.x = tg.camera.position.x;
    // tg.cameraSavedPosition.y = tg.camera.position.y;
    // tg.cameraSavedPosition.z = tg.camera.position.z;
}


function initUI(){
    // alert('initVideo');
    createScene(); //Call the createScene function
    initialiseCamera();
    // createTextures();

//     var el = document.getElementsByTagName("canvas")[0];
//   el.addEventListener("touchstart", handleStart, false);
//   el.addEventListener("touchend", handleEnd, false);
//   el.addEventListener("touchcancel", handleCancel, false);
//   el.addEventListener("touchmove", handleMove, false);
// https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
   
}

function entrypoint(){
    
    initUI();
    tg.sendMessageToWS(tg.getEmptyMessagePacket('init_world'));
}