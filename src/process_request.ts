
// var types = require('.types');
import {request_message} from './types';
import * as WebSocket from 'ws';
const assetManager = require('./asset_manager/asset_manager');
const workermanager = require('./workermanager');
const clientregistry = require('./serverlib/clientRegistry');


export class RequestProcessor {
    process(requestJSON: request_message, ws: WebSocket) {
        const clientID = clientregistry.clientMap.get(ws);
        if(clientID == undefined || clientID == null){
            console.log('ERROR:Dropping request. Unknown sender.');
            return;
        }else{
            requestJSON.clientID = clientID;
        }
        switch (requestJSON.type) {
            case 'action':
                console.log('got action update from client');
                console.log(requestJSON);
                workermanager.postMessage(requestJSON);
                break;
            case 'init_audio':
            case 'init':
            case 'init_video':
            case 'init_world':
                console.log('got message type:<' + requestJSON.type + '>');
                this.sendMessagePacket('ack1', assetManager.getAsset(requestJSON.type), ws);
                break;
            case 'request_game_admit':
                console.log('got message with type:request_game_admit');
                // this.sendMessagePacket('ack_request_game_admit', {} as any, ws);
                
                workermanager.postMessage(requestJSON);
                break;
            case 'request_game_exit':
                console.log('got message with type:request_game_exit');
                // this.sendMessagePacket('ack_request_game_exit', {} as any, ws);
                
                workermanager.postMessage(requestJSON);
                break;
            default:
                console.log('ERROR: unknown message type:<' + requestJSON.type + '>');
                break;
        }
    }

    sendMessagePacket(packetType: string, payload: JSON, ws: WebSocket){
        var container = {type:packetType, message:payload};
    
        ws.send(JSON.stringify(container));
    }

}
