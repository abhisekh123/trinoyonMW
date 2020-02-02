// might not be needed.
module.exports = {
    gameBotState:{},
    gameStaticObjectState:{},

    

    updateBotAction: function(action){
        // // console.log('update bot action');
        // // console.log(action);
        // if(action.message.target == 'ground'){
        //     // console.log('got action request for ground. skipping.');
        //     return;
        // }
        // // console.log('---');
        var botID = action.message.id;
        var botItem = workerstate.botMap[botID];
        // // console.log('current bot:');
        // // console.log(this.botArray);
        // // console.log(botID);
        // // console.log(workerstate.botMap[botID]);
        var payload = action.message;
        switch(payload.type){
            case 'changeweapon':
            case 'goto':
                botItem.instruction = payload;
                botItem.hasInstruction = true;
                break;
        }
        // // console.log('botItem:');
        // // console.log(botItem);
    },


    instructBot: function(currentBot, instructionParam, instructionPayload){
        // console.log('instructBot->bot:', currentBot.id, ' instructionParam:', instructionParam
            // , ' instructionPayload:', instructionPayload);
        currentBot.timeelapsedincurrentaction = 0;
        switch(instructionParam){
            case 'idle':
            currentBot.instruction = {};
            currentBot.instruction.type = 'idle';
            currentBot.hasInstruction = true;
            currentBot.isPerformingAction = false;
            break;
            case 'attack':
            currentBot.instruction = {};
            currentBot.instruction.type = 'attack';
            currentBot.instruction.rotation = instructionPayload.botRotation;
            currentBot.hasInstruction = true;
            currentBot.isPerformingAction = false;
            break;
            case 'spawn':
            currentBot.instruction = {};
            currentBot.instruction.type = 'spawn';
            currentBot.instruction.rotation = instructionPayload.botRotation;
            currentBot.hasInstruction = false;
            currentBot.isPerformingAction = true;
            break;
            case 'goto':
            // {
            //     botRotation: suitableEnemy.botRotation,
            //     pathToEnemy: suitableEnemy.pathToEnemy,
            // }
            // var currentPositionX = currentBot.payload.position[0];
            // var currentPositionZ = currentBot.payload.position[2];
            // var closestWalkablePosition = botroutemanager.FindClosestWalkablePoint(currentBot.instruction);
            // // console.log('closest point found:', closestWalkablePosition);
            // var targetPositionX = closestWalkablePosition.x;
            // var targetPositionZ = closestWalkablePosition.z;

            // var path = botroutemanager.findPath(currentPositionX, currentPositionZ, targetPositionX, targetPositionZ);
            var path = instructionPayload.pathToEnemy;
            // // console.log('goto path:', instructionPayload.pathToEnemy);
            currentBot.instruction = {};
            currentBot.instruction.type = 'goto';
            // // console.log('312');
            this.planBotRoute(currentBot, path);
            currentBot.isPerformingAction = true;
            // // console.log(path);
            // // console.log(currentBot);
            currentBot.hasInstruction = false;
            // currentBot.instruction = null;
            // botroutemanager.updateBotPosition(botID, targetPositionX, targetPositionZ);
            break;
            case 'die':
            currentBot.isPerformingAction = true;
            // // console.log('perform action:die:::', currentBot.id);
            currentBot.hasInstruction = false;
            currentBot.instruction = {};
            currentBot.instruction.type = 'die';
            break;
            default:
                // console.log('ERROR: unknown instruction:' + instructionParam);
        }

    },


    areAllBotsIdle: function(playerConfigParam){
        // leaderBotID: null,
        // botIDList: []
        var areBotsIdleFlag = false;
        var leaderID = playerConfigParam.leaderBotID;
        if(leaderID == null || leaderID == undefined){
            // console.log('ERROR:leader id not present.');
            return false;
        }

        // // console.log('===', );
        var leaderConfig = workerstate.botMap[playerConfigParam.leaderBotID];
        if(leaderConfig.instruction == null || leaderConfig.instruction.type == 'idle'){
            areBotsIdleFlag = true;
        }else{
            return false;
        }

        for (let i = 0; i < playerConfigParam.botIDList.length; i++) {
            // const element = array[i];
            var botConfig = workerstate.botMap[playerConfigParam.botIDList[i]];
            if(botConfig.instruction == null || leaderConfig.instruction.type == 'idle'){
                areBotsIdleFlag = true;
            }else{
                return false;
            }
        }
        return areBotsIdleFlag;
    },

    continuePerformingAction: function(currentBot, timeSliceParam){
        // // console.log(currentBot);
        // console.log('performing action for bot:<' + currentBot.id + '> with actionIndex:' + currentBot.botRouteIndex 
            // + ' action:' + currentBot.instruction.type + ' currentBot.timeelapsedincurrentaction:'
            // + currentBot.timeelapsedincurrentaction);
        // adding correction by taking into account
        // the partially executed action in the last iteration.
        // // console.log('process action for bot:' + currentBot.id);
        // // console.log('time sliece:' + timeSliceParam);
        // // console.log('currentBot.timeelapsedincurrentaction:' + currentBot.timeelapsedincurrentaction);
        var justStartedFlag = false;
        if(currentBot.timeelapsedincurrentaction == 0){
            justStartedFlag = true;
        }

        timeSliceParam += currentBot.timeelapsedincurrentaction; 
        currentBot.timeelapsedincurrentaction = 0;
        // // console.log('continuePerformingAction for:', currentBot.id);
        // // console.log(currentBot);

        var currentWeapon = currentBot.currentweapon;
        // var weaponConfig = workerstate.getItemConfig().weapon[currentWeapon];
        var weaponConfig = workerstate.getItemConfig().weapon['handGun'];

        // if(currentBot.instruction == null)
        // {
        //     // console.log(currentBot.id + ' has null instruction.');
        //     // console.log(currentBot);
        //     return;
        // }else{
        //     // console.log(currentBot.id + ' has valid instruction.');
        // }

        switch(currentBot.instruction.type){
            case 'goto':
                var update = {};
                
                // var currentPositionX = currentBot.payload.position[0];
                // var currentPositionZ = currentBot.payload.position[2];
                // var targetPositionX = currentBot.instruction.x;
                // var targetPositionZ = currentBot.instruction.z;
                for(var i = currentBot.botRouteIndex; i < currentBot.botRoute.length; ++i){

                    if(currentBot.botRoute[i][2]>timeSliceParam){//check how much we have proceeded in goto action wrt current time.
                        currentBot.timeelapsedincurrentaction = timeSliceParam;
                        timeSliceParam = 0;
                        break;
                    }
                    // timeSliceParam -= currentBot.botRoute[i][2];
                    currentBot.botRouteIndex = i;
                }
                currentBot.payload.position[0] = currentBot.botRoute[currentBot.botRouteIndex][0];
                currentBot.payload.position[2] = currentBot.botRoute[currentBot.botRouteIndex][1];
                currentBot.payload.rotation = currentBot.botRoute[currentBot.botRouteIndex][3];

                // update latest snapshot.
                update.x = currentBot.payload.position[0];
                update.z = currentBot.payload.position[2];
                update.rot = currentBot.payload.rotation;
                // console.log('updateBotPosition: botid:', currentBot.id, ' position:', currentBot.payload.position);
                bot_route_utility.updateBotPosition(currentBot.id, currentBot.payload.position[0], currentBot.payload.position[2]);
                // botroutemanager.updateBotPosition(currentBot.id, currentBot.payload.position[0], currentBot.payload.position[2]);

                if(currentBot.botRouteIndex >= currentBot.botRoute.length - 1){
                    // // console.log('done with current action. switching to idle mode.');
                    // // console.log(currentBot);
                    currentBot.botRoute = null;
                    currentBot.botRouteIndex = 0;
                    currentBot.isPerformingAction = false;
                    currentBot.timeelapsedincurrentaction = 0;

                    // update client to transition animation to idle
                    update.action = 'idle';
                }else{
                    update.action = currentBot.instruction.type;
                }
                
                this.latestSnapshot[currentBot.id] = update;
                this.isStateUpdated = true;

                // // console.log('exiting with reout index:' + currentBot.botRouteIndex);
                // // console.log('time sliece - currentBot.timeelapsedincurrentaction:' + currentBot.timeelapsedincurrentaction);
                return timeSliceParam;
            case 'idle': // spend the time slice doing nothing.
                // var update = {};
                // update.x = currentBot.payload.position[0];
                // update.z = currentBot.payload.position[2];
                // update.rot = currentBot.payload.rotation;
                // update.action = 'idle';
                // this.latestSnapshot[currentBot.id] = update;
                // this.isStateUpdated = true;

                currentBot.isPerformingAction = false;
                currentBot.hasInstruction = false;
                return 0; // consume entire time slice.
            case 'die':
                // console.log(this.lastLoopExecutionTimeStamp, ' death of:', currentBot.id);
                // currentBot.instruction.type = 'attack';
                // currentBot.instruction.rotation = instructionPayload.botRotation;
                // characterConfig.engagedEnemyType = suitableEnemy.chosenTargetType;
                // characterConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;
    

                // currentBot.payload.rotation = currentBot.instruction.rotation
                currentBot.timeelapsedincurrentaction = 0;
                currentBot.isActive = false;
                timeSliceParam = 0;
                currentBot.botRoute = null;
                currentBot.botRouteIndex = 0;
                currentBot.isPerformingAction = false;
                currentBot.hasInstruction = false;
                currentBot.timeelapsedincurrentaction = 0;

                

                // if(currentBot.type == 'base'){
                //     this.terminateGame(currentBot);
                // }else{
                    
                // }
                var update = {};
                update.action = currentBot.instruction.type;
                update.botType = currentBot.type;
                update.x = currentBot.payload.position[0];
                update.z = currentBot.payload.position[2];
                this.latestSnapshot[currentBot.id] = update;
                this.isStateUpdated = true;
                this.respawnIfNeeded(currentBot);
                // // console.log('exiting with reout index:' + currentBot.botRouteIndex);
                // // console.log('time sliece - currentBot.timeelapsedincurrentaction:' + currentBot.timeelapsedincurrentaction);
                return timeSliceParam;
            case 'spawn': // birth
                
                // currentBot.instruction.type = 'attack';
                // currentBot.instruction.rotation = instructionPayload.botRotation;
                // characterConfig.engagedEnemyType = suitableEnemy.chosenTargetType;
                // characterConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;
    

                // currentBot.payload.rotation = currentBot.instruction.rotation
                currentBot.timeelapsedincurrentaction = 0;
                // currentBot.isActive = true;
                timeSliceParam = 0;
                currentBot.botRoute = null;
                currentBot.botRouteIndex = 0;
                currentBot.isPerformingAction = false;
                currentBot.hasInstruction = false;
                currentBot.timeelapsedincurrentaction = 0;
                // update.action = 'spawn';
                // console.log(this.lastLoopExecutionTimeStamp, ' rebirth of:', currentBot.id , ' at position:', currentBot.payload.position);
                var update = {};
                update.action = currentBot.instruction.type;
                update.botType = currentBot.type;
                update.x = currentBot.payload.position[0];
                update.z = currentBot.payload.position[2];
                this.latestSnapshot[currentBot.id] = update;
                this.isStateUpdated = true;
                // // console.log('exiting with reout index:' + currentBot.botRouteIndex);
                // // console.log('time sliece - currentBot.timeelapsedincurrentaction:' + currentBot.timeelapsedincurrentaction);
                return timeSliceParam;
            case 'attack': // attack
            // currentBot.instruction.type = 'attack';
            // currentBot.instruction.rotation = instructionPayload.botRotation;
            // characterConfig.engagedEnemyType = suitableEnemy.chosenTargetType;
            // characterConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;

                // console.log('bot:' + currentBot.id + ' attack:' + currentBot.engagedEnemyTarget
                    // + ' enemy type:' + currentBot.engagedEnemyType);
                currentBot.payload.rotation = currentBot.instruction.rotation
                currentBot.timeelapsedincurrentaction = timeSliceParam;

                var update = {};

                if(currentBot.timeelapsedincurrentaction >= currentBot.attackinterval){
                    timeSliceParam = currentBot.timeelapsedincurrentaction - currentBot.attackinterval;
                    currentBot.botRoute = null;
                    currentBot.botRouteIndex = 0;
                    currentBot.isPerformingAction = false;
                    currentBot.hasInstruction = false;
                    currentBot.timeelapsedincurrentaction = 0;
                    update.action = 'idle';
                    update.x = currentBot.payload.position[0];
                    update.z = currentBot.payload.position[2];
                    update.rot = currentBot.payload.rotation;
                    this.latestSnapshot[currentBot.id] = update;
                    this.isStateUpdated = true;
                }else{
                    update.action = currentBot.instruction.type;
                    timeSliceParam = 0;
                    if(justStartedFlag){
                        // update latest snapshot.
                        update.action = currentBot.instruction.type;
                        update.x = currentBot.payload.position[0];
                        update.z = currentBot.payload.position[2];
                        update.rot = currentBot.payload.rotation;
                        this.latestSnapshot[currentBot.id] = update;
                        this.isStateUpdated = true;
                        this.updateLifeWithBotAttackDamage(currentBot);
                    }
                }
                // // console.log('exiting with reout index:' + currentBot.botRouteIndex);
                // // console.log('time sliece - currentBot.timeelapsedincurrentaction:' + currentBot.timeelapsedincurrentaction);
                return timeSliceParam;
            case 'reload':
                if(weaponConfig.reloadinterval > timeSliceParam){
                    currentBot.timeelapsedincurrentaction = timeSliceParam;
                    timeSliceParam = 0;
                }else{
                    timeSliceParam -= weaponConfig.reloadinterval;
                    currentBot.shotfired = 0;
                    if(currentBot.shotfired > weaponConfig.ammocapacity){
                        update.action = 'attack';
                        currentBot.instruction.type = 'attack';
                        break;
                    }
                }
                return timeSliceParam;
            case 'holsterweapon':
                //nextweapon weaponConfig
                
                // totalTime
                if(weaponConfig.holsterinterval > timeSliceParam){
                    currentBot.timeelapsedincurrentaction = timeSliceParam;
                    timeSliceParam = 0;
                }else{
                    timeSliceParam -= weaponConfig.holsterinterval;
                    update.action = 'equipweapon';
                    currentBot.instruction.type = 'equipweapon';
                }
                return timeSliceParam;
            case 'equipweapon':
                var nextWeaponConfig = workerstate.getItemConfig().wepon[currentBot.nextweapon];
                //nextweapon weaponConfig
                if(nextWeaponConfig.equipinterval > timeSliceParam){
                    currentBot.timeelapsedincurrentaction = timeSliceParam;
                    timeSliceParam = 0;
                }else{
                    timeSliceParam -= nextWeaponConfig.equipinterval;
                    update.action = currentBot.backupinstruction;
                    currentBot.instruction = currentBot.backupinstruction;
                }
                currentBot.nextweapon = null;
                return timeSliceParam;
            default:
                // console.log('unknown action type:' + currentBot.instruction.type);
                break;
        }
    },

    processInstruction: function(botID){
        var currentBot = workerstate.botArray[botID];
        // console.log('process bot instruction for botID:' + botID + ' currentBot.instruction.type:' + currentBot.instruction.type);
        // // console.log(currentBot);

        switch(currentBot.instruction.type){
            case 'goto':
                var currentPositionX = currentBot.payload.position[0];
                var currentPositionZ = currentBot.payload.position[2];
                var closestWalkablePosition = botroutemanager.FindClosestWalkablePoint(currentBot.instruction);
                // // console.log('closest point found:', closestWalkablePosition);
                var targetPositionX = closestWalkablePosition.x;
                var targetPositionZ = closestWalkablePosition.z;

                var path = botroutemanager.findPath(currentPositionX, currentPositionZ, targetPositionX, targetPositionZ);
                // // console.log('1');
                this.planBotRoute(currentBot, path);
                currentBot.isPerformingAction = true;
                // // console.log(path);
                // // console.log(currentBot);
                currentBot.hasInstruction = false;
                // currentBot.instruction = null;
                // botroutemanager.updateBotPosition(botID, targetPositionX, targetPositionZ);
                break;
            case 'attack':
                // // console.log('process attack instruction.');
                currentBot.isPerformingAction = true;
                // // console.log(path);
                // // console.log(currentBot);
                currentBot.hasInstruction = false;
                break;
            case 'changeweapon':
                currentBot.backupinstruction = currentBot.instruction;
                currentBot.instruction = {};
                currentBot.instruction.type = 'holsterweapon';
                currentBot.nextweapon = currentBot.backupinstruction.nextweapon;
                // currentBot.nextweapon = currentBot.instruction.nextweapon;
                break;
            // case 'spawn':
            case 'idle':
                // currentBot.backupinstruction = currentBot.instruction;
                // currentBot.instruction = {};
                // currentBot.instruction.type = 'idle';
                // currentBot.nextweapon = currentBot.backupinstruction.nextweapon;
                currentBot.isPerformingAction = true;
                currentBot.hasInstruction = false;
                // currentBot.nextweapon = currentBot.instruction.nextweapon;
                break;
            default:
                // console.log('unknown action type:' + currentBot.instruction.type);
                break;
        }

        
    },
    
}
