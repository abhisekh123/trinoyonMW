/**
 * Mostly the calbacks to html events.
 */

tg.hl = {};

// tg.hl.
console.log('sdf');
$('.button-home-start').click(function(){
    console.log('clicked button-home-start');
    tg.network.requestGameAdmit();
});

$('.bot-selection-option-container').click(function(element){
    element.preventDefault();
    var id = this.id;
    console.log('clicked bot-selection-option-container with id:', id);
    var elemntName = $('#' + id).attr('name');
    console.log('elemntName:', elemntName);
    // tg.network.requestGameAdmit();
    var rowCol = id.split('_')[1];
    var rowIndex = rowCol.split('-')[0];
    console.log(rowCol);
    var rowIdPrefix = "bot-image-tag_" + rowIndex;
    console.log(rowIdPrefix);
    $("[id^=" + rowIdPrefix + "]").hide();
    $('#bot-image-tag_' + rowCol).show();
    var currentElementImageSource = $("#botoptionimage_" + rowCol).attr('src');
    console.log(currentElementImageSource);
    $('#bot-selection-' + rowIndex).attr('src', currentElementImageSource);

    tg.botSelection.botList[rowIndex - 1] = elemntName;

    console.log(tg.botSelection);
});

tg.hl.setLoaderHeaderText = function(textParam){
    $('#load-indicator-header').html(textParam);
};

tg.hl.gameStartCountDownTickHandler = function(){
    $('#load-estimate-time-elapsed').html('Time elapsed ' + tg.uu.convertSecondsMMSS(tg.clockTimeElapsed / 1000));
};

tg.hl.countDownHandler_idle = function(){
    // do nothing
    console.log('countDownHandler_idle');
}

