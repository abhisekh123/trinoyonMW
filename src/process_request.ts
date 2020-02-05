
// var types = require('.types');
import {request_message} from './factory/types';
import * as WebSocket from 'ws';
const assetManager = require('./asset_manager/asset_manager');
const workermanager = require('./workermanager');
const userManager = require('./control/usermanager');
// const serverstate = require('./state/serverstate');

export class RequestProcessor {
    
    process(requestJSON: request_message, ws: WebSocket) {
        const userIndex = userManager.getUserIndexFromWebsocket(ws);
        if(userIndex == undefined || userIndex == null){
            console.log('ERROR:Dropping request. Unknown sender.');
            return;
        }else{
            requestJSON.userId = userIndex;
        }
        switch (requestJSON.type) {
            case 'action':
                // console.log('got action update from client');
                // console.log(requestJSON);
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
            case 'client_disconnected':
                // console.log('got message with type:', requestJSON.type);
                // this.sendMessagePacket('ack_request_game_exit', {} as any, ws);
                const userId = userManager.removeUser(ws);
                requestJSON.userId = userId;
                workermanager.postMessage(requestJSON);
                break;
            default:
                // console.log('ERROR: unknown message type:<' + requestJSON.type + '>');
                break;
        }
    }

    // send message to the client.
    sendMessagePacket(packetType: string, payload: JSON, ws: WebSocket){
        var container = {type:packetType, message:payload};
        try {
            ws.send(JSON.stringify(container));    
        } catch (error) {
            // console.log(error);
        }
    }

}

