


module.exports = {
    botArray: [],
    botMap: {},
    buildingMap: {},
    buildingArray: [],
    // baseMap: {}

    init: function(){
        
    },
    
    terminateGame(itemConfigParam){
        var loosingTeam = itemConfigParam.team;
        var update = {};
        update.action = 'over';
        update.loosingTeam = loosingTeam;
        update.x = 0;
        update.z = 0;
        this.latestSnapshot[itemConfigParam.id] = update;
        this.isStateUpdated = true;
        // this.isGameRunning = false;
        this.sendSnapshotUpdateToMain();

        // reset game
        playerManager.reset();

        for (let index = 0; index < workerstate.getWorldConfig().characters.length; index++) {
            const characterConfig = workerstate.getWorldConfig().characters[index];
            var botObject = workerstate.botArray[index];
            botObject.payload.position[0] = characterConfig.position.x;
            botObject.payload.position[2] = characterConfig.position.z;
            botObject.life = characterConfig.life;
        }
        
        for (let index = 0; index < workerstate.buildingArray.length; index++) {
            var buildingType = workerstate.buildingArray[index].type;
            var buildingItemConfig = workerstate.getItemConfig().buildings[buildingType];
            workerstate.buildingArray[i].life = buildingItemConfig.life;;
            workerstate.buildingArray[i].isActive = true;
        }
    },


    initializeWorldByPopulatingWithBots: function(){
        // // console.log('playerManager.playerArrey:', playerManager.playerArrey);
        for (let index = 0; index < workerstate.getWorldConfig().characters.length; index++) {
            const characterConfig = workerstate.getWorldConfig().characters[index];
            var botType = characterConfig.type;
            var botItemConfig = workerstate.getItemConfig().characters[botType];
            // // console.log('characterConfig.playerID:', characterConfig.playerID);
            var playerConfig = playerManager.playerArrey[characterConfig.playerID - 1];

            if(characterConfig.isLeader){
                playerConfig.leaderBotID = characterConfig.id;
            }else{
                playerConfig.botIDList.push(characterConfig.id);
            }

            var botObject = {
                timeelapsedincurrentaction:0,
                isActive:true,
                isAIDriven:false,
                id:characterConfig.id,
                isLeader: characterConfig.isLeader,
                shotfired:0,
                botRouteIndex:0,
                targetbotid:null,
                // currentweapon:botItemConfig.attachmentmesh[0],
                nextweapon:null,
                backupinstruction:null,
                // weaponinventory:botItemConfig.attachmentmesh,
                life:botItemConfig.life,
                attack: botItemConfig.attack,
                attackinterval: botItemConfig.attackinterval,
                spawnDuration: botItemConfig.spawnDuration,
                damageincurred:0,
                speed: botItemConfig.speed,
                range: botItemConfig.range,
                engagedEnemyTarget: null,
                engagedEnemyType: null,
                type: 'bot',
                botType: botType,
                team:characterConfig.team,
                playerID:characterConfig.playerID,
                botIndex: index,
                instruction: {
                    type: 'idle'
                },
                // currentBot.instruction.type = 'idle',
                payload:{
                    teamColor:playerConfig.teamColor,
                    type:botType,
                    // team:characterConfig.team,
                    position:[
                        characterConfig.position.x, 
                        characterConfig.position.y, 
                        characterConfig.position.z
                    ],
                    rotation:0,
                },
            };
            // // console.log('admitting new bot at initialization:', botObject.payload.position);
            workerstate.botArray[index] = botObject;
            workerstate.botMap[characterConfig.id] = botObject;
            this.admitNewBot(index);
        }
    },
    admitNewPlayer: function(clientID, isAI){
        // console.log('admit new player:' + clientID);
        const playerConfig = playerManager.admitNewPlayer(clientID);
        
        return playerConfig;
    },
}