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

	var currentUser = { username: "kit_test@gmail.com", password: "jasMine5284" };

	client.quickstart.signIn(currentUser, function(result){ 
		// client.customers.doQuery({ rid: { XEX: "" }}, {}, function(customers){
		// 	console.log(customers);
		// });

		// client.customers.editRecord(2, { name: "Alden2" }, function(response){
		// 	console.log(response);
		// });

		// client.customers.doQueryCount({ rid: { XEX: "" }}, function(count){
		// 	console.log(count);
		// });

		// client.customers.doQuery({ name: { CT: "A" }}, {}, function(customers){
		// 	console.log(customers);
		// });

		client.quickstart.changePassword({newPassword: "jasMine5285", currentPassword: "jasMine5284"}, function(result)
			{ console.log(result); 
		});

		// client.quickstart.signOut(function(response){
		// 	console.log(response)
		// });
	});

	// client.quickstart.register(user, function(response){
	// 	console.log(response);
	// });
});