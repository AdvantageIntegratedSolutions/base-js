$(document).ready(function(){		
	var config = {
		quickstart: true,
		realm: "ais",
	  async: "callback",
	  databaseId: "bkqdhycdy",
	  tables: {
	    customers: {
	    	dbid: "bkqdhyceg",
	    	rid: 3,
	    	name: 6,
	    	quickstart_users: true,
	    	quickstart_username: 37,
	    	quickstart_password: 38,
	    	quickstart_key: 36
	    },

	    activities: {
	    	dbid: "bkqdhycek",
	    	rid: 3,
	    	type: 7,
	    	quickstart_key: 33
	    }
	  }
	};

	var client = new Base(config);

	var currentUser = {username: "kit_test@gmail.com", password: "jasMine5282"};

	client.quickstart.signIn(currentUser, function(result){ 

		console.log(result); 

		client.quickstart.signOut(function(response){
			console.log(response)
		});

		client.customers.doQueryCount({ rid: { XEX: "" }}, function(count){
			console.log(count);
		});

		client.customers.doQuery({ rid: { XEX: "" }}, {}, function(customers){
			console.log(customers);
		});
	});

	// client.quickstart.signOut(function(response){
	// 	console.log(response)
	// });

	// client.quickstart.changePassword({newPassword: "jasMine5283", currentPassword: "jasMine5282"}, function(result)
	// 	{ console.log(result); 
	// });

	// client.quickstart.register(user, function(response){
	// 	console.log(response);
	// });

	// client.quickstart.signIn(user, function(response){
	// 	console.log(response);
	// });


});