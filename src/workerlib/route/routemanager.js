
/**
 * this file contains logical function that are used by ai/action
 */
const workerstate = require('../state/workerstate');
const pathfindingwrapper = require('./pathfindingwrapper');
const customroutingutility = require('./customroutingutility');



module.exports = {
    

    init: function(world_config, grid){
        pathfindingwrapper.init();
        customroutingutility.init();
    },



    // used for movement of player to nearesrt enemy. used by player AI
    findClosestPlayerOrTowerOrBase: function(playerConfigParam){
        var playerTeam = playerConfigParam.teamID;
        var defenseList = null;
        var base = null;
        // console.log('findClosestPlayerOrTowerOrBase->leaderID:' + playerConfigParam.leaderBotID);
        var leaderConfig = workerstate.botMap[playerConfigParam.leaderBotID];
        var leaderPosition = leaderConfig.payload.position;

        // console.log('leader position:', leaderPosition, ' team:' + playerTeam, ' playerid:' + playerConfigParam.playerID);
        
        var minDistance = workerstate.getWorldConfig().gridSide + 1;

        var target = null;
        var targetType = null;
        if(playerTeam == 1){// top team = 1
            defenseList = workerstate.getWorldConfig().defenceTop;
            base = workerstate.getWorldConfig().topBase
        }else{// bottom team = 2
            defenseList = workerstate.getWorldConfig().defenceBottom;
            base = workerstate.getWorldConfig().bottomBase;
        }

        // find closest player
        for(var playerIndex = 0; playerIndex < this.maxPlayerCount; ++playerIndex){
            const playerConfig = playerManager.playerArrey[playerIndex];
            // skip inactive player and players controlled by real people and players in the same team
            if(!playerConfig.isActive || playerConfig.teamID == playerConfigParam.teamID){
                // TODO: Add logic to spawn new AI player / admit new player here.
                continue;
            }
            var tmpLeaderConfig = workerstate.botMap[playerConfig.leaderBotID];
            var tmpLeaderPosition = tmpLeaderConfig.payload.position;
            // console.log('comparing with playerID:', playerConfig.playerID, ' tmpLeaderPosition:', tmpLeaderPosition);
            var distance = bot_route_utility.findDIstanceBetweenTwoPoints(
                leaderPosition[0], leaderPosition[2], tmpLeaderPosition[0], tmpLeaderPosition[2]
            )
            // console.log('calculated distance:', distance);
            if(distance < minDistance){
                minDistance = distance;
                target = [tmpLeaderPosition[0], tmpLeaderPosition[2]]
                targetType = 'bot';
            }
        }

        // console.log('after comparing palyers, minDistance:', minDistance, ' target:', target);

        for(var i = 0; i < defenseList.length; ++i){
            if(!defenseList[i].isActive){
                // TODO: Add logic to spawn new AI player / admit new player here.
                continue;
            }
            // console.log('comparing with defenseList[i]:', defenseList[i]);
            var distance = bot_route_utility.findDIstanceBetweenTwoPoints(
                leaderPosition[0], leaderPosition[2], defenseList[i][0], defenseList[i][1]
            )
            if(distance < minDistance){
                minDistance = distance;
                target = defenseList[i];
                targetType = 'static';
            }
        }

        // console.log('after comparing defenseList, minDistance:', minDistance, ' target:', target);

        // test base
        // console.log('comparing with base:', base);
        var distance = bot_route_utility.findDIstanceBetweenTwoPoints(
            leaderPosition[0], leaderPosition[2], base[0], base[1]
        )
        if(distance < minDistance){
            minDistance = distance;
            target = base;
            targetType = 'static';
        }

        // console.log('after comparing defenseList, minDistance:', minDistance, ' target:', target);

        if(target == null){
            return null;
        }else{
            return {
                target: target,
                targetType: targetType
            }
        }
    },

    // find point(x, y) closest to position such that (x, y) in in range of targetPosition.
    findClosestPointNeighbourhood: function(position, targetPosition, range){
        for(var side = 1; side < this.tg.grid.width; ++side){
            positionRunnerStart = {x:position.x - side, z:position.z - side};// left-bottom
            var j = 0;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)
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
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)
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
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)
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
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)
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
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)
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
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)
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
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)
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
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)
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

    FindClosestWalkablePoint: function(position){

        if(this.tg.grid.isWalkableAt(position.x, position.z) 
        && bot_route_utility.isPositionUnoccupiedByBot(position.x, position.z)){
            return position;
        }
        for(var side = 1; side < this.tg.grid.width; ++side){
            positionRunnerStart = {x:position.x - side, z:position.z - side};// left-bottom
            var j = 0;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.x = positionRunnerStart.x + 1;
            }

            positionRunnerStart.x = positionRunnerStart.x - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower right -> upper right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.z = positionRunnerStart.z + j;
            }

            positionRunnerStart.z = positionRunnerStart.z - 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)){
                        position.x = positionRunnerStart.x;
                        position.z = positionRunnerStart.z;
                        return position;
                    }
                }
                positionRunnerStart.x = positionRunnerStart.x - 1;
            }

            positionRunnerStart.x = positionRunnerStart.x + 1;
            for(j = 0; j <= (2 * side); ++j){ // lower left -> lower right
                
                if(bot_route_utility.isPointInGrid(positionRunnerStart.x, positionRunnerStart.z)){
                    if(this.tg.grid.isWalkableAt(positionRunnerStart.x, positionRunnerStart.z) 
                    && bot_route_utility.isPositionUnoccupiedByBot(positionRunnerStart.x, positionRunnerStart.z)){
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

}