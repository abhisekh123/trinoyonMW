import * as express from 'express';
const session = require('express-session');
// const bodyParser = require('body-parser');
const uuid = require('uuid');

import * as http from 'http';
import * as https from 'https';
import * as WebSocket from 'ws';
import * as path from 'path';
// const dbManager = require('./persistance/dbmanager');

import { request_message } from './factory/types';
import { RequestProcessor } from './process_request';
const messageValidator = require(__dirname + '/../../src/utils/messagevalidator');
const utilityFunctions = require(__dirname + '/../../src/utils/utilityfunctions');

const requestProcessor = new RequestProcessor();
const assetManager = require('./asset_manager/asset_manager');
const workerManager = require('./workermanager');
const userManager = require('./control/usermanager');
const serverManager = require('./control/servermanager');


const fs = require('fs');
const environmentState = require('./state/environmentstate');
const serverState = require('./state/serverstate');

// authentication
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
// const cookieParser = require('cookie-parser');
// const bodyParser = require('body-parser');
// Passport session setup.
passport.serializeUser(function (user: any, done: any) {
    // console.log('serialise function.');
    done(null, user);
});

passport.deserializeUser(function (user: any, done: any) {
    // console.log('deserialise function.');
    done(null, user);
});

passport.use(new FacebookStrategy({
    clientID: environmentState.facebookAuth.clientID,
    clientSecret: environmentState.facebookAuth.clientSecret,
    callbackURL: environmentState.facebookAuth.callbackURL,
    profileFields: environmentState.facebookAuth.profileFields
},
    async function (accessToken: any, refreshToken: any, profile: any, done: any) {
        console.log('use function.', profile);
        // console.log('accesstoken:', accessToken);
        const user = await userManager.getUserObject(profile);
        console.log('searched for user');
        console.log(user);

        
        return done(null, user);
    }
));


//
// We need the same instance of the session parser in express and
// WebSocket server.
//
const sessionParser = session({
    saveUninitialized: false,
    secret: '$eCuRiTy',
    resave: false
});

const app = express();

// for authentication
app.use(sessionParser);
app.use(passport.initialize());
app.use(passport.session());

// new session handshake protocol. tells the client what to do next.
// if an existing session is detected, then it is purged.
app.get("/ox", function (req, res) {
    console.log('ox called');
    console.log(req.query);
    var respJSON: any = {
        status: 'fail',
        // data: '123'
    };

    
    console.log('a');
    console.log(req.session);
    console.log('b');
    var userIdDecimal = '';
    if(req.session && req.session.userId){
        userIdDecimal = req.session.userId;
    } else {
        // res.send(respJSON);
        res.redirect('/login');
    }

    var userConfig = {
        firstName: serverState.users_db_state[userIdDecimal].firstName,
        lastName: serverState.users_db_state[userIdDecimal].lastName,
        userId: serverState.users_db_state[userIdDecimal].userId,
        id: serverState.users_db_state[userIdDecimal].id,
        state: serverState.users_server_state[userIdDecimal].state,
        team: serverState.users_server_state[userIdDecimal].team,
    };

    switch (req.query.type) {
        case 'p': // find a parent
            var URL = '';
            if (environmentState.environment == 'server') {
                URL = 'wss://trinoyon.com';
            } else {
                // URL = 'ws://192.168.1.3:8080';
                URL = 'ws://localhost:8080';
            }
            const wsKey = getNewWSKey();
            respJSON.data = {
                u: URL,
                k: wsKey,
                userConfig: userConfig
            };
            respJSON.status = 'ok';
            serverState.users_server_state[userIdDecimal].wsKey = wsKey;

            userManager.disconnectUser(userIdDecimal);
            break;

        default:
            break;
    }
    res.send(respJSON);
});

app.use('/static', express.static(path.join(__dirname + '/../../public')));


if (environmentState.environment == 'server') {
    console.log('enabling trust proxy');
    app.enable('trust proxy');
    app.use(function (req, res, next) {
        if (req.secure) {
            // request was via https, so do no special handling
            next();
        } else {
            // request was via http, so redirect to https
            res.redirect('https://' + req.headers.host + req.url);
        }
    });
}



// login page
app.get("/login", function (req, res) {
    // res.send("<a href='/auth/facebook'>login through facebook</a>");
    res.sendFile(path.join(__dirname + '/../../public/login.html'));
});

app.get('/logout', function (req: any, res) {
    req.logout();
    res.redirect('/');
});

if (environmentState.environment == 'server') {
    app.get('/', ensureAuthenticated, function (req, res) {
        // console.log(';;;;=>', req);
        
        if(req && req.session){
            console.log(req.session.cookie);
            if(req.session.passport && req.session.passport.user){
                console.log('setting userID to session:', req.session.passport.user.id);
                req.session.userId = req.session.passport.user.id;
            }
            
        }
        res.setHeader('test-field', 'testy');
        res.sendFile(path.join(__dirname + '/../../public/index.html'));
    });
} else {
    app.get('/', function (req, res) {
        // console.log(';;;;=>', req);
        var givenUserId = req.query.id;
        if(req && req.session){
            console.log(req.session.cookie);
            req.session.userId = givenUserId;
        }
        res.setHeader('test-field', 'testy');
        res.sendFile(path.join(__dirname + '/../../public/index.html'));
    });
}


app.post('/', ensureAuthenticated, function (req, res) {
    // console.log(req.body);
    if(req && req.session){
        console.log(req.session.cookie);
        if(req.session.passport && req.session.passport.user){
            console.log('setting userID to session:', req.session.passport.user.id);
            req.session.userId = req.session.passport.user.id;
        }
        
    }
    res.setHeader('test-field', 'testy');

    res.sendFile(path.join(__dirname + '/../../public/index.html'));
    // res.send('root - post');
});


app.get('/auth/facebook',
    passport.authenticate('facebook')
);

app.get("/auth/facebook/callback",
    passport.authenticate("facebook", {
        successRedirect: "/",
        failureRedirect: "/login"
    }));

app.get('/howrwi', function (req, res) {
    console.log('how r wi');
    // res.send(serverState.getServerState());
    var etaseta = req.query.etaseta;
    if (etaseta == 'chonch0l') {
        res.send(serverState.getServerState());
    } else {
        res.send('Cannot GET /howrwi');
    }

});

app.post('/9h109x', function (req, res) {// phionix .... restart routine.
    serverManager.initiateServerShutDownRoutine();
    res.send(serverState.getServerState());
});


app.get('/ppolicy', function (req, res) {
    // console.log(req.body);
    res.sendFile(path.join(__dirname + '/../../public/ppolicy.html'));
});

app.get('/termsofservice', function (req, res) {
    // console.log(req.body);
    res.sendFile(path.join(__dirname + '/../../public/termsofservice.html'));
});



export class DemoServer {

    async startServer(portParam: number) {
        // dbManager.init();

        // dbManager.insertTestData();
        // dbManager.testmethod();
        serverState.init(workerManager);
        // console.log(serverState);
        userManager.init(workerManager, serverState);
        requestProcessor.init(serverState);
        // console.log('starting worker');
        workerManager.startWorker();

        // console.log('starting init routine.');
        await assetManager.init();

        //initialize a simple http server
        let server = null;


        if (environmentState.environment == 'server') {

            server = https.createServer({
                key: fs.readFileSync("/home/trinoyon/ssl.key"),
                cert: fs.readFileSync("/home/trinoyon/ssl.cert")
            }, app);
            server.on('upgrade', function (request, socket, head) {
                console.log('upgrade: Parsing session from request...1/2', request.session);
                console.log('234<' + request.headers['sec-websocket-protocol'] + '>');
                // const customHeaderItemArray = request.headers['sec-websocket-protocol'].split(',');
                // const customHeaderItemArray: string[] = request.headers['sec-websocket-protocol'].split(',').map((item: string) => item.trim());
                // console.log(customHeaderItemArray);
                // const incomingKey = customHeaderItemArray[0];



                // console.log('a');
                // console.log(request.session);
                // console.log('b');
                console.log('serverState.users_server_state:', serverState.users_server_state);
                sessionParser(request, {}, () => {
                    // console.log('ea');
                    // console.log(request.session);
                    // console.log('be');
                    if (!request.session.userId) {
                        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                        socket.destroy();
                        return;
                    }
                    const incomingKey = request.headers['sec-websocket-protocol'];
                    let keyConfig = null;
                    if(serverState.users_server_state[request.session.userId] != undefined){
                        console.log(serverState.users_server_state[request.session.userId]);
                        keyConfig = serverState.users_server_state[request.session.userId].wsKey;
                    }
                    if (keyConfig == null || keyConfig == undefined || keyConfig != incomingKey) {
                        console.log('keyConfig == null || keyConfig == undefined for incoming key', incomingKey);
                        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                        socket.destroy();
                        return;
                    }
                    
                    wss.handleUpgrade(request, socket, head, function (ws) {
                        // console.log('eea');
                        // console.log(request.session);
                        // console.log('bee');
                        wss.emit('connection', ws, request);
                    });
                });
            });
        } else {
            server = http.createServer(app);
            server.on('upgrade', function (request, socket, head) {
                console.log('upgrade: Parsing session from request...2');
                // const customHeaderItemArray: string[] = request.headers['sec-websocket-protocol'].split(',').map((item: string) => item.trim());
                // console.log(customHeaderItemArray);
                // const incomingKey = customHeaderItemArray[0];



                sessionParser(request, {}, () => {
                    // console.log('ea');
                    // console.log(request.session);
                    // console.log('be');
                    const incomingKey = request.headers['sec-websocket-protocol'];
                    let keyConfig = null;
                    if(serverState.users_server_state[request.session.userId] != undefined){
                        keyConfig = serverState.users_server_state[request.session.userId].wsKey;
                    }
                    
                    if (keyConfig == null || keyConfig == undefined || keyConfig != incomingKey) {
                        console.log(serverState.users_server_state[request.session.userId]);
                        console.log('keyConfig == null || keyConfig == undefined for incoming key::', incomingKey);
                        socket.destroy();
                        return;
                    }

                    wss.handleUpgrade(request, socket, head, function (ws) {
                        // console.log('eea');
                        // console.log(request.session);
                        // console.log('bee');
                        wss.emit('connection', ws, request);
                    });
                });
            });
        }


        //initialize the WebSocket server instance
        // const wss = new WebSocket.Server({ server });
        const wss = new WebSocket.Server({ clientTracking: false, noServer: true });


        wss.on('connection', (ws: WebSocket, req: any) => {
            const userId = req.session.userId;
            // serverState.users_server_state[userId].ws = ws;
            // serverState.users_server_state[userId].isOnline = true;
            userManager.connectUser(userId, ws);

            // userManager.updateWorkerWithNewUserConnection(userId);
            
            // if (req.session) {
            // }
            // console.log('start user connection routine-->', req.user);
            // console.log('user-->', req.session);
            // console.log('request object');
            // const customHeaderItemArray: string[] = req.headers['sec-websocket-protocol'].split(',').map((item: string) => item.trim());
            //     console.log(customHeaderItemArray);
            // console.log('request.testValue::', req.testValue);
            //connection is up, let's add a simple simple event

            // console.log('aa');
            // console.log(req.session);
            // console.log('ba');
            
            ws.on('message', (message: string) => {
                //log the received message and send it back to the client
                // ws.send('hi');   
                console.log('got new message:', message);
                var messageJSON = messageValidator.validateIncomingMessage(message);

                if (messageJSON == null || messageJSON == undefined) {
                    console.log('message invalid');
                    return;
                }

                const reqMsg: request_message = messageJSON as request_message;
                reqMsg.userId = userId;
                requestProcessor.process(reqMsg);
            });
            ws.on('close', (message: string) => {
                console.log('closed connection.', message);
                console.log('client disconnect. userId:' + userId);
                ws.close();
                userManager.disconnectUser(userId);
            });

            ws.on('error', (message: string) => {
                console.log('error connection.', message);
                console.log('client disconnect. userId:' + userId);
                ws.close();
                userManager.disconnectUser(userId);
            });

        });
        // console.log('-----portParam:', portParam);
        //start our server

        if (environmentState.environment == 'server') {
            server.listen(443, () => {
                // console.log(`Server started on port ${httpsserver.address.toString} :)`);
            });

            // Redirect from http port 80 to https
            // http.createServer(function (req, res) {
            //     res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
            //     res.end();
            // }).listen(80);
        } else {
            server.listen(portParam, () => {
                // console.log(`>>>>>>>>>>>>>>>>>Server started on port ${server.address.toString} :)`);
                console.log('>>>>>>>>>>>>>>>>> local server started.');
            });
        }
    }
}

function ensureAuthenticated(req: any, res: any, next: any) {
    // console.log('ensure authenticated.');
    // if (environmentState.environment == 'local') {
    //     return next();
    // }
    if (req.isAuthenticated()) {
        // console.log('authenticated.');
        // req.session.userTest = 1;
        return next();
    }
    // console.log('not authenticated.');
    res.redirect('/login');
}

// find unique wsKey
function getNewWSKey() {
    let searchingKey = true;
    var key = null;

    // search all existing wsKey to ensure uniqueness
    let keyArray = utilityFunctions.getObjectKeys(serverState.users_server_state);
    while(searchingKey){
        const id = uuid.v4();
        searchingKey = false;
        for(var i = 0; i < keyArray.length; ++i){
            if(serverState.users_server_state[keyArray[i]].wsKey == id){
                searchingKey = true;
                break;
            }
        }
        key = id;
    }
    
    // console.log('get new key', id);
    
    return key;
}


const demoServer = new DemoServer();
if (environmentState.environment == 'server') {
    demoServer.startServer(80);
} else {
    demoServer.startServer(8080);
}





