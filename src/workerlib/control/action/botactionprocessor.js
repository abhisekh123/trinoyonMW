
const workerState = require('../../state/workerstate');
const actionUtility = require('./actionutility');

module.exports = {
    // baseMap: {}
    worldConfig: null,
    itemConfig: null,
    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
    },

    

    
    continuePerformingAction: function(botConfig, gameRoom, timeSlice){
        switch(botConfig.action){
            case 'goto':
            case 'march':
            // check if hostile in range
            timeSlice = actionUtility.traverseBotThroughPath(botConfig, timeSlice, gameRoom);
            // action = ready
            // else continue transport
            break;
            default:
            console.log('unknown botConfig.action:', botConfig.action);
            return 0;
        }
        return timeSlice;
    },
    
}
