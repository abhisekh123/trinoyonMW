
/**
 * this file contains logical function that are used by ai/action
 */
const pathfindingwrapper = require('./pathfindingwrapper');
const customroutingutility = require('./customroutingutility');
const workerState = require('../state/workerstate');



module.exports = {
    worldConfig: null,
    itemConfig: null,
    

    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();

        pathfindingwrapper.init();
        customroutingutility.init();
    },



    // used for movement of player to nearesrt enemy. used by player AI
    findClosestPlayerOrTowerOrBase: function(botConfigParam, gameRoom){
        var playerTeam = botConfigParam.teamId;
        // var defenseList = null;
        // var base = null;
        var enemyPlayerList = null;
        // console.log('findClosestPlayerOrTowerOrBase->leaderID:' + botConfigParam.leaderBotID);
        // var leaderConfig = workerstate.botMap[botConfigParam.leaderBotID];

        var leaderPosition = botConfigParam.position;

        // console.log('leader position:', leaderPosition, ' team:' + playerTeam, ' playerid:' + botConfigParam.playerID);
        
        var minDistance = this.worldConfig.gridSide + 1;

        var target = null;
        // var targetType = null;

        if(playerTeam == 1){// top team = 1
            // defenseList = workerstate.getWorldConfig().defenceTop;
            // base = workerstate.getWorldConfig().topBase
            enemyPlayerList = gameRoom.players_2;
        }else{// bottom team = 2
            // defenseList = workerstate.getWorldConfig().defenceBottom;
            // base = workerstate.getWorldConfig().bottomBase;
            enemyPlayerList = gameRoom.players_1;
        }

        // find closest enemy player bots
        for(var playerIndex = 0; playerIndex < enemyPlayerList.length; ++playerIndex){
            const playerConfig = enemyPlayerList[playerIndex];
            // skip inactive player and players controlled by real people and players in the same team
            // if(!playerConfig.isActive || playerConfig.teamID == botConfigParam.teamID){
            //     // TODO: Add logic to spawn new AI player / admit new player here.
            //     continue;
            // }

            for(var i = 0; i < playerConfig.botObjectList.length; ++i){
                var botConfig = playerConfig.botObjectList[i];
                var botPosition = botConfig.position;

                var distance = bot_route_utility.findDIstanceBetweenTwoPoints(
                    leaderPosition[0], leaderPosition[2], botPosition[0], botPosition[2]
                );

                if(distance < minDistance){
                    minDistance = distance;
                    // target = [botPosition[0], botPosition[2]]
                    target = botConfig;
                    // targetType = 'bot';
                }
            }

            // console.log('comparing with playerID:', playerConfig.playerID, ' tmpLeaderPosition:', tmpLeaderPosition);
            // console.log('calculated distance:', distance);
        }

        // console.log('after comparing palyers, minDistance:', minDistance, ' target:', target);

        // gameRoom.buildings_1
        for(var i = 0; i < gameRoom.buildingArray_1.length; ++i){
            var buildingConfig = gameRoom.buildingArray_1[i];
            if(buildingConfig.team != 0 && buildingConfig.team == playerTeam){
                // TODO: Add logic to spawn new AI player / admit new player here.
                continue;
            }
            // console.log('comparing with defenseList[i]:', defenseList[i]);
            var distance = bot_route_utility.findDIstanceBetweenTwoPoints(
                leaderPosition[0], leaderPosition[2], buildingConfig.position[0], buildingConfig.position[2]
            )
            if(distance < minDistance){
                minDistance = distance;
                target = buildingConfig;
                // if(i == 0){
                //     targetType = 'base';
                // }else{
                //     targetType = 'static';
                // }
                
            }
        }

        // gameRoom.buildings_2
        for(var i = 0; i < gameRoom.buildingArray_2.length; ++i){
            var buildingConfig = gameRoom.buildingArray_2[i];
            if(buildingConfig.team != 0 && buildingConfig.team == playerTeam){
                // TODO: Add logic to spawn new AI player / admit new player here.
                continue;
            }
            // console.log('comparing with defenseList[i]:', defenseList[i]);
            var distance = bot_route_utility.findDIstanceBetweenTwoPoints(
                leaderPosition[0], leaderPosition[2], buildingConfig.position[0], buildingConfig.position[2]
            )
            if(distance < minDistance){
                minDistance = distance;
                target = buildingConfig;
                // if(i == 0){
                //     targetType = 'base';
                // }else{
                //     targetType = 'static';
                // }
                
            }
        }

        // console.log('after comparing defenseList, minDistance:', minDistance, ' target:', target);
        if(target == null){
            return null;
        }else{
            return target;
            // {
            //     target: target,
            //     targetType: targetType
            // }
        }

    },

    // find point(x, y) closest to position such that (x, y) in in range of targetPosition.
    findClosestPointNeighbourhood: function(position, targetPosition, range){
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
        console.error('ERROR: FindPathToClosestPointInNeighbourhood point not found for target position:', targetBotConfig.position);
        return null;// walkable point not found. This should never happen.
    },

    // returns a path from source to a walkable point (probably nearest) in the neighbourhood of target.
    FindPathToClosestPointInNeighbourhood: function(botID, targetBotID){ // used for getting near friendly unit (wrt sight of target)
        var botConfig = this.tg.botConfig[botID];
        var targetBotConfig = this.tg.botConfig[targetBotID];
        var range = item_config.character[targetBotConfig.type].sight;

        var path = this.findPath(botConfig.position[0], botConfig.position[2]
            , targetBotConfig.position[0], targetBotConfig.position[2]);
        var pathIndex = 0;
        for(pathIndex = 0; pathIndex < path.length; ++pathIndex){ 
            // trace through path from source to destination to find first point in range.
            var pathPositionX = path[pathIndex][0];
            var pathPositionZ = path[pathIndex][1];
            if(bot_route_utility.isPointInRange(pathPositionX, pathPositionZ
                , targetBotConfig.position[0], targetBotConfig.position[2],range)){
                // got first point in path which is in range.
                break;
            }
        }
        if(pathIndex >= path.length){
            console.error('ERROR:pathIndex == path.length');
        }
        path.length = pathIndex + 1;// discard remaining path
        if(bot_route_utility.isPositionUnoccupiedByBot(path[pathIndex][0], path[pathIndex][1])){
            
            return path;
        }
        var finalPosition = findClosestPointNeighbourhood({x:botConfig.position[0], z:botConfig.position[2]}, 
            {x:targetBotConfig.position[0], z:targetBotConfig.position[2]}, range);
        if(finalPosition == null){
            console.error('ERROR:finalPosition == null');
            return path;
        }else{
            var pathRemaining = this.findPath(path[pathIndex][0], path[pathIndex][1]
                , finalPosition.x, finalPosition.z);
            return path.concat(pathRemaining);
        }
    },

    // find point(x, y) closest to position such that (x, y) in in range of targetPosition.
    findClosestVisiblePointInRange: function(position, targetPosition, range){
        for(var side = 1; side < this.tg.grid.width; ++side){
            positionRunnerStart = {x:position.x - side, z:position.z - side};// left-bottom
            var j = 0;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(pathfindingwrapper.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(pathfindingwrapper.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && this.getBotOccupyingPosition(positionRunnerStart.x, positionRunnerStart.z) == null
                    && bot_route_utility.isPointInRange(positionRunnerStart.x, positionRunnerStart.z
                        , targetPosition.x, targetPosition.z,range)
                    && bot_route_utility.testVisibility(positionRunnerStart.x, positionRunnerStart.z, targetPosition.x, targetPosition.z)){
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
                        , targetPosition.x, targetPosition.z,range)
                        && bot_route_utility.testVisibility(positionRunnerStart.x, positionRunnerStart.z, targetPosition.x, targetPosition.z)){
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
                        , targetPosition.x, targetPosition.z,range)
                        && bot_route_utility.testVisibility(positionRunnerStart.x, positionRunnerStart.z, targetPosition.x, targetPosition.z)){
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
                        , targetPosition.x, targetPosition.z,range)
                        && bot_route_utility.testVisibility(positionRunnerStart.x, positionRunnerStart.z, targetPosition.x, targetPosition.z)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.z = positionRunnerStart.z - 1;
            }
        }
        console.error('ERROR: FindPathToClosestPointInNeighbourhood point not found for target position:', targetBotConfig.position);
        return null;// walkable point not found. This should never happen.
    },

    FindPathToNearestVisiblePointInRange: function(botID, targetBotID){ // used for engage
        var botConfig = this.tg.botConfig[botID];
        var targetBotConfig = this.tg.botConfig[targetBotID];
        var range = item_config.weapon[botConfig.equippedWeapon].range;

        var path = this.findPath(botConfig.position[0], botConfig.position[2]
            , targetBotConfig.position[0], targetBotConfig.position[2]);
        var pathIndex = 0;
        for(pathIndex = 0; pathIndex < path.length; ++pathIndex){ 
            // trace through path from source to destination to find first point in range.
            var pathPositionX = path[pathIndex][0];
            var pathPositionZ = path[pathIndex][1];
            if(bot_route_utility.isPointInRange(pathPositionX, pathPositionZ
                , targetBotConfig.position[0], targetBotConfig.position[2],range)){
                // got first point in path which is in range.
                break;
            }
        }
        if(pathIndex >= path.length){
            console.error('ERROR:pathIndex == path.length');
        }
        path.length = pathIndex + 1;// discard remaining path
        if(bot_route_utility.isPositionUnoccupiedByBot(path[pathIndex][0], path[pathIndex][1])){
            
            return path;
        }
        var finalPosition = findClosestPointNeighbourhood({x:botConfig.position[0], z:botConfig.position[2]}, 
            {x:targetBotConfig.position[0], z:targetBotConfig.position[2]}, range);
        if(finalPosition == null){
            console.error('ERROR:finalPosition == null');
            return path;
        }else{
            var pathRemaining = this.findPath(path[pathIndex][0], path[pathIndex][1]
                , finalPosition.x, finalPosition.z);
            return path.concat(pathRemaining);
        }
    },

    getBotOccupyingPosition: function(xPosParam, zPosParam){
        return workerState.strategyMatrix[xPosParam][zPosParam].id;
    },

    
    findClosestWalkablePoint: function(position){ // position = [xpos, ypos, zpos]

        if(pathfindingwrapper.isWalkableAt(position[0], position[2]) 
        && this.getBotOccupyingPosition(position[0], position[2]) == null){
            return position;
        }

        for(var side = 1; side < this.tg.grid.width; ++side){
            var positionRunnerStart = {x:position[0] - side, z:position[2] - side};// left-bottom
            var j = 0;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(pathfindingwrapper.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(pathfindingwrapper.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && this.getBotOccupyingPosition(positionRunnerStart.x, positionRunnerStart.z) == null){
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
                    && this.getBotOccupyingPosition(positionRunnerStart.x, positionRunnerStart.z) == null){
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
                    && this.getBotOccupyingPosition(positionRunnerStart.x, positionRunnerStart.z) == null){
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
                    && this.getBotOccupyingPosition(positionRunnerStart.x, positionRunnerStart.z) == null){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.z = positionRunnerStart.z - 1;
            }
        }
        console.error('ERROR: Closest walkable point not found for position:', position);
        return null;// walkable point not found. This should never happen.
    },

    findPath: function(currentPositionX, currentPositionZ, targetPositionX, targetPositionZ){
        pathfindingwrapper.findPath(currentPositionX, currentPositionZ, targetPositionX, targetPositionZ);
    }

}