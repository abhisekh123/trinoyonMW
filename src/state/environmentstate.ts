


module.exports = {
    environment: 'local',
    // environment: 'server',

    maxUserCount: 60,
    maxGameCount: 6,
    maxMatchMakingRoomCount: 30,
    maxPlayerPerTeam: 5,

    'facebookAuth': {
        'clientID': '183311358526115', // your App ID
        'clientSecret': '75653a289a881533ff00a4ce330db23a', // your App Secret
        'callbackURL': 'https://trinoyon.com/auth/facebook/callback',
        // 'callbackURL'   : 'http://localhost:8080/auth/facebook/callback',
        'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields': ['id', 'email', 'name'], // For requesting permissions from Facebook API,
        "use_database": false,
        "host": "trinoyon",
        "username": "root",
        "password": "",
        "database": "Database Name"
    },

    'twitterAuth': {
        'consumerKey': 'your-consumer-key-here',
        'consumerSecret': 'your-client-secret-here',
        'callbackURL': 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth': {
        'clientID': 'your-secret-clientID-here',
        'clientSecret': 'your-client-secret-here',
        'callbackURL': 'http://localhost:8080/auth/google/callback'
    }
}


