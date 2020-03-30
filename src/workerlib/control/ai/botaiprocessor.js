

const workerState = require('../../state/workerstate');
const routeManager = require('../../route/routemanager');
const aiUtility = require('./aiutility');
const actionManager = require('../action/actionmanager');

module.exports = {

    worldConfig: null,
    itemConfig: null,

    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
    },

    shouldBotGoNearLeader: function(botConfig, distanceFromLeader){
        if((distanceFromLeader > this.worldConfig.maxDistanceFromLeader && botConfig.action == 'ready')
        || (distanceFromLeader > this.worldConfig.tooAwayFromLeader)){
            return true;
        }
        return false;
    },

    processAI: function(playerConfig, botIndex, gameRoom, timeSlice){
        // console.log('processAI start');
        var hostileConfig = null;
        const botConfig = playerConfig.botObjectList[botIndex];
        console.log('processAI:' + botConfig.id + ' at position:', botConfig.position);
        
        // botConfig.attack = botTypeItemConfig.attack;
        if(botConfig.action == 'goto'){
            // console.log('processAI: action goto');
            // no thinking involved. just keep going.
            timeSlice = actionManager.Bot.continuePerformingAction(botConfig, gameRoom, timeSlice);
            return timeSlice;
        }

        // hostileConfig = aiUtility.aiutilityRoute.findClosestHostileInRange(botConfig, gameRoom, botConfig.sight);
        hostileConfig = routeManager.findClosestHostile(botConfig, gameRoom, this.worldConfig.ALL);
        var distanceBetweenBotAndHostile = routeManager.getDistanceBetweenPoints(
            botConfig.position[0],
            botConfig.position[2],
            hostileConfig.position[0],
            hostileConfig.position[2]
        );

        if(distanceBetweenBotAndHostile <= botConfig.range){ // if a hostile is found in range
            console.log('--attack -> hostiles in range:' + hostileConfig.id + ' at position:', hostileConfig.position);
            // aiUtility.engageHostile(botConfig, hostileConfig, gameRoom);
            actionManager.actionUtility.addActionToBot(botConfig, 'fight', hostileConfig, gameRoom);
            aiUtility.attackHostile(botConfig, hostileConfig, gameRoom);
            return 0; // consumed all remaining time to attack. Done for the current iteration.
        }

        /**
         * march routine start. At end of this routine, only possible outcome is march instruction.
         */
        var heroConfig = playerConfig.botObjectList[0];
        
        var distanceBetweenBotAndHero = routeManager.getDistanceBetweenPoints(
            botConfig.position[0],
            botConfig.position[2],
            heroConfig.position[0],
            heroConfig.position[2]
        );

        // test the non hero bots if they are away from hero bot.
        if(botIndex != 0 && this.shouldBotGoNearLeader(botConfig, distanceBetweenBotAndHero)){
            aiUtility.goNearRoutine(0, this.worldConfig.closeProximity, botConfig, gameRoom, heroConfig);
        } else {
            // help out fellow bot
            closestTargetConfig = aiUtility.aiutilityRoute.findClosestHostileAttackedByTeamMate(botIndex, playerConfig);
            if(closestTargetConfig != null){
                console.log('--help team');
                aiUtility.goNearRoutine(1, botConfig.range, botConfig, gameRoom, closestTargetConfig);
                // find in range visible point to bot.actiondata and march to the point
                // var positionNearHostile = routeManager.findClosestVisiblePositionInRange(
                //     botConfig, 
                //     hostileConfig, 
                //     botConfig.range, 
                //     gameRoom
                // );
                // if(positionNearHostile != null){
                //     console.log('---found path to hostile attacked by friend');
                //     aiUtility.completeBotMovementActionFormalities(botConfig, positionNearHostile, 'march', gameRoom);
                //     return timeSlice;
                // }
            } else if(distanceBetweenBotAndHostile <= botConfig.sight){ // if closest hostile detected is in sight.
                aiUtility.goNearRoutine(1, botConfig.range, botConfig, gameRoom, hostileConfig);
            }
        }

        
        
        // see if needs to move
        // if(botIndex == 0){ // if hero bot
        //     // console.log('--hero bot');
        // }else{ // regular bot
        //     // console.log('--regular bot');
        //     // if away from Hero
            
        //     // console.log('---distance from hero:', distanceBetweenBotAndHero);
        //     if(distanceBetweenBotAndHero > this.worldConfig.maxDistanceFromLeader){
        //         // console.log('---too far away');
        //         var positionNearLeader = routeManager.findClosestWalkablePosition(
        //             playerConfig.botObjectList[0],
        //             this.worldConfig.maxDistanceFromLeader,
        //             gameRoom
        //         )
        //         if(positionNearLeader != null){
        //             console.log('---prepare to go near hero');
        //             aiUtility.completeBotMovementActionFormalities(botConfig, positionNearLeader, 'march', gameRoom);
        //             return timeSlice;
        //         }
        //     }
        // }
        // march routine end

        if(botConfig.action == 'march'){
            timeSlice = actionManager.Bot.continuePerformingAction(botConfig, gameRoom, timeSlice);
            console.log('--march, timeslice:', timeSlice);
            return timeSlice;
        }

        // console.log('----consume timeslice doing nothing.');
        actionManager.actionUtility.addActionToBot(botConfig, 'ready', null, gameRoom);
        return 0; // spent the time doing nothing.
    },

    // processAI_legacy: function(playerConfig, botIndex, gameRoom, timeSlice){
    //     // console.log('processAI start');
    //     var hostileConfig = null;
    //     const botConfig = playerConfig.botObjectList[botIndex];
    //     console.log('processAI:' + botConfig.id + ' at position:', botConfig.position);
        
    //     // botConfig.attack = botTypeItemConfig.attack;
    //     if(botConfig.action == 'goto'){
    //         // console.log('processAI: action goto');
    //         // no thinking involved. just keep going.
    //         timeSlice = actionManager.Bot.continuePerformingAction(botConfig, gameRoom, timeSlice);
    //         return timeSlice;
    //     }

    //     hostileConfig = aiUtility.aiutilityRoute.findClosestHostileInRange(botConfig, gameRoom, botConfig.sight);
    //     if(hostileConfig != null){ // if a hostile is found in range
    //         console.log('--engaging -> hostiles in sight:' + hostileConfig.id + ' at position:', hostileConfig.position);
    //         aiUtility.engageHostile(botConfig, hostileConfig, gameRoom);
    //         actionManager.actionUtility.addActionToBot(botConfig, 'fight', hostileConfig, gameRoom);
    //         aiUtility.attackHostile(botConfig, hostileConfig, gameRoom);
    //         return 0; // consumed all remaining time to attack. Done for the current iteration.
    //     }
        
    //     if(botConfig.action == 'march'){
            
    //         timeSlice = actionManager.Bot.continuePerformingAction(botConfig, gameRoom, timeSlice);
    //         console.log('--march, timeslice:', timeSlice);
    //         return timeSlice;
    //     }

    //     // help out fellow bot
    //     hostileConfig = aiUtility.aiutilityRoute.findClosestHostileAttackedByTeamMate(botIndex, playerConfig);
    //     if(hostileConfig != null){
    //         console.log('--help team');
    //         // find in range visible point to bot.actiondata and march to the point
    //         var positionNearHostile = routeManager.findClosestVisiblePositionInRange(
    //             botConfig, 
    //             hostileConfig, 
    //             botConfig.range, 
    //             gameRoom
    //         );
    //         if(positionNearHostile != null){
    //             console.log('---found path to hostile attacked by friend');
    //             aiUtility.completeBotMovementActionFormalities(botConfig, positionNearHostile, 'march', gameRoom);
    //             return timeSlice;
    //         }
    //     }
        
    //     // see if needs to move
    //     if(botIndex == 0){ // if hero bot
    //         // console.log('--hero bot');
    //     }else{ // regular bot
    //         // console.log('--regular bot');
    //         // if away from Hero
    //         var distanceBetweenBotAndHero = routeManager.getDistanceBetweenPoints(
    //             botConfig.position[0],
    //             botConfig.position[2],
    //             playerConfig.botObjectList[0].position[0],
    //             playerConfig.botObjectList[0].position[2]
    //         );
    //         // console.log('---distance from hero:', distanceBetweenBotAndHero);
    //         if(distanceBetweenBotAndHero > this.worldConfig.maxDistanceFromLeader){
    //             // console.log('---too far away');
    //             var positionNearLeader = routeManager.findClosestWalkablePosition(
    //                 playerConfig.botObjectList[0],
    //                 this.worldConfig.maxDistanceFromLeader,
    //                 gameRoom
    //             )
    //             if(positionNearLeader != null){
    //                 console.log('---prepare to go near hero');
    //                 aiUtility.completeBotMovementActionFormalities(botConfig, positionNearLeader, 'march', gameRoom);
    //                 return timeSlice;
    //             }
    //         }
    //     }
    //     // console.log('----consume timeslice doing nothing.');
    //     actionManager.actionUtility.addActionToBot(botConfig, 'ready', null, gameRoom);
    //     return 0; // spent the time doing nothing.
    // },


}