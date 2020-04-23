function initInput() {
    console.log('init input');

    //     var el = document.getElementsByTagName("canvas")[0];
    //   el.addEventListener("touchstart", handleStart, false);
    //   el.addEventListener("touchend", handleEnd, false);
    //   el.addEventListener("touchcancel", handleCancel, false);
    //   el.addEventListener("touchmove", handleMove, false);
    // https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
    tg.input = {};
    tg.input.keyMap = {}; //object for multiple key presses
    tg.scene.actionManager = new BABYLON.ActionManager(tg.scene);

    tg.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        tg.input.keyMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";

    }));

    tg.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        tg.input.keyMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));

    tg.scene.onPointerDown = function (evt, pickResult) {
        // We try to pick an object
        if (pickResult.hit) {
            // console.log('pickResult.pickedMesh.name:', pickResult.pickedMesh.name);
            console.log('pickResult.pickedPoint:', pickResult.pickedPoint);
            if(tg.bot.userPlayerConfig.selectedBot != null){
                var gridX = Math.floor(pickResult.pickedPoint.x / tg.worldItems.uiConfig.playerDimensionBaseUnit);
                var gridZ = Math.floor(pickResult.pickedPoint.z / tg.worldItems.uiConfig.playerDimensionBaseUnit);

                tg.network.sendUserInstruction({x: gridX, z: gridZ});
            }
        }
    };
}