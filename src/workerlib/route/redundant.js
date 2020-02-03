

module.exports = {
    botArray: [],
    botMap: {},
    buildingMap: {},
    buildingArray: [],
    // baseMap: {}
    workerRegister:{},
    grid: null,
    gridBackup: null,
    finder:null,
    mapPrecalculatedDataGrid: null,
    botPositionArray: new Array(), // bot id vs bot position.
    finder: null,
    tempGrid: null, // contains 53 x 53 grid that will be used for generating visibility map.
    visibilityMatrix: null, // grid floor meta data : bot ID + visibility matrix (per grid position)
    distanceMatrix: null,
    maxRange: 26,
    neighbourhoodBoxSide: 53,
    maxBotCount: 100,
    createFreshVisibility: true,

    restoreGrid: function(){
        this.grid = this.gridBackup.clone();
    },


    findPath: function(currentPositionX, currentPositionZ, targetPositionX, targetPositionZ){
        // console.log('findPath:' + currentPositionX + ',' + currentPositionZ + ' to '
            // + targetPositionX + ',' + targetPositionZ);
        // // console.log(currentPositionX);
        // // console.log(currentPositionZ);
        // // console.log(targetPositionX);
        // // console.log(targetPositionZ);
        var path = this.finder.findPath(
            Math.round((currentPositionX))// + this.tg.centreX
            , Math.round((currentPositionZ))// + this.tg.centreZ
            , Math.round((targetPositionX))// + this.tg.centreX
            , Math.round((targetPositionZ))// + this.tg.centreZ
            , this.grid);
        this.restoreGrid();
        // for(var i = 0; i < path.length; ++i){
        //     path[i][0] = (path[i][0] - this.tg.centreX);
        //     path[i][1] = (path[i][1] - this.tg.centreZ);
        // }
        return path;
    },



    admitNewBot: function(botConfigParam, botid){
        var botConfig = this.tg.botConfig[botid];
        // // console.log('admitNewBot@bot route manager.');
        // // console.log(botConfigParam);
        if(botConfig != undefined && botConfig != null){
            // console.log('Note@botroutemanger : Bot already present for the given ID. reassigning');
            // return;
        }

        var position = this.FindClosestWalkablePoint({x:botConfigParam.position[0], y:0, z:botConfigParam.position[2]});
        if(position!=null){
            botConfigParam.position[0] = position.x;
            botConfigParam.position[2] = position.z;
        }

        var xPos = Math.floor(botConfigParam.position[0]);
        botConfigParam.position[0] = xPos;
        var zPos = Math.floor(botConfigParam.position[2]);
        botConfigParam.position[2] = zPos;
        // this.tg.grid.setWalkableAt(xPos, zPos, false);
        this.tg.botConfig[botid] = botConfigParam;
        bot_route_utility.updateBotPosition(botid, xPos, zPos);
        return position;
    },
}