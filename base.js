function BaseConnect(){
  this.apptoken = null;
  this.async = null;

  this.post = function(data, callback, handler){
    var type = data.type || "API";
    var action = type + "_" + data.action;
    var postData = this.buildPostData(data);

    return this.xmlPost(data.dbid, action, postData, callback, handler);
  };

  this.buildPostData = function(data){
    var postData = ["<qdbapi>"];

    if(this.apptoken){
      postData.push(this.createParameter("apptoken", this.apptoken));
    };

    for(key in data.params){
      var value = data.params[key];

      if(key == "clist" || key == "slist" || key == "options"){
        if(Object.prototype.toString.call(value) == "[object Array]"){
          value = value.join(".");
        };
      };

      if(value){
        postData.push(this.createParameter(key, value));
      };
    };

    for(key in data.fieldParams){
      postData.push(this.createFieldParameter(key, data.fieldParams[key]));
    };

    for(key in data.fidParams){
      postData.push(this.createFidParameter(key, data.fidParams[key]));
    };

    if(data.csvData){
      postData.push(this.createCSVParameter(data.csvData));
    };

    postData.push("</qdbapi>");

    return postData.join("");
  };

  this.getNode = function(response, tag){
    return $(response).find(tag).text();
  };

  this.getRecords = function(response){    
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
  };

  this.getRids = function(response){    
    var records = $(response).find("records").find("record");
    var ridsArray = [];

    for(var i=0; i < records.length; i++){
      var record = records[i];
      ridsArray.push($(record).find('f[id="3"]').text());
    };

    return ridsArray;
  };

  this.getNewRids = function(response){
    var rids = $(response).find("rids").find("rid");
    var ridsArray = [];

    for(var i=0; i < rids.length; i++){
      var rid = parseInt($(rids[i]).text());
      ridsArray.push(rid);
    };

    return ridsArray;
  };

  this.getFields = function(schema){
    var fields = $(schema).find("fields").find("field");
    var fieldsObj = {};

    for(var i=0; i < fields.length; i++){
      var field = fields[i];
      var fieldHash = {
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

      fieldsObj[$(field).attr("id")] = fieldHash;
    };

    return fieldsObj;
  };

  this.getReports = function(schema){
    var reports = $(schema).find("queries").find("query");
    var reportsObj = {};

    for(var i=0; i < reports.length; i++){
      var report = reports[i];
      var reportHash = {
        "name": $(report).find("qyname").text(),
        "type": $(report).find("qytype").text(),
        "criteria": $(report).find("qycrit").text(),
        "clist": $(report).find("qyclst").text(),
        "slist": $(report).find("qyslst").text(),
        "options": $(report).find("qyopts").text()
      }

      reportsObj[$(report).attr("id")] = reportHash;
    };

    return reportsObj;
  };

  this.formatUserRoles = function(schema){
    var users = $(schema).find("users").find("user");
    var allUsers = [];

    for(var i=0; i < users.length; i++){
      var user = users[i];
      var roles = $(user).find("roles").find("role");

      var userRoles = [];
      for(var j=0; j < roles.length; j++){
        var role = roles[j];
        var roleHash = {
          "id": $(role).attr("id"),
          "name": $(role).find("name").text(),
          "accessId": $(role).find("access").attr("id"),
          "access": $(role).find("access").text() 
        }

        userRoles.push(roleHash);
      };

      var userHash = {
        "id": $(user).attr("id"),
        "firstName": $(user).find("firstName").text(),
        "lastName": $(user).find("lastName").text(),
        "lastAccess": $(user).find("lastAccess").text(),
        "lastAccessAppLocal": $(user).find("lastAccessAppLocal").text(),
        "roles": userRoles
      };

      allUsers.push(userHash);
    };

    return allUsers;
  };

  this.createParameter = function(key, value){
    return "<" + key + ">" + value + "</" + key + ">";
  };

  this.createFieldParameter = function(fid, value){
    var param = "<field fid='" + fid + "'";

    if(value){
      if(value.filename){
        param += " filename='" + value.filename + "'>";
        param += this.base64Encode(value.body);
      }else{
        param += ">"
        param += value;
      };
    };

    param += "</field>";
    return param;
  };

  this.createFidParameter = function(fid, value){
    return "<_fid_" + fid + ">" + value + "</_fid_" + fid + ">";
  };

  this.createCSVParameter = function(data){
    return "<records_csv><![CDATA[" + data + "]]></records_csv>";
  };

  this.base64Encode = function(input){
    var output = "";
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    var string = input.replace(/\r\n/g,"\n");
    var utfText = "";

    for(var n=0; n < string.length; n++){
      var c = string.charCodeAt(n);

      if (c < 128) {
        utfText += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utfText += String.fromCharCode((c >> 6) | 192);
        utfText += String.fromCharCode((c & 63) | 128);
      }
      else {
        utfText += String.fromCharCode((c >> 12) | 224);
        utfText += String.fromCharCode(((c >> 6) & 63) | 128);
        utfText += String.fromCharCode((c & 63) | 128);
      }
    }

    input = utfText;

    while(i < input.length){
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if(isNaN(chr2)){
        enc3 = enc4 = 64;
      }else if(isNaN(chr3)){
        enc4 = 64;
      };

      output = output +
      keyStr.charAt(enc1) + keyStr.charAt(enc2) +
      keyStr.charAt(enc3) + keyStr.charAt(enc4);
    };

    return output;
  };

  this.xmlPost = function(dbid, action, data, callback, handler){
    var url = "/db/" + dbid + "?act=" + action;
  
    if(this.async){
      $.ajax({ 
        url: url, 
        type: "POST",
        context: this,
        contentType: "text/xml",
        data: data,
        dataType: "xml",
        success: function(xml){
          return callback(handler(xml));
        }
      });
    }else{
      var response = null;

      $.ajax({ 
        url: url, 
        type: "POST",
        context: this,
        contentType: "text/xml",
        data: data,
        dataType: "xml",
        async: false,
        success: function(xml){
          response = handler(xml);
        }
      });

      return response;
    };
  };

  this.parseResponse = function(xml){
    var errorCode = this.getNode(xml, "errcode");
    
    if(errorCode != "0"){
      console.log(
        "*****ERROR*****: (" + this.getNode(xml, "action") + ")" + "(CODE: " + errorCode + ")",
        "MESSAGE: " + this.getNode(xml, "errtext") + " - " + this.getNode(xml, "errdetail")
      );
    };

    this.ticket = this.getNode(xml, "ticket");
    return xml;
  };

  this.setVariables = function(token, async){
    this.apptoken = token;
    this.async = async || false;
  };

  this.initHttpConnection = function(context){
    var connection = null;
    this.context = context;

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
  };
}

function Base(token, async){
  var BaseConnectInstance = new BaseConnect();
  BaseConnectInstance.setVariables(token, async);

  this.getOneTimeTicket = function(callback){
    this.handle = function(response){
      return BaseConnectInstance.getNode(response, "ticket");
    };

    var data = {
      dbid: "main",
      action: "GetOneTimeTicket"
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.authenticate = function(ticket, hours, callback){
    this.handle = function(response){
      return BaseConnectInstance.getNode(response, "ticket");
    };

    var data = {
      dbid: "main",
      action: "Authenticate",
      params: { "ticket" : ticket, "hours": hours }
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.signOut = function(callback){
    this.handle = function(response){
      var error = BaseConnectInstance.getNode(response, "errcode");
      return error == "0" ? true : false;
    };

    var data = {
      dbid: "main",
      action: "SignOut",
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.getDBVar = function(dbid, name, callback){
    this.handle = function(response){
      return BaseConnectInstance.getNode(response, "value");
    };

    var data = {
      dbid: dbid,
      action: "GetDBvar",
      params: {"varname": name}
    };

    return BaseConnectInstance.post(data, callback, this.handle)
  };

  this.setDBVar = function(dbid, name, value, callback){
    this.handle = function(response){
      return true;
    };

    var data = {
      dbid: dbid,
      action: "SetDBvar",
      params: {"varname": name, "value": value}
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.uploadPage = function(dbid, id, name, body, callback){
    this.handle = function(response){
      return BaseConnectInstance.getNode(response, "pageID");
    };

    var params = {
      "pagetype": "1", 
      "pagebody": body
    };

    if(id){
      params["pageid"] = id;
    }else if(name){
      params["pagename"] = name;
    };

    var data = {
      dbid: dbid,
      action: "AddReplaceDBPage",
      params: params
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.deletePage = function(dbid, pageId, callback){
    this.handle = function(response){
      var error = BaseConnectInstance.getNode(response, "errcode");
      return error == "0" ? true : false;
    };

    var data = {
      dbid: dbid,
      action: "PageDelete",
      type: "QBI",
      params: {"pageid": pageId}
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.cloneDatabase = function(dbid, params, callback){
    this.handle = function(response){
      return BaseConnectInstance.getNode(response, "newdbid");
    };

    var data = {
      dbid: dbid,
      action: "CloneDatabase",
      type: "API",
      params: params
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.createDatabase = function(name, description, createAppToken, callback){
    this.handle = function(response){
      return BaseConnectInstance.getNode(response, "dbid");
    };

    var data = {
      dbid: "main",
      action: "CreateDatabase",
      type: "API",
      params: { "dbname": name, "dbdesc": description, "createapptoken": createAppToken || false }
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.deleteDatabase = function(dbid, callback){
    this.handle = function(response){
      var error = BaseConnectInstance.getNode(response, "errcode");
      return error == "0" ? true : false;
    };

    var data = {
      dbid: dbid,
      action: "DeleteDatabase",
      type: "API"
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.renameApp = function(dbid, name, callback){
    this.handle = function(response){
      var error = BaseConnectInstance.getNode(response, "errcode");
      return error == "0" ? true : false;
    };

    var data = {
      dbid: dbid,
      action: "RenameApp",
      type: "API", 
      params: { "newappname": name }
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.findDbByName = function(name, callback){
    this.handle = function(response){
      return BaseConnectInstance.getNode(response, "dbid");
    };

    var data = {
      dbid: "main",
      action: "FindDBByName",
      type: "API", 
      params: { "dbname": name }
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.getAncestorInfo = function(dbid, callback){
    this.handle = function(response){
      var info = {
        "ancestorAppId": BaseConnectInstance.getNode(response, "ancestorappid"),
        "oldestAncestorAppId": BaseConnectInstance.getNode(response, "oldestancestorappid")
      };

      return info;
    };

    var data = {
      dbid: dbid,
      action: "GetAncestorInfo",
      type: "API"
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.getAppDtmInfo = function(dbid, callback){
    this.handle = function(response){

      var allTables = {};
      var tables = $(response).find("tables").find("table");
      for(var i=0; i < tables.length; i++){
        var table = tables[i];
        var tableHash = {
          "lastModifiedTime": $(table).find("lastModifiedTime").text(),
          "lastRecModTime": $(table).find("lastRecModTime").text()
        };

        allTables[$(table).attr("id")] = tableHash;
      };

      var info = {
        "requestTime": BaseConnectInstance.getNode(response, "RequestTime"),
        "requestNextAllowedTime": BaseConnectInstance.getNode(response, "RequestNextAllowedTime"),
        "lastModifiedTime": BaseConnectInstance.getNode(response, "lastModifiedTime"),
        "lastRecModTime": BaseConnectInstance.getNode(response, "lastRecModTime"),
        "tables": allTables
      };

      return info;
    };

    var data = {
      dbid: "main",
      action: "GetAppDTMInfo",
      type: "API",
      params: { "dbid": dbid }
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.getDbInfo = function(dbid, callback){
    this.handle = function(response){
      var info = {
        "dbname": BaseConnectInstance.getNode(response, "dbname"),
        "lastRecModTime": BaseConnectInstance.getNode(response, "lastRecModTime"),
        "createdTime": BaseConnectInstance.getNode(response, "createdTime"),
        "numRecords": BaseConnectInstance.getNode(response, "numRecords"),
        "mgrID": BaseConnectInstance.getNode(response, "mgrID"),
        "mgrName": BaseConnectInstance.getNode(response, "mgrName"),
        "version": BaseConnectInstance.getNode(response, "version"),
        "time_zone": BaseConnectInstance.getNode(response, "time_zone")
      };

      return info;
    };

    var data = {
      dbid: dbid,
      action: "GetDBInfo",
      type: "API"
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.grantedDbs = function(params, callback){
    this.handle = function(response){

      var allDatabases = [];
      var databases = $(response).find("databases").find("dbinfo");

      for(var i=0; i < databases.length; i++){
        var database = databases[i];
        var databaseHash = {
          "dbname": BaseConnectInstance.getNode(database, "dbname"),
          "dbid": BaseConnectInstance.getNode(database, "dbid")
        };

        allDatabases.push(databaseHash);
      };

      return allDatabases;
    };

    var data = {
      dbid: "main",
      action: "GrantedDBs",
      type: "API",
      params: params
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.doQuery = function(dbid, params, callback, handle){
    this.handle = function(response){
      return BaseConnectInstance.getRecords(response, "records");
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

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.doQueryCount = function(dbid, query, callback){
    this.handle = function(response){
      return BaseConnectInstance.getNode(response, "numMatches");
    };

    var data = {
      dbid: dbid,
      action: "DoQueryCount",
      params: {"query": query}
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.find = function(dbid, rid, callback){
    this.handle = function(response){
      var records = BaseConnectInstance.getRecords(response, "records");
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
      var records = BaseConnectInstance.getRecords(response, "records");
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
      var records = BaseConnectInstance.getRecords(response, "records");
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
      var records = BaseConnectInstance.getRecords(response, "records");
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

  this.getRids = function(dbid, params, callback){
    this.handle = function(response){
      return BaseConnectInstance.getRids(response);
    };

    if(!params){
      params = {};
    }

    params["clist"] = "3";
    return this.doQuery(dbid, params, callback, this.handle);
  };

  this.genAddRecordForm = function(dbid, params, callback){
    this.handle = function(response){
      return response;
    };

    var data = {
      dbid: dbid,
      action: "GenAddRecordForm",
      fidParams: params
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.getRecordInfo = function(dbid, rid, callback){
    this.handle = function(response){

      var allFields = {};
      var fields = $(response).find("field");

      for(var i=0; i < fields.length; i++){
        var field = fields[i];
        var fieldHash = {
          "name": BaseConnectInstance.getNode(field, "name"),
          "type": BaseConnectInstance.getNode(field, "type"),
          "value": BaseConnectInstance.getNode(field, "value")
        };

        allFields[$(field).find("fid").text()] = fieldHash;
      };

      var info = {
        "rid": BaseConnectInstance.getNode(response, "rid"),
        "num_fields": BaseConnectInstance.getNode(response, "num_fields"),
        "update_id": BaseConnectInstance.getNode(response, "update_id"),
        "fields": allFields
      };

      return info;
    };

    var data = {
      dbid: dbid,
      action: "GetRecordInfo",
      params: { "rid": rid }
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.importFromCSV = function(dbid, csvArray, callback){
    this.handle = function(response){
      return BaseConnectInstance.getNewRids(response);
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

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.addRecord = function(dbid, fieldParams, callback){
    this.handle = function(response){
      return parseInt(BaseConnectInstance.getNode(response, "rid"));
    };

    var data = {
      dbid: dbid,
      action: "AddRecord",
      fieldParams: fieldParams
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.editRecord = function(dbid, rid, fieldParams, callback){
    this.handle = function(response){
      var rid = BaseConnectInstance.getNode(response, "rid");
      return rid ? true : false;
    };

    var data = {
      dbid: dbid,
      action: "EditRecord",
      fieldParams: fieldParams,
      params: {"rid": rid}
    }

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.changeRecordOwner = function(dbid, rid, owner, callback){
    this.handle = function(response){
      return true;
    };

    var data = {
      dbid: dbid,
      action: "ChangeRecordOwner",
      params: {"rid": rid, "newowner": owner}
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.copyMasterDetail = function(dbid, params, callback){
    this.handle = function(response){
      return BaseConnectInstance.getNode(response, "numCreated");
    };

    var data = {
      dbid: dbid,
      action: "CopyMasterDetail",
      params: params
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.deleteRecord = function(dbid, rid, callback){
    this.handle = function(response){
      var rid = BaseConnectInstance.getNode(response, "rid");
      return rid ? true : false;
    };

    var data = {
      dbid: dbid,
      action: "DeleteRecord",
      params: {"rid": rid}
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.purgeRecords = function(dbid, query, callback){
    this.handle = function(response){
      var numberOfRecordDeleted = BaseConnectInstance.getNode(response, "num_records_deleted");
      return parseInt(numberOfRecordDeleted);
    };

    var data = {
      dbid: dbid,
      action: "PurgeRecords",
      params: {"query": query}
    };

    return BaseConnectInstance.post(data, callback, this.handle);
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

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.getUserRoles = function(dbid, callback){
    this.handle = function(response){
      return BaseConnectInstance.formatUserRoles(response);
    };

    var data = {
      dbid: dbid,
      action: "UserRoles"
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.changeUserRole = function(dbid, userId, roleId, newRoleId, callback){
    this.handle = function(response){
      return true;
    };

    var data = {
      dbid: dbid,
      action: "ChangeUserRole",
      params: {
        userId: userId,
        roleId: roleId
      }
    };

    if(newRoleId){
      data["params"]["newRoleId"] = newRoleId;
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.getTableFields = function(dbid, callback){
    this.handle = function(response){
      return BaseConnectInstance.getFields(response);
    };

    var data = {
      dbid: dbid,
      action: "GetSchema"
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.getTableReports = function(dbid, callback){
    this.handle = function(response){
      return BaseConnectInstance.getReports(response);
    };

    var data = {
      dbid: dbid,
      action: "GetSchema"
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };
}

var BaseHelpers = {
  getUrlParam: function(name){
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  },

  formatDateElement: function(element){
    element = element.toString();
    if(element.length == 1){
      element = "0" + element;
    };

    return element;
  },

  dateToString: function(milliseconds){
    if(milliseconds){
      var date = new Date(parseInt(milliseconds));

      var month = this.formatDateElement((date.getUTCMonth() + 1));
      var day = this.formatDateElement(date.getUTCDate());

      date = [month, day, date.getUTCFullYear()].join("-");
      return date;
    };

    return milliseconds;
  },

  dateTimeToString: function(milliseconds){
    if(milliseconds){
      var date = new Date(parseInt(milliseconds));

      var month = this.formatDateElement((date.getUTCMonth() + 1));
      var day = this.formatDateElement(date.getUTCDate());
      var hours = this.formatDateElement(date.getUTCHours());
      var minutes = this.formatDateElement(date.getUTCMinutes());
      var seconds = this.formatDateElement(date.getUTCSeconds());

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
      timeOfDay = new Date().setHours("").setMinutes("").setSeconds("");
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
  },

  redirectToEditForm: function(dbid, rid){
    window.location = "/db/"+dbid+"?a=er&rid=" + rid;
  },

  redirectToViewForm: function(dbid, rid){
    window.location = "/db/"+dbid+"?a=dr&rid=" + rid;
  },

  downloadFile: function(dbid, rid, fid, version){
    var version = version || 0;

    window.location = "https://www.quickbase.com/up/"+dbid+"/a/r"+rid+"/e"+fid+"/v" + version;
  }
};