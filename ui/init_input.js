tg.input = {};
tg.input.keyMap = {}; //object for multiple key presses

tg.input.init = function() {
    // console.log('init input');

    //     var el = document.getElementsByTagName("canvas")[0];
    //   el.addEventListener("touchstart", handleStart, false);
    //   el.addEventListener("touchend", handleEnd, false);
    //   el.addEventListener("touchcancel", handleCancel, false);
    //   el.addEventListener("touchmove", handleMove, false);
    // https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
    
    tg.scene.actionManager = new BABYLON.ActionManager(tg.scene);

    tg.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, tg.input.OnKeyDownFunction));
    // tg.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
    //     tg.input.keyMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";

    // }));
    tg.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, tg.input.OnKeyUpFunction));

    tg.scene.onPointerDown = tg.input.onPointerDownFunction;
};

tg.input.onPointerDownFunction = function (evt, pickResult) {
    // We try to pick an object
    if (pickResult.hit) {
        // console.log('pickResult.pickedMesh.name:', pickResult.pickedMesh.name);
        // console.log('pickResult.pickedPoint:', pickResult.pickedPoint);
        if(pickResult.pickedMesh.name == 'world-floor'){
            if(tg.bot.userPlayerConfig.selectedBot != null){ // bot already selected. test for goto instruction.
                var gridX = Math.floor(pickResult.pickedPoint.x / tg.worldItems.uiConfig.playerDimensionBaseUnit);
                var gridZ = Math.floor(pickResult.pickedPoint.z / tg.worldItems.uiConfig.playerDimensionBaseUnit);
    
                tg.network.sendUserInstruction({x: gridX, z: gridZ});
                tg.am.targetMarker.position.x = pickResult.pickedPoint.x;
                tg.am.targetMarker.position.z = pickResult.pickedPoint.z;
                tg.am.targetMarker.position.y = 2;

                if (tg.bot.userPlayerConfig.clearSelectionTimer != null) {
                    clearTimeout(tg.bot.userPlayerConfig.clearSelectionTimer);
                }

                tg.bot.userPlayerConfig.clearSelectionTimer = setTimeout(() => {
                    tg.input.clearDestinationMarker();
                }, tg.worldItems.uiConfig.clearDestinationTimerInterval);
            }
        }else{
            var botIndex = tg.bot.userBotIdMap[pickResult.pickedMesh.name];
            // console.log('pickResult.pickedMesh.name:', pickResult.pickedMesh.name);
            if(botIndex != null && botIndex != undefined){
                tg.hl.selectSelfBot(botIndex, false);
            }
        }
    }
};

tg.input.clearDestinationMarker = function() {
    tg.bot.userPlayerConfig.clearDestinationTimer = null;
    tg.am.targetMarker.position.y = tg.worldItems.uiConfig.hiddenY;
};

tg.input.OnKeyDownFunction = function (evt) {
    // tg.music.play(); 
    tg.input.keyMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";

};

tg.input.OnKeyUpFunction = function (evt) {
    tg.input.keyMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
};
