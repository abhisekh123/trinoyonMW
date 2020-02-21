import * as fs from 'fs';

// promisify is a neat tool in the util module that transforms a callback function into a promise one
import { promisify } from 'util';
// const writeFile = promisify(fs.writeFile)
const readFilePromise = promisify(fs.readFile);

module.exports = {
    inventory: {},

    // function to encode file data to base64 encoded string
    base64_encode: function(file: string) {
        // read binary data
        var bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return new Buffer(bitmap).toString('base64');
    },

    getAsset: function(assetType: string, assetID: string){
        switch (assetType) {
            case 'init_audio':
                return this.inventory.store.init_audio_key;
                break;
            case 'init':
                return this.inventory.store.init_key + this.inventory.store.network_manager_key;
                break;
            case 'init_video':
                // // console.log(this.inventory.store.init_video_key);
                return this.inventory.store.init_video_key;
                break;
            case 'init_world':
                return this.inventory.store.world_config_key + this.inventory.store.item_config_key + this.inventory.store.init_world_key;
                // return this.inventory.store.world_config_key;
                break;
            case 'binary':
                const actualID = this.inventory.literals[assetID];
                // console.log('actualID::' + actualID);
                return this.inventory.store[actualID];
                break;
            default:
                // console.log('default message');
                break
        }
    },

    init: async function(){
        const parentCtrl = this;

        const v1 = await readFilePromise(__dirname + '/../../../ui/inventory_catalog.json', 'utf-8');
        parentCtrl.inventory.catalog = JSON.parse(v1);

        parentCtrl.inventory.store = {};

        // for each inventory content ... read content and load in memory.
        for (var key in parentCtrl.inventory.catalog.items) {
            // // console.log("key " + key + " has value " + parentCtrl.inventory.catalog[key]);
            const fileName: string = parentCtrl.inventory.catalog.items[key];
            // const v3 = await readFilePromise('./data/' + fileName, 'utf-8');
            const v3 = await readFilePromise(__dirname + '/../../../ui/' + fileName, 'utf-8');
            parentCtrl.inventory.store[key] = v3;
        }
        // console.log('-----------------------');
        // console.log(parentCtrl.inventory.catalog);

        for (var key in parentCtrl.inventory.catalog.images) {
            // // console.log("key " + key + " has value " + parentCtrl.inventory.catalog.images[key]);
            const fileName: string = parentCtrl.inventory.catalog.images[key];
            // const v4 = await readFilePromise('./data/images/' + fileName, 'utf-8');
            const v4 = this.base64_encode(__dirname + '/../../../ui/images/' + fileName, 'utf-8');
            // // console.log('================');
            // // console.log(v4);
            parentCtrl.inventory.store[key] = v4;
        }

        // // console.log('inventory--->' , parentCtrl.inventory);
    }
}



// const assetManager = new Asset_Manager();

// module.exports = assetManager;