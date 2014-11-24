function Base(token, async){
  Base.httpConnection = BaseConnect.initHttpConnection();
  BaseConnect.setVariables(token, async);

  this.getTicket = function(callback){
    this.handle = function(response){
      return BaseConnect.getNode(response, "ticket");
    };

    var data = {
      dbid: "main",
      action: "GetOneTimeTicket",
      fieldParams: null,
      params: null,
      csvData: null
    };

    return BaseConnect.post(data, callback, this.handle);
  };

  this.getVar = function(dbid, name, callback){
    this.handle = function(response){
      return BaseConnect.getNode(response, "value");
    };

    var data = {
      dbid: dbid,
      action: "GetDBvar",
      params: {"varname": name}
    };

    return BaseConnect.post(data, callback, this.handle)
  };

  this.setVar = function(dbid, name, value, callback){
    this.handle = function(response){
      return true;
    };

    var data = {
      dbid: dbid,
      action: "SetDBvar",
      params: {"varname": name, "value": value}
    };

    return BaseConnect.post(data, callback, this.handle);
  };

  this.doQuery = function(dbid, params, callback, handle){
    this.handle = function(response){
      return BaseConnect.getRecords(response, "records");
    };

    var queryParams = {"fmt": "structured"}
    if(params.query || params.qid){
      if(params.query){
        queryParams.query = params.query;
      }else{
        queryParams.qid = params.qid;
      };
    }else{
      queryParams.query = "{'3'.XEX.''}"
    };

    queryParams.clist = params.clist || "a"
    queryParams.slist = params.slist
    queryParams.options = params.options

    var data = {
      dbid: dbid,
      action: "DoQuery",
      params: queryParams
    };

    if(handle){
      this.handle = handle;
    };

    return BaseConnect.post(data, callback, this.handle);
  };

  this.doQueryCount = function(dbid, query, callback){
    this.handle = function(response){
      return BaseConnect.getNode(response, "numMatches");;
    };

    var data = {
      dbid: dbid,
      action: "DoQueryCount",
      query: query
    };

    return BaseConnect.post(data, callback, this.handle);
  };

  this.find = function(dbid, rid, callback){
    this.handle = function(response){
      var records = BaseConnect.getRecords(response, "records");
      if(records.length > 0){
        if(records.length > 1){
          return records;
        }else{
          return records[0];
        };
      }else{
        return {};
      };
    };

    var query = [];
    
    if(Object.prototype.toString.call(rid) == "[object Array]"){
      for(var i=0; i < rid.length; i++){
        query.push("{'3'.EX.'"+rid[i]+"'}");
      };
    }else{
      query.push("{'3'.EX.'"+rid+"'}");
    }

    query = query.join("OR");

    return this.doQuery(dbid, {"query": query}, callback, this.handle);
  };

  this.first = function(dbid, params, callback){
    this.handle = function(response){
      var records = BaseConnect.getRecords(response, "records");
      if(records.length > 0){
        return records[0];
      }else{
        return {};
      };
    };

    return this.doQuery(dbid, params, callback, this.handle);
  };

  this.last = function(dbid, params, callback){
    this.handle = function(response){
      var records = BaseConnect.getRecords(response, "records");
      if(records.length > 0){
        return records[records.length - 1];
      }else{
        return {};
      };
    };

    return this.doQuery(dbid, params, callback, this.handle);
  };

  this.all = function(dbid, params, callback){
    this.handle = function(response){
      var records = BaseConnect.getRecords(response, "records");
      if(records.length > 0){
        return records;
      }else{
        return {};
      };
    };

    if(!params){
      params = {};
    };

    params["query"] = "{'3'.XEX.''}";
    return this.doQuery(dbid, params, callback, this.handle);
  };

  this.importRecords = function(dbid, csvArray, callback){
    this.handle = function(response){
      return BaseConnect.getRids(response);
    };

    var csv = "";
    var clist = [];

    for(key in csvArray[0]){
      clist.push(key);
    };

    clist = clist.join(".");

    for(var i=0; i < csvArray.length; i++){
      var row = csvArray[i];
      var rowValues = [];

      for(key in row){
        value = row[key];
        value = value.toString().replace(/"/g, '""');
        rowValues.push('"' + value + '"');
      };

      rowValues.join(",")
      rowValues += "\n"

      csv += (rowValues);
    };

    var data = {
      dbid: dbid,
      action: "ImportFromCSV",
      params: {"clist": clist},
      csvData: csv
    }

    return BaseConnect.post(data, callback, this.handle);
  };

  this.addRecord = function(dbid, fieldParams, callback){
    this.handle = function(response){
      return parseInt(BaseConnect.getNode(response, "rid"));
    };

    var data = {
      dbid: dbid,
      action: "AddRecord",
      fieldParams: fieldParams
    };

    return BaseConnect.post(data, callback, this.handle);
  };

  this.editRecord = function(dbid, rid, fieldParams, callback){
    this.handle = function(response){
      var rid = BaseConnect.getNode(response, "rid");

      if(rid){
        return true;
      }else{
        return false;
      }
    };

    var data = {
      dbid: dbid,
      action: "EditRecord",
      fieldParams: fieldParams,
      params: {"rid": rid}
    }

    return BaseConnect.post(data, callback, this.handle);
  };

  this.deleteRecord = function(dbid, rid, callback){
    this.handle = function(response){
      var rid = BaseConnect.getNode(response, "rid");

      if(rid){
        return true;
      }else{
        return false;
      }
    };

    var data = {
      dbid: dbid,
      action: "DeleteRecord",
      params: {"rid": rid}
    };

    return BaseConnect.post(data, callback, this.handle);
  };

  this.purgeRecords = function(dbid, query, callback){
    this.handle = function(response){
      var numberOfRecordDeleted = BaseConnect.getNode(response, "num_records_deleted");
      return parseInt(numberOfRecordDeleted);
    };

    var data = {
      dbid: dbid,
      action: "PurgeRecords",
      params: {"query": query}
    };

    return BaseConnect.post(data, callback, this.handle);
  };

  this.getUserInfo = function(email, callback, handler){
    this.handle = function(response){
      var user = $(response).find("user");

      user = {
        "id": $(user).attr("id"),
        "firstName": $(user).find("firstName").text(),
        "lastName": $(user).find("lastName").text(),
        "login": $(user).find("login").text(),
        "email": $(user).find("email").text(),
        "screenName": $(user).find("screenName").text(),
        "isVerified": $(user).find("isVerified").text(),
        "externalAuth": $(user).find("externalAuth").text()
      };

      return user;
    };

    if(!email){
      email = "";
    };

    var data = {
      dbid: "main",
      action: "GetUserInfo",
      params: {"email": email}
    };

    return BaseConnect.post(data, callback, this.handle);
  };

  this.getTableFields = function(dbid, callback){
    this.handle = function(response){
      return BaseConnect.getFields(response);
    };

    var data = {
      dbid: dbid,
      action: "GetSchema"
    };

    return BaseConnect.post(data, callback, this.handle);
  };
}

var BaseHelpers = {
  getUrlParam: function(name){
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  },

  dateToString: function(milliseconds){
    if(milliseconds){
      var date = new Date(parseInt(milliseconds));

      var month = BaseConnect.formatDateElement((date.getUTCMonth() + 1));
      var day = BaseConnect.formatDateElement(date.getUTCDate());

      date = [month, day, date.getUTCFullYear()].join("-");
      return date;
    };

    return milliseconds;
  },

  dateTimeToString: function(milliseconds){
    if(milliseconds){
      var date = new Date(parseInt(milliseconds));

      var month = BaseConnect.formatDateElement((date.getUTCMonth() + 1));
      var day = BaseConnect.formatDateElement(date.getUTCDate());
      var hours = BaseConnect.formatDateElement(date.getUTCHours());
      var minutes = BaseConnect.formatDateElement(date.getUTCMinutes());
      var seconds = BaseConnect.formatDateElement(date.getUTCSeconds());

      var dateTime = [month, day, date.getUTCFullYear()].join("-");
      var ampm = parseInt(hours) >= 12 ? 'pm' : 'am';
      
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'

      dateTime += " "
      dateTime += [hours, minutes].join(":")
      dateTime += " " + ampm
      return dateTime;
    };

    return milliseconds;
  },

  durationToString: function(milliseconds){
    var duration = "0";

    if(milliseconds){
      duration = parseInt(milliseconds) / 3600000;
    };

    return duration.toString() + " hours";
  },

  timeOfDayToString: function(milliseconds){
    var timeOfDay = "";

    if(milliseconds){
      timeOfDay = new Date();
      timeOfDay.setHours("");
      timeOfDay.setMinutes("");
      timeOfDay.setSeconds("");
      timeOfDay = timeOfDay.setMilliseconds(milliseconds);
      timeOfDay = new Date(timeOfDay);

      var hours = parseInt(timeOfDay.getHours());
      var minutes = timeOfDay.getMinutes().toString();
      var zone = "am";
      
      if(hours >= 12){
        zone = "pm"

        if(hours > 12){
          hours = hours - 12
        };
      };

      if(minutes.length == 1){
        minutes = "0" + minutes;
      };

      timeOfDay = hours.toString() + ":" + minutes + " " + zone
    };

    return timeOfDay;
  }
};

var BaseConnect = {
  apptoken: null,
  async: null,

  post: function(data, callback, handler){
    var request = this.buildRequest();

    for(key in data.params){
      var value = data.params[key];

      if(key == "clist" || key == "slist" || key == "options"){
        if(Object.prototype.toString.call(value) == "[object Array]"){
          value = value.join(".");
        };
      };

      this.addParameter(request, key, value);
    };

    for(key in data.fieldParams){
      this.addFieldParameter(request, key, data.fieldParams[key]);
    };

    if(data.csvData){
      var records_csv = request.createElement("records_csv");
      records_csv.appendChild(request.createCDATASection(data.csvData));
      request.documentElement.appendChild(records_csv);
    };

    response = this.xmlPost(data.dbid, "API_" + data.action, request, callback, handler);
    return response
  },

  formatDateElement: function(element){
    element = element.toString();
    if(element.length == 1){
      element = "0" + element;
    };

    return element;
  },

  getNode: function(response, tag){
    return $(response).find(tag).text();
  },

  getRecords: function(response){    
    var records = $(response).find("records").find("record");

    var recordsArray = [];

    for(var i=0; i < records.length; i++){
      var record = records[i];
      var fields = $(record).find("f");

      record = {}

      for(var j=0; j < fields.length; j++){
        var field = fields[j];
        var id = parseInt($(field).attr("id"));

        if($(field).find("url").text() != ""){
          var url = $(field).find("url").text();
          var sections = url.split("/");
          var filename = sections[sections.length - 1];

          var value = {"filename": filename, "url": url};
        }else{
          var value = $(field).text();
        };

        record[id] = value;
      };

      recordsArray.push(record);
    };

    return recordsArray;
  },

  getRids: function(response){
    var rids = $(response).find("rids").find("rid");
    var ridsArray = [];

    for(var i=0; i < rids.length; i++){
      var rid = parseInt($(rids[i]).text());
      ridsArray.push(rid);
    };

    return ridsArray;
  },

  getFields: function(schema){
    var fields = $(schema).find("fields").find("field");
    var fieldsArray = [];

    for(var i=0; i < fields.length; i++){
      var field = fields[i];
      var fieldHash = {
        "id": $(field).attr("id"),
        "label": $(field).find("label").text(),
        "nowrap": $(field).find("nowrap").text(),
        "bold": $(field).find("bold").text(),
        "required": $(field).find("required").text(),
        "appears_by_default": $(field).find("appears_by_default").text(),
        "find_enabled": $(field).find("find_enabled").text(),
        "allow_new_choices": $(field).find("allow_new_choices").text(),
        "sort_as_given": $(field).find("sort_as_given").text(),
        "carrychoices": $(field).find("carrychoices").text(),
        "foreignkey": $(field).find("foreignkey").text(),
        "unique": $(field).find("unique").text(),
        "doesdatacopy": $(field).find("doesdatacopy").text(),
        "fieldhelp": $(field).find("fieldhelp").text(),
        "display_user": $(field).find("display_user").text(),
        "default_kind": $(field).find("default_kind").text()
      }

      fieldsArray.push(fieldHash);
    };

    return fieldsArray;
  },

  createDocument: function(){
    try{
      if(window.ActiveXObject !== undefined){
        return new ActiveXObject("Microsoft.XmlDom");
      };

      if(document.implementation && document.implementation.createDocument){
        var doc = document.implementation.createDocument("", "", null);
        return doc;
      };
    }
    catch(ex){}
    throw new Error("Sorry. Your browser does not support Base.js.");
  },

  buildRequest: function(){
    var request = this.createDocument();
    request.async = this.async;
    request.resolveExternals = false;

    var root = request.createElement("qdbapi");

    try{
      request.removeChild(request.documentElement);
    }
    catch(e){}

    request.appendChild(root);

    if(this.apptoken){
      this.addParameter(request, "apptoken", this.apptoken);
    };

    return request;
  },

  addParameter: function (request, name, value){
    var mainElement = request.documentElement;
    var nameTag = request.createElement(name);
    var node = request.createTextNode(value);
    nameTag.appendChild(node);
    mainElement.appendChild(nameTag);
  },

  addFieldParameter: function (request, fid, value){
    var mainElement = request.documentElement;
    var fieldTag = request.createElement("field");
    fieldTag.setAttribute("fid", fid);

    var node = request.createTextNode(value);
    fieldTag.appendChild(node);
    mainElement.appendChild(fieldTag);
  },

  xmlPost: function(dbid, action, request, callback, handler){
    var script = "/db/" + dbid + "?act=" + action;

    if(this.async == true){
      var connection = BaseConnect.initHttpConnection();
    }else{
      var connection = Base.httpConnection;
    };

    connection.open("POST", script, this.async);
    
    if((/MSIE 1/i).test(navigator.appVersion) || window.ActiveXObject !== undefined){
      try { connection.responseType = 'msxml-document'; } catch (e) { }
    };

    if(this.async == true){
      connection.onreadystatechange = function(){
        if(connection.readyState == 4 && connection.status == 200){
          var xml = BaseConnect.parseResponse(connection);
          xml = handler(xml);
          callback(xml);
        }
      };
    };

    connection.setRequestHeader("Content-Type", "text/xml");
    connection.send(request);

    if(this.async == false){
      var xml = BaseConnect.parseResponse(connection);
      return handler(xml);
    };
  },

  parseResponse: function(connection){
    var xml = connection.responseXML;
    var errorCode = BaseConnect.getNode(xml, "errcode");
    
    if(errorCode != "0"){
      console.log(
        "*****ERROR*****: (" + BaseConnect.getNode(xml, "action") + ")" + "(CODE: " + errorCode + ")",
        "MESSAGE: " + BaseConnect.getNode(xml, "errtext") + " - " + BaseConnect.getNode(xml, "errdetail")
      );
    };

    this.ticket = BaseConnect.getNode(xml, "ticket");
    return xml;
  },

  setVariables: function(token, async){
    this.apptoken = token;
    this.async = async || false;
  },

  initHttpConnection: function(){
    var connection = null;

    try{
      if(!connection){
        connection = new XMLHttpRequest();
      };
    }
    catch(e){
    }
    try{
      if(!connection){
        connection = new ActiveXObject("Msxml2.XMLHTTP");
      };
    }
    catch(e){
    }
    try{
      if(!connection){
        connection = new ActiveXObject("Microsoft.XMLHTTP");
      };
    }
    catch(e){
      alert("This browser does not support BaseJS.");
    };

    return connection;
  }
}