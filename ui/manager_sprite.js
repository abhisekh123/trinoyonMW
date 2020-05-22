tg.sprite = {};
tg.sprite.test = function () {
    // alert('sprite_manager');
    // alert('sprite_manager');
    console.log('--------sprite_manager--------');

    var mat = new BABYLON.StandardMaterial("mat1", tg.scene);
    mat.alpha = 1.0;
    mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1.0);
    //mat.backFaceCulling = false;
    //mat.wireframe = true;
    var texture = new BABYLON.Texture("static/sprite/test.png", tg.scene);
    mat.diffuseTexture = texture;
    tg.sprite.texture = texture;
    //mat.diffuseTexture.hasAlpha = true;

    var hSpriteNb = 6; // 6 sprites per raw
    var vSpriteNb = 4; // 4 sprite raws

    var faceUV = new Array(6);

    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }

    faceUV[1] = new BABYLON.Vector4(0, 0, 1 / hSpriteNb, 1 / vSpriteNb);

    var options = {
        width: 100,
        height: 100,
        depth: 100,
        faceUV: faceUV
    };

    var box = BABYLON.MeshBuilder.CreateBox('box', options, tg.scene);
    box.position.y = 50;
    box.position.x = 450;
    box.position.z = 450;
    box.material = mat;
};

tg.sprite.refresh = function(){
    tg.sprite.texture.uOffset += 1/6;
};


