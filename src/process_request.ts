
// var types = require('.types');
import {request_message} from './factory/types';
import * as WebSocket from 'ws';
const assetManager = require('./asset_manager/asset_manager');
const workermanager = require('./workermanager');
const userManager = require('./control/usermanager');
const serverState = require('./state/serverstate');
// const serverstate = require('./state/serverstate');

export class RequestProcessor {
    
    process(requestJSON: request_message) {
        
        switch (requestJSON.type) {
            case 'action':
                // console.log('got action update from client');
                // console.log(requestJSON);
                workermanager.postMessage(requestJSON);
                break;
            case 'binary':
            case 'init':
            case 'init_ui':
            case 'init_world':
                console.log('got message type:<' + requestJSON.type + '>');
                this.sendMessagePacket('ack1', assetManager.getAsset(requestJSON.type), requestJSON.userId);
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
                const userId = userManager.removeUser(requestJSON.userId);
                requestJSON.userId = userId;
                workermanager.postMessage(requestJSON);
                break;
            default:
                // console.log('ERROR: unknown message type:<' + requestJSON.type + '>');
                break;
        }
    }

    // send message to the client.
    sendMessagePacket(packetType: string, payload: JSON, userId: string){
        console.log('sending message packet', userId);
        const ws: WebSocket = serverState.userIdToWSMap[userId].ws;
        // console.log('ws=>', ws);
        var container = {type:packetType, message:payload};
        try {
            ws.send(JSON.stringify(container));    
        } catch (error) {
            console.log(error);
        }
    }

}

