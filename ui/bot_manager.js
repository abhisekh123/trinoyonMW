

tg.bm = {};


tg.startCharacterAnimation = function(characterConfig, currentAction, animationPlayFlag){
    if(animationPlayFlag == null || animationPlayFlag == undefined){
        animationPlayFlag = true;
    }
    var isCharacter = true;
    // var characterConfig = tg.characterConfig[id];
    var characterTypeConfig = itemConfigs.items[characterConfig.characterName];
    if(characterTypeConfig == null ||characterConfig == undefined){
        isCharacter = false;
    }
    switch(currentAction){
        case'goto':
            if(!isCharacter){
                break;
            }
            characterConfig.action = 'goto';
            if(characterConfig.currentAnimation != characterTypeConfig.runAnimationIndex){
                characterConfig.animationGroups[characterConfig.currentAnimation].reset();
                characterConfig.animationGroups[characterConfig.currentAnimation].stop();
                characterConfig.animationGroups[characterTypeConfig.runAnimationIndex].play(animationPlayFlag);
                characterConfig.currentAnimation = characterTypeConfig.runAnimationIndex;
            }
            break;
        case 'idle':
            if(!isCharacter){
                break;
            }
            characterConfig.action = 'idle';
            if(characterConfig.currentAnimation != characterTypeConfig.idleAnimationIndex){
                characterConfig.animationGroups[characterConfig.currentAnimation].reset();
                characterConfig.animationGroups[characterConfig.currentAnimation].stop();
                characterConfig.animationGroups[characterTypeConfig.idleAnimationIndex].play(animationPlayFlag);
                characterConfig.currentAnimation = characterTypeConfig.idleAnimationIndex;
            }
            break;
        case 'attack':
            if(!isCharacter){
                break;
            }
            characterConfig.action = 'attack';
            if(characterConfig.currentAnimation != characterTypeConfig.attackAnimationIndex){
                characterConfig.animationGroups[characterConfig.currentAnimation].reset();
                characterConfig.animationGroups[characterConfig.currentAnimation].stop();
                characterConfig.animationGroups[characterTypeConfig.attackAnimationIndex].play(animationPlayFlag);
                characterConfig.currentAnimation = characterTypeConfig.attackAnimationIndex;
            }
            break;
        case 'die':
            if(!isCharacter){
                // break;
                // characterConfig.residue.position.x = positionParam.x;
                characterConfig.residue.position.y = tg.playerDimensionBaseUnit;
                // characterConfig.residue.position.z = positionParam.z;
            }else{
                if(characterConfig.currentAnimation != characterTypeConfig.dieAnimationIndex){
                    characterConfig.animationGroups[characterConfig.currentAnimation].reset();
                    characterConfig.animationGroups[characterConfig.currentAnimation].stop();
                    characterConfig.animationGroups[characterTypeConfig.dieAnimationIndex].play(animationPlayFlag);
                    characterConfig.currentAnimation = characterTypeConfig.dieAnimationIndex;
                }
            }
            characterConfig.action = 'die';
            
            tg.hideMeshFromVisiblePlane(characterConfig.parentMesh);
            break;
        case 'spawn':
            if(!isCharacter){
                break;
            }
            characterConfig.action = 'spawn';
            if(characterConfig.currentAnimation != characterTypeConfig.idleAnimationIndex){
                characterConfig.animationGroups[characterConfig.currentAnimation].reset();
                characterConfig.animationGroups[characterConfig.currentAnimation].stop();
                characterConfig.animationGroups[characterTypeConfig.idleAnimationIndex].play(animationPlayFlag);
                characterConfig.currentAnimation = characterTypeConfig.idleAnimationIndex;
            }
            tg.showMeshToVisiblePlane(characterConfig.parentMesh);
            break;
        default:
            // console.log('ERROR:Unknown action:' + currentAction + ' for character:' + characterConfig.id);
    }
    // characterConfig.animation = animationName;
    // characterConfig.isAnimated = true;
    // characterConfig.animStartTime = Date.now();
    // characterConfig.gridCoordinate = tg.getGridCoordinateFromPointerPosition(characterConfig.mesh.position);
};

