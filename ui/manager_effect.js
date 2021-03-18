
tg.effect = {};

tg.effect.addAbilityEffectSprite = function (abilityObject, characterID, positionParam, abilityConfig) {
    var key = abilityConfig.metaData.key;
    // tg.am[key] = new BABYLON.SpriteManager(
    // explosion sprite
    var explosionSprite = new BABYLON.Sprite('ability_' + abilityObject.action + '_' + characterID, tg.am[key]);
    explosionSprite.position.x = positionParam.x;
    // projectilePlane.position.y = tg.worldItems.uiConfig.hiddenY;
    explosionSprite.position.y = tg.worldItems.uiConfig.hiddenY;
    explosionSprite.position.z = positionParam.z;
    explosionSprite.isPickable = false;
    explosionSprite.width = abilityConfig.metaData.width;
    explosionSprite.height = abilityConfig.metaData.height;
    // sprite.angle = Math.PI/4;
    // sprite.invertU = -1;
    explosionSprite.cellIndex = abilityConfig.metaData.staticCellIndex;

    // explosionSprite.playAnimation(0, 15, true, 100);
    abilityObject[abilityConfig.metaData.key] = {
        sprite: explosionSprite,
        start: abilityConfig.metaData.startCellIndex,
        end: abilityConfig.metaData.endCellIndex,
        delay: abilityConfig.metaData.delay,
        visibleY: abilityConfig.metaData.visibleY
    }
};

tg.effect.processAbilityStateChangeEvent = function (botObject, updateItemConfig, abilityIndex, isUserBot, userBotIndex) {
    var abilityObject = botObject.ability[abilityIndex];
    var abilityConfig = tg.itemConfigs.abilityConfig[abilityObject.action];
    // console.log(abilityObject.action + '::ability state change for bot:', botObject.id);
    // console.log('current value:' + botObject[abilityObject.key] + ' New value:' + updateItemConfig[abilityObject.key]);

    if(isUserBot == true){
        if(updateItemConfig[abilityObject.key] == tg.worldItems.constants.ABILITY_AVAILABLE){
            $('#footer-image-ability-' + abilityIndex + '_' + userBotIndex).show();
        } else {
            $('#footer-image-ability-' + abilityIndex + '_' + userBotIndex).hide();
        }
    }
    // if botObject is same as currently selected bot the update bot ability button state
    if(tg.bot.userPlayerConfig.selectedBot != null && tg.bot.userPlayerConfig.selectedBot.id == botObject.id){ 
        var botObject = tg.bot.userPlayerConfig.selectedBot;
        var abilityButton = tg.hl.getHTMLElementByIndex(abilityIndex, 'right-column-button');

        if(updateItemConfig[abilityObject.key] == tg.worldItems.constants.ABILITY_AVAILABLE){
            tg.hl.enableDiv(abilityButton);
        } else {
            tg.hl.disableDiv(abilityButton);
        }
    }
    switch (abilityObject.action) {
        case 'sheild':
            var abilityEffectPlane = abilityObject[abilityConfig.metaData.key];
            if(updateItemConfig[abilityObject.key] == tg.worldItems.constants.ABILITY_ACTIVE){
                abilityEffectPlane.position.y = abilityObject.visibleY;
                abilityEffectPlane.position.x = 0;
                abilityEffectPlane.position.z = 0;
                abilityEffectPlane.parent = botObject.controlMesh;
                // abilityEffectPlane.position.y = 10;
                // abilityEffectPlane.position.x = botObject.controlMesh.position.x;
                // abilityEffectPlane.position.z = botObject.controlMesh.position.z;
                // abilityEffectPlane.parent = botObject.controlMesh;
            } else {
                abilityEffectPlane.position.y = tg.worldItems.uiConfig.hiddenY;
                abilityEffectPlane.parent = null;
            }
            break;
        case 'pulse':
            var abilityEffectSpriteConfig = abilityObject[abilityConfig.metaData.key];
            if(updateItemConfig[abilityObject.key] == tg.worldItems.constants.ABILITY_ACTIVE){
                abilityEffectSpriteConfig.sprite.position.x = botObject.controlMesh.position.x;
                abilityEffectSpriteConfig.sprite.position.z = botObject.controlMesh.position.z;
                abilityEffectSpriteConfig.sprite.position.y = abilityEffectSpriteConfig.visibleY;
                
                abilityEffectSpriteConfig.sprite.playAnimation(
                    abilityEffectSpriteConfig.start,
                    abilityEffectSpriteConfig.end,
                    false,
                    abilityEffectSpriteConfig.delay
                );
                
            } else {
                abilityEffectSpriteConfig.sprite.position.y = tg.worldItems.uiConfig.hiddenY;
                
            }
            break;
        case 'scorch':
            
            if(updateItemConfig[abilityObject.key] == tg.worldItems.constants.ABILITY_ACTIVE){
                var projectilePlane = abilityObject[abilityConfig.metaData.key];
                botObject.projectile = projectilePlane;
            } else {
                var projectilePlane = botObject.projectileData.plane;
                botObject.projectile = projectilePlane;
            }
            break;
        case 'retreat':
            var abilityEffectPlane = abilityObject[abilityConfig.metaData.key];
            if(updateItemConfig[abilityObject.key] == tg.worldItems.constants.ABILITY_ACTIVE){
                abilityEffectPlane.position.x = 0;
                abilityEffectPlane.position.z = 0;
                abilityEffectPlane.position.y = abilityObject.visibleY;
                abilityEffectPlane.parent = botObject.controlMesh;
            } else {
                abilityEffectPlane.position.y = tg.worldItems.uiConfig.hiddenY;
                abilityEffectPlane.parent = null;
            }
            break;
        default:
            break;
    }
};



tg.effect.addAbilityEffectPlane = function (abilityObject, characterID, positionParam, abilityConfig) {
    // console.log(abilityObject.action + '::tg.effect.addAbilityEffectPlane:', characterID);
    var faceUV = new BABYLON.Vector4(0, 0, 1, 1);

    var options = {
        sideOrientation: BABYLON.Mesh.DOUBLESIDE, // FRONTSIDE, BACKSIDE, DOUBLESIDE
        frontUVs: faceUV,
        backUVs: faceUV,
        // updatable: false,
        width: abilityConfig.metaData.cellDimension.width,
        height: abilityConfig.metaData.cellDimension.height,
    }

    var projectilePlane = BABYLON.MeshBuilder.CreatePlane('ability_' + abilityObject.action + '_' + characterID, options, tg.scene);
    // projectilePlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    projectilePlane.material = tg.am[abilityConfig.metaData.key];

    // console.log('=======->' + projectilePlane.isPickable);

    // projectilePlane.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
    // projectilePlane.bakeCurrentTransformIntoVertices();

    projectilePlane.position.x = positionParam.x;
    projectilePlane.position.y = tg.worldItems.uiConfig.hiddenY;
    // projectilePlane.position.y = 20;
    projectilePlane.position.z = positionParam.z;
    projectilePlane.isPickable = false;
    // projectile.material = tg.am[];

    // botObject.projectile = projectilePlane;
    // botObject.isProjectileActive = false;
    abilityObject[abilityConfig.metaData.key] = projectilePlane;
};



