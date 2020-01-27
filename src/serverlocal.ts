import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as path from 'path';

import {request_message} from './factory/types';
import {RequestProcessor} from './process_request';
// import * as clientMessageValidator from '../src/utils/client_message_validator';
// import * as clientMessageValidator from './utils/client_message_validator';
const clientMessageValidator = require(__dirname + '/../../src/utils/client_message_validator');
// const clientMessageValidator = require('src/utils/client_message_validator');

const app = express();
const requestProcessor = new RequestProcessor();
const assetManager = require('./asset_manager/asset_manager');
const workermanager = require('./workermanager');
const clientregistry = require('./state/clientstate');

const https = require('https');
const fs = require('fs');

console.log()

export class DemoServer {


    async startServer(portParam: number){
        clientregistry.init();
        // console.log('starting worker');
        workermanager.startWorker();
        
        // console.log('starting init routine.');
        await assetManager.init();
        // console.log('completed initialising assetmanager.');
        app.get('/', function(req, res) {
            // console.log(req.body);
            res.sendFile(path.join(__dirname + '/../../public/index.html'));
        });

        app.post('/', function(req, res) {
            // console.log(req.body);
            res.sendFile(path.join(__dirname + '/../../public/index.html'));
        });

        app.get('/ppolicy', function(req, res) {
            // console.log(req.body);
            res.sendFile(path.join(__dirname + '/../../public/ppolicy.html'));
        });

        app.get('/termsofservice', function(req, res) {
            // console.log(req.body);
            res.sendFile(path.join(__dirname + '/../../public/termsofservice.html'));
        });

        app.use('/static', express.static(path.join(__dirname + '/../../public')));

        //initialize a simple http server
        const server = http.createServer(app);

        // const httpOptions = {
        //     key: fs.readFileSync("/home/trinoyon/ssl.key"),
        //     cert: fs.readFileSync("/home/trinoyon/ssl.cert")
        // }
        // const httpsserver = https.createServer(httpOptions, app);

        //initialize the WebSocket server instance
        const wss = new WebSocket.Server({ server });
        // const wss = new WebSocket.Server({ server: httpsserver});

        wss.on('connection', (ws: WebSocket) => {
            // // console.log('got new connection:' , ws);
            // console.log('got new connection');
            let clientID = clientregistry.admitNewClient(ws);
            if(clientID < 0){
                ws.close();
                return;
            }

            //connection is up, let's add a simple simple event
            ws.on('message', (message: string) => {
                //log the received message and send it back to the client
                
                let clientConfig = clientregistry.clientMap.get(ws);
                // console.log('received: %s', message + 'from client with ID:' , clientConfig);

                var messageJSON = clientMessageValidator.validateClientMessage(message);

                if(messageJSON == null || messageJSON == undefined){
                    return;
                }
                
                const reqMsg: request_message = messageJSON as request_message;
                requestProcessor.process(reqMsg, ws);
            });
            ws.on('close', (message: string) => {
                // console.log('closed connection.');
                const clientID = clientregistry.removeClient(ws);
                if(clientID != null && clientID != undefined){
                    requestProcessor.process({
                        type: 'client_disconnected',
                        clientID: clientID,
                        teamID: 0,
                        message:{}
                    } as request_message, ws);
                }
                
            });

            ws.on('error', (message: string) => {
                clientregistry.removeClient(ws);
            });
        
        });
        // console.log('-----portParam:', portParam);
        //start our server
        server.listen(portParam, () => {
            // console.log(`>>>>>>>>>>>>>>>>>Server started on port ${server.address.toString} :)`);
        });

        // httpsserver.listen(443, () => {
        //     // console.log(`Server started on port ${httpsserver.address.toString} :)`);
        // });

    }
}



const demoServer = new DemoServer();
// demoServer.startServer(80);
demoServer.startServer(8080);




