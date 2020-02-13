import * as express from 'express';
const session = require('express-session');
const uuid = require('uuid');

import * as http from 'http';
import * as https from 'https';
import * as WebSocket from 'ws';
import * as path from 'path';

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
passport.serializeUser(function(user: any, done: any) {
    done(null, user);
  });
  
  passport.deserializeUser(function(obj: any, done: any) {
    done(null, obj);
  });

  // Use the FacebookStrategy within Passport.

passport.use(new FacebookStrategy({
    clientID: environmentState.facebookAuth.clientID,
    clientSecret:environmentState.facebookAuth.clientSecret ,
    callbackURL: environmentState.facebookAuth.callbackURL,
    profileFields: environmentState.facebookAuth.profileFields
  },
  function(accessToken: any, refreshToken: any, profile: any, done: any) {
    // const { email, first_name, last_name } = profile._json;
    // const userData = {
    //   email,
    //   firstName: first_name,
    //   lastName: last_name
    // };
    process.nextTick(function () {
      //Check whether the User exists or not using profile.id
      if(environmentState.facebookAuth.use_database) {
        // if sets to true
        // pool.query("SELECT * from user_info where user_id="+profile.id, (err,rows) => {
        //   if(err) throw err;
        //   if(rows && rows.length === 0) {
        //       console.log("There is no such user, adding now");
        //       pool.query("INSERT into user_info(user_id,user_name) VALUES('"+profile.id+"','"+profile.username+"')");
        //   } else {
        //       console.log("User already exists in database");
        //   }
        // });
      }
      return done(null, profile);
    });
  }
));


const map = new Map();
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
// app.use(cookieParser());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'keyboard cat', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());


app.use(express.static('public'));
app.use(sessionParser);
// console.log()
app.post('/login', function (req, res) {
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

// console.log('completed initialising assetmanager.');
app.get('/', function (req, res) {
    console.log(req);
    res.sendFile(path.join(__dirname + '/../../public/index.html'));
});

app.post('/', function (req, res) {
    // console.log(req.body);
    res.sendFile(path.join(__dirname + '/../../public/index.html'));
});

app.get('/ppolicy', function (req, res) {
    // console.log(req.body);
    res.sendFile(path.join(__dirname + '/../../public/ppolicy.html'));
});

app.get('/termsofservice', function (req, res) {
    // console.log(req.body);
    res.sendFile(path.join(__dirname + '/../../public/termsofservice.html'));
});

app.post('/howrwi', function (req, res) {
    res.send(serverstate.getServerState());
});

app.post('/9h109x', function (req, res) {// phionix .... restart routine.
    serverManager.initiateServerShutDownRoutine();
    res.send(serverstate.getServerState());
});


app.get('/account', ensureAuthenticated, function(req: any, res){
    res.render('account', { user: req.user });
  });
  
//   app.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));
app.get('/auth/facebook', function (req, res) {// phionix .... restart routine.
        console.log('auth123');
        passport.authenticate('facebook');
        // serverManager.initiateServerShutDownRoutine();
        // res.send(serverstate.getServerState());
    }
);
  
  
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { successRedirect : '/', failureRedirect: '/login' }),
    function(req, res) {
        console.log('adafs');
        res.redirect('/');
    });
  
  app.get('/logout', function(req: any, res){
    req.logout();
    res.redirect('/');
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
                console.log('Parsing session from request...');

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
                console.log('Parsing session from request...');

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

        // server.on('upgrade', function(request, socket, head) {
        //     console.log('Parsing session from request...');

        //     sessionParser(request, {}, () => {
        //       if (!request.session.userId) {
        //         socket.destroy();
        //         return;
        //       }

        //       console.log('Session is parsed!');

        //       wss.handleUpgrade(request, socket, head, function(ws) {
        //         wss.emit('connection', ws, request);
        //       });
        //     });
        //   });

        wss.on('connection', (ws: WebSocket, req: any) => {
            // if (req.session) {
            // }


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
                // console.log('closed connection.');
                this.removeUser(ws);
            });

            ws.on('error', (message: string) => {
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
        requestProcessor.process({
            type: 'client_disconnected',
            userId: '',
            teamID: 0,
            message: {}
        } as request_message, wsParam);
    }
}

function ensureAuthenticated(req: any, res: any, next: any) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
  }


const demoServer = new DemoServer();
if (environmentState.environment == 'server') {
    demoServer.startServer(80);
} else {
    demoServer.startServer(8080);
}





