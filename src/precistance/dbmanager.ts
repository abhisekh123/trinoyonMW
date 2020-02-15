// const Datastore = require('nedb');
// import datastore from 'nedb-promise';
const datastore = require('nedb-promise');
const utilityFunctions = require(__dirname + '/../../../src/utils/utilityfunctions');

//   , db = new Datastore({ filename: '/usee', autoload: true });
// You can issue commands right away

module.exports = {
    db: {
        users: null,
    },
    init: async function () {
        this.db.users = new datastore({
            filename: '../users.db',
            autoload: true
        });
    },

    createNewUser: async function (userId: string) {
        const now = utilityFunctions.getCurrentTime();
        const user = {
            id: userId,
            joiniing: now,
            lastLogin: now,
            isOnline: true,
            gold: 0,
        };

        await this.db.users.insert(user);
        return user;
    },
    findUser: async function (userId: string) {
        console.log('find user start');
        const searchResult = await this.db.users.findOne({ id: userId });
        console.log('find user executed query');
        console.log(searchResult);
        return searchResult;
    },
    updateUser: function () {

    },
    deleteUser: function () {

    }
}