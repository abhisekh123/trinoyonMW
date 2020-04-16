
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
        animationObject = botObject.animations[tg.animationmanager.actionToAnimationMap['spawn']];
        botObject.controlMesh.position.y = 0;
    } else {
        animationObject = botObject.animations[tg.animationmanager.actionToAnimationMap[newAction]];
    }

    if(newAction == 'die'){
        // console.log('die:', botObject.id);
        botObject.controlMesh.position.y = tg.worldItems.uiConfig.hiddenY;
        // botObject.projectile.position.y = tg.worldItems.uiConfig.hiddenY;
    }

    botObject.animationGroups[animationObject.index].stop();
    botObject.animationGroups[animationObject.index].reset();
    if(animationObject.type == 'interval'){ // play a part of the animation.
        botObject.animationGroups[animationObject.index].start(animationPlayFlag,1,animationObject.from,animationObject.to);
    } else { // play entire animation
        botObject.animationGroups[animationObject.index].play(animationPlayFlag);
    }

    if(newAction != 'attack'){
        botObject.animationAction = newAction;
    } else {
        botObject.animationAction = 'ready';
    }
};


