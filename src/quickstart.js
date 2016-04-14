function QuickStart(config){
	this.url = "https://ken9jrw9tg.execute-api.us-east-1.amazonaws.com/quickstart/proxy";
	this.config = config;

	this.createUser = function(user, callback){
		this.handle = function(response){
			return response;
		};

		this.post(user, callback, this.handler);
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

    console.log(postData);

    if(this.async == "callback"){
    	this.callback(postData, callback, handler);
    }else{
    	this.promise(postData, callback, handler);
    };
	};

	this.callback = function(postData, callback, handler){
		postData["success"] = function(xml){
      return callback(handler(xml));
    };

    $.ajax(postData);
	};

	this.promise = function(postData, callback, handler){
    postData["dataType"] = "text";
    postData["dataFilter"] = handler;

    return $.ajax(postData);
	};
};