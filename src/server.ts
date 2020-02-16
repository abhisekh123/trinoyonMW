import * as express from 'express';
const session = require('express-session');
const uuid = require('uuid');

import * as http from 'http';
import * as https from 'https';
import * as WebSocket from 'ws';
import * as path from 'path';
const dbManager = require('./precistance/dbmanager');

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
const serverstate = require('./state/serverstate');

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


const map = new Map();
//
// We need the same instance of the session parser in express and
// WebSocket server.
//
const sessionParser = session({
    saveUninitialized: true,
    secret: '$eCuRiTy',
    resave: true
});

const app = express();

// for authentication
// app.use(cookieParser());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(session({ secret: 'keyboard cat', key: 'sid' }));
app.use(sessionParser);
app.use(passport.initialize());
app.use(passport.session());

// login page
app.get("/login", function (req, res) {
    res.send("<a href='/auth/facebook'>login through facebook</a>");
});
app.use('/static', express.static(path.join(__dirname + '/../../public')));
// app.use(express.static('public'));
// console.log()
app.post('/login1', function (req, res) {
    //
    // "Log in" user and set userId to session.
    //
    console.log('asdfvcv');
    const id = uuid.v4();

    console.log(`Updating session for user ${id}`);
    if (req.session) {
        req.session.user = id;
    }
    // req.session.userId = id;
    res.send({ result: 'OK', message: 'Session updated' });
});

app.delete('/logout', function (req, res) {
    // let ws = null;
    if (req.session) {
        const ws = map.get(req.session.userId);
        req.session.destroy(function () {
            if (ws) ws.close();

            res.send({ result: 'OK', message: 'Session destroyed' });
        });
    } else {
        return;
    }
    console.log('Destroying session');

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

// app.get('/auth/facebook/callback',
//     passport.authenticate('facebook', { failureRedirect: '/login' }),
//     function (req, res) {
//         // Successful authentication, redirect home.
//         console.log('call back.');
//         res.redirect('/');
//     });
app.get("/auth/facebook/callback",
    passport.authenticate("facebook", {
        successRedirect : "/",
        failureRedirect : "/login"
}));

app.get('/howrwi', function (req, res) {
    console.log('how r wi');
    // res.send(serverstate.getServerState());
    res.send('a1');
});

app.post('/9h109x', function (req, res) {// phionix .... restart routine.
    serverManager.initiateServerShutDownRoutine();
    res.send(serverstate.getServerState());
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

    loginRoutine(req: any) {
        const id = uuid.v4();

        console.log(`Updating session for user ${id}`);
        if (req.session) {
            req.session.user = id;
        }
        // req.session.userId = id;
        return { result: 'OK', message: 'Session updated' };
    }

    logoutRoutine(req: any) {
        const ws = map.get(req.session.userId);
        req.session.destroy(function () {
            if (ws) ws.close();

            return { result: 'OK', message: 'Session destroyed' };
        });
    }

    admitNewConnectionRoutine(req: any, ws: WebSocket) {
        const userId_new = req.session.userId;

        map.set(userId_new, ws);
        // // console.log('got new connection:' , ws);
        console.log('got new connection');
        let userId = userManager.admitNewUser(ws);
        if (userId < 0) {
            console.log('error: could not connect the new client.');
            ws.close();
            return;
        }
    }

    async startServer(portParam: number) {
        dbManager.init();
        userManager.init();
        // console.log('starting worker');
        workerManager.startWorker();

        // console.log('starting init routine.');
        await assetManager.init();

        //
        // Serve static files from the 'public' folder.
        //



        // app.use('/static', express.static(path.join(__dirname + '/../../public')));

        //initialize a simple http server
        let server = null;

        // const httpOptions = {
        //     key: null,
        //     cert: null
        // };
        // let httpsserver = null;

        if (environmentState.environment == 'server') {
            // httpOptions.key = fs.readFileSync("/home/trinoyon/ssl.key");
            // httpOptions.cert = fs.readFileSync("/home/trinoyon/ssl.cert");

            server = https.createServer({
                key: fs.readFileSync("/home/trinoyon/ssl.key"),
                cert: fs.readFileSync("/home/trinoyon/ssl.cert")
            }, app);
            server.on('upgrade', function (request, socket, head) {
                console.log('upgrade: Parsing session from request...1');
                console.log('1....request.session-->', request.session);
                console.log('1....request.session-->', socket.session);
                console.log('1....request.session-->', head);
                // console.log('request-->', request);
                sessionParser(request, {}, () => {
                    if (!request.session.userId) {
                        socket.destroy();
                        return;
                    }

                    console.log('Session is parsed!');

                    wss.handleUpgrade(request, socket, head, function (ws) {
                        wss.emit('connection', ws, request);
                    });
                });
            });
        } else {
            server = http.createServer(app);
            server.on('upgrade', function (request, socket, head) {
                console.log('upgrade: Parsing session from request...2');
                console.log('request.session-->', request.session);
                sessionParser(request, {}, () => {
                    if (!request.session.userId) {
                        socket.destroy();
                        return;
                    }

                    console.log('Session is parsed!');

                    wss.handleUpgrade(request, socket, head, function (ws) {
                        wss.emit('connection', ws, request);
                    });
                });
            });
        }


        //initialize the WebSocket server instance
        const wss = new WebSocket.Server({ server });
        // let wss = null;
        // if (environment.environment == 'server') {
        //     wss = new WebSocket.Server({ server: httpsserver });
        // } else {
        //     wss = new WebSocket.Server({ server });
        // }
        // http.IncomingMessage

        wss.on('upgrade', function(request, socket, head) {
            console.log('Parsing session from request...345');
            console.log('request.session-->', request.session);
            sessionParser(request, {}, () => {
              if (!request.session.userId) {
                socket.destroy();
                return;
              }

              console.log('Session is parsed!');

              wss.handleUpgrade(request, socket, head, function(ws) {
                wss.emit('connection', ws, request);
              });
            });
          });

        wss.on('connection', (ws: WebSocket, req: any) => {
            // if (req.session) {
            // }
            console.log('user-->', req.user);
            console.log('request object');
            // console.log(req);

            // const userId_new = req.session.userId;

            // map.set(userId_new, ws);
            // // // console.log('got new connection:' , ws);
            // console.log('got new connection');
            // let userId = userManager.admitNewUser(ws);
            // if (userId < 0) {
            //     console.log('error: could not connect the new client.');
            //     ws.close();
            //     return;
            // }

            //connection is up, let's add a simple simple event
            ws.on('message', (message: string) => {
                //log the received message and send it back to the client

                var messageJSON = messageValidator.validateIncomingMessage(message);

                if (messageJSON == null || messageJSON == undefined) {
                    console.log('message invalid');
                    return;
                }

                const reqMsg: request_message = messageJSON as request_message;
                requestProcessor.process(reqMsg, ws);
            });
            ws.on('close', (message: string) => {
                console.log('closed connection.');
                this.removeUser(ws);
            });

            ws.on('error', (message: string) => {
                console.log('error connection.');
                this.removeUser(ws);
            });

        });
        console.log('-----portParam:', portParam);
        //start our server

        if (environmentState.environment == 'server') {
            server.listen(443, () => {
                // console.log(`Server started on port ${httpsserver.address.toString} :)`);
            });
        } else {
            server.listen(portParam, () => {
                // console.log(`>>>>>>>>>>>>>>>>>Server started on port ${server.address.toString} :)`);
            });
        }
    }

    removeUser(wsParam: WebSocket) {
        console.log('removeUser start');
        requestProcessor.process({
            type: 'client_disconnected',
            userId: '',
            teamID: 0,
            message: {}
        } as request_message, wsParam);
    }
}

function ensureAuthenticated(req: any, res: any, next: any) {
    // console.log('ensure authenticated.');
    if (req.isAuthenticated()) { 
        console.log('authenticated.');
        return next(); 
    }
    console.log('not authenticated.');
    res.redirect('/login')
}




const demoServer = new DemoServer();
if (environmentState.environment == 'server') {
    demoServer.startServer(80);
} else {
    demoServer.startServer(8080);
}





