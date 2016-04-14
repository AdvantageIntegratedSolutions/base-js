function QuickStart(config){
	this.url = "https://ken9jrw9tg.execute-api.us-east-1.amazonaws.com/quickstart/proxy";
	this.config = config;

	this.createUser = function(data, callback){
		this.handle = function(response){
			return response;
		};

		data["table"] = this.config.users;
		this.post(data, callback, this.handler);
	};

	this.signIn = function(){

	};

	this.signOut = function(){

	};

	this.post = function(data, callback, handler){
		data = JSON.stringify(data);

		var postData = {
      url: this.url,
      data: data,
      dataType: "json",
      type: "POST",
      contentType: "application/json"
    };

    console.log(postData)

    //TODO - add promises once we have the core complete.
    this.callback(postData, callback, handler); 
	};

	this.callback = function(postData, callback, handler){
		postData["success"] = function(xml){
      return callback(handler(xml));
    };

    $.ajax(postData);
	};
};