$(document).ready(function(){		
	var config = {
		quickstart: true,
	  async: "callback",
	  databaseId: "bkqdhycdy",
	  tables: {
	    quickstartUsers: {
				dbid: "bkqsdtu33",
				rid: 3,
				username: 6,
				password: 7,
				key: 9
	    },

	    customers: {
	    	dbid: "bkqdhyceg",
	    	rid: 3,
	    	name: 6
	    }
	  }
	};

	var client = new Base(config);
	var user = {
		username: "kith",
		password: "jasMine5281"
	};

	client.quickstart.register(user, function(response){
		console.log(response);
	});

	client.quickstart.signIn(user, function(response){
		console.log(response);
	});

	client.customers.doQuery({ rid: { XEX: "" }}, {}, function(customers){
		console.log(customers);
	});
});