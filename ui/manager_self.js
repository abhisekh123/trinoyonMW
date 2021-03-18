
// self has already been initialised in t.js
// tg.self = {};

tg.self.resumeOngoingMatchIfAny = function() {
    console.log('resume ongoing session.');
    if(tg.self.userConfig.isPlaying == true){
        console.log('already playing a game.');
        tg.network.requestGameResume();
    } else {
        console.log('no ongoing game');
    }
}

tg.self.refreshMap = function() {
    // console.log('refresh minimap');
    tg.mapCanvasContext.clearRect(0, 0, tg.mapCanvas.width, tg.mapCanvas.height);

    for (var i = 0; i < tg.am.staticItems.buildingsArray.length; ++i) {
        var buildingConfig = tg.am.staticItems.buildingsArray[i];
        // console.log(buildingConfig.position);
        let miniMapPositionX = (tg.self.map.mapPositionFactor * buildingConfig.position.x) - (tg.self.map.buildingDimention / 2);
        let miniMapPositionZ = tg.self.map.mapPositionFactor * buildingConfig.position.z - (tg.self.map.buildingDimention / 2);
        // console.log('miniMapX:', miniMapPositionX);
        // console.log('miniMapZ:', miniMapPositionZ);
        // tg.self.map.buildingDimention
        // tg.self.map.botDimention
        if(buildingConfig.team == 0){ // destroyed or orphan buildings
            tg.mapCanvasContext.fillStyle = "white";
        } else if(buildingConfig.team == tg.bot.userPlayerConfig.team){
            // friendly building
            // tg.mapCanvasContext.beginPath();
            // tg.mapCanvasContext.rect(20, 20, 150, 100);
            tg.mapCanvasContext.fillStyle = "#3eff15";
            // tg.mapCanvasContext.fill();
        } else {
            // ennemy buildings
            // tg.mapCanvasContext.beginPath();
            // tg.mapCanvasContext.rect(20, 20, 150, 100);
            tg.mapCanvasContext.fillStyle = "red";
            // tg.mapCanvasContext.fill();
        }

        tg.mapCanvasContext.beginPath();
        tg.mapCanvasContext.rect(miniMapPositionZ, miniMapPositionX, tg.self.map.buildingDimention, tg.self.map.buildingDimention);
        // tg.mapCanvasContext.fillStyle = "blue";
        tg.mapCanvasContext.fill();
    }
    const circleRadian = 2 * Math.PI;

    for(var i = 0; i < tg.am.dynamicItems.botsArray.length; ++i){
        var botObject = tg.am.dynamicItems.botsArray[i];
        // console.log(botObject.team);

        let miniMapPositionX = (tg.self.map.mapPositionFactor * botObject.controlMesh.position.x) - (tg.self.map.buildingDimention / 2);
        let miniMapPositionZ = tg.self.map.mapPositionFactor * botObject.controlMesh.position.z - (tg.self.map.buildingDimention / 2);
        if(botObject.team == tg.bot.userPlayerConfig.team){
            // friendly building
            // tg.mapCanvasContext.beginPath();
            // tg.mapCanvasContext.rect(20, 20, 150, 100);
            tg.mapCanvasContext.fillStyle = "#88aa88";
            // tg.mapCanvasContext.fill();
        } else {
            // ennemy buildings
            // tg.mapCanvasContext.beginPath();
            // tg.mapCanvasContext.rect(20, 20, 150, 100);
            tg.mapCanvasContext.fillStyle = "#ff5349";
            // tg.mapCanvasContext.fill();
        }

        var botIndex = tg.bot.userBotIdMap[botObject.id];
            // console.log('pickResult.pickedMesh.name:', pickResult.pickedMesh.name);
        if (botIndex != null && botIndex != undefined) {
            tg.mapCanvasContext.fillStyle = "#10e4de";
        }

        tg.mapCanvasContext.beginPath();
        // ctx.arc(100, 75, 50, 0, 2 * Math.PI); (Z,x,radius,startAngle,endAngle)
        tg.mapCanvasContext.arc(miniMapPositionZ, miniMapPositionX, tg.self.map.botDimention, 0, circleRadian);
        // tg.mapCanvasContext.fillStyle = "blue";
        tg.mapCanvasContext.fill();
    }
}
