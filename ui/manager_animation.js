
tg.animationmanager = {};

tg.animationmanager.actionToAnimationMap = {
    'ready': 'idleAnimation',
    'goto': 'runAnimation',
    'march': 'runAnimation',
    'die': 'dieAnimation',
    'spawn': 'spawnAnimation',
    'attack': 'attackAnimation',
};

tg.animationmanager.startCharacterAnimation = function(botObject, newAction){
    if(botObject.animationAction == newAction){
        // same action. nothing to do.
        return;
    }
    
    var currentAnimationObject = botObject.animations[tg.animationmanager.actionToAnimationMap[botObject.animationAction]];
    var animationObject = null;
    var animationPlayFlag = true;
    if(newAction == 'die' || newAction == 'attack'){
        animationPlayFlag = false;
    }

    // if(newAction == 'attack'){
    //     console.log('attack');
    // }

    if(botObject.animationAction == 'die'){
        // console.log('spawn....', botObject.id);
        tg.audio.playItemEventAudio(botObject, 'spawn');
        animationPlayFlag = false;
        animationObject = botObject.animations[tg.animationmanager.actionToAnimationMap['spawn']];
        botObject.controlMesh.position.y = 0;
    } else {
        animationObject = botObject.animations[tg.animationmanager.actionToAnimationMap[newAction]];
    }

    if(newAction == 'die'){
        tg.audio.playItemEventAudio(botObject, 'die');
        // console.log('die:', botObject.id);
        // botObject.controlMesh.position.y = tg.worldItems.uiConfig.hiddenY;
        // botObject.projectile.position.y = tg.worldItems.uiConfig.hiddenY;
    }
    for(var i = 0; i < botObject.animationGroups.length; ++i){
        botObject.animationGroups[i].stop();
        botObject.animationGroups[i].reset();
    }
    // botObject.animationGroups[currentAnimationObject.index].stop();
    // botObject.animationGroups[currentAnimationObject.index].reset();
    if(animationObject.type == 'interval'){ // play a part of the animation.
        // if(newAction == 'attack'){
        //     console.log('botObject.id:' + botObject.id + ' animationPlayFlag:' + animationPlayFlag);
        // }
        botObject.animationGroups[animationObject.index].start(animationPlayFlag,animationObject.speed,animationObject.from,animationObject.to);
    } else { // play entire animation
        // botObject.animationGroups[animationObject.index].play(animationPlayFlag);
        botObject.animationGroups[animationObject.index].start(
            animationPlayFlag,
            animationObject.speed,
            botObject.animationGroups[animationObject.index].from,
            botObject.animationGroups[animationObject.index].to
        );
    }

    if(newAction != 'attack'){
        botObject.animationAction = newAction;
    } else {
        botObject.animationAction = 'ready';
    }
};


// https://www.babylonjs-playground.com/#KTGKUQ#7
// Start all animations on given targets
// @param - loop defines if animations must loop
// @param - speedRatio defines the ratio to apply to animation speed (1 by default)
// @param - from defines the from key (optional)
// @param - to defines the to key (optional)
// @param - isAdditive defines the additive state for the resulting animatables (optional)
// @returns - the current animation group
// alert(animationGroups.length); // 8 
// animationGroups.forEach(function (animationGroup) {
//     animationGroup.start(false, 1, 131 / 30, 160 / 30);
// });
// alert(animationGroups[0].from); 0
// alert(animationGroups[0].to); 6.9
// alert(animationGroups[0].speedRatio);
// animationGroups[0].start(true,10,5,6,false);
// scene.createDefaultCameraOrLight(true, true, true);
// scene.createDefaultEnvironment();
// currentScene.animationGroups[0].start(true,1,5,6);
// currentScene.animationGroups[0].stop()
// currentScene.animationGroups[0].reset()
// currentScene.animationGroups[0].stop();currentScene.animationGroups[0].reset();currentScene.animationGroups[1].start(true,1,5,6);
