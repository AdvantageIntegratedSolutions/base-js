$(document).ready(function(){		
	var config = {
		quickstart: true,
	  async: "callback",
	  databaseId: "bkqdhycdy",
	  tables: {
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