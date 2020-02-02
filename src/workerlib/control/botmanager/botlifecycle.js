// might not be needed.
module.exports = {
    gameBotState:{},
    gameStaticObjectState:{},

    
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


    respawnIfNeeded(characterConfig){
        var parentCtrl = this;
        switch(characterConfig.type){
            case 'bot':
            // enemyConfig = workerstate.botMap[characterConfig.engagedEnemyTarget];
            setTimeout(function(){
                parentCtrl.respawn(characterConfig);
                // tg.selectedObjectPointerMesh.position.x = position.x;
                // tg.selectedObjectPointerMesh.position.y = position.z;
                // tg.selectedObjectPointerMesh.position.y = tg.selectedObjectPointerMeshPositionY;
            }, 
            characterConfig.spawnDuration);
            break;
            case 'tower':
            // enemyConfig = workerstate.buildingMap[characterConfig.engagedEnemyTarget];
            break;
            default:
            // console.log('ERROR: unknown enemy type:' + characterConfig);
            break;
        }
    },

    respawn(itemConfigParam){

        itemConfigParam.isActive = true;
        var itemTypeConfig = workerstate.getItemConfig().characters[itemConfigParam.botType];
        itemConfigParam.life = itemTypeConfig.life;
        var spawnPosition = null;
        if(itemConfigParam.isLeader){
            // spawn near base
            var team = itemConfigParam.team;
            var basePosition = null;
            if(team == 1){
                basePosition = workerstate.buildingMap['base2'].position;
            }else{
                basePosition = workerstate.buildingMap['base1'].position;
            }
            spawnPosition = botroutemanager.FindClosestWalkablePoint(basePosition);
        }else{
            var playerConfig = playerManager.getPlayerByTeamID(itemConfigParam.team);
            var leaderConfig = workerstate.botMap[playerConfig.leaderBotID];
            spawnPosition = botroutemanager.FindClosestWalkablePoint({
                x: leaderConfig.payload.position[0],
                z: leaderConfig.payload.position[2]
            });
        }
        itemConfigParam.payload.position[0] = spawnPosition.x;
        itemConfigParam.payload.position[2] = spawnPosition.z;
        // // console.log('1');
        this.instructBot(itemConfigParam, 'spawn', {botRotation: 0});
    },


    admitNewBot: function(botIndex){
        // // console.log('admit new bot:' + botIndex);
        // var botList = this.botArray;
        // var botID = this.findEmptyBotSlot();
        var botElement = workerstate.botArray[botIndex];
        
        var botItemProperty = workerstate.getItemConfig().characters[botElement.payload.type];

        workerstate.botArray[botIndex].hasInstruction = false;
        workerstate.botArray[botIndex].isPerformingAction = false;
        workerstate.botArray[botIndex].life = botItemProperty.life;
        // workerstate.botArray[botIndex].equippedWeapon = botItemProperty.attachmentmesh[0];

        workerstate.botArray[botIndex].strideDistance = botItemProperty.strideDistance;
        workerstate.botArray[botIndex].strideTime = botItemProperty.strideTime;
        workerstate.botArray[botIndex].range = botItemProperty.range;
        workerstate.botArray[botIndex].botRoute = null;


        workerstate.botArray[botIndex].botRoute = null;

        var position = botroutemanager.admitNewBot(botElement.payload, botIndex);
        workerstate.botArray[botIndex].payload.position[0] = position.x;
        workerstate.botArray[botIndex].payload.position[2] = position.z;
    },


    deActivateBot: function(botID){
        if(workerstate.botArray[botID].isActive == false){
            // console.log('ERROR:the agent is already inactive.');
        }
        botroutemanager.deActivateBot(botID);
    },
    
}
