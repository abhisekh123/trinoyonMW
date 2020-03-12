/**
 * Common utility functions used by other ai modules.
 */

const workerState = require('../../state/workerstate');

module.exports = {
    // baseMap: {}
    worldConfig: null,
    itemConfig: null,
    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
    },

    // here the itemConfig can be buildingConfig or botConfig.
    findClosestHostileInRange: function(itemConfig, gameRoom){
        for(var side = 1; side < this.tg.grid.width; ++side){
            positionRunnerStart = {x:position.x - side, z:position.z - side};// left-bottom
            var j = 0;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(pathfindingwrapper.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(pathfindingwrapper.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && this.getBotOccupyingPosition(positionRunnerStart.x, positionRunnerStart.z) == null
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.x = positionRunnerStart.x + 1;
            }

            positionRunnerStart.x = positionRunnerStart.x - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower right -> upper right
                
                if(pathfindingwrapper.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(pathfindingwrapper.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && this.getBotOccupyingPosition(positionRunnerStart.x, positionRunnerStart.z) == null
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.z = positionRunnerStart.z + j;
            }

            positionRunnerStart.z = positionRunnerStart.z - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(pathfindingwrapper.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(pathfindingwrapper.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && this.getBotOccupyingPosition(positionRunnerStart.x, positionRunnerStart.z) == null
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.x = positionRunnerStart.x - 1;
            }

            positionRunnerStart.x = positionRunnerStart.x + 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(pathfindingwrapper.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(pathfindingwrapper.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && this.getBotOccupyingPosition(positionRunnerStart.x, positionRunnerStart.z) == null
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.z = positionRunnerStart.z - 1;
            }
        }
    }
}


