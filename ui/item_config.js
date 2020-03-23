    // per stride : 0.5M in 0.25 sec 
    // diagonal movement in 0.75 sec
    // linear movement in 0.5 sec
    // aim in 0.5 sec

    // 4 possible action state: got, march, fight, ready

    var itemConfigs = {
        items:{
            lion:{
                bannedMeshes:[],
                idleAnimationIndex:0,
                runAnimationIndex:5,
                dieAnimationIndex:6,
                spawnAnimationIndex:4,
                attackAnimationIndex:8,
                attackinterval: 1000,
                attack: 1,
                life:10,
                speed:1, //one tile per 1000 ms.
                strideDistance: 0.5,
                strideTime: 0.25,
                sight: 7,
                range: 2,
                parentMesh: null,
                file:'digimon_3d_leomonice_leomon',
                scale:5,
                animationSpeed:1,
                respawnTime: 5000, // 3 seconds
                iconurl: 'static/img/lion_icon.png'
            },
            swordman:{
                // bannedMeshes:[9],
                bannedMeshes:[],
                // idleAnimationIndex:0,
                // runAnimationIndex:16,
                // dieAnimationIndex:9,
                // spawnAnimationIndex:7,
                // attackAnimationIndex:2,

                idleAnimationIndex:0,
                runAnimationIndex:0,
                dieAnimationIndex:0,
                spawnAnimationIndex:0,
                attackAnimationIndex:0,

                attackinterval: 1000,
                attack: 1,
                life:10,
                speed:1, //one tile per 1000 ms.
                strideDistance: 0.5,
                strideTime: 0.25,
                sight: 8,
                range: 2,
                parentMesh: null,
                // file:'low_poly_character_rpg_kit_animation',
                file: 'bow_trigger_game_character',
                scale:0.3,
                animationSpeed: 1,
                respawnTime: 3000, // 3 seconds
                iconurl: 'static/img/swordsman_icon.png'
            },
            archer:{
                // bannedMeshes:[9],
                bannedMeshes:[],
                idleAnimationIndex:0,
                runAnimationIndex:0,
                dieAnimationIndex:0,
                spawnAnimationIndex:0,
                attackAnimationIndex:0,
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
                sight: 8,
                range: 4,
                parentMesh: null,
                // file:'low_poly_character_rpg_kit_animation',
                file: 'bow_trigger_game_character',
                scale:0.3,
                animationSpeed: 1,
                respawnTime: 3000, // 3 seconds
                iconurl: 'static/img/archer_icon.png'
            },
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
            }
        },
        
    };
    
    
    if(typeof tg !== 'undefined' && tg){
        // console.log(tg);
        tg.itemConfigs = itemConfigs;
    }else{
        module.exports = itemConfigs;
    }