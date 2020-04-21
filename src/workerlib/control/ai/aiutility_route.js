/**
 * Common utility functions used by other ai modules.
 */

const workerState = require('../../state/workerstate');
const routeManager = require('../../route/routemanager');

module.exports = {
    // baseMap: {}
    worldConfig: null,
    itemConfig: null,
    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();

        // console.log('==++++', this.worldConfig);
    },


    // findClosestHostileAttackedByTeamMate: function(botIndex, playerConfig){
    //     var hostileConfig = null;
    //     return hostileConfig;
    // },


    planBotRoute: function(botConfig, path){ // each path element : [posX, posZ, time to travel, rotation]
        if(path.length < 2){ // TODO: check if path can be length 1.
            console.error('ERROR:Path smaller than 2', botConfig.id);
            // console.log('path:', path);
            return;
        }
        // var currentTime = workerState.currentTime;
        var pathTime = botConfig.activityTimeStamp;
        // path[0].push(this.setBotPathData(path[0], path[0], botConfig));
        path[0].push(pathTime); // position at begining.
        var diffCount = 0;
        for(var i = 1; i < path.length; ++i){
            diffCount = 0;
            // var timeDelta = this.setBotPathData(path[i], path[i + 1], botConfig);
            // timeToTravel += (timeDelta * 1000);//convert to milliseconds.

            // testing if tow consecutive path positions are adjacent or diagonal.
            if(path[i - 1][0] != path[i][0]){
                ++diffCount;
            }
            if(path[i - 1][1] != path[i][1]){
                ++diffCount;
            }
            if(diffCount == 1){
                // adjacent
                pathTime += botConfig.adjacentTime;
            } else if(diffCount == 2){
                // adjacent
                pathTime += botConfig.diagonalTime;
            } else {
                console.error('ERROR: unknown value for path planning:', diffCount);
                pathTime += botConfig.diagonalTime;
            }
            path[i].push(pathTime);
        }
        return;
    },
}


