
/**
 * MANAGES SERVER LIFECYCLE ROUTINES
 */

const environmentState = require('../state/environmentstate');
const dbManager = require('../persistance/dbmanager');

// TODO: On user join : send status (queue status)

module.exports = {
    serverState: null,
    // dbManager: null,
    init: function(serverState: any) {
        this.serverState = serverState;
        // this.dbManager = dbManager;
    },

    initiateServerShutDownRoutine: function() {
        this.serverState.state = 'shuttingdown'
    },

    

    updateWeeklyTopPlayers: function(header: string) {
        // console.log('updateWeeklyTopPlayers');
        let weeklyTopPlayers = this.serverState.persistant_server_state['weeklytopplayers'];
        let needToCreateNewRecord = false;
        if(weeklyTopPlayers == null || weeklyTopPlayers == undefined){
            console.error('no record found for top players.');
            weeklyTopPlayers = {name: 'weeklytopplayers'};
            needToCreateNewRecord = true;
        }

        // const weeklytopplayers = {
        //     name: 'weeklytopplayers',
        //     lastUpdate: now,
        //     isActive: true,
        //     topPlayers: [],
        // };
        weeklyTopPlayers.lastUpdate = this.serverState.serverTime;
        weeklyTopPlayers.header = header;
        weeklyTopPlayers.isActive = true;
        weeklyTopPlayers.topPlayers = this.searchTopPlayers(3, 'weeklytopplayers');

        if(needToCreateNewRecord == true){
            console.log('create new weeklytopplayers');
            dbManager.createNewSeverStateItem(weeklyTopPlayers);
        } else {
            console.log('update weeklytopplayers');
            dbManager.updateServerState('weeklytopplayers');
        }
        
        // this.dbManager.resetAllPlayerWeeklyRecord();

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
        const chosenPlayerSummary = [];
        for(var i = 0; i < chosenPlayers.length; ++i){
            const summaryObject: any = {};
            summaryObject.name = chosenPlayers[i].firstName + chosenPlayers[i].lastName;
            summaryObject.win = chosenPlayers[i].weeklywin;
            summaryObject.loss = chosenPlayers[i].weeklyloss;
            summaryObject.death = chosenPlayers[i].wdeath;
            summaryObject.kill = chosenPlayers[i].wkill;
            // summaryObject.destroy = chosenPlayers[i].wdestroy;
            // summaryObject.damage = chosenPlayers[i].wdamage;
            summaryObject.attack = chosenPlayers[i].wattack;

            chosenPlayerSummary.push(summaryObject);
        }
        return chosenPlayerSummary;
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

