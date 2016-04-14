$(document).ready(function(){		
	var quickStartConfig = {
		async: "callback",
		table: {
			dbid: "bkqsdtu33",
			rid: 3,
			username: 6,
			password: 7,
			key: 9
		}
	};

	var quickStart = new QuickStart(quickStartConfig);
	var user = {
		username: "kith",
		password: "jasMine5281"
	};

	quickStart.createUser(user, function(response){
		console.log(response);
	});
});