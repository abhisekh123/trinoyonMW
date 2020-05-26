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

tg.audio.initGameDynamicObjectAudio = function(objectParam, objectConfigParam){
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
        {}
    );
    
    objectParam.sound = soundHandle;
};

tg.audio.playItemEventAudio = function(objectParam, eventType){
    // if(tg.isGameLive != true){
    //     return;
    // }

    switch (eventType) {
        case 'attack':
            // var animConfig = objectParam.animations.attackAnimation;
            var distance = tg.getDistanceBetweenPoints(
                getGridPositionFromFloorPosition(tg.am.cameraTarget.position.x),
                getGridPositionFromFloorPosition(tg.am.cameraTarget.position.z),
                getGridPositionFromFloorPosition(objectParam.controlMesh.position.x),
                getGridPositionFromFloorPosition(objectParam.controlMesh.position.z)
            );

            if(distance <= tg.worldItems.uiConfig.maxAudibleDistance){
                tg.audio.playGameAudio(
                    objectParam.sound,
                    objectParam.animations.attackAnimation.offset,
                    objectParam.animations.attackAnimation.duration
                );
            }
            
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
    if(tg.isGameLive == true){
        soundParam.play(0, offset, duration);
    }
    // tg.audio.ambience.play(time,offset,length); // all in seconds. time: play audio after given seconds delay.
    // tg.audio.ambience.play(0,1,1);
};

tg.audio.stopGameAudio = function (soundParam) {
    soundParam.stop();
};


