
const workerState = require('../../state/workerstate');
const aiUtility = require('../ai/aiutility');

module.exports = {
    // baseMap: {}
    worldConfig: null,
    itemConfig: null,
    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
    },

    traverseBotThroughPath: function(botConfig){

    },,,

    
    continuePerformingAction: function(botConfig, gameRoom, timeSlice){
        switch(botConfig.action){
            case 'goto':
            // else continue transport
            break;
            case 'march':
            // check if hostile in range
            if(aiUtility.canAttack(botConfig)){ // if can attack
                var hostileConfig = aiUtility.findClosestHostileInRange(botConfig, gameRoom, botConfig.range);
                if(hostileConfig != null){ // if a hostile is found in range
                    botConfig.action = 'fight';
                    botConfig.actionData = hostileConfig;
                    aiUtility.processAttackDamageEvent(botConfig, hostileConfig);
                    return 0; // consumed all remaining time to attack. Done for the current iteration.
                }
            }
            // action = ready
            // else continue transport
            break;
            default:
            console.log('unknown botConfig.action:', botConfig.action);
            break;
        }
    },

    continuePerformingAction_OLD: function(botConfig, gameRoom, timeSlice){
        // // console.log(currentBot);
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

    updateLifeWithBotAttackDamage(characterConfig){
        // currentBot.instruction.type = 'attack';
        // currentBot.instruction.rotation = instructionPayload.botRotation;
        // characterConfig.engagedEnemyType = suitableEnemy.chosenTargetType;
        // characterConfig.engagedEnemyTarget = suitableEnemy.chosenEnemyID;
        var enemyConfig = null;
        var attackDamage = characterConfig.attack;
        // // console.log('characterConfig.engagedEnemyType:', characterConfig.engagedEnemyType);
        // // console.log(characterConfig);
        switch(characterConfig.engagedEnemyType){
            case 'bot':
            enemyConfig = workerstate.botMap[characterConfig.engagedEnemyTarget];
            break;
            case 'static':
            enemyConfig = workerstate.buildingMap[characterConfig.engagedEnemyTarget];
            break;
            default:
            // console.log('ERROR: unknown enemy type:' + characterConfig.engagedEnemyType);
            return;
            // break;
        }
        // console.log('/////////////enemy life:', enemyConfig.life, ' enemyConfig.id:', enemyConfig.id);
        // // console.log(enemyConfig);
        enemyConfig.life -= attackDamage;
        // if(characterConfig.engagedEnemyType == 'static'){
        //     if(enemyConfig.life <= 0){
        //         ,,,,
        //     }
        // }else{

        // }
        // console.log('enemy life after attack:', enemyConfig.life);
    },
    
}
