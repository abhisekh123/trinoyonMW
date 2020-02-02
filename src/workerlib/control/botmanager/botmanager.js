
module.exports = {
    botArray: [],
    botMap: {},
    buildingMap: {},
    buildingArray: [],
    // baseMap: {}

    init: function(){
        
    },

    processBot: function(botID, timeSliceParam){ // time slice is the time that needs to be consumed in this cycle
        
        var currentBot = workerstate.botArray[botID];
        // console.log('-------->>start processBot for: <' + currentBot.id + '>');
        var timeSlice = timeSliceParam;
        while(timeSlice > 0){
            // console.log('timeSlice:', timeSlice);
            if(currentBot.isPerformingAction){
                // // console.log('action:' + currentBot.id);
                timeSlice = this.continuePerformingAction(currentBot, timeSlice);
            }else if(currentBot.hasInstruction){ // instruction provided either by user or AI
                // // console.log('instruction:' + currentBot.id);
                this.processInstruction(botID);
            }else{// standing idle. This is executed for idle user bot.
                // // console.log('else');
                // timeSlice = 0;
                this.requestAIToInstructBot(currentBot);
            }
        }
        // // console.log('exit');
    },
}