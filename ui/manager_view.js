tg.view = {};

tg.view.processMMRUpdate = function (updateParam) {
    console.log('got mmr update:', updateParam);
}

tg.view.processMMRExpel = function (updateParam) {
    $('#enemy-player-container-parent').hide();
    $('#team-player-container-parent').hide();
    $('#matchmaking-footer-container').hide();
    $('#gameplay-footer-container').show();
}

tg.view.processMMRAdmit = function (updateParam) {
    $('#enemy-player-container-parent').show();
    $('#team-player-container-parent').show();
    $('#matchmaking-footer-container').show();
    $('#gameplay-footer-container').hide();
}
