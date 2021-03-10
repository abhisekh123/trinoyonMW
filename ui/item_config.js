    // per stride : 0.5M in 0.25 sec 
    // diagonal movement in 0.75 sec
    // linear movement in 0.5 sec
    // aim in 0.5 sec

    // 4 possible action state: got, march, fight(not supported for now), ready

    var itemConfigs = {
        projectiles: [
            {
                key: 'flame_arrow',
                file: 'static/sprite/flame_arrow.png',
            }
        ],
        planes: [
            {
                key: 'rank0',
                file: 'static/img/botrank0.png',
            },
            {
                key: 'rank1',
                file: 'static/img/botrank1.png',
            },
            {
                key: 'rank2',
                file: 'static/img/botrank2.png',
            },
            {
                key: 'rank3',
                file: 'static/img/botrank3.png',
            },
            {
                key: 'teambase',
                file: 'static/img/teambase.png',
            },
            {
                key: 'selectedbase',
                file: 'static/img/selectedbase.png',
            },
        ],
        effectSprites: [
            {
                key: 'building_explosion',
                file: 'static/sprite/building_explosion4.png',
                capacity: 12, // (5 defence + 1 base) * 2
                cellDimension: {width: 512 / 4, height: 512 / 4}
            },
            // {// working
            //     key: 'building_explosion',
            //     file: 'static/sprite/building_explosion2.png',
            //     capacity: 12, // (5 defence + 1 base) * 2
            //     cellDimension: {width: 960 / 5, height: 384 / 2}
            // },
            // {
            //     key: 'building_explosion',
            //     file: 'static/sprite/building_explosion.png',
            //     capacity: 12, // (5 defence + 1 base) * 2
            //     cellDimension: {width: 860 / 8, height: 664 / 6}
            // },
            // {
            //     key: 'building_explosion',
            //     file: 'static/sprite/building_explosion1.jpg',
            //     capacity: 12, // (5 defence + 1 base) * 2
            //     cellDimension: {width: 260 / 4, height: 300 / 4}
            // }
        ],
        globalAIConfig: {
            retreatAbilityLifeFraction: 0.3,
            hpAbilityLifeFraction: 0.45,
            lastAttackTimeHealOffset: 6000, // 6 seconds without damage to start healing
        },
        abilityConfig: {
            // iconurl: image to be shown in the ui icon to activate the event.
            scorch: {
                name: 'scorch',
                iconurl: 'static/img/flame_arrow_icon.png',
                resetInterval: 30000,
                duration: 5000,
                targetAttackFactor: 6,
                description: 'This ability targets single opponent warrior.<br>Once activated, the warrior will shoot fire arrows for the entire active duration, each attack to the target will cause 4 times the current attack damage.<br>It is best that this ability is activated while the warrior is already attacking an enemy. Otherwise the ability might complete the active duration without being able to use the ability on an opponent.',
                metaData: {
                    type: 'plane',
                    file: '/static/img/fireball.png',
                    key: 'material_ability_scorch',
                    cellDimension: {
                        width: 3,
                        height: 3,
                    }
                }
            },
            retreat: {
                // goto base
                name: 'retreat',
                description: 'Once the ability is activated, the warrior will return to base. This ability can be used to prevent the warrior from getting killed when life is low.',
                iconurl: '/static/img/flag-white.png',
                resetInterval: 5000,
                duration: 3000,
                metaData: {
                    type: 'plane',
                    file: '/static/img/flag-white.png',
                    key: 'material_ability_retreat',
                    cellDimension: {
                        width: 5,
                        height: 5,
                    }
                }
            },
            pulse: {
                // 1.5 attack to recipient
                // ((0.5 * distance) / range) attack to all
                // single attack. deactivate ability right after that.
                name: 'pulse',
                description: 'This ability targets multiple nearby opponents. This is a single attack ability meaning this ability can be used only once in the active duration. Once activated, the warrior releases an energy pulse during the next attack causing 3.5 times the current attack damage to the target opponent and 1.5 times the current attack damage to nearby opponent warriors.<br>This ability is best used when the warrior is already fighting and there are multiple enemy troops nearby. When used properly, the warrior can level up quickly.',
                iconurl: '/static/img/quake.jpeg',
                resetInterval: 40000,
                duration: 3000,
                neighbourAttackFactor: 2.5,
                targetAttackFactor: 4.5,
                metaData: {
                    type: 'sprite',
                    file: '/static/img/pulse.png',
                    key: 'sprite_manager_ability_pulse',
                    cellDimension: {width: 480 / 5, height: 192 / 2},
                    staticCellIndex: 9,
                    delay: 100,
                    startCellIndex: 0,
                    endCellIndex: 9,
                    width: 30,
                    height: 30,
                    visibleY: 10
                }
            },
            sheild: {
                // 0.25 * damage(all attacks received) received for the whole duration.
                name: 'sheild',
                description: 'This is a defensive ability. Once activated, the warrior gets a protective sheild which absorbs attack damage from opponents. During the active state, for each attack recieved, the warrior life loss is 0.25 times the attack damage. Use it when the warrior is recieving heavy attack.',
                iconurl: 'static/img/sheild.png',
                resetInterval: 20000,
                duration: 5000,
                defenceFactor: 0.25,
                metaData: {
                    type: 'plane',
                    file: '/static/img/dragon-sheild.png',
                    key: 'material_ability_sheild',
                    cellDimension: {
                        width: 5,
                        height: 5,
                    }
                }
            }
        },
        items:{
            lion:{
                bannedMeshes:[],
                audioFile: 'static/audio/fury.mp3',
                ability: [
                    {
                        key: 'abilityKey0',
                        action: 'retreat',
                        timeStamp: 0
                    },
                    {
                        key: 'abilityKey1',
                        action: 'pulse',
                        timeStamp: 0
                    }
                ],
                levelMap: [
                    {
                        damage: 60,
                        attack: 25,
                        life: 400,
                        speed: 1.5,
                        ability: [
                            {},
                            {
                                intensity: 1
                            }
                        ]
                    },
                    {
                        damage: 60,
                        attack: 27,
                        life: 450,
                        speed: 1.6,
                        ability: [
                            {},
                            {
                                intensity: 1
                            }
                        ]
                    },
                    {
                        damage: 60,
                        attack: 29,
                        life: 500,
                        speed: 1.7,
                        ability: [
                            {},
                            {
                                intensity: 1
                            }
                        ]
                    },
                    {
                        damage: 60,
                        attack: 30,
                        life: 530,
                        speed: 1.8,
                        ability: [
                            {},
                            {
                                intensity: 1
                            }
                        ]
                    },
                ],
                animations: {
                    idleAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 0,

                        // audio configurations
                        offset: 1,
                        duration: 1,
                        volume: 0.2
                    },
                    runAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 5,

                        // audio configurations
                        offset: 1,
                        duration: 1,
                        volume: 0.2
                    },
                    dieAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 6,

                        // audio configurations
                        offset: 2,
                        duration: 1,
                        volume: 0.2
                    },
                    spawnAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 4,

                        // audio configurations
                        offset: 1,
                        duration: 1,
                        volume: 0.2
                    },
                    attackAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 8,

                        // audio configurations
                        offset: 3,
                        duration: 0.5,
                        volume: 0.2
                    },
                    teamLevelUpAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 8,

                        // audio configurations
                        offset: 4,
                        duration: 1,
                        volume: 0.2
                    },
                    enemyLevelUpAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 8,

                        // audio configurations
                        offset: 5,
                        duration: 1,
                        volume: 0.2
                    },
                    gotoAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 8,

                        // audio configurations
                        offset: 0,
                        duration: 1,
                        volume: 0.2
                    },
                    selectAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 8,

                        // audio configurations
                        offset: 0,
                        duration: 1,
                        volume: 0.2
                    },
                },

                description: "Once a fearce fighter, a leader and a protector. He was mortally wounded in a war and was ready to embrace a warrior's death. But he was subjected to human-animal hybrid experiments agains his will. Once in higher level, lion is a formidable force to be reckoned with.",
                
                weaponType: 'melee',
                projectileShootY: 0.75,
                projectileReceiveY: 0.75,

                attackinterval: 1000,
                // attack: 2,
                // life:60,
                // speed:2, //one tile per 1000 ms.
                sight: 6,
                range: 2,
                parentMesh: null,
                file:'digimon_3d_leomonice_leomon',
                scale:4,
                respawnTime: 15000, // 3 seconds
                iconurl: 'static/img/lion_icon.png',
                headerScale: 0.05,
                headerPositionY: 1.8,
                headerSize: 25,
                hpBarScale: 0.5,
                hpBarPositionY: 2.5,
            },
            swordman:{
                bannedMeshes:[6],
                audioFile: 'static/audio/swordman.mp3',
                ability: [
                    {
                        key: 'abilityKey0',
                        action: 'retreat',
                        timeStamp: 0
                    },
                    {
                        key: 'abilityKey1',
                        action: 'sheild',
                        timeStamp: 0
                    }
                ],
                levelMap: [
                    {
                        damage: 60,
                        attack: 2,
                        life: 300,
                        speed: 1,
                        ability: [
                            {},
                            {
                                intensity: 0.1
                            }
                        ]
                    },
                    {
                        damage: 60,
                        attack: 2,
                        life: 350,
                        speed: 1.1,
                        ability: [
                            {},
                            {
                                intensity: 0.15
                            }
                        ]
                    },
                    {
                        damage: 60,
                        attack: 3,
                        life: 400,
                        speed: 1.2,
                        ability: [
                            {},
                            {
                                intensity: 0.2
                            }
                        ]
                    },
                    {
                        damage: 60,
                        attack: 3,
                        life: 450,
                        speed: 1.3,
                        ability: [
                            {},
                            {
                                intensity: 0.25
                            }
                        ]
                    },
                ],
                animations: {
                    idleAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 4,

                        // audio configurations
                        offset: 1,
                        duration: 1,
                        volume: 0.2
                    },
                    runAnimation:{
                        speed:6,
                        type: 'flat',
                        index: 1,

                        // audio configurations
                        offset: 1,
                        duration: 1,
                        volume: 0.2
                    },
                    dieAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 3,

                        // audio configurations
                        offset: 2,
                        duration: 1,
                        volume: 0.2
                    },
                    spawnAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 2,

                        // audio configurations
                        offset: 3,
                        duration: 1.5,
                        volume: 0.2
                    },
                    attackAnimation:{
                        speed:3,
                        type: 'flat',
                        index: 0,

                        // audio configurations
                        offset: 5,
                        duration: 0.5,
                        volume: 0.2
                    },

                    teamLevelUpAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 8,

                        // audio configurations
                        offset: 6,
                        duration: 1,
                        volume: 0.2
                    },
                    enemyLevelUpAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 8,

                        // audio configurations
                        offset: 6,
                        duration: 1,
                        volume: 0.2
                    },
                    gotoAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 8,

                        // audio configurations
                        offset: 0,
                        duration: 1.5,
                        volume: 0.2
                    },
                    selectAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 8,

                        // audio configurations
                        offset: 0,
                        duration: 1.5,
                        volume: 0.2
                    },
                },

                description: 'An anciant warrior with unknown past. In the quest to become the strongest warrior, he kept replacing his body parts with mechanical alternatives. But in the process some how he lost himself. Now he is a walking tank tormented by fragments of his past memories. All that is left of him is his conscience and endurance. Although he is slow to move but a high level swordman is virtually unkillable. Use him as a sheild for other troops.',
                
                weaponType: 'melee',
                projectileShootY: 0.75,
                projectileReceiveY: 0.75,

                attackinterval: 1000,
                // attack: 1,
                // life:40,
                // speed:2, //one tile per 1000 ms.
                sight: 6,
                range: 2,
                parentMesh: null,
                file:'low_poly_knight_animated',
                scale:1.7,
                respawnTime: 15000, // 3 seconds
                iconurl: 'static/img/swordsman_icon.png',
                headerScale: 0.14,
                headerPositionY: 3.5,
                headerSize: 25,
                hpBarScale: 1,
                hpBarPositionY: 5,
            },
            archer:{
                bannedMeshes:[],
                audioFile: 'static/audio/archer.mp3',
                ability: [
                    {
                        key: 'abilityKey0',
                        action: 'retreat',
                        timeStamp: 0
                    },
                    {
                        key: 'abilityKey1',
                        action: 'scorch',
                        timeStamp: 0
                    }
                ],
                levelMap: [
                    {
                        damage: 60,
                        attack: 2,
                        life: 80,
                        speed: 1,
                        ability: [
                            {},
                            {
                                intensity: 1
                            }
                        ]
                    },
                    {
                        damage: 60,
                        attack: 2,
                        life: 90,
                        speed: 1.1,
                        ability: [
                            {},
                            {
                                intensity: 1
                            }
                        ]
                    },
                    {
                        damage: 60,
                        attack: 3,
                        life: 100,
                        speed: 1.2,
                        ability: [
                            {},
                            {
                                intensity: 1
                            }
                        ]
                    },
                    {
                        damage: 60,
                        attack: 3,
                        life: 105,
                        speed: 1.3,
                        ability: [
                            {},
                            {
                                intensity: 1
                            }
                        ]
                    },
                ],
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
                        offset: 1,
                        duration: 1,
                        volume: 0.2
                    },
                    runAnimation:{
                        speed:1,
                        type: 'interval',
                        index: 0,
                        from: 2.4,
                        to: 3.1,

                        // audio configurations
                        offset: 1,
                        duration: 1,
                        volume: 0.2
                    },
                    dieAnimation:{
                        speed:1,
                        type: 'interval',
                        index: 0,
                        from: 17,
                        to: 19.1,

                        // audio configurations
                        offset: 2,
                        duration: 1,
                        volume: 0.2
                    },
                    spawnAnimation:{
                        speed:1,
                        type: 'interval',
                        index: 0,
                        from: 16,
                        to: 17,

                        // audio configurations
                        offset: 1,
                        duration: 1,
                        volume: 0.2
                    },
                    attackAnimation:{
                        speed:2,
                        type: 'interval',
                        index: 0,
                        from: 6.5,
                        to: 7.5,

                        // audio configurations
                        offset: 3,
                        duration: 1,
                        volume: 0.2
                    },

                    teamLevelUpAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 8,

                        // audio configurations
                        offset: 5,
                        duration: 1,
                        volume: 0.2
                    },
                    enemyLevelUpAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 8,

                        // audio configurations
                        offset: 5,
                        duration: 1,
                        volume: 0.2
                    },
                    gotoAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 8,

                        // audio configurations
                        offset: 4,
                        duration: 1,
                        volume: 0.2
                    },
                    selectAnimation:{
                        speed:1,
                        type: 'flat',
                        index: 8,

                        // audio configurations
                        offset: 0,
                        duration: 1,
                        volume: 0.2
                    },
                },
                
                description: 'She has little life and can be killed easily. But Once leveled up she has highest agility and attack. Sheild her well and she can raise havoc to enemy. Also if used well, she can kill the retreating enemy troops easily.',

                weaponType: 'arrow',
                projectileShootY: 0.75,
                projectileReceiveY: 0.75,

                attackinterval: 1000,
                // attack: 3,
                // life:20,
                // speed:2, //one tile per 1000 ms.
                sight: 6,
                range: 4,
                parentMesh: null,
                // file:'low_poly_character_rpg_kit_animation',
                file: 'bow_trigger_game_character',
                scale:0.2,
                respawnTime: 15000, // 3 seconds
                iconurl: 'static/img/archer_icon.png',
                headerScale: 1.5,
                headerPositionY: 16,
                headerSize: 25,
                hpBarScale: 8,
                hpBarPositionY: 40,
            },
            tower:{
                life:500,
                audioFile: 'static/audio/building.mp3',
                levelMap: [
                    {
                        damage: 30,
                        attack: 10,
                    },
                ],
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
                    attackAnimation:{
                        offset: 8,
                        duration: 1.5,
                        autoplay: false,
                        loop: false,
                        volume: 0.2
                    },
                    destroyAnimation:{
                        offset: 3,
                        duration: 4,
                        autoplay: false,
                        loop: false,
                        volume: 0.2
                    },
                    captureAnimation:{
                        offset: 0,
                        duration: 2.5,
                        autoplay: false,
                        loop: false,
                        volume: 0.2
                    },
                },

                description: 'description tower',

                // attack:4,
                iconurl: 'static/img/swordsman_icon.png',
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
                life:200,
                audioFile: 'static/audio/building.mp3',
                levelMap: [
                    {
                        damage: 30,
                        attack: 2,
                    },
                ],
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
                    attackAnimation:{
                        offset: 8,
                        duration: 1.5,
                        autoplay: false,
                        loop: false,
                        volume: 0.2
                    },
                    destroyAnimation:{
                        offset: 3,
                        duration: 4,
                        autoplay: false,
                        loop: false,
                        volume: 0.2
                    },
                    captureAnimation:{ // this audio must never play. this config added to avoid runtime error
                        offset: 0,
                        duration: 2.5,
                        autoplay: false,
                        loop: false,
                        volume: 0.2
                    },
                },

                description: 'description base',


                // attack:2,
                iconurl: 'static/img/swordsman_icon.png',
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