/**
 * Mostly the calbacks to html events.
 */

tg.hl = {};

// tg.hl.
console.log('sdf');
$('#button-start').click(function(){
    console.log('clicked button-start');
    tg.nm.requestGameAdmit();
});

tg.hl.gameStartCountDownTickHandler = function(){
    $('#load-estimate-time-elapsed').html(tg.uu.convertSecondsMMSS(tg.clockTimeElapsed));
};

tg.hl.countDownHandler_idle = function(){
    // do nothing
    console.log('countDownHandler_idle');
}

