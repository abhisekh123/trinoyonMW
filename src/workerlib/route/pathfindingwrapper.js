
/**
 * this is a wrapper function containing higher level wrapper function for pathfinding library.
 */
const PF = require('pathfinding');
const workerstate = require('../state/workerstate');

module.exports = {
    // baseMap: {}
    finder: null,

    init: function(){
        this.finder = new PF.AStarFinder({
            allowDiagonal: true,
            dontCrossCorners: true,
            heuristic: PF.Heuristic.chebyshev
        });
    },
    workerRegister:{},
    tg: {
        botConfig:{}
    },
    finder:null,

    

    restoreGrid: function(){
        // let width = this.tg.grid.width;
        // let height = this.tg.grid.height;
        // let gridNodes = this.tg.grid.nodes;
        // let gridBackupNodes = this.tg.gridBackup.nodes;

        // for (var i = 0; i < height; ++i) {
        //     for (var j = 0; j < width; ++j) {
        //         // newNodes[i][j] = new Node(j, i, thisNodes[i][j].walkable);
        //         gridNodes[i][j].walkable = gridBackupNodes[i][j].walkable;
        //     }
        // }

        // this.printGrid();
        this.tg.grid = this.tg.gridBackup.clone();
    },

    findPath: function(currentPositionX, currentPositionZ, targetPositionX, targetPositionZ){
        // // console.log('findPath');
        // // console.log(currentPositionX);
        // // console.log(currentPositionZ);
        // // console.log(targetPositionX);
        // // console.log(targetPositionZ);
        var path = this.finder.findPath(
            Math.round((currentPositionX))// + this.tg.centreX
            , Math.round((currentPositionZ))// + this.tg.centreZ
            , Math.round((targetPositionX))// + this.tg.centreX
            , Math.round((targetPositionZ))// + this.tg.centreZ
            , this.tg.grid);
        this.restoreGrid();
        // for(var i = 0; i < path.length; ++i){
        //     path[i][0] = (path[i][0] - this.tg.centreX);
        //     path[i][1] = (path[i][1] - this.tg.centreZ);
        // }
        return path;
    },

    prepareGrid: function(){
        // console.log('prepareGrid.');
        // console.log(this.world_config);
        // world_config.length = Number(world_config.length);
        // world_config.breadth = Number(world_config.breadth);


        // console.log('prepare grid@bot route manager :: world_config.gridSide:' + world_config.gridSide);

        this.tg.grid = new PF.Grid(world_config.gridSide, world_config.gridSide);
        // // console.log(this.tg.grid);
        // // console.log(this.tg.grid);
        // // console.log(this.tg.grid.nodes.length);
        // // console.log(this.tg.grid.nodes[0].length);

        this.tg.centreZ = (world_config.gridSide - 1)/2;
        this.tg.centreX = (world_config.gridSide - 1)/2;

        var towerIndex = 0;

        for(var i = 0; i < world_config.obstacles.length; ++i){
            this.tg.grid.setWalkableAt(world_config.obstacles[i][0], world_config.obstacles[i][1], false);
        }
        for(var i = 0; i < world_config.defenceBottom.length; ++i){
            this.tg.grid.setWalkableAt(world_config.defenceBottom[i][0], world_config.defenceBottom[i][1], false);
            var towerID = 'tower' + towerIndex;
            world_config.defenceBottom[i].push(towerID);
            workerstate.buildingMap[towerID] = {
                life:item_config.buildings.tower.life,
                attack:item_config.buildings.tower.attack,
                isActive: true,
                type:'tower',
                team:1,
                id:towerID,
                position: {
                    x: world_config.defenceBottom[i][0],
                    z: world_config.defenceBottom[i][1]
                }
            }
            workerstate.buildingArray.push(workerstate.buildingMap[towerID]);
            ++towerIndex;
        }
        for(var i = 0; i < world_config.defenceTop.length; ++i){
            this.tg.grid.setWalkableAt(world_config.defenceTop[i][0], world_config.defenceTop[i][1], false);
            var towerID = 'tower' + towerIndex;
            world_config.defenceTop[i].push(towerID);
            workerstate.buildingMap[towerID] = {
                life:item_config.buildings.tower.life,
                attack:item_config.buildings.tower.attack,
                type:'tower',
                isActive: true,
                team:2,
                id:towerID,
                position: {
                    x: world_config.defenceTop[i][0],
                    z: world_config.defenceTop[i][1]
                }
            }
            workerstate.buildingArray.push(workerstate.buildingMap[towerID]);
            ++towerIndex;
        }
        this.tg.grid.setWalkableAt(world_config.topBase[0], world_config.topBase[1], false);
        world_config.topBase.push('base1');
        workerstate.buildingMap['base1'] = {
            life:item_config.buildings.base.life,
            attack:item_config.buildings.base.attack,
            type:'base',
            isActive: true,
            team:2,
            id:'base1',
            position: {
                x: world_config.topBase[0],
                z: world_config.topBase[1]
            }
        }
        workerstate.buildingArray.push(workerstate.buildingMap['base1']);
        this.tg.grid.setWalkableAt(world_config.bottomBase[0], world_config.bottomBase[1], false);
        world_config.bottomBase.push('base2');
        workerstate.buildingMap['base2'] = {
            life:item_config.buildings.base.life,
            attack:item_config.buildings.base.attack,
            type:'base',
            isActive: true,
            team:1,
            id:'base2',
            position: {
                x: world_config.bottomBase[0],
                z: world_config.bottomBase[1]
            }
        }
        workerstate.buildingArray.push(workerstate.buildingMap['base2']);

        this.tg.gridBackup = this.tg.grid.clone();
        // this.printGrid();

        // console.log('-------grid initialised');
        // // console.log(this.tg.grid);

        this.finder = new PF.AStarFinder({
            allowDiagonal: true,
            dontCrossCorners: true,
            heuristic: PF.Heuristic.chebyshev
        });

        this.gridBackup = this.grid.clone();
        bot_route_utility.init(world_config, this.tg.grid.clone());
        
    },



    deActivateBot: function(botid){
        var botConfig = this.tg.botConfig[botid];
        if(botConfig == undefined || botConfig == null){
            // console.log('ERROR: Bot undefined. Skip termination process. Bot ID:' + botid);
            return;
        }
        var xPos = botConfigParam.position[0];
        var zPos = botConfigParam.position[2];
        // this.tg.grid.setWalkableAt(xPos + this.tg.centreX, zPos + this.tg.centreX, true);
        this.tg.botConfig[botid] = null;
    },
}