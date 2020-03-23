tg.ui3d = {};

tg.ui3d.gethpbar = function (idParam) {
    var hpBarConfig = {};

    var healthBarMaterial = new BABYLON.StandardMaterial("hbmat" + idParam, tg.scene);
    healthBarMaterial.diffuseColor = BABYLON.Color3.Green();
    healthBarMaterial.backFaceCulling = false;
    hpBarConfig.healthBarMaterial = healthBarMaterial;

    var healthBarContainerMaterial = new BABYLON.StandardMaterial("hbcmat" + +idParam, tg.scene);
    healthBarContainerMaterial.diffuseColor = BABYLON.Color3.Blue();
    healthBarContainerMaterial.backFaceCulling = false;
    hpBarConfig.healthBarContainerMaterial = healthBarContainerMaterial;

    var dynamicTexture = new BABYLON.DynamicTexture("dt" + idParam, 512, tg.scene, true);
    dynamicTexture.hasAlpha = true;
    hpBarConfig.dynamicTexture = dynamicTexture;

    var healthBarTextMaterial = new BABYLON.StandardMaterial("hbtmat" + idParam, tg.scene);
    healthBarTextMaterial.diffuseTexture = dynamicTexture;
    healthBarTextMaterial.backFaceCulling = false;
    healthBarTextMaterial.diffuseColor = BABYLON.Color3.Green();
    hpBarConfig.healthBarTextMaterial = healthBarTextMaterial;

    var healthBar = BABYLON.MeshBuilder.CreatePlane("hb1", {
        width: 2,
        height: .5,
        subdivisions: 4
    }, tg.scene);
    hpBarConfig.healthBar = healthBar;

    var healthBarContainer = BABYLON.MeshBuilder.CreatePlane("hb2", {
        width: 2,
        height: .5,
        subdivisions: 4
    }, tg.scene);
    hpBarConfig.healthBarContainer = healthBarContainer;
    healthBarContainer.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    var healthBarText = BABYLON.MeshBuilder.CreatePlane("hb3", {
        width: 2,
        height: 2,
        subdivisions: 4
    }, tg.scene);
    healthBarText.material = healthBarMaterial;
    hpBarConfig.healthBarText = healthBarText;

    healthBar.position = new BABYLON.Vector3(0, 0, -.01); // Move in front of container slightly.  Without this there is flickering.
    healthBarContainer.position = new BABYLON.Vector3(0, 3, 0); // Position above player.
    healthBarText.position = new BABYLON.Vector3(1.5, -.4, 0);

    healthBar.parent = healthBarContainer;
    // healthBarContainer.parent = player;
    healthBarText.parent = healthBarContainer;

    healthBar.material = healthBarMaterial;
    healthBarContainer.material = healthBarContainerMaterial;
    healthBarText.material = healthBarTextMaterial;

    // initialise the hp bar

    var healthPercentage = 100;
    var textureContext = dynamicTexture.getContext();
    var size = dynamicTexture.getSize();
    var text = healthPercentage + "%";

    textureContext.clearRect(0, 0, size.width, size.height);

    textureContext.font = "bold 120px Calibri";
    var textSize = textureContext.measureText(text);
    textureContext.fillStyle = "white";
    textureContext.fillText(text, (size.width - textSize.width) / 2, (size.height - 120) / 2);

    dynamicTexture.update();

    return hpBarConfig;
}

tg.ui3d.updateHPBarPercentage = function (hpBarConfig, healthPercentage) {
    healthPercentage = Math.round(healthPercentage);
    if (healthPercentage < 1) {
        healthPercentage = 0;
    }

    hpBarConfig.healthBar.scaling.x = healthPercentage / 100;
    hpBarConfig.healthBar.position.x = (1 - (healthPercentage / 100)) * -1;

    if (hpBarConfig.healthBar.scaling.x < 0) {

    } else if (hpBarConfig.healthBar.scaling.x < .5) {
        hpBarConfig.healthBarMaterial.diffuseColor = BABYLON.Color3.Yellow();
        hpBarConfig.healthBarTextMaterial.diffuseColor = BABYLON.Color3.Yellow();
    } else if (hpBarConfig.healthBar.scaling.x < .3) {
        hpBarConfig.healthBarMaterial.diffuseColor = BABYLON.Color3.Red();
        hpBarConfig.healthBarTextMaterial.diffuseColor = BABYLON.Color3.Red();
    }

    //
    // Display Health Percentage.
    // - Only update display if whole number.
    // 

    var textureContext = hpBarConfig.dynamicTexture.getContext();
    var size = hpBarConfig.dynamicTexture.getSize();
    var text = healthPercentage + "%";

    textureContext.clearRect(0, 0, size.width, size.height);

    textureContext.font = "bold 120px Calibri";
    var textSize = textureContext.measureText(text);
    textureContext.fillStyle = "white";
    textureContext.fillText(text, (size.width - textSize.width) / 2, (size.height - 120) / 2);

    hpBarConfig.dynamicTexture.update();

}