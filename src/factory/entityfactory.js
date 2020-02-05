// //////////////////////////////////////////////////////////////
/**
 * This file contains factory method and crud/compare methods
 * different entity object.
 * Entity examples:
 * game, bot, obstacle, environment
 */
// //////////////////////////////////////////////////////////////

module.exports = {
    getNewGameRoom: function(){
        var gameRoom = {};
        gameRoom.playersArray = [];
        gameRoom.playersMap = {};
        gameRoom.bots = {};
        gameRoom.buildings = {};
        return gameRoom;
    },
}