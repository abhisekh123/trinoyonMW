const workerState = require('../../state/workerstate');
const routeManager = require('../../route/routemanager');

module.exports = {

    worldConfig: null,
    itemConfig: null,

    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
    },

    processAI: function(botConfig, isHero, gameRoom){
        // console.log('processAI:' + botConfig.id);

        if(isHero){
            var suitableEnemy = routeManager.findClosestPlayerOrTowerOrBase(botConfig, gameRoom);
        }else{

        }

        
        // // console.log('((((((((((((suitableEnemy:', suitableEnemy.id);
        
        if(suitableEnemy != null ){// if engaged to enemy
            
            botConfig.engagedEnemyType = suitableEnemy.chosenTargetType;
            botConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;
            // switch (suitableEnemy.chosenTargetType) {
            //     case 'bot':
            //         botConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;        
            //         break;
            //     case 'static':
            //         botConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;
            //         break;
            //     default:
            //         break;
            // }
            
            if(suitableEnemy.pathToEnemy.length < (botConfig.range + 1)){ // if enemy in range
                // engage enemy
                // instruct bot to attack
                // // console.log('2');
                this.instructBot(botConfig, 'attack', {botRotation: suitableEnemy.botRotation});
            }else{
                // bit.engagedTargetID = null
                // // console.log('instruct bot goto:');
                this.instructBot(botConfig, 'goto', 
                {
                    // botRotation: suitableEnemy.botRotation,
                    pathToEnemy: suitableEnemy.pathToEnemy,
                });
            }
        }else{
            leaderConfig = this.isBotAwayFromLeader(botConfig);
            // console.log('leaderConfig:', leaderConfig);
            if( leaderConfig != null){
                // // console.log('this is leader config:', leaderConfig);
                var path = routeManager.findPath(
                    botConfig.payload.position[0], 
                    botConfig.payload.position[2], 
                    leaderConfig.payload.position[0], 
                    leaderConfig.payload.position[2]);
                // // console.log('2');
                this.planBotRoute(botConfig, path);
                this.instructBot(botConfig, 'goto', 
                    {
                        // botRotation: suitableEnemy.botRotation,
                        pathToEnemy: path,
                    });
            
            }else{
                // // console.log('3');
                this.instructBot(botConfig, 'idle', null);
            }
        }
        
        // action = goto; instruction = null
        // if hostile visible, engage hostile
        // instruction = engage, action = null
        // if away from commander, goto commander
        // action = goto.
    },


    isBotAwayFromLeader(botConfig){
        var enemyPlayerArray = null;
        if(botConfig.team == 1){
            enemyPlayerArray = gameRoom.players_2;
        }else{
            enemyPlayerArray = gameRoom.players_1;
        }

        for (var i = 0; i < gameRoom.players_2.length; ++i) {
            const playerConfig = gameRoom.players_2[i];
            for (var j = 0; j < playerConfig.botObjectList.length; ++j) {
                const botConfig = playerConfig.botObjectList[j];
                this.processBotLifeCycle(botConfig, gameRoom, j==0);
            }
        }
        // // console.log('isBotAwayFromLeader::', botConfig);
        if(!botConfig.isLeader){
            var playerConfig = playerManager.playerArrey[botConfig.playerID - 1];
            // // console.log('player config:', playerConfig);
            var leaderConfig = workerstate.botMap[playerConfig.leaderBotID];
            if(leaderConfig == null || leaderConfig == undefined){
                return null;
            }
            // // console.log('plaleaderConfigyer config:', leaderConfig);
            var currentPositionX = botConfig.payload.position[0];
            var currentPositionZ = botConfig.payload.position[2];
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