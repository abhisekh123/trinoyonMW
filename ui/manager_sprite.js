tg.sprite = {};
tg.sprite.test = function () {
    // alert('sprite_manager');
    // alert('sprite_manager');
    console.log('--------sprite_manager--------');

    var mat = new BABYLON.StandardMaterial("mat1", tg.scene);
    // mat.alpha = 0;
    // mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1.0);
    //mat.backFaceCulling = false;
    //mat.wireframe = true;
    // var texture = new BABYLON.Texture("static/sprite/lightning-pattern-png-1.png", tg.scene);
    // var texture = new BABYLON.Texture("static/img/palm.png", tg.scene);
    var texture = new BABYLON.Texture("static/sprite/flame_arrow.png", tg.scene);
    texture.hasAlpha = true;
	texture.getAlphaFromRGB = true;
    
    mat.diffuseTexture = texture;
    tg.sprite.texture = texture;
    

    // var f = new BABYLON.Vector4(0,0, 1/6, 1); // front image = half the whole image along the width 
    var f = new BABYLON.Vector4(0,0, 1/6, 1);
	
	var options = {
		sideOrientation: BABYLON.Mesh.DOUBLESIDE, // FRONTSIDE, BACKSIDE, DOUBLESIDE
        frontUVs: f,
		backUVs: f,
        // updatable: false,
		width: 5,
		height: 5,
	}
	
	var plane = BABYLON.MeshBuilder.CreatePlane("", options, tg.scene);
    plane.material = mat;
    
    // plane.material = mat;
    tg.sprite.plane = plane;
    // plane.rotation.x = Math.PI / 2;
    // var orientation = BABYLON.Vector3.RotationFromAxis(1, 0, 1);
    // plane.rotation = orientation;

    plane.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
    plane.bakeCurrentTransformIntoVertices();

    // plane.rotate(BABYLON.Axis.Y, 1.45, BABYLON.Space.WORLD);// BABYLON.Space.LOCAL
    plane.position.y = 15;
    plane.position.x = 450;
    plane.position.z = 450;

    setInterval(tg.sprite.refresh, 150);
};

tg.sprite.refresh = function(){
    if(tg.sprite == null && tg.sprite == undefined){
        return;
    }
    if(tg.sprite.texture == null && tg.sprite.texture == undefined){
        return;
    }
    tg.sprite.texture.uOffset += 1/6;
    tg.sprite.plane.addRotation(0, 0.01, 0); 
};




/** CODES NOT USED PRESENTLY */
tg.sprite.test_boxAnimation = function () {
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


