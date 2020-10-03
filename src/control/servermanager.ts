
/**
 * MANAGES SERVER LIFECYCLE ROUTINES
 */

const environmentState = require('../state/environmentstate');

// TODO: On user join : send status (queue status)

module.exports = {
    serverState: null,
    init: function(serverState: any) {
        this.serverState = serverState;
    },

    initiateServerShutDownRoutine: function() {
        this.serverState.state = 'shuttingdown'
    },

    

    updateWeeklyTopPlayers: function() {
        console.log('updateWeeklyTopPlayers');
        const weeklyTopPlayers = this.serverState.persistant_server_state['weeklytopplayers'];
        if(weeklyTopPlayers == null || weeklyTopPlayers == undefined){
            console.error('no record found for top players.');
            return {};
        }

        // const weeklytopplayers = {
        //     name: 'weeklytopplayers',
        //     lastUpdate: now,
        //     isActive: true,
        //     topPlayers: [],
        // };
        weeklyTopPlayers.lastUpdate = this.serverState.serverTime;
        weeklyTopPlayers.isActive = true;
        weeklyTopPlayers.topPlayers = [];


        return weeklyTopPlayers;
    },

    searchTopPlayers: function(count: number, playerSearchType: string) {
        const chosenPlayers = [];
        // let currentIndex = 0;

        chosenPlayers[0] = this.serverState.users_db_state[this.serverState.user_id_list[0]];

        for(var i = 0; i < count; ++i){
            for(var j = 0; j < this.serverState.user_id_list.length; ++j){
                const currentPlayer = this.serverState.users_db_state[this.serverState.user_id_list[j]];
                let isCurrentPlayerAlreadyChosen = false;
                // routine to avoid duplicate entry.
                for(var k = 0; k <= i; ++k){ // is current player already chosen
                    if(chosenPlayers[k].id == currentPlayer.id){
                        isCurrentPlayerAlreadyChosen = true;
                        break;
                    }
                }
                if(isCurrentPlayerAlreadyChosen == true){
                    continue;
                }

                if(this.isCurrentPlayerBetterThanTheCosenOne(playerSearchType, chosenPlayers[i], currentPlayer) == true){
                    chosenPlayers[i] = currentPlayer;
                }
            }
        }
    },

    isCurrentPlayerBetterThanTheCosenOne: function(playerSearchType: string, chosenPlayer: any, currentPlayer: any) {

    },

    getTopPlayersSelectiveInformation: function(chosenPlayerIds: any, playerSearchType: string) {

    },

    getComparisonCriteriaList: function(playerSearchType: string) {
        switch (playerSearchType) {
            case 'weeklytopplayers':
                return [
                    'victory',
                    'kill',
                    'damage',
                ]
                break;
        
            default:
                break;
        }
    }
};

