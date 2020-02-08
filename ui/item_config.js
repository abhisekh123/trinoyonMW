    // per stride : 0.5M in 0.25 sec 
    // diagonal movement in 0.75 sec
    // linear movement in 0.5 sec
    // aim in 0.5 sec

    var itemConfigs = {
        items:{
            lion:{
                bannedMeshes:[],
                idleAnimationIndex:0,
                runAnimationIndex:5,
                dieAnimationIndex:6,
                spawnAnimationIndex:4,
                attackAnimationIndex:8,
                attackinterval: 500,
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
                animationSpeed:1
            },
            swordman:{
                bannedMeshes:[9],
                idleAnimationIndex:0,
                runAnimationIndex:16,
                dieAnimationIndex:9,
                spawnAnimationIndex:7,
                attackAnimationIndex:2,
                attackinterval: 500,
                attack: 1,
                life:10,
                speed:1, //one tile per 1000 ms.
                strideDistance: 0.5,
                strideTime: 0.25,
                sight: 7,
                range: 2,
                parentMesh: null,
                file:'low_poly_character_rpg_kit_animation',
                scale:0.04,
                animationSpeed: 1
            },
            archer:{
                bannedMeshes:[9],
                idleAnimationIndex:0,
                runAnimationIndex:16,
                dieAnimationIndex:9,
                spawnAnimationIndex:7,
                attackAnimationIndex:2,
                attackinterval: 500,
                attack: 1,
                life:10,
                speed:1, //one tile per 1000 ms.
                strideDistance: 0.5,
                strideTime: 0.25,
                sight: 7,
                range: 2,
                parentMesh: null,
                file:'low_poly_character_rpg_kit_animation',
                scale:0.04,
                animationSpeed: 1
            },
            tower:{
                life:10,
                attack:2,
                file: 'tower_gloom',
                scale: 0.05,
                sight: 3,
                range: 3,
                attackinterval: 1000,
            },
            base:{
                life:10,
                attack:2,
                file: 'defense_tower',
                scale: 2,
                sight: 3,
                range: 3,
            }
        },
        
    };
    
    
    if(typeof tg !== 'undefined' && tg){
        // console.log(tg);
        tg.itemConfigs = itemConfigs;
    }else{
        module.exports = itemConfigs;
    }