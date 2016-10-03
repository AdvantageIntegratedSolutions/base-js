$(document).ready(function(){		
	var config = {
		username: "kith",
		password: "angular2.0",
		token: "dw9ziewyeardxswcy7driw4ci",
		realm: "ais",
	  async: "callback",
	  databaseId: "bkqdhycdy",
	  tables: {
	    customers: {
	    	dbid: "bkqdhyceg",
	    	rid: 3,
	    	name: 6
	    },

	    activities: {
	    	dbid: "bkqdhycek",
	    	rid: 3,
	    	type: 7,
	    	notes: 14
	    }
	  }
	};

	var client = new Base(config);

	client.activities.doQuery({ rid: { XEX: "" }}, { options: "num-1" }, function(activities){
		console.log("Activities:", activities);
	});

	// client.activities.editRecord(8, { notes: "Test Notes" }, function(response){
	// 	console.log(response);
	// });

	// client.customers.doQueryCount({ rid: { XEX: "" }}, function(count){
	// 	console.log(count);
	// });

	// var csvArray = [
	// 	{ name: 'Mike"s' },
	// 	{ name: "Step,hani'e" },
	// 	{ name: "Jackson" },
	// 	{ name: "Martin" }
	// ];

	// client.customers.importFromCSV(csvArray, function(){});

	// client.customers.doQuery({ name: { CT: "A" }}, {}, function(customers){
	// 	console.log(customers);
	// });

	// client.quickstart.changePassword({newPassword: "test1", currentPassword: "test"}, function(result)
	// 	{ console.log(result); 
	// });

	// client.quickstart.register(user, function(response){
	// 	console.log(response);
	// });
});