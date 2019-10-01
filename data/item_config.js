    // per stride : 0.5M in 0.25 sec 
    // diagonal movement in 0.75 sec
    // linear movement in 0.5 sec
    // aim in 0.5 sec

    var itemConfigs = {
        buildings:{
            tower:{
                life:10,
                attack:2
            },
            base:{
                life:10,
                attack:2
            }
        },
        characters:{
            lion:{
                bannedMeshes:[],
                idleAnimationIndex:0,
                runAnimationIndex:5,
                dieAnimationIndex:6,
                spawnAnimationIndex:4,
                attackAnimationIndex:8,
                respawnInterval: 3000,
                spawnDuration: 500,
                attackinterval: 500,
                attack: 1,
                life:10,
                speed:1, //one tile per 1000 ms.
                strideDistance: 0.5,
                strideTime: 0.25,
                sight: 7,
                range: 2,
                parentMesh: null,
                model:'digimon_3d_leomonice_leomon',
                scale:5
            },
            boy:{
                bannedMeshes:[9],
                idleAnimationIndex:0,
                runAnimationIndex:16,
                dieAnimationIndex:9,
                spawnAnimationIndex:7,
                attackAnimationIndex:2,
                respawnInterval: 3000,
                spawnDuration: 500,
                attackinterval: 500,
                attack: 1,
                life:10,
                speed:1, //one tile per 1000 ms.
                strideDistance: 0.5,
                strideTime: 0.25,
                sight: 7,
                range: 2,
                parentMesh: null,
                model:'low_poly_character_rpg_kit_animation',
                scale:0.04
            },
        },
        character_old:{
            rifleman:{
                attachmentmesh:['rifle', 'handGun'],
                life:10,
                speed:1, //one tile per 1000 ms.
                strideDistance: 0.5,
                strideTime: 0.25,
                sight: 11,
            },
            commander:{
                attachmentmesh:['mcGun', 'handGun'],
                life:10,
                speed:1, //one tile per 1000 ms.
                strideDistance: 0.5,
                strideTime: 0.25,
                sight: 13
            },
        },
        weapon:{ // range 0 <= 26. Time intervals in milliseconds.
            rifle:{
                size:[2,2,2],
                rotation:0.001,
                range: 7,
                holsterinterval: 250,
                equipinterval: 250,
                reloadinterval: 250,
                attackinterval: 500,
                damage: 2,
                ammocapacity: 1,
            },
            handGun:{
                size:[2,2,2],
                rotation:0.001,
                range:4,
                holsterinterval: 250,
                equipinterval: 250,
                reloadinterval: 250,
                attackinterval: 500,
                damage: 1,
                ammocapacity: 6,
            },
            mcGun:{
                size:[2,2,2],
                rotation:0.001,
                range:5,
                holster: 0.25,
                equip: 0.25,
                reload: 0.25,
                attack: 0.5,
                ammocapacity: 10,
            }
        },
        ammo:{
            rifle:{
                regular:{
                    type:1,
                    size:[2,2,2],
                    position:[10,1,10],
                    rotation:0.001
                }
            }
        },
        animationconfig:{
            rifleman:{
                idle:{},
            },
            commander:{
                idle:{},
            }
        },
        meshconfig:{
            rifleman:{
                type:'human',
                head:{
                    mesh:'basic',
                    texture:'color',
                    payload:{
                        shape:'cube',
                        scale:[1,1,1],
                        size:[1,1,1],
                        color:'#222222'
                    }
                }
            },
            commander:{
                type:'human',
                head:{
                    mesh:'basic',
                    texture:'color',
                    payload:{
                        shape:'sphere',
                        scale:[1,1,1],
                        size:[1,1,1],
                        color:'#222222'
                    }
                }
            },
            rifle:{
                type:'weapon',
                body:{
                    mesh:'basic',
                    texture:'color',
                    payload:{
                        shape:'cube',
                        scale:[1,1,1],
                        size:[1,1,1],
                        color:'#222222'
                    }
                }
            }
        }
    };
    
    
    if(typeof tg !== 'undefined' && tg){
        // console.log(tg);
        tg.itemConfigs = itemConfigs;
    }else{
        module.exports = itemConfigs;
    }