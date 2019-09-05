

https://www.youtube.com/watch?v=ZqGVU1sW8pg
https://www.youtube.com/watch?v=V2l_rfoGHgk
https://www.youtube.com/watch?v=IrulFx7mMkU
https://www.youtube.com/watch?v=Ql-BEIMmQk8
https://www.youtube.com/watch?v=cHmh1SNlmmU
https://www.youtube.com/watch?v=seMNyBOF_tY
https://www.youtube.com/watch?v=WjMGLfg5uaU
https://www.youtube.com/watch?v=W9KAx7ml-Hk
https://www.youtube.com/watch?v=hr5C5BYEigs
https://www.youtube.com/watch?v=JdzlcRYqjMo
https://www.youtube.com/watch?v=KmGL1HYNtR0
https://www.youtube.com/watch?v=s_WiEvPYBIc
https://www.youtube.com/watch?v=lq_iY2TMxyc
https://www.youtube.com/watch?v=oRpM2giA91Y
https://www.youtube.com/watch?v=zOTayQZn6Rw
https://www.youtube.com/watch?v=NLZL8wtuRmA
https://www.youtube.com/watch?v=QC6iaoY_kuA
https://www.youtube.com/watch?v=sJVpUWCGztQ
https://www.youtube.com/watch?v=mTSb58GIEvQ
https://www.youtube.com/watch?v=nycYxb-zNwc

start:
npm run start



closest:
FindClosestWalkablePoint: function(position){ ======
findClosestPointNeighbourhood: function(position, targetPosition, range){
FindPathToClosestPointInNeighbourhood: function(botID, targetBotID){
findClosestVisiblePointInRange: function(position, targetPosition, range){ // interesting
nearest
FindPathToNearestVisiblePointInRange: function(botID, targetBotID){

    visibilityMatrix should have map / array to store all bots occupying the grid.

todo now: (bot ai) - done.
1>bot auto attack closest
2>chase inrange enemy.
3>go near leader

player(ai)
1>if all bots are idle, find next target, march leader to trget.

admit player
remove player

bot life cycle (die/spawn)

tower attack.
tower life cycle.

base attack
base life cycle.

game life cycle.


isObstacleDefenseOrBase


type: static, bot, base, tower

// init_world

loadStaticModel == 572
    worldItems.staticObjectMap[itemID] = {};
    worldItems.staticObjectMap[itemID].parentMesh = parentMesh;
    worldItems.staticObjectMap[itemID].type = 'tower';
    worldItems.staticObjectMap[itemID].controlMesh = newMeshes[0];
    worldItems.staticObjectMap[itemID].position = positionParam;

processLoadedModel == 465
     worldItems.characterMap[characterID] = {};
    worldItems.characterMap[characterID].parentMesh = parentMesh;
    worldItems.characterMap[characterID].characterName = characterName;
    worldItems.characterMap[characterID].controlMesh = newMeshes[0];
    worldItems.characterMap[characterID].currentAnimation = characterConfig.idleAnimationIndex;
    worldItems.characterMap[characterID].animationGroups = animationGroups;
    worldItems.characterMap[characterID].defaultRotation = Math.PI;
    worldItems.characterMap[characterID].intermediatePositionArray = [];
    worldItems.characterMap[characterID].intermediatePositionArrayIndex = 0;
    worldItems.characterMap[characterID].action = 'idle';
    worldItems.characterMap[characterID].team = team;
    worldItems.characterMap[characterID].playerID = playerID;

// workerlogic

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
                attackinterval: botItemConfig.attackinterval,
                spawnDuration: botItemConfig.spawnDuration,
                damageincurred:0,
                speed: botItemConfig.speed,
                range: botItemConfig.range,
                engagedEnemyTarget: null,
                engagedEnemyType: null,
                type: 'bot',
                payload:{
                    teamColor:playerConfig.teamColor,
                    type:botType,
                    team:characterConfig.team,
                    position:[
                        characterConfig.position.x, 
                        characterConfig.position.y, 
                        characterConfig.position.z
                    ],
                    rotation:0,
                },
            };