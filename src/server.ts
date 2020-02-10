import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as path from 'path';

import {request_message} from './factory/types';
import {RequestProcessor} from './process_request';
const messageValidator = require(__dirname + '/../../src/utils/messagevalidator');

const app = express();
const requestProcessor = new RequestProcessor();
const assetManager = require('./asset_manager/asset_manager');
const workerManager = require('./workermanager');
const userManager = require('./control/usermanager');

const https = require('https');
const fs = require('fs');
const environment = require('./state/environmentstate');
const serverstate = require('./state/serverstate');


console.log()

export class DemoServer {


    async startServer(portParam: number){
        userManager.init();
        // console.log('starting worker');
        workerManager.startWorker();
        
        // console.log('starting init routine.');
        await assetManager.init();
        // console.log('completed initialising assetmanager.');
        app.get('/', function(req, res) {
            // console.log(req);
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

        app.post('/howrwi', function(req, res) {
            res.send(serverstate.getServerState());
        });

        app.use('/static', express.static(path.join(__dirname + '/../../public')));

        //initialize a simple http server
        const server = http.createServer(app);

        const httpOptions = {
            key: null,
            cert: null
        };
        let httpsserver = null;

        if(environment.environment == 'server'){
            httpOptions.key = fs.readFileSync("/home/trinoyon/ssl.key");
            httpOptions.cert = fs.readFileSync("/home/trinoyon/ssl.cert");

            httpsserver = https.createServer(httpOptions, app);
        }
        

        //initialize the WebSocket server instance
        let wss = null;
        if(environment.environment == 'server'){
            wss = new WebSocket.Server({ server: httpsserver });
        } else {
            wss = new WebSocket.Server({ server });
        }
        
        wss.on('connection', (ws: WebSocket) => {
            // // console.log('got new connection:' , ws);
            console.log('got new connection');
            let userId = userManager.admitNewUser(ws);
            if(userId < 0){
                console.log('error: could not connect the new client.');
                ws.close();
                return;
            }

            //connection is up, let's add a simple simple event
            ws.on('message', (message: string) => {
                //log the received message and send it back to the client

                var messageJSON = messageValidator.validateIncomingMessage(message);

                if(messageJSON == null || messageJSON == undefined){
                    console.log('message invalid');
                    return;
                }
                
                const reqMsg: request_message = messageJSON as request_message;
                requestProcessor.process(reqMsg, ws);
            });
            ws.on('close', (message: string) => {
                // console.log('closed connection.');
                this.removeUser(ws);
            });

            ws.on('error', (message: string) => {
                this.removeUser(ws);
            });
        
        });
        console.log('-----portParam:', portParam);
        //start our server
        server.listen(portParam, () => {
            // console.log(`>>>>>>>>>>>>>>>>>Server started on port ${server.address.toString} :)`);
        });
        if(environment.environment == 'server'){
            httpsserver.listen(443, () => {
                // console.log(`Server started on port ${httpsserver.address.toString} :)`);
            });
        }
    }

    removeUser(wsParam: WebSocket){
        requestProcessor.process({
            type: 'client_disconnected',
            userId: '',
            teamID: 0,
            message:{}
        } as request_message, wsParam);
    }
}



const demoServer = new DemoServer();
if(environment.environment == 'server'){
    demoServer.startServer(80);
} else {
    demoServer.startServer(8080);
}





