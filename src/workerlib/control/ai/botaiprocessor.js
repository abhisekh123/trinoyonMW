

const workerState = require('../../state/workerstate');
const routeManager = require('../../route/routemanager');
const aiUtility = require('./aiutility');

module.exports = {

    worldConfig: null,
    itemConfig: null,

    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
    },

    processAI: function(playerConfig, botIndex, gameRoom, timeSlice){
        var hostileConfig = null;
        const botConfig = playerConfig.botObjectList[botIndex];
        // console.log('processAI:' + botConfig.id);
        
        // botConfig.attack = botTypeItemConfig.attack;
        
        if(aiUtility.canAttack(botConfig)){ // if can attack
            hostileConfig = aiUtility.findClosestHostileInRange(botConfig, gameRoom, botConfig.range);
            if(hostileConfig != null){ // if a hostile is found in range
                botConfig.action = 'fight';
                botConfig.actionData = hostileConfig;
                aiUtility.processAttackDamageEvent(botConfig, hostileConfig);
                return 0; // consumed all remaining time to attack. Done for the current iteration.
            }
        }

        // help out fellow bot
        hostileConfig = aiUtility.findClosestHostileAttackedByTeamMate(botIndex, playerConfig);
        if(hostileConfig != null){
            // find in range visible point to bot.actiondata and march to the point
            var positionNearHostile = routeManager.findClosestVisiblePointInRange(
                botConfig, 
                hostileConfig, 
                botConfig.range, 
                gameRoom
            );
            if(positionNearHostile != null){
                var path = routeManager.findPath(
                    botConfig.position[0],
                    botConfig.position[2],
                    positionNearHostile.x,
                    positionNearHostile.z
                );

                this.planBotRoute(botConfig, path); // set timestamp to each path position.
                aiUtility.addActionToBot(botConfig, 'march', path);
                return timeSlice;
            }
        }
        
        // see if needs to move
        if(botIndex == 0){ // if hero bot
        }else{ // regular bot
            // if away from Hero
            var distanceBetweenBotAndHero = routeManager.getDistanceBetweenPoints(
                botConfig.position[0],
                botConfig.position[2],
                playerConfig.botObjectList[0].position[0],
                playerConfig.botObjectList[0].position[2]
            );
            if(distanceBetweenBotAndHero > this.worldConfig.maxDistanceFromLeader){
                var positionNearLeader = routeManager.findClosestWalkablePosition(
                    playerConfig.botObjectList[0],
                    this.worldConfig.maxDistanceFromLeader,
                    gameRoom
                )
                if(positionNearLeader != null){
                    var path = routeManager.findPath(
                        botConfig.position[0],
                        botConfig.position[2],
                        positionNearLeader.x,
                        positionNearLeader.z
                    );

                    this.planBotRoute(botConfig, path); // set timestamp to each path position.
                    aiUtility.addActionToBot(botConfig, 'march', path);
                    return timeSlice;
                }
            }
        }
        return 0; // spent the time doing nothing.
    },

    planBotRoute: function(botConfig, path){ // each path element : [posX, posZ, time to travel, rotation]
        if(path.length < 2){ // TODO: check if path can be length 1.
            console.log('ERROR:Path smaller than 2');
            return;
        }
        var currentTime = workerState.currentTime;
        // path[0].push(this.setBotPathData(path[0], path[0], botConfig));
        path[0].push(currentTime); // position at begining.
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
                path[i].push(botConfig.adjacentTime);
            } else if(diffCount == 2){
                // adjacent
                path[i].push(botConfig.diagonalTime);
            } else {
                console.log('ERROR: unknown value for path planning:', diffCount);
                path[i].push(botConfig.diagonalTime);
            }
            
        }
        return;
    },

    // redundant. just use the distance matrix.
    isBotAwayFromLeader(botConfig, leaderConfig){
        
    },

}