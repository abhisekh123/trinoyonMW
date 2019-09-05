"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const process_request_1 = require("./process_request");
const app = express();
const requestProcessor = new process_request_1.RequestProcessor();
// const fs = require('fs');
const assetManager = require('./asset_manager/asset_manager');
const workermanager = require('./workermanager');
// const { parse } = require('querystring');
const clientregistry = require('./serverlib/clientRegistry');
// const world_config = require('../../data/world_config');
class DemoServer {
    // initialiseConfiguration(){
    //     console.log('initialiseConfiguration');
    //     world_config.commonConfig.maxBotCount = world_config.commonConfig.maxPlayerCount * world_config.commonConfig.maxBotPerPlayer;
    // }
    startServer(portParam) {
        return __awaiter(this, void 0, void 0, function* () {
            clientregistry.init();
            // this.initialiseConfiguration();
            console.log('starting worker');
            workermanager.startWorker();
            // return;
            console.log('starting init routine.');
            yield assetManager.init();
            console.log('completed initialising assetmanager.');
            // viewed at http://localhost:8999
            app.get('/', function (req, res) {
                console.log(req.body);
                res.sendFile(path.join(__dirname + '/../../public/index.html'));
            });
            app.use('/static', express.static(path.join(__dirname + '/../../public')));
            //initialize a simple http server
            const server = http.createServer(app);
            //initialize the WebSocket server instance
            const wss = new WebSocket.Server({ server });
            wss.on('connection', (ws) => {
                // console.log('got new connection:' , ws);
                console.log('got new connection');
                let clientID = clientregistry.admitNewClient(ws);
                if (clientID < 0) {
                    ws.close();
                    return;
                }
                //connection is up, let's add a simple simple event
                ws.on('message', (message) => {
                    //log the received message and send it back to the client
                    let clientConfig = clientregistry.clientMap.get(ws);
                    console.log('received: %s', message + 'from client with ID:', clientConfig);
                    var messageJSON;
                    if (message) {
                        try {
                            messageJSON = JSON.parse(message);
                            if (!messageJSON.hasOwnProperty('type')) {
                                //bad request. discard.
                                return;
                            }
                        }
                        catch (e) {
                            console.log(e); // error in the above string (in this case, yes)!
                            return;
                        }
                    }
                    const reqMsg = messageJSON;
                    // processRequest(reqMsg);
                    requestProcessor.process(reqMsg, ws);
                });
                ws.on('close', (message) => {
                    console.log('closed connection.');
                    clientregistry.removeClient(ws);
                });
                ws.on('error', (message) => {
                    // ws.close();
                    clientregistry.removeClient(ws);
                });
            });
            //start our server
            // server.listen(process.env.PORT || 8999, () => {
            server.listen(portParam, () => {
                console.log(`Server started on port ${server.address.toString} :)`);
            });
        });
    }
}
exports.DemoServer = DemoServer;
const demoServer = new DemoServer();
demoServer.startServer(8999);
//# sourceMappingURL=server.js.map