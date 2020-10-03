
// const Datastore = require('nedb');
// import datastore from 'nedb-promise';
const datastore = require('nedb-promise');
const utilityFunctions = require(__dirname + '/../../../src/utils/utilityfunctions');
// const serverState = require('../state/serverstate');

//   , db = new Datastore({ filename: '/usee', autoload: true });
// You can issue commands right away

module.exports = {
    db: {
        users: null,
    },
    serverState: null,
    init: async function (serverState: any) {
        this.serverState = serverState;
        // console.log('---serverstate:', serverState);
        this.db.serverstate = new datastore({
            filename: '../data_trinoyonMW/serverstate.db',
            autoload: true
        });
        this.db.users = new datastore({
            filename: '../data_trinoyonMW/users.db',
            autoload: true
        });

        // process server state
        // process server state
        const serverStates = await this.db.serverstate.find({}, function (err: any, docs: any) {});
        for(var i = 0; i < serverStates.length; ++i){
            this.serverState.persistant_server_state[serverStates[i].uniquename] = serverStates[i];
            this.serverState.serverstate_id_list.push(serverStates[i].uniquename);
        }

        // process users
        const allUsers = await this.db.users.find({}, function (err: any, docs: any) {});
        for(var i = 0; i < allUsers.length; ++i){
            // console.log('==>allUsers[i].id:', allUsers[i].id);
            // allUsers[i].userId = parseInt(allUsers[i].id, 10).toString(32);
            // console.log(allUsers[i].userId);
            // console.log(parseInt(allUsers[i].id, 32).toString(10));
            this.serverState.users_db_state[allUsers[i].id] = allUsers[i];
            this.serverState.users_server_state[allUsers[i].id] = this.getEmptyUserServerState();
            this.serverState.users_server_state[allUsers[i].id].id = allUsers[i].id;
            this.serverState.users_server_state[allUsers[i].id].isMMRReady = false;
            this.serverState.users_server_state[allUsers[i].id].firstName = allUsers[i].firstName;
            this.serverState.users_server_state[allUsers[i].id].lastName = allUsers[i].lastName;
            this.serverState.users_server_state[allUsers[i].id].ws = null;
            this.serverState.users_server_state[allUsers[i].id].isOnline = false;
            this.serverState.user_id_list.push(allUsers[i].id);
            // console.log('updating:', allUsers[i].id);
            // console.log('result:', result);
            // var result = await this.db.users.update({ id: allUsers[i].id }, { $set: { userId: allUsers[i].userId } }, { multi: true });
            // console.log(i + '::completed update', result);
        }
        // await this.introduceNewField();

        await this.insertTestData();
    },

    introduceNewField: async function() {
        console.log('introduce new user fields:', this.serverState.user_id_list.length);
        for(var i = 0; i < this.serverState.user_id_list.length; ++i){
            var userId = this.serverState.user_id_list[i];
            console.log('updating record for user:', userId);
            var currentUser = this.serverState.users_db_state[userId];
            currentUser.gold = 0;
            currentUser.trophy = i;
            currentUser.totalwin = 0;
            currentUser.totalloss = 0;
            currentUser.weeklywin = 0;
            currentUser.weeklyloss = 0;


            currentUser.tdeath = 0;
            currentUser.wdeath = 0;
            currentUser.tkill = 0;
            currentUser.wkill = 0;
            currentUser.tdestroy = 0;
            currentUser.wdestroy = 0;

            currentUser.tdamage = 0;
            currentUser.wdamage = 0;
            currentUser.tattack = 0;
            currentUser.wattack = 0;

            const updateResult = await this.db.users.update({ id: currentUser.id }, currentUser);
            console.log('updateResult:', updateResult);
            console.log('i>' + i);
        }
    },

    getEmptyUserServerState: function(){
        return {
            isOnline: false,
            ws: null,
            state: 'idle', // possible state: idle, playing, matchmaking
            wsKey: null,
            mmrIndex: null,
            // team: 0
        };
    },

    createNewUser: async function (profile: any) {
        const now = utilityFunctions.getCurrentTime();
        const userId = parseInt(profile.id, 10).toString(32);
        const user = {
            id: profile.id,
            userId: userId,
            joiniing: now,
            lastLogin: now,
            isOnline: true,
            gold: 0,
            trophy: 0,
            totalwin: 0,
            totalloss: 0,
            weeklywin: 0,
            weeklyloss: 0,
            firstName: profile._json.first_name,
            lastName: profile._json.last_name,
            email: profile._json.email,
        };

        await this.db.users.insert(user);
        var userCreated = await this.db.users.findOne({id: profile.id});
        this.serverState.users_db_state[profile.id] = userCreated;
        this.serverState.users_server_state[profile.id] = this.getEmptyUserServerState();
        this.serverState.users_server_state[profile.id].id = profile.id;
        this.serverState.users_server_state[profile.id].isMMRReady = false;
        this.serverState.users_server_state[profile.id].firstName = user.firstName;
        this.serverState.users_server_state[profile.id].lastName = user.lastName;
        this.serverState.users_server_state[profile.id].ws = null;
        this.serverState.users_server_state[profile.id].isOnline = true;
        this.serverState.user_id_list.push(profile.id);

        return user;
    },
    findUser: async function (userId: string) {
        // console.log('find user start');
        const searchResult = await this.db.users.findOne({ id: userId });
        // console.log('find user executed query');
        // console.log(searchResult);
        return searchResult;
    },

    updateServerState: function(uniquename: string) {
        const serverStateItem = this.serverState.persistant_server_state[uniquename];
        const updateResult = this.db.users.update({ uniquename: serverStateItem.uniquename }, serverStateItem);
    },

    updateUser: function (userId: string) {
        const currentUser = this.serverState.users_db_state[userId];
        const updateResult = this.db.users.update({ id: currentUser.id }, currentUser);
    },
    deleteUser: function () {

    },


    testmethod: async function () {
        // var userId = '10210327194683735';
        // const searchResult = await this.db.users.findOne({ id: userId });
        // console.log(searchResult);
        // db.find({}, function (err, docs) {
        // });
    },


    insertTestData: async function () {

        // data entry for this.db.serverstate.weeklytopplayers
        // const now = utilityFunctions.getCurrentTime();
        // const weeklytopplayers = {
        //     name: 'weeklytopplayers',
        //     lastUpdate: now,
        //     isActive: true,
        //     topPlayers: [],
        // };

        // await this.db.serverstate.insert(weeklytopplayers);
        

        // test data entry for user
        // var testData = [
        //     { "id": "681734469306879", "joiniing": 1588184333509, "lastLogin": 1588184333509, "isOnline": true, "gold": 0, "firstName": "Sukanya", "lastName": "Biswas", "_id": "B9tfRLyTrc431dOW" },
        //     { "id": "1190500853", "joiniing": 1581803155426, "lastLogin": 1581803155426, "isOnline": true, "gold": 0, "firstName": "Abhisekh", "lastName": "Biswas", "email": "avi.priceless@gmail.com", "_id": "CXSXRzAYEj3S3yuk" },
        //     { "id": "100000472612598", "joiniing": 1588746445397, "lastLogin": 1588746445397, "isOnline": true, "gold": 0, "firstName": "Rahul", "lastName": "Banerjee", "_id": "dqzQRwuFCCiU4aC4" },
        //     { "id": "10210327194683735", "joiniing": 1594790501574, "lastLogin": 1594790501574, "isOnline": true, "gold": 0, "firstName": "গৌরব", "lastName": "ভট্টাচার্য্য", "email": "gourabb003@gmail.com", "_id": "apBqA62qHGKW6im0" }
        // ];
        // for (var i = 0; i < testData.length; ++i) {
        //     this.createNewUser({
        //         id: testData[i].id,
        //         _json: {
        //             first_name: testData[i].firstName,
        //             last_name: testData[i].lastName,
        //             email: ''
        //         }
        //     });
        // }
    },
}