
tg.animationmanager = {};

tg.animationmanager.actionToAnimationMap = {
    'ready': 'idleAnimation',
    'goto': 'runAnimation',
    'march': 'runAnimation',
    'die': 'dieAnimation',
    'spawn': 'spawnAnimation',
    'fight': 'attackAnimation',
};

tg.animationmanager.startCharacterAnimation = function(botObject, currentAction){
    if(botObject.animationAction == currentAction){
        // same action. nothing to do.
        return;
    }
    
    var animationObject = null;
    var animationPlayFlag = true;
    if(currentAction == 'die'){
        animationPlayFlag = false;
    }

    if(botObject.animationAction == 'die'){
        // console.log('spawn....', botObject.id);
        animationObject = botObject.animations[tg.animationmanager.actionToAnimationMap['spawn']];
        botObject.controlMesh.position.y = 0;
    } else {
        animationObject = botObject.animations[tg.animationmanager.actionToAnimationMap[currentAction]];
    }

    // if(currentAction == 'fight'){
    //     console.log('fight:', botObject.id);
    // }
    if(currentAction == 'die'){
        // console.log('die:', botObject.id);
        botObject.controlMesh.position.y = tg.worldItems.uiConfig.hiddenY;
    }

    botObject.animationAction = currentAction;

    botObject.animationGroups[animationObject.index].stop();
    botObject.animationGroups[animationObject.index].reset();
    if(animationObject.type == 'interval'){ // play a part of the animation.
        botObject.animationGroups[animationObject.index].start(animationPlayFlag,1,animationObject.from,animationObject.to);
    } else { // play entire animation
        botObject.animationGroups[animationObject.index].play(animationPlayFlag);
    }


};


