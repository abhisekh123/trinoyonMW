import * as express from 'express';
const session = require('express-session');
// const bodyParser = require('body-parser');
const uuid = require('uuid');

import * as http from 'http';
import * as https from 'https';
import * as WebSocket from 'ws';
import * as path from 'path';
const dbManager = require('./persistance/dbmanager');

import { request_message } from './factory/types';
import { RequestProcessor } from './process_request';
const messageValidator = require(__dirname + '/../../src/utils/messagevalidator');

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
        // console.log('use function.', profile);
        // console.log('accesstoken:', accessToken);
        const user = await dbManager.findUser(profile.id);
        // console.log('searched for user');
        // console.log(user);

        if (user) {
            // console.log('known user');
            return done(null, user);
        } else {
            // console.log('creating new user');
            const newUser = await dbManager.createNewUser(profile);
            return done(null, newUser);
        }

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

// miscellanious 
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
    switch (req.query.type) {
        case 'p': // find a parent
            var URL = '';
            if (environmentState.environment == 'server') {
                URL = 'wss://trinoyon.com';
            } else {
                // URL = 'ws://192.168.1.3:8080';
                URL = 'ws://localhost:8080';
            }
            const userKey = getNewKey(req);
            respJSON.data = {
                u: URL,
                k: userKey
            };
            respJSON.status = 'ok';

            // later send this key to the intended parent server
            if (serverState.userIdToWSMap[userKey] != undefined) {
                // if there is already a connection.
                // remove user routine.
            }
            serverState.userIdToWSMap[userKey] = {}; // check if there is actually a connection.
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

// console.log('completed initialising assetmanager.');
app.get('/', ensureAuthenticated, function (req, res) {
    console.log('req for root');
    console.log('2....request.session-->', req.session);
    // console.log(';;;;=>', req);
    res.setHeader('test-field', 'testy');
    res.sendFile(path.join(__dirname + '/../../public/index.html'));
    // res.send('root');
});

app.post('/', ensureAuthenticated, function (req, res) {
    // console.log(req.body);
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
    if(etaseta == 'chonch0l'){
        res.send(serverState.getServerState());
    }else{
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
        dbManager.init();
        userManager.init();
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
                console.log('upgrade: Parsing session from request...1/2');
                console.log('234<' + request.headers['sec-websocket-protocol'] + '>');
                // const customHeaderItemArray = request.headers['sec-websocket-protocol'].split(',');
                // const customHeaderItemArray: string[] = request.headers['sec-websocket-protocol'].split(',').map((item: string) => item.trim());
                // console.log(customHeaderItemArray);
                // const incomingKey = customHeaderItemArray[0];
                const incomingKey = request.headers['sec-websocket-protocol'];
                const keyConfig = serverState.userIdToWSMap[incomingKey];
                if (keyConfig == null || keyConfig == undefined) {
                    console.log('keyConfig == null || keyConfig == undefined for incoming key', incomingKey);
                    socket.destroy();
                    return;
                }


                // console.log('a');
                // console.log(request.session);
                // console.log('b');
                // request.session.userId = incomingKey;
                sessionParser(request, {}, () => {
                    // console.log('ea');
                    // console.log(request.session);
                    // console.log('be');
                    request.session.userId = incomingKey;
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
                const incomingKey = request.headers['sec-websocket-protocol'];
                const keyConfig = serverState.userIdToWSMap[incomingKey];
                request.incomingKey = incomingKey;
                if (keyConfig == null || keyConfig == undefined) {
                    console.log('keyConfig == null || keyConfig == undefined for incoming key', incomingKey);
                    socket.destroy();
                    return;
                }


                sessionParser(request, {}, () => {
                    // console.log('ea');
                    // console.log(request.session);
                    // console.log('be');
                    request.session.userId = incomingKey;
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
            const keyConfig = serverState.userIdToWSMap[userId];
            keyConfig.ws = ws;
            // if (req.session) {
            // }
            // console.log('start user connection routine-->', req.user);
            // console.log('user-->', req.session);
            // console.log('request object');
            // const customHeaderItemArray: string[] = req.headers['sec-websocket-protocol'].split(',').map((item: string) => item.trim());
            //     console.log(customHeaderItemArray);
            // console.log('request.testValue::', req.testValue);
            //connection is up, let's add a simple simple event

            // const userConfig = serverState.userIdToWSMap[userKey];
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
                this.removeUser(userId);
            });

            ws.on('error', (message: string) => {
                console.log('error connection.', message);
                this.removeUser(userId);
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

    removeUser(wsParam: WebSocket) {
        console.log('removeUser start');
        // requestProcessor.process({
        //     type: 'client_disconnected',
        //     userId: '',
        //     team: 0,
        //     message: {}
        // } as request_message, wsParam);
    }
}

function ensureAuthenticated(req: any, res: any, next: any) {
    // console.log('ensure authenticated.');
    if (environmentState.environment == 'local') {
        return next();
    }
    if (req.isAuthenticated()) {
        console.log('authenticated.');
        // req.session.userTest = 1;
        return next();
    }
    console.log('not authenticated.');
    res.redirect('/login')
}

// function admitNewConnectionRoutine(req: any, ws: WebSocket) {
//     const userId_new = req.session.userId;
//     // // console.log('got new connection:' , ws);
//     console.log('got new connection');
//     let userId = userManager.admitNewUser(ws);
//     if (userId < 0) {
//         console.log('error: could not connect the new client.');
//         ws.close();
//         return;
//     }
// }

function getNewKey(requestObject: any) {
    const id = uuid.v4();
    console.log('get new key', id);
    var key = id;
    return key;
}


const demoServer = new DemoServer();
if (environmentState.environment == 'server') {
    demoServer.startServer(80);
} else {
    demoServer.startServer(8080);
}





