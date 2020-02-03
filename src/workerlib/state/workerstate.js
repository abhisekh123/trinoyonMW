
const world_config = require(__dirname + '/../../../ui/world_config');
const item_config = require(__dirname + '/../../../ui/item_config');

module.exports = {
    customConfigs: {
        createFreshVisibility: true,
    },
    globalDistanceMatrix: null,
    games: [],
    grid: {},
    // baseMap: {}

    init: function(){
        
    },
    getWorldConfig: function() {
        return world_config;
    },
    getItemConfig: function() {
        return item_config;
    }
}