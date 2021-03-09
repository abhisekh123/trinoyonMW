// function initMethodTest(){
//     alert('init audio');
// },

tg.audio = {};

tg.audio.loadAudioAssets = function () {
    // var music = new BABYLON.Sound("sound", 'static/audio/Dark-Things-2_V001.mp3', tg.scene, null, { 
    //     loop: true, 
    //     autoplay: true 
    //  });	

    //     function callback() { 
    //         setTimeout(function() {
    //             console.log('##############');
    //             tg.music.setVolume(1);
    //             tg.music.play();
    //         }, 10)
    //     }
    // );
    // console.log('-----------');
    var audioParameters = null;
    for (var i = 0; i < tg.worldItems.ambientAudio.length; ++i) {
        var audioItemConfig = tg.worldItems.ambientAudio[i];

        if (audioItemConfig.offset < 0) {
            audioParameters = {
                // playbackRate: 1.0 ,
                loop: audioItemConfig.loop,
                autoplay: audioItemConfig.autoplay,
                volume: audioItemConfig.volume,
            }
        } else {
            audioParameters = {
                // playbackRate: 1.0 ,
                loop: audioItemConfig.loop,
                autoplay: audioItemConfig.autoplay,
                volume: audioItemConfig.volume,
                offset: audioItemConfig.offset,
                length: audioItemConfig.length
            }
        }
        tg.audio[audioItemConfig.key] = new BABYLON.Sound(
            'sound_' + audioItemConfig.key,
            audioItemConfig.file,
            tg.scene,
            function () {
                // console.log('##############');
                // console.log(tg.music);
                // tg.music.play(); 
                tg.am.updateNewAssetLoaded(1);
            },
            // function callback() { setTimeout(function() {tg.music.play();}, 5000)},
            audioParameters
        );
    }

    // var soundSprite = new BABYLON.Sound(
    //     "Violons",
    //     "static/audio/test.mp3",
    //     tg.scene,
    //     null, {
    //         loop: true,
    //         autoplay: true,
    //         length: 9,
    //         offset: 14
    //     }
    // );

    return tg.worldItems.ambientAudio.length;
};

tg.audio.initGameDynamicObjectAudio = function (objectParam, objectConfigParam) {
    var soundHandle = new BABYLON.Sound(
        'sound_' + objectParam.id,
        objectConfigParam.audioFile,
        tg.scene,
        function () {
            // console.log('##############');
            // console.log(tg.music);
            // tg.music.play(); 
            tg.am.updateNewAssetLoaded(1);
        },
        // function callback() { setTimeout(function() {tg.music.play();}, 5000)},
        {
            volume: 0.2
        }
    );

    objectParam.sound = soundHandle;
};

tg.audio.getDistanceFromCameraTarget = function (objectParam) {
    return tg.getDistanceBetweenPoints(
        getGridPositionFromFloorPosition(tg.am.cameraTarget.position.x),
        getGridPositionFromFloorPosition(tg.am.cameraTarget.position.z),
        getGridPositionFromFloorPosition(objectParam.controlMesh.position.x),
        getGridPositionFromFloorPosition(objectParam.controlMesh.position.z)
    );
};

tg.audio.playItemEventAudio = function (objectParam, eventType) {
    if (tg.isGameLive != true) {
        return;
    }
    tg.audio.stopAudio(objectParam.sound);

    switch (eventType) {
        case 'attack':
            // var animConfig = objectParam.animations.attackAnimation;
            var distance = tg.audio.getDistanceFromCameraTarget(objectParam);

            if (distance <= tg.worldItems.uiConfig.maxAudibleDistance) {
                tg.audio.playGameAudio(
                    objectParam.sound,
                    objectParam.animations.attackAnimation.offset,
                    objectParam.animations.attackAnimation.duration
                );
            }
            break;
        case 'select':
            tg.audio.playGameAudio(
                objectParam.sound,
                objectParam.animations.selectAnimation.offset,
                objectParam.animations.selectAnimation.duration
            );
            break;
        case 'levelup':
            // var animConfig = objectParam.animations.attackAnimation;
            // var distance = tg.audio.getDistanceFromCameraTarget(objectParam);

            // if (distance <= tg.worldItems.uiConfig.maxAudibleDistance) {
            //     if(objectParam.team == tg.bot.userPlayerConfig.team){
            //         tg.audio.playGameAudio(
            //             objectParam.sound,
            //             objectParam.animations.teamLevelUpAnimation.offset,
            //             objectParam.animations.teamLevelUpAnimation.duration
            //         );
            //     }else{
            //         tg.audio.playGameAudio(
            //             objectParam.sound,
            //             objectParam.animations.enemyLevelUpAnimation.offset,
            //             objectParam.animations.enemyLevelUpAnimation.duration
            //         );
            //     }
                
            // }
            if(objectParam.playerID == tg.bot.userPlayerConfig.id){
                // console.log('level up:', objectParam.id);
                tg.audio.playGameAudio(
                    objectParam.sound,
                    objectParam.animations.teamLevelUpAnimation.offset,
                    objectParam.animations.teamLevelUpAnimation.duration
                );
            }
            
            break;
        case 'spawn':
            // var animConfig = objectParam.animations.attackAnimation;
            if(objectParam.playerID == tg.bot.userPlayerConfig.id){
                tg.audio.playGameAudio(
                    objectParam.sound,
                    objectParam.animations.spawnAnimation.offset,
                    objectParam.animations.spawnAnimation.duration
                );
            }else{
                var distance = tg.audio.getDistanceFromCameraTarget(objectParam);

                if (distance <= tg.worldItems.uiConfig.maxAudibleDistance) {
                    tg.audio.playGameAudio(
                        objectParam.sound,
                        objectParam.animations.spawnAnimation.offset,
                        objectParam.animations.spawnAnimation.duration
                    );
                }
            }
            
            break;
        case 'die':
            // var animConfig = objectParam.animations.attackAnimation;
            if(objectParam.playerID == tg.bot.userPlayerConfig.id){
                tg.audio.playGameAudio(
                    objectParam.sound,
                    objectParam.animations.dieAnimation.offset,
                    objectParam.animations.dieAnimation.duration
                );
            }else{
                var distance = tg.audio.getDistanceFromCameraTarget(objectParam);

                if (distance <= tg.worldItems.uiConfig.maxAudibleDistance) {
                    tg.audio.playGameAudio(
                        objectParam.sound,
                        objectParam.animations.dieAnimation.offset,
                        objectParam.animations.dieAnimation.duration
                    );
                }
            }
            
            break;
        case 'goto':
            // tg.audio.playGameAudio(
            //     objectParam.sound,
            //     objectParam.animations.gotoAnimation.offset,
            //     objectParam.animations.gotoAnimation.duration
            // );
            if(objectParam.playerID == tg.bot.userPlayerConfig.id){
                tg.audio.playGameAudio(
                    objectParam.sound,
                    objectParam.animations.dieAnimation.offset,
                    objectParam.animations.dieAnimation.duration
                );
            }
            break;
        case 'destroy':
            tg.audio.playGameAudio(
                objectParam.sound,
                objectParam.animations.destroyAnimation.offset,
                objectParam.animations.destroyAnimation.duration
            );
            break;
        case 'capture':
            tg.audio.playGameAudio(
                objectParam.sound,
                objectParam.animations.captureAnimation.offset,
                objectParam.animations.captureAnimation.duration
            );
            break;
        default:
            console.error('ERROR:Unknown event type @ tg.audio.playItemEventAudio : ' + eventType);
            break;
    }
};

tg.audio.playAudio = function (soundParam) {
    soundParam.play();
    // tg.audio.ambience.play(time,offset,length); // all in seconds. time: play audio after given seconds delay.
    // tg.audio.ambience.play(0,1,1);
};

tg.audio.stopAudio = function (soundParam) {
    soundParam.stop();
};

tg.audio.playGameAudio = function (soundParam, offset, duration) {
    soundParam.play(0, offset, duration);
    // if(tg.isGameLive == true){
    //     soundParam.play(0, offset, duration);
    // }
    // tg.audio.ambience.play(time,offset,length); // all in seconds. time: play audio after given seconds delay.
    // tg.audio.ambience.play(0,1,1);
};

// tg.audio.stopGameAudio = function (soundParam) {
//     soundParam.stop();
// };


