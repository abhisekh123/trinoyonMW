const workerState = require('../../state/workerstate');

module.exports = {
    'Base'                      : require('./core/Node'),
    'Minion'                    : require('./core/Grid'),
    'Bot'                       : require('./core/Util'),
    'Tower'                     : require('./core/DiagonalMovement'),
    
    init: function(){
        this.Base.init();
        this.Minion.init();
        this.Bot.init();
        this.Tower.init();
    }
};