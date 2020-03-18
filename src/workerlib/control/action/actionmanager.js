// const workerState = require('../../state/workerstate');


module.exports = {
    'Base'                      : require('./baseactionprocessor'),
    'Minion'                    : require('./minionactionprocessor'),
    'Bot'                       : require('./botactionprocessor'),
    'Tower'                     : require('./toweractionprocessor'),
    'actionUtility'             : require('./actionutility'),
    
    init: function(){
        this.Base.init();
        this.Minion.init();
        this.Bot.init();
        this.Tower.init();
        this.actionUtility.init();
    }
};