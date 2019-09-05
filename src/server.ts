import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as path from 'path';

import {request_message} from './types';
import {RequestProcessor} from './process_request';

const app = express();
const requestProcessor = new RequestProcessor();
// const fs = require('fs');
const assetManager = require('./asset_manager/asset_manager');
const workermanager = require('./workermanager');
// const { parse } = require('querystring');
const clientregistry = require('./serverlib/clientRegistry');
// const world_config = require('../../data/world_config');


export class DemoServer {

    // initialiseConfiguration(){
    //     console.log('initialiseConfiguration');
    //     world_config.commonConfig.maxBotCount = world_config.commonConfig.maxPlayerCount * world_config.commonConfig.maxBotPerPlayer;
    // }

    async startServer(portParam: number){
        clientregistry.init();
        // this.initialiseConfiguration();
        console.log('starting worker');
        workermanager.startWorker();
        
        // return;
        console.log('starting init routine.');
        await assetManager.init();
        console.log('completed initialising assetmanager.');
        // viewed at http://localhost:8999
        app.get('/', function(req, res) {
            console.log(req.body);
            res.sendFile(path.join(__dirname + '/../../public/index.html'));
        });


        app.use('/static', express.static(path.join(__dirname + '/../../public')));

        //initialize a simple http server
        const server = http.createServer(app);

        //initialize the WebSocket server instance
        const wss = new WebSocket.Server({ server });

        wss.on('connection', (ws: WebSocket) => {
            // console.log('got new connection:' , ws);
            console.log('got new connection');
            let clientID = clientregistry.admitNewClient(ws);
            if(clientID < 0){
                ws.close();
                return;
            }

            //connection is up, let's add a simple simple event
            ws.on('message', (message: string) => {
                //log the received message and send it back to the client
                
                let clientConfig = clientregistry.clientMap.get(ws);
                console.log('received: %s', message + 'from client with ID:' , clientConfig);

                var messageJSON;
                if(message) {
                    try {
                        messageJSON = JSON.parse(message);
                        if(!messageJSON.hasOwnProperty('type')){
                            //bad request. discard.
                            return;
                        }
                    } catch(e) {
                        console.log(e); // error in the above string (in this case, yes)!
                        return;
                    }
                }
                
                const reqMsg: request_message = messageJSON as request_message;
                // processRequest(reqMsg);
                requestProcessor.process(reqMsg, ws);
            });
            ws.on('close', (message: string) => {
                console.log('closed connection.');
                clientregistry.removeClient(ws);
            });

            ws.on('error', (message: string) => {
                // ws.close();
                clientregistry.removeClient(ws);
            });
        
        });
        
        //start our server
        // server.listen(process.env.PORT || 8999, () => {
        server.listen(portParam, () => {
            console.log(`Server started on port ${server.address.toString} :)`);
        });
    }
}



const demoServer = new DemoServer();
demoServer.startServer(8999);



