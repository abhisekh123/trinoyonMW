
/**
 * MANAGES SERVER LIFECYCLE ROUTINES
 */

const environmentState = require('../state/environmentstate');

// TODO: On user join : send status (queue status)

module.exports = {
    serverState: null,
    dbManager: null,
    init: function(serverState: any, dbManager: any) {
        this.serverState = serverState;
        this.dbManager = dbManager;
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
        weeklyTopPlayers.topPlayers = this.searchTopPlayers(3, 'weeklytopplayers');

        this.dbManager.updateServerState('weeklytopplayers');

        return weeklyTopPlayers;
    },

    searchTopPlayers: function(count: number, playerSearchType: string) {
        const chosenPlayers = [];
        // let currentIndex = 0;

        const comparisonCriteria = this.getComparisonCriteriaList(playerSearchType);

        for(var i = 0; i < count; ++i){
            chosenPlayers[i] = this.serverState.users_db_state[this.serverState.user_id_list[0]];
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

                if(this.isCurrentPlayerBetterThanTheCosenOne(playerSearchType, chosenPlayers[i], currentPlayer, comparisonCriteria) == true){
                    chosenPlayers[i] = currentPlayer;
                }
            }
        }
    },

    ratePlayerBasedOnCriteria: function(player: any, criteria: string) {
        switch (criteria) {
            case 'wvictory':
                return player.weeklywin;
                break;
            case 'wkill':
                return player.wkill;
                break;
            case 'wdamage':
                return player.wdamage;
                break;
        
            default:
                break;
        }
    },

    isCurrentPlayerBetterThanTheCosenOne: function(chosenPlayer: any, currentPlayer: any, comparisonCriteria: any) {
        for(var i = 0; i < comparisonCriteria.length; ++i){
            var choosenPlayerRating = this.ratePlayerBasedOnCriteria(chosenPlayer, comparisonCriteria[i]);
            var currentPlayerRating = this.ratePlayerBasedOnCriteria(currentPlayer, comparisonCriteria[i]);
            if(choosenPlayerRating == currentPlayerRating){
                // draw. check for next criteria
            } else {
                if(choosenPlayerRating < currentPlayerRating){
                    return true;
                } else {
                    return false;
                }
            }
        }
        return true;
    },

    getTopPlayersSelectiveInformation: function(chosenPlayerIds: any, playerSearchType: string) {

    },

    getComparisonCriteriaList: function(playerSearchType: string) {
        switch (playerSearchType) {
            case 'weeklytopplayers':
                return [
                    'wvictory',
                    'wkill',
                    'wdamage',
                ]
                break;
        
            default:
                break;
        }
    }
};

