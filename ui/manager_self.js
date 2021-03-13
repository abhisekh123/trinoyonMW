
// self has already been initialised in t.js
// tg.self = {};

tg.self.resumeOngoingMatchIfAny = function() {
    console.log('resume ongoing session.');
    if(tg.self.userConfig.isPlaying == true){
        console.log('already playing a game.');
        tg.network.requestGameResume();
    } else {
        console.log('no ongoing game');
    }
}
