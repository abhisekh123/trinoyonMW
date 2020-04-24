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
            break;
        case 'show_match_page':
            tg.world.handleNewMatchStartReadyTrigger();
            break;

        default:
            break;
    }
};

tg.am.updateNewAssetLoaded = function(count){
    console.log('tg.am.updateNewAssetLoaded');
    tg.am.totalAssetsLoaded_tillNow += count;
    tg.pv.refreshAssetLoadedAlert(tg.am.totalAssetsLoaded_tillNow, tg.am.totalAssetsToBeLoaded);

    if(tg.am.totalAssetsLoaded_tillNow >= tg.am.totalAssetsToBeLoaded){
        console.log('(tg.am.totalAssetsLoaded_tillNow >= tg.am.totalAssetsToBeLoaded)');
        tg.am.onLoadCompleteActionHandler();
    }
}

tg.am.createMaterials = function () {
    console.log('creating materials');

    // material for crates
    var boxMaterial = new BABYLON.StandardMaterial("material_box", tg.scene);

    boxMaterial.diffuseTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);
    boxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    // boxMaterial.specularTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);
    // boxMaterial.emissiveTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);
    // boxMaterial.ambientTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);
    boxMaterial.freeze();
    tg.am.boxMaterial = boxMaterial;
    // material for ground
    var groundMaterial = new BABYLON.StandardMaterial("material_ground", tg.scene);

    groundMaterial.diffuseTexture = new BABYLON.Texture("static/img/stone_floor6.jpg", tg.scene);
    groundMaterial.diffuseTexture.uScale = tg.worldItems.gridSide / 2;
    groundMaterial.diffuseTexture.vScale = tg.worldItems.gridSide / 2;
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    groundMaterial.freeze();
    tg.am.groundMaterial = groundMaterial;


    // var materialGround = new BABYLON.StandardMaterial('ground_test', tg.scene);
    // materialGround.diffuseColor = new BABYLON.Color3(90/255, 90/255, 90/255);
    // materialGround.emissiveColor = new BABYLON.Color3(90/255, 90/255, 90/255);
    // materialGround.alpha = 0.5;

    var material_semitransparent_blue = new BABYLON.StandardMaterial('material_semitransparent_blue', tg.scene);
    material_semitransparent_blue.diffuseColor = BABYLON.Color3.Blue();
    material_semitransparent_blue.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material_semitransparent_blue.backFaceCulling = false;
    material_semitransparent_blue.needDepthPrePass = true;
    material_semitransparent_blue.alpha = 0.7;
    // material_semitransparent_blue.freeze();
    tg.am.material_semitransparent_blue = material_semitransparent_blue;

    var material_semitransparent_red = new BABYLON.StandardMaterial('material_semitransparent_red', tg.scene);
    material_semitransparent_red.diffuseColor = BABYLON.Color3.Red();
    material_semitransparent_red.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material_semitransparent_red.backFaceCulling = false;
    material_semitransparent_red.needDepthPrePass = true;
    material_semitransparent_red.alpha = 0.5;
    // material_semitransparent_red.freeze();
    tg.am.material_semitransparent_red = material_semitransparent_red;


    var material_semitransparent_projectile = new BABYLON.StandardMaterial('material_semitransparent_projectile', tg.scene);
    material_semitransparent_projectile.diffuseColor = new BABYLON.Color3(1, 0.65, 0);
    material_semitransparent_projectile.emissiveColor = new BABYLON.Color3(1, 0.65, 0);
    // material_semitransparent_projectile.freeze();
    tg.am.material_semitransparent_projectile = material_semitransparent_projectile;

    var material_semitransparent_towerprojectile = new BABYLON.StandardMaterial('material_semitransparent_towerprojectile', tg.scene);
    material_semitransparent_towerprojectile.diffuseColor = new BABYLON.Color3(1, 0, 0);
    material_semitransparent_towerprojectile.emissiveColor = new BABYLON.Color3(1, 0, 0);
    // material_semitransparent_towerprojectile.freeze();
    tg.am.material_semitransparent_towerprojectile = material_semitransparent_towerprojectile;

    var material_semitransparent_chosen = new BABYLON.StandardMaterial('material_semitransparent_chosen', tg.scene);
    material_semitransparent_chosen.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.9);
    material_semitransparent_chosen.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material_semitransparent_chosen.backFaceCulling = false;
    material_semitransparent_chosen.needDepthPrePass = true;
    material_semitransparent_chosen.alpha = 0.6;
    // material_semitransparent_chosen.freeze();
    tg.am.material_semitransparent_chosen = material_semitransparent_chosen;

    var material_transparent = new BABYLON.StandardMaterial('material_transparent', tg.scene);
    material_transparent.diffuseColor = new BABYLON.Color3(0, 0, 0);
    material_transparent.emissiveColor = new BABYLON.Color3(0, 0, 0);
    material_transparent.backFaceCulling = false;
    material_transparent.needDepthPrePass = true;
    material_transparent.alpha = 0;
    material_transparent.freeze();
    tg.am.material_transparent = material_transparent;

    // tg.material_semitransparent_blue = material_semitransparent_blue;
    // tg.material_semitransparent_red = material_semitransparent_red;
    // tg.material_semitransparent_chosen = material_semitransparent_chosen;
    // tg.material_character_parent = material_character_parent;
    

    var material_enemy_marker = new BABYLON.StandardMaterial('material_enemy_marker', tg.scene);
    // material_enemy_marker.diffuseColor = BABYLON.Color3.Blue();
    material_enemy_marker.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.2);
    material_enemy_marker.backFaceCulling = false;
    material_enemy_marker.needDepthPrePass = true;
    material_enemy_marker.alpha = 0.7;
    material_enemy_marker.freeze();
    tg.am.material_enemy_marker = material_enemy_marker;

    var material_friend_marker = new BABYLON.StandardMaterial('material_friend_marker', tg.scene);
    // material_friend_marker.diffuseColor = BABYLON.Color3.Blue();
    material_friend_marker.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.2);
    material_friend_marker.backFaceCulling = false;
    material_friend_marker.needDepthPrePass = true;
    material_friend_marker.alpha = 0.7;
    material_friend_marker.freeze();
    tg.am.material_friend_marker = material_friend_marker;

    var material_self_marker = new BABYLON.StandardMaterial('material_self_marker', tg.scene);
    // material_self_marker.diffuseColor = BABYLON.Color3.Blue();
    material_self_marker.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    material_self_marker.backFaceCulling = false;
    material_self_marker.needDepthPrePass = true;
    material_self_marker.alpha = 0.7;
    material_self_marker.freeze();
    tg.am.material_self_marker = material_self_marker;

    // materials for hp bars : completely opaque
    var material_self_hpbar = new BABYLON.StandardMaterial('material_self_hpbar', tg.scene);
    material_self_hpbar.diffuseColor = new BABYLON.Color3(0.1, 0.4, 0.1);
    material_self_hpbar.freeze();
    tg.am.material_self_hpbar = material_self_hpbar;

    var material_self_hpbarcontainer = new BABYLON.StandardMaterial('material_self_hpbarcontainer', tg.scene);
    material_self_hpbarcontainer.diffuseColor = new BABYLON.Color3(0.2, 0.3, 0.2);
    material_self_hpbarcontainer.freeze();
    tg.am.material_self_hpbarcontainer = material_self_hpbarcontainer;

    var material_friend_hpbar = new BABYLON.StandardMaterial('material_friend_hpbar', tg.scene);
    material_friend_hpbar.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.4);
    material_friend_hpbar.freeze();
    tg.am.material_friend_hpbar = material_friend_hpbar;

    var material_friend_hpbarcontainer = new BABYLON.StandardMaterial('material_friend_hpbarcontainer', tg.scene);
    material_friend_hpbarcontainer.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.3);
    material_friend_hpbarcontainer.freeze();
    tg.am.material_friend_hpbarcontainer = material_friend_hpbarcontainer;

    var material_enemy_hpbar = new BABYLON.StandardMaterial('material_enemy_hpbar', tg.scene);
    material_enemy_hpbar.diffuseColor = new BABYLON.Color3(0.4, 0.1, 0.1);
    material_enemy_hpbar.freeze();
    tg.am.material_enemy_hpbar = material_enemy_hpbar;

    var material_enemy_hpbarcontainer = new BABYLON.StandardMaterial('material_enemy_hpbarcontainer', tg.scene);
    material_enemy_hpbarcontainer.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.2);
    material_enemy_hpbarcontainer.freeze();
    tg.am.material_enemy_hpbarcontainer = material_enemy_hpbarcontainer;

    var material_neutral_hpbar = new BABYLON.StandardMaterial('material_neutral_hpbar', tg.scene);
    material_neutral_hpbar.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material_neutral_hpbar.freeze();
    tg.am.material_neutral_hpbar = material_neutral_hpbar;

    var material_neutral_hpbarcontainer = new BABYLON.StandardMaterial('material_neutral_hpbarcontainer', tg.scene);
    material_neutral_hpbarcontainer.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    material_neutral_hpbarcontainer.freeze();
    tg.am.material_neutral_hpbarcontainer = material_neutral_hpbarcontainer;

    console.log('complete creating materials');
}

tg.am.init = function(){
    tg.am.staticItems = {};
    tg.am.staticItems.buildings = {};
    tg.am.staticItems.buildingsArray = [];

    tg.am.dynamicItems = {};
    tg.am.dynamicItems.bots = {};
    tg.am.dynamicItems.botsArray = [];

    tg.am.createMaterials();
    tg.static.addStaticItems();
    tg.static.loadGLTFAssetsForStaticItems('show_home_page');
};
