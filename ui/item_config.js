    // per stride : 0.5M in 0.25 sec 
    // diagonal movement in 0.75 sec
    // linear movement in 0.5 sec
    // aim in 0.5 sec

    // 4 possible action state: got, march, fight, ready

    var itemConfigs = {
        items:{
            lion:{
                bannedMeshes:[],
                // idleAnimationIndex:0,
                // runAnimationIndex:5,
                // dieAnimationIndex:6,
                // spawnAnimationIndex:4,
                // attackAnimationIndex:8,
                animations: {
                    idleAnimation:{
                        type: 'flat',
                        index: 0
                    },
                    runAnimation:{
                        type: 'flat',
                        index: 5
                    },
                    dieAnimation:{
                        type: 'flat',
                        index: 6
                    },
                    spawnAnimation:{
                        type: 'flat',
                        index: 4
                    },
                    attackAnimation:{
                        type: 'flat',
                        index: 8
                    },
                },
                

                attackinterval: 1000,
                attack: 1,
                life:10,
                speed:1, //one tile per 1000 ms.
                strideDistance: 0.5,
                strideTime: 0.25,
                sight: 4,
                range: 2,
                parentMesh: null,
                file:'digimon_3d_leomonice_leomon',
                scale:6,
                animationSpeed:1,
                respawnTime: 5000, // 3 seconds
                iconurl: 'static/img/lion_icon.png',
                headerScale: 0.03,
                headerPositionY: 1.8,
            },
            swordman:{
                bannedMeshes:[6],
                // bannedMeshes:[],
                // idleAnimationIndex:0,
                // runAnimationIndex:16,
                // dieAnimationIndex:9,
                // spawnAnimationIndex:7,
                // attackAnimationIndex:2,
                animations: {
                    idleAnimation:{
                        type: 'flat',
                        index: 4
                    },
                    runAnimation:{
                        type: 'flat',
                        index: 1
                    },
                    dieAnimation:{
                        type: 'flat',
                        index: 3
                    },
                    spawnAnimation:{
                        type: 'flat',
                        index: 2
                    },
                    attackAnimation:{
                        type: 'flat',
                        index: 0
                    },
                },
                

                attackinterval: 1000,
                attack: 1,
                life:10,
                speed:1, //one tile per 1000 ms.
                strideDistance: 0.5,
                strideTime: 0.25,
                sight: 4,
                range: 2,
                parentMesh: null,
                file:'low_poly_knight_animated',
                scale:2.5,
                animationSpeed: 1,
                respawnTime: 3000, // 3 seconds
                iconurl: 'static/img/swordsman_icon.png',
                headerScale: 0.1,
                headerPositionY: 3.5,
            },
            archer:{
                // bannedMeshes:[9],
                bannedMeshes:[],
                // idleAnimationIndex:0,
                // runAnimationIndex:0,
                // dieAnimationIndex:0,
                // spawnAnimationIndex:0,
                // attackAnimationIndex:0,
                // animation interval : 0 to 19.16666603088379

                animations: {
                    idleAnimation:{
                        type: 'interval',
                        index: 0,
                        from: 0,
                        to: 2
                    },
                    runAnimation:{
                        type: 'interval',
                        index: 0,
                        from: 2.4,
                        to: 3.1
                    },
                    dieAnimation:{
                        type: 'interval',
                        index: 0,
                        from: 17,
                        to: 19.1
                    },
                    spawnAnimation:{
                        type: 'interval',
                        index: 0,
                        from: 16,
                        to: 17
                    },
                    attackAnimation:{
                        type: 'interval',
                        index: 0,
                        from: 6.5,
                        to: 7.5
                    },
                },
                
                // idleAnimationIndex:55,
                // runAnimationIndex:63,
                // dieAnimationIndex:58,
                // spawnAnimationIndex:62,
                // attackAnimationIndex:57,
                attackinterval: 1000,
                attack: 1,
                life:10,
                speed:1, //one tile per 1000 ms.
                strideDistance: 0.5,
                strideTime: 0.25,
                sight: 5,
                range: 4,
                parentMesh: null,
                // file:'low_poly_character_rpg_kit_animation',
                file: 'bow_trigger_game_character',
                scale:0.3,
                animationSpeed: 1,
                respawnTime: 3000, // 3 seconds
                iconurl: 'static/img/archer_icon.png',
                headerScale: 0.5,
                headerPositionY: 16,
            },
            // boy:{
            //     bannedMeshes:[9],
            //     // bannedMeshes:[],
            //     idleAnimationIndex:0,
            //     runAnimationIndex:16,
            //     dieAnimationIndex:9,
            //     spawnAnimationIndex:7,
            //     attackAnimationIndex:2,

            //     attackinterval: 1000,
            //     attack: 1,
            //     life:10,
            //     speed:1, //one tile per 1000 ms.
            //     strideDistance: 0.5,
            //     strideTime: 0.25,
            //     sight: 8,
            //     range: 2,
            //     parentMesh: null,
            //     file:'low_poly_character_rpg_kit_animation',
            //     scale:0.3,
            //     animationSpeed: 1,
            //     respawnTime: 3000, // 3 seconds
            //     iconurl: 'static/img/swordsman_icon.png',
            //     headerScale: 1,
            //     headerPositionY: 1,
            // },
            tower:{
                life:1000,
                attack:2,
                file: 'tower_gloom',
                scale: 0.05,
                sight: 3,
                range: 3,
                attackinterval: 1000,
                captureTime: 3000 // 3 seconds
            },
            base:{
                life:1000,
                attack:2,
                file: 'defense_tower',
                scale: 2,
                sight: 3,
                range: 3,
                attackinterval: 1000,
            },
        },
        
    };
    
    
    if(typeof tg !== 'undefined' && tg){
        // console.log(tg);
        tg.itemConfigs = itemConfigs;
    }else{
        module.exports = itemConfigs;
    }