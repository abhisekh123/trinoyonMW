
// console.log('####world_config');
var worldItems = {
    // assume each tile is 1 x 1 meter^2
    // avg speed : 10 kmph : 2.77m/sec
    // root(2) = 1.414
    // 2.77/1.414 = 1.96

    // for speed 2.77m/sec
    // 1.414 covered in 0.5 sec : time taken to move diagonal tile
    // 1 covered in 0.36 sec : time taken to move adjescent tile

    // for speed Xm/sec
    // 1.414 / (X) : sec for diagonal
    // 1 / (X) : sec for adjescent

    // walk stride length : 0.75M
    // run cycle length : 1.5M
    // 2 cycles / sec
    createFreshStrategyMatrix: true,
    strategyMatrixFileName: 'visibilityMatrix.txt',

    uiConfig: {
        playerDimensionBaseUnit: 10,
        hiddenY: -10, //value of y coordinate when object is hidden 
        cameraTargetMovementStep: 2,
        clearSelectionTimerInterval: 5000,
        projectilePathTimeResolution: 60, // time in miliseconds to transit from one plan path to another. 
        projectilePathDistanceResolution: 1, // distance between each planned path for projectile (in floor/world unit, not grid unit)
        plannedPathResolution: 8, // number of position to be planned for each distance of one tile
    },
    
    maxRange: 10,
    neighbourhoodBoxSide: 21, // (maxRange x 2) + 1
    gridSide: 89,
    gridUnitSize: 50,

    topBase:[44,6], // team 1 :: base1
    defenceTop:[[44,17],[40,9],[48,9],[16,19],[69,15]], // team 1
    topBasePlayerPosition:[[46, 4], [46, 3], [46, 5], [42, 4], [42, 3], [42, 5]],

    bottomBase:[44,82], // team 2 :: base2
    defenceBottom:[[48,79],[40,79],[44,71],[19,73],[72,69]], // team 2
    bottomBasePlayerPosition:[[46, 84], [46, 83], [46, 85], [42, 84], [42, 83], [42, 85]],

    maxDistanceFromLeader: 7,
    tooAwayFromLeader: 10,
    closeProximity: 5,

    refreshWorldInterval: 500, // refreshWorld() should run once every interval.
    refreshWorldPerIntervalUI: 10,
    processActionResolution: 200, // for each refreshWorld() delta time will be broken into interval of this.
    matchMaxTimeDuration: 5 * 60 * 1000, // 5 minutes
    // topTeamCaracters:[[44,8], [46, 6], [42, 6]],
    // bottomTeamCaracters:[[44,80], [46, 82], [42, 82]],
    // top team = 1
    // bottom team = 2
    // topTeamCaractersA:[[46, 4], [42, 4]],
    // bottomTeamCaractersA:[[46, 84], [42, 84]],
    commonConfig:{
        maxPlayerCount:4, // player count should be a perfect square
        maxBotPerPlayer:3, //max maxBotPerPlayer should be a perfect square
        maxBotCount:12, // NOTE: maxBotCount = maxBotPerPlayer * maxPlayerCount

        maxClientCount:128,
        botColor: '#1122ff',
        selfColor: '#aaddaa',
    },

    constants: { 
        // FIND CLOSEST HOSTILE FLAG
        ALL: 0,
        BUILDINGS: 1,
        BOTS: 2,

        // VISIBILITY FLAG
        VISIBLE: 1,
        INVISIBLE: 2,
        DONTCARE: 0,
    },
    // players: [
    //     {
    //         playerID:1,
    //         team:1
    //     },
    //     {
    //         playerID:2,
    //         team:1
    //     },
    //     {
    //         playerID:3,
    //         team:2
    //     },
    //     {
    //         playerID:4,
    //         team:2
    //     },
    // ],

    characterMap: {
        refference:{
            type:'type',
            parentMesh:null,
        },
        ground:{
            type:'ground',
        }

    },

    obstacles: [
        [0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[0,11],[0,12],[0,13],[0,14],[0,15],[0,16],[0,17],[0,18],[0,19],[0,20],[0,21],[0,22],[0,23],[0,24],[0,25],[0,26],[0,27],[0,28],[0,29],[0,30],[0,31],[0,32],[0,33],[0,34],[0,35],[0,36],[0,37],[0,38],[0,39],[0,40],[0,41],[0,42],[0,43],[0,44],[0,45],[0,46],[0,47],[0,48],[0,49],[0,50],[0,51],[0,52],[0,53],[0,54],[0,55],[0,56],[0,57],[0,58],[0,59],[0,60],[0,61],[0,62],[0,63],[0,64],[0,65],[0,66],[0,67],[0,68],[0,69],[0,70],[0,71],[0,72],[0,73],[0,74],[0,75],[0,76],[0,77],[0,78],[0,79],[0,80],[0,81],[0,82],[0,83],[0,84],[0,85],[0,86],[0,87],[0,88],[1,0],[1,88],[2,0],[2,88],[3,0],[3,10],[3,40],[3,88],[4,0],[4,10],[4,40],[4,48],[4,49],[4,50],[4,51],[4,52],[4,53],[4,76],[4,77],[4,78],[4,79],[4,80],[4,81],[4,82],[4,83],[4,88],[5,0],[5,10],[5,40],[5,53],[5,61],[5,69],[5,83],[5,88],[6,0],[6,10],[6,14],[6,15],[6,16],[6,17],[6,18],[6,19],[6,20],[6,21],[6,22],[6,40],[6,53],[6,56],[6,61],[6,69],[6,70],[6,71],[6,72],[6,83],[6,88],[7,0],[7,14],[7,22],[7,45],[7,46],[7,56],[7,61],[7,83],[7,88],[8,0],[8,14],[8,22],[8,32],[8,45],[8,56],[8,61],[8,83],[8,88],[9,0],[9,3],[9,4],[9,5],[9,6],[9,7],[9,14],[9,22],[9,27],[9,28],[9,29],[9,32],[9,45],[9,56],[9,61],[9,62],[9,63],[9,64],[9,78],[9,83],[9,88],[10,0],[10,32],[10,36],[10,37],[10,38],[10,39],[10,40],[10,45],[10,49],[10,56],[10,71],[10,72],[10,73],[10,78],[10,83],[10,88],[11,0],[11,17],[11,19],[11,49],[11,56],[11,73],[11,78],[11,83],[11,88],[12,0],[12,17],[12,18],[12,19],[12,49],[12,50],[12,51],[12,56],[12,73],[12,78],[12,88],[13,0],[13,9],[13,10],[13,11],[13,18],[13,24],[13,25],[13,29],[13,30],[13,56],[13,73],[13,78],[13,88],[14,0],[14,11],[14,24],[14,30],[14,36],[14,56],[14,57],[14,58],[14,65],[14,66],[14,67],[14,68],[14,69],[14,73],[14,78],[14,88],[15,0],[15,11],[15,27],[15,36],[15,65],[15,78],[15,88],[16,0],[16,27],[16,36],[16,45],[16,46],[16,47],[16,48],[16,49],[16,65],[16,88],[17,0],[17,27],[17,36],[17,65],[17,88],[18,0],[18,4],[18,5],[18,6],[18,7],[18,14],[18,23],[18,32],[18,65],[18,88],[19,0],[19,14],[19,23],[19,32],[19,52],[19,56],[19,57],[19,58],[19,59],[19,60],[19,65],[19,88],[20,0],[20,11],[20,12],[20,13],[20,14],[20,23],[20,24],[20,25],[20,30],[20,31],[20,32],[20,39],[20,40],[20,41],[20,42],[20,43],[20,52],[20,56],[20,65],[20,69],[20,78],[20,79],[20,80],[20,81],[20,82],[20,83],[20,84],[20,85],[20,86],[20,87],[20,88],[21,0],[21,19],[21,43],[21,52],[21,56],[21,65],[21,69],[21,78],[21,88],[22,0],[22,19],[22,43],[22,52],[22,56],[22,65],[22,69],[22,78],[22,88],[23,0],[23,16],[23,19],[23,26],[23,27],[23,28],[23,29],[23,43],[23,56],[23,60],[23,69],[23,70],[23,71],[23,72],[23,78],[23,88],[24,0],[24,16],[24,43],[24,60],[24,78],[24,88],[25,0],[25,1],[25,2],[25,3],[25,4],[25,5],[25,6],[25,7],[25,8],[25,9],[25,10],[25,11],[25,12],[25,13],[25,14],[25,15],[25,16],[25,60],[25,78],[25,82],[25,83],[25,84],[25,88],[26,0],[26,50],[26,51],[26,52],[26,60],[26,78],[26,84],[26,88],[27,0],[27,19],[27,29],[27,52],[27,60],[27,61],[27,62],[27,63],[27,64],[27,71],[27,72],[27,73],[27,74],[27,75],[27,76],[27,77],[27,78],[27,84],[27,88],[28,0],[28,19],[28,29],[28,46],[28,52],[28,53],[28,64],[28,71],[28,88],[29,0],[29,29],[29,46],[29,64],[29,88],[30,0],[30,29],[30,46],[30,64],[30,88],[31,0],[31,29],[31,30],[31,31],[31,32],[31,33],[31,46],[31,64],[31,65],[31,88],[32,0],[32,5],[32,6],[32,7],[32,8],[32,12],[32,13],[32,14],[32,15],[32,19],[32,20],[32,21],[32,46],[32,53],[32,54],[32,55],[32,56],[32,57],[32,58],[32,59],[32,65],[32,69],[32,70],[32,71],[32,72],[32,73],[32,74],[32,75],[32,76],[32,80],[32,81],[32,82],[32,83],[32,88],[33,0],[33,21],[33,26],[33,46],[33,59],[33,88],[34,0],[34,21],[34,26],[34,46],[34,59],[34,88],[35,0],[35,21],[35,26],[35,33],[35,34],[35,35],[35,36],[35,37],[35,38],[35,46],[35,59],[35,88],[36,0],[36,13],[36,14],[36,15],[36,16],[36,21],[36,26],[36,46],[36,59],[36,72],[36,73],[36,74],[36,75],[36,88],[37,0],[37,16],[37,26],[37,55],[37,59],[37,72],[37,88],[38,0],[38,16],[38,26],[38,33],[38,55],[38,72],[38,88],[39,0],[39,1],[39,2],[39,3],[39,4],[39,16],[39,26],[39,33],[39,39],[39,40],[39,51],[39,55],[39,72],[39,84],[39,85],[39,86],[39,87],[39,88],[40,0],[40,39],[40,51],[40,55],[40,66],[40,88],[41,0],[41,22],[41,39],[41,45],[41,46],[41,51],[41,61],[41,66],[41,88],[42,0],[42,13],[42,22],[42,42],[42,51],[42,61],[42,75],[42,88],[43,0],[43,13],[43,33],[43,34],[43,35],[43,42],[43,61],[43,75],[43,88],[44,0],[44,13],[44,44],[44,75],[44,88],[45,0],[45,13],[45,27],[45,46],[45,53],[45,54],[45,55],[45,75],[45,88],[46,0],[46,13],[46,27],[46,37],[46,46],[46,66],[46,75],[46,88],[47,0],[47,22],[47,27],[47,37],[47,42],[47,43],[47,49],[47,66],[47,88],[48,0],[48,22],[48,33],[48,37],[48,49],[48,88],[49,0],[49,1],[49,2],[49,3],[49,4],[49,16],[49,33],[49,37],[49,48],[49,49],[49,55],[49,62],[49,72],[49,84],[49,85],[49,86],[49,87],[49,88],[50,0],[50,16],[50,33],[50,55],[50,62],[50,72],[50,88],[51,0],[51,16],[51,29],[51,33],[51,62],[51,72],[51,88],[52,0],[52,13],[52,14],[52,15],[52,16],[52,29],[52,42],[52,62],[52,67],[52,72],[52,73],[52,74],[52,75],[52,88],[53,0],[53,29],[53,42],[53,50],[53,51],[53,52],[53,53],[53,54],[53,55],[53,62],[53,67],[53,88],[54,0],[54,29],[54,42],[54,62],[54,67],[54,88],[55,0],[55,29],[55,42],[55,62],[55,67],[55,88],[56,0],[56,5],[56,6],[56,7],[56,8],[56,12],[56,13],[56,14],[56,15],[56,16],[56,17],[56,18],[56,19],[56,23],[56,29],[56,30],[56,31],[56,32],[56,33],[56,34],[56,35],[56,42],[56,67],[56,68],[56,69],[56,73],[56,74],[56,75],[56,76],[56,80],[56,81],[56,82],[56,83],[56,88],[57,0],[57,23],[57,24],[57,42],[57,55],[57,56],[57,57],[57,58],[57,59],[57,88],[58,0],[58,24],[58,42],[58,59],[58,88],[59,0],[59,24],[59,42],[59,59],[59,88],[60,0],[60,17],[60,24],[60,35],[60,36],[60,42],[60,59],[60,69],[60,88],[61,0],[61,4],[61,10],[61,11],[61,12],[61,13],[61,14],[61,15],[61,16],[61,17],[61,24],[61,25],[61,26],[61,27],[61,28],[61,36],[61,59],[61,69],[61,88],[62,0],[62,4],[62,10],[62,28],[62,36],[62,37],[62,38],[62,88],[63,0],[63,4],[63,5],[63,6],[63,10],[63,28],[63,72],[63,73],[63,74],[63,75],[63,76],[63,77],[63,78],[63,79],[63,80],[63,81],[63,82],[63,83],[63,84],[63,85],[63,86],[63,87],[63,88],[64,0],[64,10],[64,28],[64,45],[64,72],[64,88],[65,0],[65,10],[65,16],[65,17],[65,18],[65,19],[65,28],[65,32],[65,45],[65,59],[65,60],[65,61],[65,62],[65,69],[65,72],[65,88],[66,0],[66,10],[66,19],[66,23],[66,32],[66,36],[66,45],[66,69],[66,88],[67,0],[67,10],[67,19],[67,23],[67,32],[67,36],[67,45],[67,69],[67,88],[68,0],[68,1],[68,2],[68,3],[68,4],[68,5],[68,6],[68,7],[68,8],[68,9],[68,10],[68,19],[68,23],[68,32],[68,36],[68,45],[68,46],[68,47],[68,48],[68,49],[68,56],[68,57],[68,58],[68,63],[68,64],[68,65],[68,74],[68,75],[68,76],[68,77],[68,88],[69,0],[69,23],[69,28],[69,29],[69,30],[69,31],[69,32],[69,36],[69,56],[69,65],[69,74],[69,88],[70,0],[70,23],[70,56],[70,65],[70,74],[70,81],[70,82],[70,83],[70,84],[70,88],[71,0],[71,23],[71,52],[71,61],[71,88],[72,0],[72,23],[72,39],[72,40],[72,41],[72,42],[72,43],[72,52],[72,61],[72,88],[73,0],[73,10],[73,23],[73,52],[73,61],[73,77],[73,88],[74,0],[74,10],[74,15],[74,19],[74,20],[74,21],[74,22],[74,23],[74,30],[74,31],[74,32],[74,52],[74,58],[74,64],[74,77],[74,88],[75,0],[75,10],[75,15],[75,32],[75,58],[75,59],[75,63],[75,64],[75,70],[75,77],[75,78],[75,79],[75,88],[76,0],[76,10],[76,15],[76,32],[76,37],[76,38],[76,39],[76,69],[76,70],[76,71],[76,88],[77,0],[77,5],[77,10],[77,15],[77,32],[77,39],[77,69],[77,71],[77,88],[78,0],[78,5],[78,10],[78,15],[78,16],[78,17],[78,32],[78,39],[78,43],[78,48],[78,49],[78,50],[78,51],[78,52],[78,56],[78,88],[79,0],[79,5],[79,10],[79,24],[79,25],[79,26],[79,27],[79,32],[79,43],[79,56],[79,59],[79,60],[79,61],[79,66],[79,74],[79,81],[79,82],[79,83],[79,84],[79,85],[79,88],[80,0],[80,5],[80,27],[80,32],[80,43],[80,56],[80,66],[80,74],[80,88],[81,0],[81,5],[81,27],[81,32],[81,42],[81,43],[81,66],[81,74],[81,88],[82,0],[82,5],[82,16],[82,17],[82,18],[82,19],[82,27],[82,32],[82,35],[82,48],[82,66],[82,67],[82,68],[82,69],[82,70],[82,71],[82,72],[82,73],[82,74],[82,78],[82,88],[83,0],[83,5],[83,19],[83,27],[83,35],[83,48],[83,78],[83,88],[84,0],[84,5],[84,6],[84,7],[84,8],[84,9],[84,10],[84,11],[84,12],[84,35],[84,36],[84,37],[84,38],[84,39],[84,40],[84,48],[84,78],[84,88],[85,0],[85,48],[85,78],[85,88],[86,0],[86,88],[87,0],[87,88],[88,0],[88,1],[88,2],[88,3],[88,4],[88,5],[88,6],[88,7],[88,8],[88,9],[88,10],[88,11],[88,12],[88,13],[88,14],[88,15],[88,16],[88,17],[88,18],[88,19],[88,20],[88,21],[88,22],[88,23],[88,24],[88,25],[88,26],[88,27],[88,28],[88,29],[88,30],[88,31],[88,32],[88,33],[88,34],[88,35],[88,36],[88,37],[88,38],[88,39],[88,40],[88,41],[88,42],[88,43],[88,44],[88,45],[88,46],[88,47],[88,48],[88,49],[88,50],[88,51],[88,52],[88,53],[88,54],[88,55],[88,56],[88,57],[88,58],[88,59],[88,60],[88,61],[88,62],[88,63],[88,64],[88,65],[88,66],[88,67],[88,68],[88,69],[88,70],[88,71],[88,72],[88,73],[88,74],[88,75],[88,76],[88,77],[88,78],[88,79],[88,80],[88,81],[88,82],[88,83],[88,84],[88,85],[88,86],[88,87],[88,88]
    ],
    // normalised units:
    // per stride : 0.5M in 0.25 sec 
    // diagonal movement in 0.75 sec
    // linear movement in 0.5 sec
    // aim in 0.5 sec

};

if(typeof tg !== 'undefined' && tg){
    // console.log(tg);
    tg.worldItems = worldItems;
}else{
    module.exports = worldItems;
}
