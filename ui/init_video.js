/**
 * init world and init persistant 3D components
 */

tg.video = {};
/******* Add the create scene function ******/
tg.createScene = function() {
    tg.canvas = document.getElementById('tc'); // Get the canvas element 
    tg.engine = new BABYLON.Engine(tg.canvas, true); // Generate the BABYLON 3D engine

    // Create the scene space
    tg.scene = new BABYLON.Scene(tg.engine);
    tg.scene.autoClear = false; // Color buffer
    tg.scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously
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
    
};

tg.initialiseCamera = function() {
    // tg.camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, 
    //     new BABYLON.Vector3(44.5 * tg.playerDimensionBaseUnit, 3 * tg.playerDimensionBaseUnit, 100 * tg.playerDimensionBaseUnit), tg.scene);
    
    // Parameters: name, position, scene
    tg.camera = new BABYLON.FollowCamera("Camera", new BABYLON.Vector3(0, 10, -10), tg.scene);
    // //The goal distance of camera from target
	tg.camera.radius = 90;
	
	// // The goal height of camera above local origin (centre) of target
	tg.camera.heightOffset = 35;
	
	// // The goal rotation of camera around local origin (centre) of target in x y plane
	tg.camera.rotationOffset = 0;
	
	// //Acceleration of camera in moving from current to goal position
	// tg.camera.cameraAcceleration = 0.002
	
	// //The speed at which acceleration is halted 
    // tg.camera.maxCameraSpeed = 5
    
    // tg.camera.attachControl(tg.canvas, true);

    // tg.camera2 = new BABYLON.ArcRotateCamera("camera2",  3 * Math.PI / 8, 3 * Math.PI / 8, 400, new BABYLON.Vector3(0, 10, -10), tg.scene);
    // tg.camera2.attachControl(tg.canvas, true);
    // tg.camera2.position = new BABYLON.Vector3(0, 500, 500);
    // // Two Viewports
    // tg.camera.viewport = new BABYLON.Viewport(0, 0, 1, 1);
    // tg.camera2.viewport = new BABYLON.Viewport(0, 0.8, 0.2, 0.2);

    // tg.scene.activeCameras.push(tg.camera);
    // tg.scene.activeCameras.push(tg.camera2);
};


tg.initUI = function(){
    // alert('initVideo');
    tg.createScene();
    tg.initialiseCamera();
    // createTextures();
};

tg.initVideo = function(){
    tg.initUI();
    tg.input.init();
    
};

function entrypoint(){
    tg.initVideo();
    tg.sendMessageToWS(tg.getEmptyMessagePacket('init_world'));
};

tg.video.leftJoystickActive = false;
tg.video.rightJoystickActive = false;

tg.video.cameraPan = function(angleParam){
    console.log('camera pan:', angleParam);
    tg.video.moveCameraSideway(Math.cos(angleParam));
    tg.video.moveCameraStraight(-Math.sin(angleParam));
};

tg.video.cameraChangeView = function(angleParam){
    console.log('camera view:', angleParam);
    tg.video.cameraRotate(Math.cos(angleParam));
    tg.video.cameraZoom(-Math.sin(angleParam));
};

tg.video.moveCameraSideway = function(factorParam){
    tg.am.cameraTarget.position.x += tg.worldItems.uiConfig.sideX * factorParam;
    tg.am.cameraTarget.position.z += tg.worldItems.uiConfig.sideZ * factorParam;

    if(tg.am.cameraTarget.position.z > tg.worldItems.calculatedGridSide){
        tg.am.cameraTarget.position.z = tg.worldItems.calculatedGridSide;
    }
    if(tg.am.cameraTarget.position.x > tg.worldItems.calculatedGridSide){
        tg.am.cameraTarget.position.x = tg.worldItems.calculatedGridSide;
    }
    if(tg.am.cameraTarget.position.z < 0){
        tg.am.cameraTarget.position.z = 0;
    }
    if(tg.am.cameraTarget.position.x < 0){
        tg.am.cameraTarget.position.x = 0;
    }
};

tg.video.moveCameraStraight = function(factorParam){
    tg.am.cameraTarget.position.x += tg.worldItems.uiConfig.forewardX * factorParam;
    tg.am.cameraTarget.position.z += tg.worldItems.uiConfig.forewardZ * factorParam;

    if(tg.am.cameraTarget.position.z > tg.worldItems.calculatedGridSide){
        tg.am.cameraTarget.position.z = tg.worldItems.calculatedGridSide;
    }
    if(tg.am.cameraTarget.position.x > tg.worldItems.calculatedGridSide){
        tg.am.cameraTarget.position.x = tg.worldItems.calculatedGridSide;
    }
    if(tg.am.cameraTarget.position.z < 0){
        tg.am.cameraTarget.position.z = 0;
    }
    if(tg.am.cameraTarget.position.x < 0){
        tg.am.cameraTarget.position.x = 0;
    }
};

tg.video.cameraRotate = function(factorParam){
    tg.camera.rotationOffset += tg.worldItems.uiConfig.cameraTargetRotationStep * factorParam;
    
    if(tg.camera.rotationOffset > 359){
        tg.camera.rotationOffset = 0;
    }
    if(tg.camera.rotationOffset < 0){
        tg.camera.rotationOffset = 359;
    }
    // tg.camera2.rotationOffset = tg.camera.rotationOffset;
    tg.calculateCameraMovementSteps();
};


tg.video.cameraZoom = function(factorParam){
    tg.camera.radius += tg.worldItems.uiConfig.cameraRadiusStep * factorParam;
    tg.camera.heightOffset += tg.worldItems.uiConfig.cameraHeightStep * factorParam;
    
    if(tg.camera.radius > tg.worldItems.uiConfig.maxCameraRadius){
        tg.camera.radius = tg.worldItems.uiConfig.maxCameraRadius;
    }
    if(tg.camera.heightOffset > tg.worldItems.uiConfig.maxCameraHeight){
        tg.camera.heightOffset = tg.worldItems.uiConfig.maxCameraHeight;
    }
    if(tg.camera.radius < tg.worldItems.uiConfig.minCameraRadius){
        tg.camera.radius = tg.worldItems.uiConfig.minCameraRadius;
    }
    if(tg.camera.heightOffset < tg.worldItems.uiConfig.minCameraHeight){
        tg.camera.heightOffset = tg.worldItems.uiConfig.minCameraHeight;
    }
};

// tg.video.moveCameraLeft = function(){

//     tg.am.cameraTarget.position.x -= tg.worldItems.uiConfig.sideX;
//     tg.am.cameraTarget.position.z -= tg.worldItems.uiConfig.sideZ;

//     if(tg.am.cameraTarget.position.z > tg.worldItems.calculatedGridSide){
//         tg.am.cameraTarget.position.z = tg.worldItems.calculatedGridSide;
//     }
//     if(tg.am.cameraTarget.position.x > tg.worldItems.calculatedGridSide){
//         tg.am.cameraTarget.position.x = tg.worldItems.calculatedGridSide;
//     }
//     if(tg.am.cameraTarget.position.z < 0){
//         tg.am.cameraTarget.position.z = 0;
//     }
//     if(tg.am.cameraTarget.position.x < 0){
//         tg.am.cameraTarget.position.x = 0;
//     }
// };
// tg.video.moveCameraRight = function(){
//     tg.am.cameraTarget.position.x += tg.worldItems.uiConfig.sideX;
//     tg.am.cameraTarget.position.z += tg.worldItems.uiConfig.sideZ;

//     if(tg.am.cameraTarget.position.z > tg.worldItems.calculatedGridSide){
//         tg.am.cameraTarget.position.z = tg.worldItems.calculatedGridSide;
//     }
//     if(tg.am.cameraTarget.position.x > tg.worldItems.calculatedGridSide){
//         tg.am.cameraTarget.position.x = tg.worldItems.calculatedGridSide;
//     }
//     if(tg.am.cameraTarget.position.z < 0){
//         tg.am.cameraTarget.position.z = 0;
//     }
//     if(tg.am.cameraTarget.position.x < 0){
//         tg.am.cameraTarget.position.x = 0;
//     }

// };
// tg.video.moveCameraForeward = function(){
//     tg.am.cameraTarget.position.x -= tg.worldItems.uiConfig.forewardX;
//     tg.am.cameraTarget.position.z -= tg.worldItems.uiConfig.forewardZ;

//     if(tg.am.cameraTarget.position.z > tg.worldItems.calculatedGridSide){
//         tg.am.cameraTarget.position.z = tg.worldItems.calculatedGridSide;
//     }
//     if(tg.am.cameraTarget.position.x > tg.worldItems.calculatedGridSide){
//         tg.am.cameraTarget.position.x = tg.worldItems.calculatedGridSide;
//     }
//     if(tg.am.cameraTarget.position.z < 0){
//         tg.am.cameraTarget.position.z = 0;
//     }
//     if(tg.am.cameraTarget.position.x < 0){
//         tg.am.cameraTarget.position.x = 0;
//     }

// };
// tg.video.moveCameraBackward = function(){
//     tg.am.cameraTarget.position.x += tg.worldItems.uiConfig.forewardX;
//     tg.am.cameraTarget.position.z += tg.worldItems.uiConfig.forewardZ;

//     if(tg.am.cameraTarget.position.z > tg.worldItems.calculatedGridSide){
//         tg.am.cameraTarget.position.z = tg.worldItems.calculatedGridSide;
//     }
//     if(tg.am.cameraTarget.position.x > tg.worldItems.calculatedGridSide){
//         tg.am.cameraTarget.position.x = tg.worldItems.calculatedGridSide;
//     }
//     if(tg.am.cameraTarget.position.z < 0){
//         tg.am.cameraTarget.position.z = 0;
//     }
//     if(tg.am.cameraTarget.position.x < 0){
//         tg.am.cameraTarget.position.x = 0;
//     }

// };
// tg.video.rotateCameraLeft = function(){
//     tg.camera.rotationOffset -= tg.worldItems.uiConfig.cameraTargetRotationStep;
//     if(tg.camera.rotationOffset < 0){
//         tg.camera.rotationOffset = 359;
//     }
//     // tg.camera2.rotationOffset = tg.camera.rotationOffset;
//     tg.calculateCameraMovementSteps();
// };
// tg.video.rotateCameraRight = function(){
//     tg.camera.rotationOffset += tg.worldItems.uiConfig.cameraTargetRotationStep;
    
//     if(tg.camera.rotationOffset > 359){
//         tg.camera.rotationOffset = 0;
//     }
//     // tg.camera2.rotationOffset = tg.camera.rotationOffset;
//     tg.calculateCameraMovementSteps();
// };
// tg.video.moveCameraNear = function(){
//     tg.camera.radius -= tg.worldItems.uiConfig.cameraRadiusStep;
//     tg.camera.heightOffset -= tg.worldItems.uiConfig.cameraHeightStep;
//     if(tg.camera.radius < tg.worldItems.uiConfig.minCameraRadius){
//         tg.camera.radius = tg.worldItems.uiConfig.minCameraRadius;
//     }
//     if(tg.camera.heightOffset < tg.worldItems.uiConfig.minCameraHeight){
//         tg.camera.heightOffset = tg.worldItems.uiConfig.minCameraHeight;
//     }
// };
// tg.video.moveCameraAway = function(){
//     tg.camera.radius += tg.worldItems.uiConfig.cameraRadiusStep;
//     tg.camera.heightOffset += tg.worldItems.uiConfig.cameraHeightStep;
    
//     if(tg.camera.radius > tg.worldItems.uiConfig.maxCameraRadius){
//         tg.camera.radius = tg.worldItems.uiConfig.maxCameraRadius;
//     }
//     if(tg.camera.heightOffset > tg.worldItems.uiConfig.maxCameraHeight){
//         tg.camera.heightOffset = tg.worldItems.uiConfig.maxCameraHeight;
//     }
// };
