// might not be needed.
module.exports = {
    gameBotState:{},
    gameStaticObjectState:{},

    
    isBotAwayFromLeader(characterConfig){
        // // console.log('isBotAwayFromLeader::', characterConfig);
        if(!characterConfig.isLeader){
            var playerConfig = playerManager.playerArrey[characterConfig.playerID - 1];
            // // console.log('player config:', playerConfig);
            var leaderConfig = workerstate.botMap[playerConfig.leaderBotID];
            if(leaderConfig == null || leaderConfig == undefined){
                return null;
            }
            // // console.log('plaleaderConfigyer config:', leaderConfig);
            var currentPositionX = characterConfig.payload.position[0];
            var currentPositionZ = characterConfig.payload.position[2];
            var leaderPositionX = leaderConfig.payload.position[0]; 
            var leaderPositionZ = leaderConfig.payload.position[2];

            if(Math.abs(currentPositionX - leaderPositionX) > workerstate.getWorldConfig().maxDistanceFromLeader || 
                    Math.abs(currentPositionZ - leaderPositionZ) > workerstate.getWorldConfig().maxDistanceFromLeader){
                // console.log('bot away from leader.');
                return leaderConfig;
            }else{
                return null;
            }
        }else{
            return null;
        }
    },

    planBotRoute: function(currentBot, path){ // each path element : [posX, posZ, time to travel, rotation]
        if(path.length < 1){
            // console.log('ERROR:Path smaller than 1');
        }
        // var currentTime = math_util.getCurrentTime();
        // // console.log('plan bot route at time:' + currentTime);
        var currentPositionX = currentBot.payload.position[0];
        var currentPositionZ = currentBot.payload.position[2];
        currentPositionX = path[0][0];
        currentPositionZ = path[0][1];
        currentBot.payload.position[0] = currentPositionX;
        currentBot.payload.position[2] = currentPositionZ;
        //process app path
        var timeToTravel = 0;
        // path[0].push(this.setBotPathData(path[0], path[0], currentBot));
        path[0].push(0);
        for(var i = 0; i < path.length - 1; ++i){
            var timeDelta = this.setBotPathData(path[i], path[i + 1], currentBot);
            timeToTravel += (timeDelta * 1000);//convert to milliseconds.
            path[i + 1].push(timeToTravel);
        }
        // path[path.length - 1][3] = path[path.length - 2][3]
        if(path.length > 1){//last and second last segment will have same rotation.
            path[path.length - 1][3] = path[path.length - 2][3];
        }
        currentBot.botRoute = path;
        currentBot.botRouteIndex = 0;
        // // console.log('done planning path with ' + path.length + ' steps with estimated completion time of ' + timeToTravel + ' milliseconds.');
    },


    setBotPathData: function(startPoint, endPoint, currentBot){
        // var returnObject = {
        //     currentTimeDelta = 0,

        // }
        if(startPoint[0] < endPoint[0]){
            if(startPoint[1] > endPoint[1]){
                // return 'nw';
                startPoint.push(workerstate.getWorldConfig().const.rotation['nw']);
                // return Math.round((1.5 * currentBot.strideTime)/currentBot.strideDistance);
                return ((1.5 * currentBot.strideTime)/currentBot.strideDistance);
            }else if(startPoint[1] == endPoint[1]){
                // return 'w';
                startPoint.push(workerstate.getWorldConfig().const.rotation['w']);
                return ((1 * currentBot.strideTime)/currentBot.strideDistance);
            }else if(startPoint[1] < endPoint[1]){
                // return 'sw';
                startPoint.push(workerstate.getWorldConfig().const.rotation['sw']);
                return ((1.5 * currentBot.strideTime)/currentBot.strideDistance);
            }
        }else if(startPoint[0] == endPoint[0]){
            if(startPoint[1] > endPoint[1]){
                // return 'n';
                startPoint.push(workerstate.getWorldConfig().const.rotation['n']);
                return ((1 * currentBot.strideTime)/currentBot.strideDistance);
            }else if(startPoint[1] == endPoint[1]){
                // nothing to do.
                // return 'o';
                startPoint.push(null);
                return 0;
            }else if(startPoint[1] < endPoint[1]){
                // return 's';
                startPoint.push(workerstate.getWorldConfig().const.rotation['s']);
                return ((1 * currentBot.strideTime)/currentBot.strideDistance);
            }
        }else if(startPoint[0] > endPoint[0]){
            if(startPoint[1] > endPoint[1]){
                // return 'ne';
                startPoint.push(workerstate.getWorldConfig().const.rotation['ne']);
                return ((1.5 * currentBot.strideTime)/currentBot.strideDistance);
            }else if(startPoint[1] == endPoint[1]){
                // return 'e';
                startPoint.push(workerstate.getWorldConfig().const.rotation['e']);
                return ((1 * currentBot.strideTime)/currentBot.strideDistance);
            }else if(startPoint[1] < endPoint[1]){
                // return 'se';
                startPoint.push(workerstate.getWorldConfig().const.rotation['se']);
                return ((1.5 * currentBot.strideTime)/currentBot.strideDistance);
            }
        }
    },
    
}
