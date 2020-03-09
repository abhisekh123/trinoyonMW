/**
 * Common utility functions used by other ai modules.
 */

const workerState = require('../../state/workerstate');

module.exports = {
    // baseMap: {}
    worldConfig: null,
    itemConfig: null,
    init: function(){
        this.worldConfig = workerState.getWorldConfig();
        this.itemConfig = workerState.getItemConfig();
    },
}


