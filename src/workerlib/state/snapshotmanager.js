
// const PF = require('pathfinding');
// const world_config = require(__dirname + '/../../ui/world_config');

// var fs = require('fs');
// const readline = require('readline');
const workerstate = require('./workerstate');

module.exports = {
    snapshot:[],

    init: function(){
        
    },

    clearSnaphsot: function(){
        this.snapshot.length = 0;
    },

    // populate current message with latest game snapshot. To be sent to newly admitted player.
    addSnapshot: function(currentMessage, playerConfig){
        currentMessage.bots = [];
        currentMessage.objects = [];
        currentMessage.playerConfig = {};
        for (let index = 0; index < workerstate.botArray.length; index++) {
            const element = workerstate.botArray[index];
            const botConfigEntry = {};
            botConfigEntry.x = element.payload.position[0];
            botConfigEntry.y = 0;
            botConfigEntry.z = element.payload.position[2];
            botConfigEntry.ry = element.payload.rotation;
            botConfigEntry.playerID = element.playerID;
            botConfigEntry.isLeader = element.isLeader;
            botConfigEntry.id = element.id;
            botConfigEntry.life = element.life;
            botConfigEntry.isActive = element.isActive;
            botConfigEntry.action = element.instruction.type;
            currentMessage.bots[index] = botConfigEntry;
        }
        for (let index = 0; index < workerstate.buildingArray.length; index++) {
            const element = workerstate.buildingArray[index];
            const buildingConfigEntry = {};
            buildingConfigEntry.life = element.life;
            buildingConfigEntry.team = element.team;
            buildingConfigEntry.isActive = element.isActive;
            buildingConfigEntry.id = element.id;
            currentMessage.objects[index] = buildingConfigEntry;
        }
        // currentMessage.objects = workerstate.buildingArray;
        currentMessage.playerConfig = {};
        currentMessage.playerConfig.playerID = playerConfig.playerID;
        currentMessage.playerConfig.teamID = playerConfig.teamID;
        return currentMessage;
    },
    getSnapshot: function(){
        // return this.snapshot;
    }
}
