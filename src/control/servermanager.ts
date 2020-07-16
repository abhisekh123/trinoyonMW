
/**
 * MANAGES SERVER LIFECYCLE ROUTINES
 */

// const serverState = require('../state/serverstate');
const environmentState = require('../state/environmentstate');

// TODO: On user join : send status (queue status)

module.exports = {
    initiateServerShutDownRoutine: function() {
        serverState.state = 'shuttingdown'
    }
};

