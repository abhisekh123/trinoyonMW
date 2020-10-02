
/**
 * MANAGES SERVER LIFECYCLE ROUTINES
 */

const serverState = require('../state/serverstate');
const environmentState = require('../state/environmentstate');

// TODO: On user join : send status (queue status)

module.exports = {
    initiateServerShutDownRoutine: function() {
        serverState.state = 'shuttingdown'
    },

    updateWeeklyTopPlayers: function() {
        console.log('updateWeeklyTopPlayers');
        let weeklyTopPlayers = serverState.persistant_server_state['weeklytopplayers'];
        if(weeklyTopPlayers == null || weeklyTopPlayers == undefined){

        }
    }
};

