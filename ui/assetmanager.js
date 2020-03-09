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
    boxMaterial.specularTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);
    boxMaterial.emissiveTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);
    boxMaterial.ambientTexture = new BABYLON.Texture("static/img/cpack01.jpg", tg.scene);

    tg.am.boxMaterial = boxMaterial;
    // material for ground
    var groundMaterial = new BABYLON.StandardMaterial("material_ground", tg.scene);

    groundMaterial.diffuseTexture = new BABYLON.Texture("static/img/stone_floor6.jpg", tg.scene);
    groundMaterial.diffuseTexture.uScale = tg.worldItems.gridSide / 2;
    groundMaterial.diffuseTexture.vScale = tg.worldItems.gridSide / 2;

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

    tg.am.material_semitransparent_blue = material_semitransparent_blue;

    var material_semitransparent_red = new BABYLON.StandardMaterial('material_semitransparent_red', tg.scene);
    material_semitransparent_red.diffuseColor = BABYLON.Color3.Red();
    material_semitransparent_red.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material_semitransparent_red.backFaceCulling = false;
    material_semitransparent_red.needDepthPrePass = true;
    material_semitransparent_red.alpha = 0.5;

    tg.am.material_semitransparent_red = material_semitransparent_red;

    var material_semitransparent_chosen = new BABYLON.StandardMaterial('material_semitransparent_chosen', tg.scene);
    material_semitransparent_chosen.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.9);
    material_semitransparent_chosen.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material_semitransparent_chosen.backFaceCulling = false;
    material_semitransparent_chosen.needDepthPrePass = true;
    material_semitransparent_chosen.alpha = 0.6;

    tg.am.material_semitransparent_chosen = material_semitransparent_chosen;

    var material_transparent = new BABYLON.StandardMaterial('material_transparent', tg.scene);
    material_transparent.diffuseColor = new BABYLON.Color3(0, 0, 0);
    material_transparent.emissiveColor = new BABYLON.Color3(0, 0, 0);
    material_transparent.backFaceCulling = false;
    material_transparent.needDepthPrePass = true;
    material_transparent.alpha = 0;

    tg.am.material_transparent = material_transparent;

    // tg.material_semitransparent_blue = material_semitransparent_blue;
    // tg.material_semitransparent_red = material_semitransparent_red;
    // tg.material_semitransparent_chosen = material_semitransparent_chosen;
    // tg.material_character_parent = material_character_parent;

    console.log('complete creating materials');
}

tg.am.init = function(){
    tg.am.staticItems = {};
    tg.am.dynamicItems = {};
    tg.am.dynamicItems.bots = {};

    tg.am.createMaterials();
    tg.static.addStaticItems();
    tg.static.loadGLTFAssetsForStaticItems('show_home_page');
}