
/**
 * this is a wrapper function containing higher level wrapper function for pathfinding library.
 * These functions perform the low level operations which are used by route manager and other modules.
 */
const PF = require('pathfinding');
const workerState = require('../state/workerstate');

module.exports = {
    // baseMap: {}
    worldConfig: null,
    itemConfig: null,
    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
        workerState.finder = new PF.BestFirstFinder({
            allowDiagonal: false,
            dontCrossCorners: true,
            heuristic: PF.Heuristic.euclidean
        });

        this.prepareGrid();

        var matrix = [
            [0, 0, 0, 1, 0],
            [1, 0, 0, 0, 1],
            [0, 0, 1, 0, 0],
        ];
        var grid = new PF.Grid(matrix);
        var path = workerState.finder.findPath(1, 2, 4, 2, grid);
        console.log('==========>', path);
    },
    

    restoreGrid: function(){
        // let width = workerState.grid.width;
        // let height = workerState.grid.height;
        // let gridNodes = workerState.grid.nodes;
        // let gridBackupNodes = workerState.gridBackup.nodes;

        // for (var i = 0; i < height; ++i) {
        //     for (var j = 0; j < width; ++j) {
        //         // newNodes[i][j] = new Node(j, i, thisNodes[i][j].walkable);
        //         gridNodes[i][j].walkable = gridBackupNodes[i][j].walkable;
        //     }
        // }

        // this.printGrid();
        workerState.grid = workerState.gridBackup.clone();
    },

    findPath: function(currentPositionX, currentPositionZ, targetPositionX, targetPositionZ){
        // console.log('findPath');
        // console.log(currentPositionX);
        // console.log(currentPositionZ);
        // console.log(targetPositionX);
        // console.log(targetPositionZ);
        // console.log(workerState.finder);
        // console.log('workerState.finder.findPath', workerState.finder.findPath);
        // console.log(workerState.grid);

        var path = workerState.finder.findPath(
            currentPositionX
            ,currentPositionZ
            ,targetPositionX
            ,targetPositionZ
            , workerState.grid);

        // console.log('pati:', path);
        this.restoreGrid();
        // console.log('==========>', path1);

        return path;
    },

    prepareGrid: function(){
        // console.log('prepareGrid.');
        // console.log(this.this.worldConfig);

        // console.log('prepare grid@bot route manager :: this.worldConfig.gridSide:' + this.worldConfig.gridSide);

        workerState.grid = new PF.Grid(this.worldConfig.gridSide, this.worldConfig.gridSide);
        // // console.log(workerState.grid);
        // // console.log(workerState.grid);
        // // console.log(workerState.grid.nodes.length);
        // // console.log(workerState.grid.nodes[0].length);

        var towerIndex = 0;

        // obstacles
        for(var i = 0; i < this.worldConfig.obstacles.length; ++i){
            workerState.grid.setWalkableAt(this.worldConfig.obstacles[i][1], this.worldConfig.obstacles[i][0], false);
        }

        // base team 1(top)
        workerState.grid.setWalkableAt(this.worldConfig.topBase[1], this.worldConfig.topBase[0], false);
        this.worldConfig.topBase.push('base1');
        workerState.buildingMap_1['base1'] = {
            life:this.itemConfig.items.base.life,
            fullLife:this.itemConfig.items.base.life,
            attack:this.itemConfig.items.base.attack,
            range:this.itemConfig.items.base.range,
            sight:this.itemConfig.items.base.sight,
            attackinterval:this.itemConfig.items.base.attackinterval,
            // deathTimestamp: 0,
            activityTimeStamp: 0,
            lastAttackTime:0,
            type:'base',
            isActive: true,
            team:1,
            id:'base1',
            ownershipClaimStartTimestamp: 0,
            mostResentOwnershipClaimingTeam: null,
            intervalToCompleteOwnershipClaim: this.itemConfig.items.base.intervalToCompleteOwnershipClaim,
            position: [
                this.worldConfig.topBase[1],
                0,
                this.worldConfig.topBase[0]
            ],
            levelMap:this.itemConfig.items.base.levelMap,
            level: 0
        }
        workerState.buildingArray_1.push(workerState.buildingMap_1['base1']);


        // defence team 1(top)
        for(var i = 0; i < this.worldConfig.defenceTop.length; ++i){
            workerState.grid.setWalkableAt(this.worldConfig.defenceTop[i][1], this.worldConfig.defenceTop[i][0], false);
            var towerID = 'tower' + towerIndex;
            this.worldConfig.defenceTop[i].push(towerID);
            workerState.buildingMap_1[towerID] = {
                life:this.itemConfig.items.tower.life,
                fullLife:this.itemConfig.items.tower.life,
                attack:this.itemConfig.items.tower.attack,
                range:this.itemConfig.items.tower.range,
                sight:this.itemConfig.items.tower.sight,
                captureTime:this.itemConfig.items.tower.captureTime,
                attackinterval:this.itemConfig.items.tower.attackinterval,
                // deathTimestamp: 0,
                activityTimeStamp: 0,
                lastAttackTime:0,
                type:'tower',
                isActive: true,
                team:1,
                id:towerID,
                ownershipClaimStartTimestamp: 0,
                mostResentOwnershipClaimingTeam: null,
                intervalToCompleteOwnershipClaim: this.itemConfig.items.tower.intervalToCompleteOwnershipClaim,
                position: [
                    this.worldConfig.defenceTop[i][1],
                    0,
                    this.worldConfig.defenceTop[i][0]
                ],
                levelMap:this.itemConfig.items.tower.levelMap,
                level: 0
            }
            workerState.buildingArray_1.push(workerState.buildingMap_1[towerID]);
            ++towerIndex;
        }


        // base team 2(bottom)
        workerState.grid.setWalkableAt(this.worldConfig.bottomBase[1], this.worldConfig.bottomBase[0], false);
        this.worldConfig.bottomBase.push('base2');
        workerState.buildingMap_2['base2'] = {
            life:this.itemConfig.items.base.life,
            fullLife:this.itemConfig.items.base.life,
            attack:this.itemConfig.items.base.attack,
            range:this.itemConfig.items.base.range,
            sight:this.itemConfig.items.base.sight,
            attackinterval:this.itemConfig.items.base.attackinterval,
            // deathTimestamp: 0,
            activityTimeStamp: 0,
            lastAttackTime:0,
            type:'base',
            isActive: true,
            team:2,
            id:'base2',
            ownershipClaimStartTimestamp: 0,
            mostResentOwnershipClaimingTeam: null,
            intervalToCompleteOwnershipClaim: this.itemConfig.items.base.intervalToCompleteOwnershipClaim,
            position: [
                this.worldConfig.bottomBase[1],
                0,
                this.worldConfig.bottomBase[0]
            ],
            levelMap:this.itemConfig.items.base.levelMap,
            level: 0
        }
        workerState.buildingArray_2.push(workerState.buildingMap_2['base2']);

        // defence team 2(bottom)
        for(var i = 0; i < this.worldConfig.defenceBottom.length; ++i){
            workerState.grid.setWalkableAt(this.worldConfig.defenceBottom[i][1], this.worldConfig.defenceBottom[i][0], false);
            var towerID = 'tower' + towerIndex;
            this.worldConfig.defenceBottom[i].push(towerID);
            workerState.buildingMap_2[towerID] = {
                life:this.itemConfig.items.tower.life,
                fullLife:this.itemConfig.items.tower.life,
                attack:this.itemConfig.items.tower.attack,
                range:this.itemConfig.items.tower.range,
                sight:this.itemConfig.items.tower.sight,
                captureTime:this.itemConfig.items.tower.captureTime,
                attackinterval:this.itemConfig.items.tower.attackinterval,
                // deathTimestamp: 0,
                activityTimeStamp: 0,
                lastAttackTime:0,
                isActive: true,
                type:'tower',
                team:2,
                id:towerID,
                ownershipClaimStartTimestamp: null,
                mostResentOwnershipClaimingTeam: null,
                intervalToCompleteOwnershipClaim: this.itemConfig.items.tower.intervalToCompleteOwnershipClaim,
                position: [
                    this.worldConfig.defenceBottom[i][1],
                    0,
                    this.worldConfig.defenceBottom[i][0]
                ],
                levelMap:this.itemConfig.items.tower.levelMap,
                level: 0
            }
            workerState.buildingArray_2.push(workerState.buildingMap_2[towerID]);
            ++towerIndex;
        }
        
        workerState.gridBackup = workerState.grid.clone();
    },

    isPointInGrid: function(xParam, zParam){
        if(xParam < 0 || zParam < 0){
            return false;
        }
        if(xParam < this.worldConfig.gridSide && zParam < this.worldConfig.gridSide){
            return true;
        }else{
            return false;
        }
    },

    isWalkableAt: function(xParam, zParam){
        return workerState.grid.isWalkableAt(xParam, zParam);
    },
}