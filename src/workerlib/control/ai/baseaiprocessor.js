const workerState = require('../../state/workerstate');
const routeManager = require('../../route/routemanager');
const aiUtility = require('./aiutility');

module.exports = {
    // baseMap: {}
    worldConfig: null,
    itemConfig: null,
    init: function () {
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
    },

    processAI: function (buildingConfigParam, gameRoom) {
        // TODO
        var hostileConfig = routeManager.findClosestHostile(buildingConfigParam, gameRoom, this.worldConfig.constants.BOTS);
        var distanceBetweenBotAndHostile = this.worldConfig.gridSide + 1;
        if (hostileConfig != null) {
            distanceBetweenBotAndHostile = routeManager.getDistanceBetweenPoints(
                buildingConfigParam.position[0],
                buildingConfigParam.position[2],
                hostileConfig.position[0],
                hostileConfig.position[2]
            );
        }

        if (distanceBetweenBotAndHostile <= buildingConfigParam.range) { // if a hostile is found in range
            aiUtility.attackHostile(buildingConfigParam, hostileConfig, gameRoom);
            // console.log('complete tower attack routine.');
            return; // consumed all remaining time to attack. Done for the current iteration.
        } else {
            buildingConfigParam.activityTimeStamp = workerState.currentTime;
        }
    }
}