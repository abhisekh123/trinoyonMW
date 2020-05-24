    // per stride : 0.5M in 0.25 sec 
    // diagonal movement in 0.75 sec
    // linear movement in 0.5 sec
    // aim in 0.5 sec

    // 4 possible action state: got, march, fight(not supported for now), ready

    var itemConfigs = {
        items:{
            lion:{
                bannedMeshes:[],
                audioFile: 'static/audio/Darkness-Approaches_Looping.mp3',
                animations: {
                    idleAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 0,

                        // audio configurations
                        offset: 1000,
                        length: 1000,
                        volume: 0.2
                    },
                    runAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 5,

                        // audio configurations
                        offset: 1000,
                        length: 1000,
                        volume: 0.2
                    },
                    dieAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 6,

                        // audio configurations
                        offset: 1000,
                        length: 1000,
                        volume: 0.2
                    },
                    spawnAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 4,

                        // audio configurations
                        offset: 1000,
                        length: 1000,
                        volume: 0.2
                    },
                    attackAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 8,

                        // audio configurations
                        offset: 1000,
                        length: 1000,
                        volume: 0.2
                    },
                },
                
                weaponType: 'melee',
                projectileShootY: 0.75,
                projectileReceiveY: 0.75,

                attackinterval: 1000,
                attack: 2,
                life:60,
                speed:2, //one tile per 1000 ms.
                sight: 6,
                range: 2,
                parentMesh: null,
                file:'digimon_3d_leomonice_leomon',
                scale:6,
                respawnTime: 15000, // 3 seconds
                iconurl: 'static/img/lion_icon.png',
                headerScale: 0.03,
                headerPositionY: 1.8,
                hpBarScale: 0.5,
                hpBarPositionY: 2.5,
            },
            swordman:{
                bannedMeshes:[6],
                audioFile: 'static/audio/Darkness-Approaches_Looping.mp3',
                animations: {
                    idleAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 4,

                        // audio configurations
                        offset: 1000,
                        length: 1000,
                        volume: 0.2
                    },
                    runAnimation:{
                        speed:6,
                        type: 'flat',
                        index: 1,

                        // audio configurations
                        offset: 1000,
                        length: 1000,
                        volume: 0.2
                    },
                    dieAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 3,

                        // audio configurations
                        offset: 1000,
                        length: 1000,
                        volume: 0.2
                    },
                    spawnAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 2,

                        // audio configurations
                        offset: 1000,
                        length: 1000,
                        volume: 0.2
                    },
                    attackAnimation:{
                        speed:3,
                        type: 'flat',
                        index: 0,

                        // audio configurations
                        offset: 1000,
                        length: 1000,
                        volume: 0.2
                    },
                },
                
                weaponType: 'melee',
                projectileShootY: 0.75,
                projectileReceiveY: 0.75,

                attackinterval: 1000,
                attack: 1,
                life:40,
                speed:2, //one tile per 1000 ms.
                sight: 6,
                range: 2,
                parentMesh: null,
                file:'low_poly_knight_animated',
                scale:2.5,
                respawnTime: 15000, // 3 seconds
                iconurl: 'static/img/swordsman_icon.png',
                headerScale: 0.1,
                headerPositionY: 3.5,
                hpBarScale: 1,
                hpBarPositionY: 5,
            },
            archer:{
                bannedMeshes:[],
                audioFile: 'static/audio/Darkness-Approaches_Looping.mp3',
                projectile: {
                    image: 'static/sprite/flame_arrow.png',
                    uBottom: 0,
                    vBottom: 0,
                    uTop: 1/6,
                    vTop: 1,
                    uOffset: 1/6,
                    height: 5,
                    width: 5
                    // vOffset: 0,
                },
                animations: {
                    idleAnimation:{
                        speed:1,
                        type: 'interval',
                        index: 0,
                        from: 0,
                        to: 2,

                        // audio configurations
                        offset: 1000,
                        length: 1000,
                        volume: 0.2
                    },
                    runAnimation:{
                        speed:1,
                        type: 'interval',
                        index: 0,
                        from: 2.4,
                        to: 3.1,

                        // audio configurations
                        offset: 1000,
                        length: 1000,
                        volume: 0.2
                    },
                    dieAnimation:{
                        speed:1,
                        type: 'interval',
                        index: 0,
                        from: 17,
                        to: 19.1,

                        // audio configurations
                        offset: 1000,
                        length: 1000,
                        volume: 0.2
                    },
                    spawnAnimation:{
                        speed:1,
                        type: 'interval',
                        index: 0,
                        from: 16,
                        to: 17,

                        // audio configurations
                        offset: 1000,
                        length: 1000,
                        volume: 0.2
                    },
                    attackAnimation:{
                        speed:2,
                        type: 'interval',
                        index: 0,
                        from: 6.5,
                        to: 7.5,

                        // audio configurations
                        offset: 1000,
                        length: 1000,
                        volume: 0.2
                    },
                },
                
                weaponType: 'arrow',
                projectileShootY: 0.75,
                projectileReceiveY: 0.75,

                attackinterval: 1000,
                attack: 3,
                life:20,
                speed:2, //one tile per 1000 ms.
                sight: 6,
                range: 4,
                parentMesh: null,
                // file:'low_poly_character_rpg_kit_animation',
                file: 'bow_trigger_game_character',
                scale:0.3,
                respawnTime: 15000, // 3 seconds
                iconurl: 'static/img/archer_icon.png',
                headerScale: 0.5,
                headerPositionY: 16,
                hpBarScale: 8,
                hpBarPositionY: 40,
            },
            tower:{
                life:10,
                audioFile: 'static/audio/test.mp3',
                projectile: {
                    image: 'static/sprite/flame_arrow.png',
                    uBottom: 0,
                    vBottom: 0,
                    uTop: 1/5,
                    vTop: 1/5,
                    uOffset: 1/5,
                    // vOffset: 0,
                    height: 5,
                    width: 5
                },
                animations: {
                    attack:{
                        offset: 1000,
                        length: 1000,
                        autoplay: false,
                        loop: false,
                        volume: 0.2
                    },
                    destroy:{
                        offset: 2000,
                        length: 1000,
                        autoplay: false,
                        loop: false,
                        volume: 0.2
                    },
                    capture:{
                        offset: 3000,
                        length: 1000,
                        autoplay: false,
                        loop: false,
                        volume: 0.2
                    },
                },
                attack:4,
                file: 'tower_gloom',
                scale: 0.05,
                sight: 6,
                range: 4,
                attackinterval: 1000,
                weaponType: 'fireball',
                projectileShootY: 2,
                projectileReceiveY: 0.75,
                intervalToCompleteOwnershipClaim: 3000, // 3 seconds
                hpBarScale: 10,
                hpBarPositionY: 34,
            },
            base:{
                life:100,
                audioFile: 'static/audio/test.mp3',
                projectile: {
                    image: 'static/sprite/flame_arrow.png',
                    uBottom: 0,
                    vBottom: 0,
                    uTop: 1/6,
                    vTop: 1/6,
                    uOffset: 1/6,
                    // vOffset: 0,
                    height: 5,
                    width: 5
                },
                animations: {
                    attack:{
                        offset: 1000,
                        length: 1000,
                        autoplay: false,
                        loop: false,
                        volume: 0.2
                    },
                    destroy:{
                        offset: 2000,
                        length: 1000,
                        autoplay: false,
                        loop: false,
                        volume: 0.2
                    },
                },
                attack:2,
                file: 'defense_tower',
                scale: 2,
                sight: 6,
                range: 4,
                attackinterval: 1000,
                weaponType: 'fireball',
                projectileShootY: 2,
                projectileReceiveY: 0.75,
                intervalToCompleteOwnershipClaim: 3000, // 3 seconds
                hpBarScale: 10,
                hpBarPositionY: 20,
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
            //     speed: 1,
            //     respawnTime: 3000, // 3 seconds
            //     iconurl: 'static/img/swordsman_icon.png',
            //     headerScale: 1,
            //     headerPositionY: 1,
            // },
        },
        
    };
    
    
    if(typeof tg !== 'undefined' && tg){
        // console.log(tg);
        tg.itemConfigs = itemConfigs;
    }else{
        module.exports = itemConfigs;
    }