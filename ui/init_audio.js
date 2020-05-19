

// function initMethodTest(){
//     alert('init audio');
// },

tg.audio = {};

tg.audio.loadAudioAssets = function(){
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
    for(var i = 0; i < tg.worldItems.ambientAudio.length; ++i){
        var audioItemConfig = tg.worldItems.ambientAudio[i];
        tg.audio[audioItemConfig.key] = new BABYLON.Sound(
            'sound' + audioItemConfig.key,
            audioItemConfig.file,
            tg.scene, 
            function () { 
                // console.log('##############');
                // console.log(tg.music);
                // tg.music.play(); 
                tg.am.updateNewAssetLoaded(1);
            },
            // function callback() { setTimeout(function() {tg.music.play();}, 5000)},
            { 
                // playbackRate: 1.0 ,
                loop: audioItemConfig.loop,
                autoplay: audioItemConfig.autoplay,
            }
        );
    }

    return tg.worldItems.ambientAudio.length;
};

