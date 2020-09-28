/**
 * manage assets related to gameplay: 3D assets, audio, etc
 */

tg.am = {};

tg.am.onLoadCompleteActionHandler = function() {
    switch (tg.am.onLoadComplete) {
        case 'show_home_page':
            // if (tg.isGameLive == false) {
            //     tg.showHomePage();
            // }
            tg.pn.showHomePage();
            tg.audio.playAudio(tg.audio.menu);
            break;
        case 'show_match_page':
            tg.world.handleNewMatchStartReadyTrigger();
            break;

        default:
            break;
    }
};

// tg.am.populateAssetArray = function(assetArray, keyParam, urlParam){
//     assetArray.push({url: urlParam, key: keyParam});
// };

tg.am.preloadAssets = function(){
    var totalAssetsTobeLoaded = 0;
    var assetArray = [];

    // gather assets to be pre loaded
    // lion
    
    assetArray.push({
        url: tg.itemConfigs.items.lion.audioFile,
        key: 'lion-audio',
    });
    // swordman
    assetArray.push({
        url: tg.itemConfigs.items.swordman.audioFile,
        key: 'swordman-audio',
    });
    // archer
    assetArray.push({
        url: tg.itemConfigs.items.archer.audioFile,
        key: 'archer-audio',
    });
    // assetArray.push({
    //     url: tg.itemConfigs.items.archer.projectile.image,
    //     key: 'archer-projectile',
    // });
    // base
    assetArray.push({
        url: tg.itemConfigs.items.base.audioFile,
        key: 'base-audio',
    });
    // assetArray.push({
    //     url: tg.itemConfigs.items.base.projectile.image,
    //     key: 'base-projectile',
    // });
    // tower
    assetArray.push({
        url: tg.itemConfigs.items.tower.audioFile,
        key: 'tower-audio',
    });
    // assetArray.push({
    //     url: tg.itemConfigs.items.tower.projectile.image,
    //     key: 'tower-projectile',
    // });

    totalAssetsTobeLoaded = assetArray.length;

    for(var i = 0; i < assetArray.length; ++i){
        var binaryTask = tg.am.bam.addBinaryFileTask(assetArray[i].key, assetArray[i].url);
        binaryTask.onSuccess = function (task) {
            // Do something with task.data
            // console.log(task);
            tg.am.updateNewAssetLoaded(1);
        }
    }

    tg.am.bam.load();

    tg.am.bam.onFinish = function (tasks) {
        // DO nothing for now.
        // tg.am.bam.reset();
        console.log('babylon task loader completed task.');
	};

    return totalAssetsTobeLoaded;
}

tg.am.updateNewAssetLoaded = function(count){
    // console.log('tg.am.updateNewAssetLoaded');
    tg.am.totalAssetsLoaded_tillNow += count;
    tg.pv.refreshAssetLoadedAlert(tg.am.totalAssetsLoaded_tillNow, tg.am.totalAssetsToBeLoaded);

    if(tg.am.totalAssetsLoaded_tillNow >= tg.am.totalAssetsToBeLoaded){
        // console.log('(tg.am.totalAssetsLoaded_tillNow >= tg.am.totalAssetsToBeLoaded)');
        tg.am.onLoadCompleteActionHandler();
    }
};

tg.am.getMaterialsForPlane = function(configParam, idPrefix){
    var key = configParam.key;
    var filePath = configParam.file;
    var newId = idPrefix + key;
    var material = new BABYLON.StandardMaterial(newId, tg.scene);

    var projectileTexture = new BABYLON.Texture(filePath, tg.scene);
    projectileTexture.hasAlpha = true;
    projectileTexture.getAlphaFromRGB = true;

    material.diffuseTexture = projectileTexture;
    material.emissiveTexture = projectileTexture;
    
    material.disableLighting = true;
    material.freeze();
    tg.am[newId] = material;
};

tg.am.createMaterials = function () {
    // console.log('creating materials');

    // material for crates
    var boxMaterial = new BABYLON.StandardMaterial("material_box", tg.scene);

    // boxMaterial.emissiveTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);
    // boxMaterial.emissiveTexture = new BABYLON.Texture("static/img/stone_floor5.jpg", tg.scene);
    // boxMaterial.emissiveColor = new BABYLON.Color3(45/256, 62/256, 50/256);
    boxMaterial.diffuseColor = new BABYLON.Color3(45/256, 62/256, 50/256);
    // boxMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.3, 0.3);
    // boxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    // boxMaterial.specularTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);
    // boxMaterial.emissiveTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);
    // boxMaterial.ambientTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);
    // boxMaterial.disableLighting = true;
    boxMaterial.freeze();
    tg.am.boxMaterial = boxMaterial;

    // material for projectiles
    for(var i = 0; i < tg.itemConfigs.projectiles.length; ++i){
        tg.am.getMaterialsForPlane(tg.itemConfigs.projectiles[i], 'material_projectile_');
    }

    // material for planes
    for(var i = 0; i < tg.itemConfigs.planes.length; ++i){
        tg.am.getMaterialsForPlane(tg.itemConfigs.planes[i], 'material_plane_');
    }

    // material for ability effect
    const itemKeyArray = tg.uu.getObjectKeys(tg.itemConfigs.abilityConfig);
    for(var i = 0; i < itemKeyArray.length; ++i){
        var abilityConfig = tg.itemConfigs.abilityConfig[itemKeyArray[i]];

        if(abilityConfig.metaData.type != 'plane'){
            continue;
        }

        var paramConfig = {
            file: abilityConfig.metaData.file,
            key: abilityConfig.metaData.key,
        }
        tg.am.getMaterialsForPlane(paramConfig, '');
    }

    // sprite for effects
    for(var i = 0; i < tg.itemConfigs.effectSprites.length; ++i){
        var key = 'sprite_manager_' + tg.itemConfigs.effectSprites[i].key;
        tg.am[key] = new BABYLON.SpriteManager(
            key,
            tg.itemConfigs.effectSprites[i].file,
            tg.itemConfigs.effectSprites[i].capacity,
            tg.itemConfigs.effectSprites[i].cellDimension,
            tg.scene
        );
    }

    // material for ground
    var groundMaterial = new BABYLON.StandardMaterial("material_ground", tg.scene);

    // // groundMaterial.emissiveTexture = new BABYLON.Texture("static/img/stone_floor6.jpg", tg.scene);
    // groundMaterial.emissiveTexture = new BABYLON.Texture("static/img/grass.png", tg.scene);
    // groundMaterial.emissiveTexture.uScale = tg.worldItems.gridSide / 8;
    // groundMaterial.emissiveTexture.vScale = tg.worldItems.gridSide / 8;

    groundMaterial.emissiveColor = new BABYLON.Color3(20/256, 20/256, 40/256);
    // groundMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.3);
    // material_sky.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.5);
    // material_sky.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.5);

    groundMaterial.disableLighting = true;
    groundMaterial.freeze();
    tg.am.groundMaterial = groundMaterial;
    // tg.am.groundMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.3);

    var material_sky = new BABYLON.StandardMaterial('material_sky', tg.scene);
    // material_sky.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.5);
    material_sky.emissiveColor = new BABYLON.Color3(0.4, 0.4, 0.55);
    // material_sky.emissiveColor = new BABYLON.Color3(198/256, 230/256, 245/256);
    material_sky.backFaceCulling = false;
    material_sky.disableLighting = true;
    // material_sky.needDepthPrePass = true;
    // material_sky.alpha = 0.7;
    // material_semitransparent_blue.freeze();
    material_sky.disableLighting = true;
    material_sky.freeze();
    tg.material_sky = material_sky;

    // var materialGround = new BABYLON.StandardMaterial('ground_test', tg.scene);
    // materialGround.diffuseColor = new BABYLON.Color3(90/255, 90/255, 90/255);
    // materialGround.emissiveColor = new BABYLON.Color3(90/255, 90/255, 90/255);
    // materialGround.alpha = 0.5;

    var material_semitransparent_blue = new BABYLON.StandardMaterial('material_semitransparent_blue', tg.scene);
    material_semitransparent_blue.emissiveColor = BABYLON.Color3.Blue();
    // material_semitransparent_blue.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material_semitransparent_blue.backFaceCulling = false;
    material_semitransparent_blue.needDepthPrePass = true;
    material_semitransparent_blue.alpha = 0.7;
    material_semitransparent_blue.disableLighting = true;
    // material_semitransparent_blue.freeze();
    tg.am.material_semitransparent_blue = material_semitransparent_blue;

    var material_semitransparent_red = new BABYLON.StandardMaterial('material_semitransparent_red', tg.scene);
    material_semitransparent_red.emissiveColor = BABYLON.Color3.Red();
    // material_semitransparent_red.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material_semitransparent_red.backFaceCulling = false;
    material_semitransparent_red.needDepthPrePass = true;
    material_semitransparent_red.disableLighting = true;
    material_semitransparent_red.alpha = 0.5;
    // material_semitransparent_red.freeze();
    tg.am.material_semitransparent_red = material_semitransparent_red;


    var material_semitransparent_projectile = new BABYLON.StandardMaterial('material_semitransparent_projectile', tg.scene);
    // material_semitransparent_projectile.diffuseColor = new BABYLON.Color3(1, 0.65, 0);
    material_semitransparent_projectile.emissiveColor = new BABYLON.Color3(1, 0.65, 0);
    material_semitransparent_projectile.disableLighting = true;
    material_semitransparent_projectile.freeze();
    tg.am.material_semitransparent_projectile = material_semitransparent_projectile;

    var material_semitransparent_towerprojectile = new BABYLON.StandardMaterial('material_semitransparent_towerprojectile', tg.scene);
    // material_semitransparent_towerprojectile.diffuseColor = new BABYLON.Color3(1, 0, 0);
    material_semitransparent_towerprojectile.emissiveColor = new BABYLON.Color3(1, 0, 0);
    material_semitransparent_towerprojectile.freeze();
    material_semitransparent_towerprojectile.disableLighting = true;
    tg.am.material_semitransparent_towerprojectile = material_semitransparent_towerprojectile;

    var material_semitransparent_chosen = new BABYLON.StandardMaterial('material_semitransparent_chosen', tg.scene);
    material_semitransparent_chosen.emissiveColor = new BABYLON.Color3(0.7, 0.7, 0.9);
    // material_semitransparent_chosen.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material_semitransparent_chosen.backFaceCulling = false;
    material_semitransparent_chosen.needDepthPrePass = true;
    material_semitransparent_chosen.alpha = 0.6;
    material_semitransparent_chosen.disableLighting = true;
    // material_semitransparent_chosen.freeze();
    tg.am.material_semitransparent_chosen = material_semitransparent_chosen;

    var material_transparent = new BABYLON.StandardMaterial('material_transparent', tg.scene);
    // material_transparent.diffuseColor = new BABYLON.Color3(0, 0, 0);
    material_transparent.emissiveColor = new BABYLON.Color3(0, 0, 0);
    material_transparent.backFaceCulling = false;
    material_transparent.needDepthPrePass = true;
    material_transparent.alpha = 0;
    material_transparent.disableLighting = true;
    // material_transparent.freeze();
    tg.am.material_transparent = material_transparent;

    // tg.material_semitransparent_blue = material_semitransparent_blue;
    // tg.material_semitransparent_red = material_semitransparent_red;
    // tg.material_semitransparent_chosen = material_semitransparent_chosen;
    // tg.material_character_parent = material_character_parent;
    

    var material_enemy_marker = new BABYLON.StandardMaterial('material_enemy_marker', tg.scene);
    // material_enemy_marker.diffuseColor = BABYLON.Color3.Blue();
    material_enemy_marker.emissiveColor = new BABYLON.Color3(0.4, 0.2, 0.2);
    material_enemy_marker.backFaceCulling = false;
    material_enemy_marker.needDepthPrePass = true;
    material_enemy_marker.alpha = 0.7;
    // material_enemy_marker.freeze();
    material_enemy_marker.disableLighting = true;
    tg.am.material_enemy_marker = material_enemy_marker;

    var material_friend_marker = new BABYLON.StandardMaterial('material_friend_marker', tg.scene);
    // material_friend_marker.diffuseColor = BABYLON.Color3.Blue();
    material_friend_marker.emissiveColor = new BABYLON.Color3(0.2, 0.4, 0.2);
    material_friend_marker.backFaceCulling = false;
    material_friend_marker.needDepthPrePass = true;
    material_friend_marker.alpha = 0.7;
    // material_friend_marker.freeze();
    material_friend_marker.disableLighting = true;
    tg.am.material_friend_marker = material_friend_marker;

    var material_self_marker = new BABYLON.StandardMaterial('material_self_marker', tg.scene);
    // material_self_marker.diffuseColor = BABYLON.Color3.Blue();
    material_self_marker.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    material_self_marker.backFaceCulling = false;
    material_self_marker.needDepthPrePass = true;
    material_self_marker.alpha = 0.7;
    // material_self_marker.freeze();
    material_friend_marker.disableLighting = true;
    tg.am.material_self_marker = material_self_marker;

    // materials for hp bars : completely opaque
    var material_self_hpbar = new BABYLON.StandardMaterial('material_self_hpbar', tg.scene);
    material_self_hpbar.emissiveColor = new BABYLON.Color3(0.1, 0.4, 0.1);
    material_self_hpbar.disableLighting = true;
    material_self_hpbar.freeze();
    tg.am.material_self_hpbar = material_self_hpbar;

    var material_self_hpbarcontainer = new BABYLON.StandardMaterial('material_self_hpbarcontainer', tg.scene);
    material_self_hpbarcontainer.emissiveColor = new BABYLON.Color3(0.2, 0.3, 0.2);
    material_self_hpbarcontainer.disableLighting = true;
    material_self_hpbarcontainer.freeze();
    tg.am.material_self_hpbarcontainer = material_self_hpbarcontainer;

    var material_friend_hpbar = new BABYLON.StandardMaterial('material_friend_hpbar', tg.scene);
    material_friend_hpbar.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.4);
    material_friend_hpbar.disableLighting = true;
    material_friend_hpbar.freeze();
    tg.am.material_friend_hpbar = material_friend_hpbar;

    var material_friend_hpbarcontainer = new BABYLON.StandardMaterial('material_friend_hpbarcontainer', tg.scene);
    material_friend_hpbarcontainer.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.3);
    material_friend_hpbarcontainer.disableLighting = true;
    material_friend_hpbarcontainer.freeze();
    tg.am.material_friend_hpbarcontainer = material_friend_hpbarcontainer;

    var material_enemy_hpbar = new BABYLON.StandardMaterial('material_enemy_hpbar', tg.scene);
    material_enemy_hpbar.emissiveColor = new BABYLON.Color3(0.4, 0.1, 0.1);
    material_enemy_hpbar.disableLighting = true;
    material_enemy_hpbar.freeze();
    tg.am.material_enemy_hpbar = material_enemy_hpbar;

    var material_enemy_hpbarcontainer = new BABYLON.StandardMaterial('material_enemy_hpbarcontainer', tg.scene);
    material_enemy_hpbarcontainer.emissiveColor = new BABYLON.Color3(0.3, 0.2, 0.2);
    material_enemy_hpbarcontainer.disableLighting = true;
    material_enemy_hpbarcontainer.freeze();
    tg.am.material_enemy_hpbarcontainer = material_enemy_hpbarcontainer;

    var material_neutral_hpbar = new BABYLON.StandardMaterial('material_neutral_hpbar', tg.scene);
    material_neutral_hpbar.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material_neutral_hpbar.disableLighting = true;
    material_neutral_hpbar.freeze();
    tg.am.material_neutral_hpbar = material_neutral_hpbar;

    var material_neutral_hpbarcontainer = new BABYLON.StandardMaterial('material_neutral_hpbarcontainer', tg.scene);
    material_neutral_hpbarcontainer.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    material_neutral_hpbarcontainer.disableLighting = true;
    material_neutral_hpbarcontainer.freeze();
    tg.am.material_neutral_hpbarcontainer = material_neutral_hpbarcontainer;

    // console.log('complete creating materials');
};

tg.am.initialiseBotMetaDataFactory = function(playerConfigArray){
    var metaDataRequirement = {
        retreat: 0,
        sheild: 0,
        scorch: 0,
        pulse: 0,
    };
    for (let i = 0; i < playerConfigArray.length; i++) {
        const playerBotArray = playerConfigArray[i].botObjectList;
        for (let j = 0; j < playerBotArray.length; j++) {
            let botConfig = playerBotArray[j];
            var characterConfig = tg.itemConfigs.items[botConfig.type];
            // return;
            for(var k = 0; k < characterConfig.ability.length; ++k){
                switch (characterConfig.ability[k].action) {
                    case 'retreat':
                        metaDataRequirement[characterConfig.ability[k].action]++;
                        break;
                    case 'sheild':
                        metaDataRequirement[characterConfig.ability[k].action]++;
                        break;
                    case 'scorch':
                        metaDataRequirement[characterConfig.ability[k].action]++;
                        break;
                    case 'pulse':
                        metaDataRequirement[characterConfig.ability[k].action]++;
                        break;
                    default:
                        break;
                }
            }
        }
    }

    // console.log('metaDataRequirement:', metaDataRequirement);

    // initialise factory objects

    // pulse:
    var pulseAbilityConfig = tg.itemConfigs.abilityConfig.pulse;
    var key = pulseAbilityConfig.metaData.key;
    tg.am[key] = new BABYLON.SpriteManager(
        key,
        pulseAbilityConfig.metaData.file,
        metaDataRequirement.pulse,// capacity
        pulseAbilityConfig.metaData.cellDimension,
        tg.scene
    );
};

tg.am.init = function(){
    tg.am.bam = new BABYLON.AssetsManager(tg.scene);
    tg.am.staticItems = {};
    tg.am.staticItems.buildings = {};
    tg.am.staticItems.buildingsArray = [];

    tg.am.dynamicItems = {};
    tg.am.dynamicItems.bots = {};
    tg.am.dynamicItems.botsArray = [];

    tg.am.createMaterials();
    tg.static.addStaticItems();
    tg.static.loadStaticAssets('show_home_page');
};
