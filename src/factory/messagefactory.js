
const utilityFunctions = require('../utils/utilityfunctions');

module.exports = {
    
    getMessageObjectForUser: function() {
        const timeNow = utilityFunctions.getCurrentTime();
        return {
            type: null,
            time: timeNow,
            id: 'm_' + timeNow,
        };
    }
}