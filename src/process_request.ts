
/**
 * Process request from users(clients)
 */

// var types = require('.types');
import {request_message} from './factory/types';
import * as WebSocket from 'ws';
const assetManager = require('./asset_manager/asset_manager');
const workermanager = require('./workermanager');
const userManager = require('./control/usermanager');
const serverState = require('./state/serverstate');
const clientBroadcaster = require('./clientbroadcaster');
// const serverstate = require('./state/serverstate');

export class RequestProcessor {
    
    process(requestJSON: request_message) {
        
        switch (requestJSON.type) {
            case 'action':
            case 'si':
                // console.log('got action update from client');
                // console.log(requestJSON);
                workermanager.postMessage(requestJSON);
                break;
            case 'message':
                console.log('got message:', requestJSON);
                this.processIncomingMessages(requestJSON);
                break;
            case 'binary':
            case 'init':
            case 'init_ui':
            case 'init_world':
                // console.log('got message type:<' + requestJSON.type + '>');
                this.sendMessagePacket('ack1', assetManager.getAsset(requestJSON.type), requestJSON.userId);
                break;
            case 'request_game_admit':
                // console.log('got message with type:request_game_admit userID:', requestJSON.userId);
                
                workermanager.postMessage(requestJSON);
                break;
            case 'request_game_exit':
            case 'client_disconnected':
                // console.log('got message with type:', requestJSON.type);
                userManager.disconnectUser(requestJSON.userId);
                // requestJSON.userId = userId;
                // workermanager.postMessage(requestJSON);
                break;
            default:
                console.log('ERROR: unknown message type:<' + requestJSON.type + '>');
                break;
        }
    }

    processIncomingMessages(requestJSON: any){
        switch (requestJSON.sub) {
            case 'text':
                clientBroadcaster.forewardToAllOnlineNonPlayingUser(requestJSON);
                break;
            case 'invite':
            case 'challenge':
            case 'rejectmatchmakingrequest':
                // console.log('got ' + requestJSON.sub);
                clientBroadcaster.sendMessageToRecipientByUserID(
                    requestJSON.payload.recipientId, JSON.stringify(requestJSON)
                );
                break;
            default:
                break;
        }
    }

    // send message to the client.
    sendMessagePacket(packetType: string, payload: JSON, userId: string){
        // console.log('sending message packet', userId);
        // const ws: WebSocket = serverState.users_server_state[userId].ws;
        // console.log('ws=>', ws);
        var container = {type:packetType, message:payload};
        clientBroadcaster.sendMessageToRecipientByUserID(userId, JSON.stringify(container));
    }

}

