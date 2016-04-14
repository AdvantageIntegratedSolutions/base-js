$(document).ready(function(){		
	//Initiate connection to application
	var config = {
		username: "kith",
		password: "jasMine5281",
		realm: "ais",
		token: "cgfsmfcdc5vyp5k5s7h6b6v3m9v",
		async: "callback",
		databaseId: "bkqdhycdy",
		tables: {
			teachers: {
				dbid: "bkqdhyceg",
				rid: 3,
				name: 6
			},

			quickstartUsers: {
				dbid: "bkqsdtu33",
				rid: 3,
				username: 6,
				password: 7,
				key: 9
			}
		}
	};

	var database = new Base(config);

	var user = {
		username: "kith",
		password: "jasMine5281"
	};

	database.createUser(user, function(response){
		console.log(response)
	});
});