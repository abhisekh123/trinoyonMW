/**
 * Single file exporter of all underlying ai modules. Makes import clean.
 * This is the file that should be imported by other files.
 * This file internally will use the sub modules for ai functions.
 */
const aiUtility = require('./aiutility');

module.exports = {
    'Player'                    : require('./playeraiprocessor'),
    'Base'                      : require('./baseaiprocessor'),
    'Minion'                    : require('./minionaiprocessor'),
    'Bot'                       : require('./botaiprocessor'),
    'Tower'                     : require('./toweraiprocessor'),

    init: function(){
        this.Player.init();
        this.Base.init();
        this.Minion.init();
        this.Bot.init();
        this.Tower.init();
        aiUtility.init();
    }
};