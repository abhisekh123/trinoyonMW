const workerState = require('../../state/workerstate');
const routeManager = require('../../route/routemanager');
const snapShotManager = require('../../state/snapshotmanager');
const aiUtility = require('./aiutility');
const actionManager = require('../action/actionmanager');

module.exports = {
    // baseMap: {}
    worldConfig: null,
    itemConfig: null,
    init: function () {
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
    },
    processAI: function (buildingConfigParam, gameRoom) {
        if (buildingConfigParam.team != 0) { // active buildings(owned by team.)

            var hostileConfig = routeManager.findClosestHostile(buildingConfigParam, gameRoom, this.worldConfig.constants.BOTS);
            var distanceBetweenBotAndHostile = this.worldConfig.gridSide + 1;
            if (hostileConfig != null) {
                distanceBetweenBotAndHostile = routeManager.getDistanceBetweenPoints(
                    buildingConfigParam.position[0],
                    buildingConfigParam.position[2],
                    hostileConfig.position[0],
                    hostileConfig.position[2]
                );
                // if(buildingConfigParam.id == 'tower7'){
                //     console.log(buildingConfigParam.id + ' found hostile ' + hostileConfig.id + ' distance:' + distanceBetweenBotAndHostile);
                //     console.log('building position:' + buildingConfigParam.position + ' hostileConfig.position:' + hostileConfig.position);
                // }

            }

            if (distanceBetweenBotAndHostile <= buildingConfigParam.range) { // if a hostile is found in range
                // if(buildingConfigParam.id == 'tower7'){
                //     console.log(buildingConfigParam.id + '--attack -> hostiles in range:' + hostileConfig.id + ' at position:', hostileConfig.position);
                // }

                aiUtility.attackHostile(buildingConfigParam, hostileConfig, gameRoom);
                // console.log('complete tower attack routine.');
                return; // consumed all remaining time to attack. Done for the current iteration.
            } else {
                buildingConfigParam.activityTimeStamp = workerState.currentTime;
            }

        } else { // orphan towers
            var team1BotsInRange = false;
            var team2BotsInRange = false;

            // scan neighbourhood
            for (var i = 0; i < gameRoom.allBotObjects.length; i++) {
                var distanceBetweenBotAndTower = routeManager.getDistanceBetweenPoints(
                    buildingConfigParam.position[0],
                    buildingConfigParam.position[2],
                    gameRoom.allBotObjects[i].position[0],
                    gameRoom.allBotObjects[i].position[2]
                );
                if (distanceBetweenBotAndTower <= buildingConfigParam.sight) {
                    if (gameRoom.allBotObjects[i].team == 1) {
                        team1BotsInRange = true;
                    } else if (gameRoom.allBotObjects[i].team == 2) {
                        team2BotsInRange = true;
                    }
                }
            }

            // if (buildingConfigParam.id == 'tower9') {
            //     console.log(buildingConfigParam.id + '--team1BotsInRange:' + team1BotsInRange + ' team2BotsInRange:' + team2BotsInRange);
            // }

            // if bots of both team are present or no team bot is present. no team eligible to start claim process.
            if (team1BotsInRange == team2BotsInRange) {
                buildingConfigParam.ownershipClaimStartTimestamp = null;
                buildingConfigParam.mostResentOwnershipClaimingTeam = null;
                buildingConfigParam.life = 0;
                return;
            } else {
                var currentTeam = 0;
                if (team1BotsInRange == true) {
                    currentTeam = 1;
                } else {
                    currentTeam = 2;
                }

                if (currentTeam == buildingConfigParam.mostResentOwnershipClaimingTeam) { // progress ownership claim process
                    if ((workerState.currentTime - buildingConfigParam.ownershipClaimStartTimestamp) >=
                        buildingConfigParam.intervalToCompleteOwnershipClaim) { // complete claim process
                        // if (buildingConfigParam.id == 'tower9') {
                        //     console.log('complete ownership process');
                        // }
                        buildingConfigParam.team = currentTeam;
                        buildingConfigParam.isActive = true;
                        if(buildingConfigParam.team == 1){
                            ++gameRoom.statistics.towerCountTeam1;
                        } else {
                            ++gameRoom.statistics.towerCountTeam2;
                        }
                        buildingConfigParam.ownershipClaimStartTimestamp = null;
                        buildingConfigParam.mostResentOwnershipClaimingTeam = null;
                        buildingConfigParam.life = buildingConfigParam.fullLife;
                        actionManager.actionUtility.updateProximityGraphEntry(gameRoom, buildingConfigParam)
                        snapShotManager.add_BuildingTeamChange_Event(gameRoom, buildingConfigParam);
                    } else { // in progress. update count down .. i.e. life
                        // if (buildingConfigParam.id == 'tower9') {
                        //     console.log('ownership process in progress:' + buildingConfigParam.life);
                        // }
                        buildingConfigParam.life = buildingConfigParam.fullLife * (
                            (workerState.currentTime - buildingConfigParam.ownershipClaimStartTimestamp) /
                            buildingConfigParam.intervalToCompleteOwnershipClaim
                        );
                    }
                } else { // start new claim process
                    // if (buildingConfigParam.id == 'tower9') {
                    //     console.log('start ownership process in progress:' + currentTeam);
                    // }
                    buildingConfigParam.ownershipClaimStartTimestamp = workerState.currentTime;
                    buildingConfigParam.mostResentOwnershipClaimingTeam = currentTeam;
                    buildingConfigParam.life = 0;
                }
            }
        }
    }
}