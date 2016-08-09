function BaseConnect(config){
  this.config = config;
  this.inverseTables = BaseHelpers.inverseTables(config.tables);
  this.apptoken = config.token;
  this.async = config.async || false;
  this.databaseId = config.databaseId;
  this.username = config.username;
  this.password = config.password;
  this.quickstartConfig = config.quickstart || false;
  this.ticket = config.ticket;
  this.realm = config.realm;
  this.proxies = {
    local: "https://i460ti6d92.execute-api.us-east-1.amazonaws.com/prod",
    quickstart: "https://zzcogtljc7.execute-api.us-east-1.amazonaws.com/prod/proxy"
  };

  _self = this;

  this.post = function(data, callback, handler){
    var type = data.type || "API";
    var action = type + "_" + data.action;
    var postData = this.buildPostData(data.dbid, data);
    var dbid = "";

    if(!data.dbid){
      dbid = "main";
    }else{
      if(this.config && data.dbid != "main"){
        if(data.dbid == this.databaseId){
          dbid = this.databaseId;
        }else{
          dbid = this.config.tables[data.dbid].dbid;
        };
      }else{
        dbid = data.dbid;
      };
    };

    return this.xmlPost(dbid, action, postData, callback, handler);
  };

  this.generateQuickbaseQuery = function(query){
    var validQuery = [];

    var handleEx = function(key, value){
      return "{'"+key+"'.EX.'"+value+"'}";
    };

    var handleOtherOperators = function(key, value){
      var operators = Object.keys(value);

      var queryParts = [];
      for(var i=0; i < operators.length; i++){
        var operator = operators[i];

        var compareValue = value[operator];
        var queryPart = "";

        if(operator == "in"){
          var queryParts = [];

          compareValue.forEach(function(v){
            queryParts.push("{'"+key+"'.EX.'"+v+"'}");
          });

          queryPart = "(" + queryParts.join("OR") + ")";
        }else{
          queryPart = "{'"+key+"'."+operator+".'"+compareValue+"'}";
        };

        queryParts.push(queryPart);
      };

      return queryParts.join("AND");
    };

    var handleOr = function(key, value){
      var queryPart = [];

      value.forEach(function(query){
        var key = Object.keys(query)[0];
        var value = query[key];

        if(typeof value == "object"){
          var query = handleOtherOperators(key, value);
          queryPart.push(query);
        }else{
          var query = handleEx(key, value);
          queryPart.push(query);
        };
      });

      return "(" + queryPart.join("OR") + ")";
    };

    for(var key in query){
      var value = query[key];
      var queryPart = "";

      if(key == "or"){
        queryPart = handleOr(key, value);
      }else{
        if(typeof value == "object"){
          queryPart = handleOtherOperators(key, value);
        }else{
          queryPart = handleEx(key, query[key]);
        };
      };

      validQuery.push(queryPart);
    };

    validQuery = validQuery.join("AND");
    return validQuery;
  };

  this.replaceFieldNames = function(query, dbid){
    var config = this.config;

    query = query.split(/(}AND|\)AND|}OR|\)OR)/).map(function(queryPart){
      if(!/(}AND|\)AND|}OR|\)OR)/.test(queryPart)){
        var field = queryPart.match(/\{'*(.*)'\..*'/)[1];

        if(isNaN(field)){
          var fid = config.tables[dbid][field];
          queryPart = queryPart.replace(field, fid);
        };
      };

      return queryPart;
    });

    return query.join("");
  };

  this.replaceOptionFieldNames = function(value, dbid){
    var config = this.config;

    value = value.split(".");
    value = value.map(function(fieldName){
      if(isNaN(fieldName)){
        var fid = config.tables[dbid][fieldName];
        return fid;
      }else{
        return fieldName;
      }
    });

    return value.join(".");
  };

  this.handleXMLCharacters = function(string){
    if(typeof string == "string"){
      string = string
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
    };

    return string;
  };

  this.buildPostData = function(dbid, data){
    var postData = ["<qdbapi>"];

    if(this.apptoken){
      postData.push(this.createParameter("apptoken", this.apptoken));
    };

    if(this.username && !this.ticket){
      postData.push(this.createParameter("username", this.username));
      postData.push(this.createParameter("password", this.password));
    };

    if(this.ticket){
      postData.push(this.createParameter("ticket", this.ticket));
    };

    for(var key in data.params){
      var value = data.params[key];

      if(key == "clist" || key == "slist" || key == "options"){
        if(typeof value == "object"){
          value = value.join(".");
        };

        if(this.config && (key == "clist" || key == "slist")){
          if(value){
            value = this.replaceOptionFieldNames(value, dbid);
          };
        };
      }else if(key == "query"){
        value = this.generateQuickbaseQuery(value);

        if(this.config){
          value = this.replaceFieldNames(value, dbid);
        };

        key = "query";
      };

      if(value){
        postData.push(this.createParameter(key, value));
      };
    };

    for(field in data.fieldParams){
      if(this.config){
        var fid = this.config.tables[dbid][field];
      }else{
        var fid = field;
      };

      var fieldValue = this.handleXMLCharacters(data.fieldParams[field]);
      postData.push(this.createFieldParameter(fid, fieldValue));
    };

    for(key in data.fidParams){
      postData.push(this.createFidParameter(key, data.fidParams[key]));
    };

    if(data.csvData){
      postData.push(this.createCSVParameter(data.csvData));
    };

    postData.push("</qdbapi>");
    postData = postData.join("");

    if(this.username || this.quickstartConfig){
      return { "xml": postData }
    }else{
      return postData;
    };
  };

  this.getNode = function(response, tag){
    return $(response).find(tag).text();
  };

  this.getRecords = function(dbid, response){
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

        if(this.config){
          var tableConfig = this.inverseTables[dbid];
          if(tableConfig[id]){
            id = tableConfig[id.toString()];
            record[id] = value;
          };
        }else{
          record[id] = value;
        };
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

  this.getTableSchema = function(schema) {
    var tableSchema = {
      dbid: '',
      tableName: '',
      keyFid: '',
      fields: this.getFields(schema)
    };

    var $schema = $(schema);
    tableSchema.dbid = $schema.find('table_id').text();
    tableSchema.tableName = $schema.find('name').text();
    tableSchema.keyFid = $schema.find('key_fid').text();

    return tableSchema;
  };

  this.getFields = function(schema){
    var fields = $(schema + ', fields').find("field");
    var fieldsObj = {};

    for (var i=0; i < fields.length; i++){
      var $field = $(fields[i]);
      var fieldHash = {};

      for (var j = 0; j < fields[i].attributes.length; j++) {
        var prop = fields[i].attributes[j].name;
        var val = fields[i].attributes[j].value;
        if (prop == 'id') {
          fieldHash['fid'] = val;
        } else {
          fieldHash[prop] = val;
        }
      }

      $field.children().each(function(i, childNode) {
        var prop = childNode.nodeName.toLowerCase();
        var val = childNode.innerText;
        if (prop != 'choices') fieldHash[prop] = val;
      })

      var choices = $field.find("choices").find("choice");
      if (choices.length > 0){
        var fieldChoices = [];
        for(var j=0; j < choices.length; j++){

          var choice = $(choices[j]).text();
          fieldChoices.push(choice);
        };

        fieldHash["choices"] = fieldChoices;
      };

      fieldsObj[$field.attr("id")] = fieldHash;
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

        if(value.ignoreEncoding == true){
          param += value.body;
        }else{
          param += this.base64Encode(value.body);
        };
      }else{
        param += ">"
        param += value;
      };
    }else{
      param += ">";
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

  this.quickstartPost = function(data, callback, handler, dbid, action, proxy){
    if(proxy){
      var json = {
        dbid: dbid,
        realm: this.realm,
        action: action,
        apptoken: this.apptoken
      };

      json["xml"] = data.xml;
      json["quickstartAction"] = "Proxy";
      json["ticket"] = JSON.parse(BaseHelpers.getCookie("quickstart_session")).ticket;
    }else{
      var json = data;
    };

    json = JSON.stringify(json)

    var postData = {
      url: this.proxies.quickstart,
      data: json,
      dataType: "text",
      type: "POST",
      contentType: "application/json"
    };

    if(this.async == "callback"){
    	postData["success"] = function(json){
    	  json = JSON.parse(json);
    	  json = json.data || json;

    		if(json.error){
    			return callback(json);
    		} else {
    			return callback(handler(json));
    		}
    	};

    	$.ajax(postData);

    } else if(this.async == "promise"){
      postData["dataType"] = "text";
      postData["dataFilter"] = function(json){
    	  json = JSON.parse(json);
    	  json = json.data || json;

    		if(json.error){
    			return json;
    		} else {
    			return handler(json);
    		}
    	};

      return $.ajax(postData);
    };
  };

  this.qbaseResponseCode = function(response){
    var code = $(response).find("errcode").text();
    var message = $(response).find("errtext").text();
    message += ", " + $(response).find("errdetail").text();

    return { error: { code: code, message: message }};
  };

  this.xmlPost = function(dbid, action, data, callback, handler){
    if(this.quickstartConfig){
      return _self.quickstartPost(data, callback, handler, dbid, action, true);
    };

    var url = "/db/" + dbid + "?act=" + action;
    var postData = {
      url: url,
      data: data,
      dataType: "xml",
      type: "POST",
      context: this,
      contentType: "text/xml"
    };

    //local development
    if(this.username){
      data["realm"] = this.realm;
      data["call"] = action;
      data["apptoken"] = this.apptoken || "";
      data["dbid"] = dbid;

      postData["dataType"] = "text";
      postData["contentType"] = "application/json";

      postData["url"] = this.proxies.local;
      postData["data"] = JSON.stringify(data);
    };

    if(this.async == "callback"){
      postData["success"] = function(xml){
        var qbaseResponse = this.qbaseResponseCode(xml);

        if(qbaseResponse.error.code != "0"){
          return callback(qbaseResponse);
        }else{
          return callback(handler(xml));
        };
      };

      postData["error"] = function(xml){
        return callback({ error: { code: "503", message: "Service Unavailable."}})
      };

      $.ajax(postData);

    } else if(this.async == "promise"){
      postData["dataType"] = "text";

      postData["dataFilter"] = function(xml){
        var qbaseResponse = _self.qbaseResponseCode(xml);

        if(qbaseResponse.error.code != "0"){
          return qbaseResponse;
        }else{
          return handler(xml);
        };
      };

      return $.ajax(postData);
    }else{
      var response = null;

      postData["success"] = function(xml){
        var qbaseResponse = this.qbaseResponseCode(xml);

        if(qbaseResponse.error.code != "0"){
          response = qbaseResponse;
        }else{
          response = handler(xml);
        };
      };

      postData["error"] = function(xml){
        return callback({ error: { code: "503", message: "Service Unavailable."}})
      };

      postData["async"] = false;

      $.ajax(postData);

      return response;
    };
  };
}

function Base(config){
  var BaseConnectInstance = new BaseConnect(config);
  this.databaseId = config.databaseId;

  this.Table = function(key, config){
    this.removeQuickstartConfig = function(config){
      delete config["quickstart_users"];
      delete config["quickstart_username"];
      delete config["quickstart_password"];
      delete config["quickstart_key"];
      return config;
    };

    if(BaseConnectInstance.config.quickstart){
      config = this.removeQuickstartConfig(config);
    };

    this[key] = config;
    this.tableName = key;
    this.dbid = config.dbid;

    this.doQuery = function(query, params, callback, handle){
      var tableName = this.tableName;

      this.handle = function(response){
        return BaseConnectInstance.getRecords(tableName, response, "records");
      };

      var queryParams = {"fmt": "structured", "returnpercentage": "1"}
      if(query){
        var isQid = !isNaN(query);

        if(isQid){
          queryParams.qid = query;
        }else{
          queryParams.query = query;
        };
      }else{
        queryParams.query = "{'3'.XEX.''}"
      };

      if(params){
        var clist = params.clist;
      }else{
        var params = {};
      };

      if(BaseConnectInstance.config && !clist){
        var table = BaseConnectInstance.config.tables[tableName];

        var clist = [];
        for(key in table){
          var value = table[key];

          if(!isNaN(value)){
            clist.push(key);
          };
        };

        params.clist = clist.join(".");
      };

      queryParams.clist = params.clist;
      queryParams.slist = params.slist
      queryParams.options = params.options

      var data = {
        dbid: tableName,
        action: "DoQuery",
        params: queryParams
      };

      if(handle){
        this.handle = handle;
      };

      return BaseConnectInstance.post(data, callback, this.handle);
    };

    this.find = function(rid, callback){
      var tableName = this.tableName;

      this.handle = function(response){
        var records = BaseConnectInstance.getRecords(tableName, response, "records");
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

      if(Object.prototype.toString.call(rid) == "[object Array]"){
        var query = { "3": { in: rid }}
      }else{
        var query = { "3": rid };
      };

      return this.doQuery(query, null, callback, this.handle);
    };

    this.first = function(query, params, callback){
      var tableName = this.tableName;

      this.handle = function(response){
        var records = BaseConnectInstance.getRecords(tableName, response, "records");
        if(records.length > 0){
          return records[0];
        }else{
          return {};
        };
      };

      return this.doQuery(query, params, callback, this.handle);
    };

    this.last = function(query, params, callback){
      var tableName = this.tableName;

      this.handle = function(response){
        var records = BaseConnectInstance.getRecords(tableName, response, "records");
        if(records.length > 0){
          return records[records.length - 1];
        }else{
          return {};
        };
      };

      return this.doQuery(query, params, callback, this.handle);
    };

    this.all = function(params, callback){
      var tableName = this.tableName;

      this.handle = function(response){
        var records = BaseConnectInstance.getRecords(tableName, response, "records");
        if(records.length > 0){
          return records;
        }else{
          return {};
        };
      };

      return this.doQuery({ "3": { XEX: "" } }, params, callback, this.handle);
    };

    this.getRids = function(query, callback){
      this.handle = function(response){
        return BaseConnectInstance.getRids(response);
      };

      params = {
        clist: "3"
      };

      if(!query){
        query = { "3": { XEX: "" } }
      };

      return this.doQuery(query, params, callback, this.handle);
    };

    this.doQueryCount = function(query, callback){
      this.handle = function(response){
        return BaseConnectInstance.getNode(response, "numMatches");
      };

      var data = {
        dbid: this.tableName,
        action: "DoQueryCount",
        params: {"query": query}
      };

      return BaseConnectInstance.post(data, callback, this.handle);
    };

    this.addRecord = function(fieldParams, callback){
      this.handle = function(response){
        return parseInt(BaseConnectInstance.getNode(response, "rid"));
      };

      var data = {
        dbid: this.tableName,
        action: "AddRecord",
        fieldParams: fieldParams
      };

      return BaseConnectInstance.post(data, callback, this.handle);
    };

    this.editRecord = function(rid, fieldParams, callback){
      this.handle = function(response){
        var rid = BaseConnectInstance.getNode(response, "rid");
        return rid ? true : false;
      };

      var data = {
        dbid: this.tableName,
        action: "EditRecord",
        fieldParams: fieldParams,
        params: {"rid": rid}
      }

      return BaseConnectInstance.post(data, callback, this.handle);
    };

    this.changeRecordOwner = function(rid, owner, callback){
      this.handle = function(response){
        return true;
      };

      var data = {
        dbid: this.tableName,
        action: "ChangeRecordOwner",
        params: {"rid": rid, "newowner": owner}
      };

      return BaseConnectInstance.post(data, callback, this.handle);
    };

    this.copyMasterDetail = function(params, callback){
      this.handle = function(response){
        return BaseConnectInstance.getNode(response, "parentrid");
      };

      var data = {
        dbid: this.tableName,
        action: "CopyMasterDetail",
        params: params
      };

      return BaseConnectInstance.post(data, callback, this.handle);
    };

    this.getRecordInfo = function(rid, callback){
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
        dbid: this.tableName,
        action: "GetRecordInfo",
        params: { "rid": rid }
      };

      return BaseConnectInstance.post(data, callback, this.handle);
    };

    this.deleteRecord = function(rid, callback){
      this.handle = function(response){
        var rid = BaseConnectInstance.getNode(response, "rid");
        return rid ? true : false;
      };

      var data = {
        dbid: this.tableName,
        action: "DeleteRecord",
        params: {"rid": rid}
      };

      return BaseConnectInstance.post(data, callback, this.handle);
    };

    this.purgeRecords = function(query, callback){
      this.handle = function(response){
        var numberOfRecordDeleted = BaseConnectInstance.getNode(response, "num_records_deleted");
        return parseInt(numberOfRecordDeleted);
      };

      var data = {
        dbid: this.tableName,
        action: "PurgeRecords",
        params: {"query": query}
      };

      return BaseConnectInstance.post(data, callback, this.handle);
    };

    this.runImport = function(id, callback){
      this.handle = function(response){
        var numberOfRecordsImported = BaseConnectInstance.getNode(response, "import_status").match(/\d+/)[0];
        return parseInt(numberOfRecordsImported);
      };

      var data = {
        dbid: this.tableName,
        action: "RunImport",
        params: {"id": id}
      };

      return BaseConnectInstance.post(data, callback, this.handle);
    };

    this.importFromCSV = function(csvArray, callback){
      this.handle = function(response){
        return BaseConnectInstance.getNewRids(response);
      };

      var csv = "";
      var clist = [];

      for(key in csvArray[0]){
        if(BaseConnectInstance.config){
          tableConfig = BaseConnectInstance.config.tables[this.tableName];
          key = tableConfig[key];
        };

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
        dbid: this.tableName,
        action: "ImportFromCSV",
        params: {"clist": clist},
        csvData: csv
      }

      return BaseConnectInstance.post(data, callback, this.handle);
    };

    this.getTableFields = function(callback){
      this.handle = function(response){
        return BaseConnectInstance.getTableSchema(response);
      };

      var data = {
        dbid: this.tableName,
        action: "GetSchema"
      };

      return BaseConnectInstance.post(data, callback, this.handle);
    };

    this.genAddRecordForm = function(params, callback){
      this.handle = function(response){
        return response;
      };

      var data = {
        dbid: this.tableName,
        action: "GenAddRecordForm",
        fidParams: params
      };

      return BaseConnectInstance.post(data, callback, this.handle);
    };

    this.getNumRecords = function(callback){
      this.handle = function(response){
        return parseInt(BaseConnectInstance.getNode(response, "num_records"));
      };

      var data = {
        dbid: this.tableName,
        action: "GetNumRecords"
      };

      return BaseConnectInstance.post(data, callback, this.handle);
    };

    this.setFieldProperties = function(fid, params, callback){
      this.handle = function(response){
        var error = BaseConnectInstance.getNode(response, "errcode");
        return error == 0 ? true : false;
      };

      params["fid"] = fid;

      var data = {
        dbid: this.tableName,
        action: "SetFieldProperties",
        params: params
      };

      return BaseConnectInstance.post(data, callback, this.handle);
    };

    this.getTableReports = function(callback){
      this.handle = function(response){
        return BaseConnectInstance.getReports(response);
      };

      var data = {
        dbid: this.tableName,
        action: "GetSchema"
      };

      return BaseConnectInstance.post(data, callback, this.handle);
    };
  };

  this.setTables = function(tables){
    for(var key in tables){
      this[key] = new this.Table(key, tables[key]);
    };
  };

  this.setTables(config.tables);

  this.getOneTimeTicket = function(callback){
    this.handle = function(response){
      return BaseConnectInstance.getNode(response, "ticket");
    };

    var data = {
      action: "GetOneTimeTicket"
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.authenticate = function(auth, hours, callback){
    this.handle = function(response){
      return BaseConnectInstance.getNode(response, "ticket");
    };

    var data = {
      action: "Authenticate",
      params: { "hours": hours }
    };

    if(auth.ticket){
      data["ticket"] = auth.ticket;
    };

    if(auth.username && auth.password){
      data["username"] = auth.username;
      data["password"] = auth.password;
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.signOut = function(callback){
    this.handle = function(response){
      var error = BaseConnectInstance.getNode(response, "errcode");
      return error == "0" ? true : false;
    };

    var data = {
      action: "SignOut",
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.getDBVar = function(name, callback){
    this.handle = function(response){
      return BaseConnectInstance.getNode(response, "value");
    };

    var data = {
      dbid: this.databaseId,
      action: "GetDBvar",
      params: {"varname": name}
    };

    return BaseConnectInstance.post(data, callback, this.handle)
  };

  this.setDBVar = function(name, value, callback){
    this.handle = function(response){
      return true;
    };

    var data = {
      dbid: this.databaseId,
      action: "SetDBvar",
      params: {"varname": name, "value": value}
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.uploadPage = function(id, name, body, callback){
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
      dbid: this.databaseId,
      action: "AddReplaceDBPage",
      params: params
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.deletePage = function(pageId, callback){
    this.handle = function(response){
      var error = BaseConnectInstance.getNode(response, "errcode");
      return error == "0" ? true : false;
    };

    var data = {
      dbid: this.databaseId,
      action: "PageDelete",
      type: "QBI",
      params: {"pageid": pageId}
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.getDbPage = function(pageId, callback){
    this.handle = function(response){
      return BaseConnectInstance.getNode(response, "pagebody");
    };

    var data = {
      dbid: this.databaseId,
      action: "GetDBPage",
      type: "API",
      params: { "pageID": pageId }
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.cloneDatabase = function(params, callback){
    this.handle = function(response){
      return BaseConnectInstance.getNode(response, "newdbid");
    };

    var data = {
      dbid: this.databaseId,
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
      action: "CreateDatabase",
      type: "API",
      params: { "dbname": name, "dbdesc": description, "createapptoken": createAppToken || false }
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.deleteDatabase = function(callback){
    this.handle = function(response){
      var error = BaseConnectInstance.getNode(response, "errcode");
      return error == "0" ? true : false;
    };

    var data = {
      dbid: this.databaseId,
      action: "DeleteDatabase",
      type: "API"
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.renameApp = function(name, callback){
    this.handle = function(response){
      var error = BaseConnectInstance.getNode(response, "errcode");
      return error == "0" ? true : false;
    };

    var data = {
      dbid: this.databaseId,
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
      action: "FindDBByName",
      type: "API",
      params: { "dbname": name }
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.getTables = function(callback){
    this.handle = function(schema){
      var tables = $(schema).find("chdbid");
      var tablesObj = {};

      for(var i=0; i < tables.length; i++){
        var table = tables[i];
        var tableName = $(table).attr("name");
        var tableId = $(table).text();

        tablesObj[tableName] = tableId;
      }

      return tablesObj;
    };

    var data = {
      dbid: this.databaseId,
      action: "GetSchema",
      type: "API"
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.getAppDtmInfo = function(callback){
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
      action: "GetAppDTMInfo",
      type: "API",
      params: { "dbid": this.databaseId }
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.getDbInfo = function(callback){
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
      dbid: this.databaseId,
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
      action: "GrantedDBs",
      type: "API",
      params: params
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

  this.getUserRoles = function(callback){
    this.handle = function(response){
      return BaseConnectInstance.formatUserRoles(response);
    };

    var data = {
      dbid: this.databaseId,
      action: "UserRoles"
    };

    return BaseConnectInstance.post(data, callback, this.handle);
  };

  this.changeUserRole = function(userId, roleId, newRoleId, callback){
    this.handle = function(response){
      return true;
    };

    var data = {
      dbid: this.databaseId,
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

  this.quickstart = {
    register: function(data, callback){
      this.handler = function(response){
        if(response.ticket){
          BaseHelpers.setCookie("quickstart_session", JSON.stringify(response), 2);
        }else{
          BaseHelpers.setCookie("quickstart_session", "", -1);
        };

        return response;
      };

      data["quickstartAction"] = "Register";
      data["appToken"] = config.token;
      data["realm"] = config.realm;
      data["dbid"] = config.databaseId;

      return _self.quickstartPost(data, callback, this.handler);
    },

    signIn: function(data, callback){
      this.handler = function(response){
        if(response.ticket){
          BaseHelpers.setCookie("quickstart_session", JSON.stringify(response), 2);
        }else{
          BaseHelpers.setCookie("quickstart_session", "", -1);
        };

        return response;
      };

      data["quickstartAction"] = "SignIn";
      data["appToken"] = config.token;
      data["realm"] = config.realm;
      data["dbid"] = config.databaseId;

      return _self.quickstartPost(data, callback, this.handler);
    },

    signOut: function(callback){
      BaseHelpers.setCookie("quickstart_session", "", -1);

      if(callback){
      	callback(true);
      }
    },

    changePassword: function(data, callback){
      this.handler = function(response){
        return response;
      };

      data["ticket"] = JSON.parse(BaseHelpers.getCookie("quickstart_session")).ticket;
      data["quickstartAction"] = "ChangePassword";
      data["realm"] = config.realm;
      data["dbid"] = config.databaseId;

      return _self.quickstartPost(data, callback, this.handler);
    }
  }
}

var BaseHelpers = {
  options: {
    timeZone: 'utc',
    format: 'hours'
  },

  setCookie: function(name, value, hours) {
    var d = new Date();
    d.setTime(d.getTime() + (hours*60*60*1000));
    var expires = "expires="+ d.toUTCString();

    document.cookie = name + "=" + value + "; " + expires;
  },

  getCookie: function(name) {
    var name = name + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') {
        c = c.substring(1);
      };

      if (c.indexOf(name) == 0) {
        return c.substring(name.length,c.length);
      };
    }
    return "";
  },

  inverseTables: function(config){
    var inverseTables = {};

    for(var table in config){
      var newObject = {};

      for(var field in config[table]){
        newObject[config[table][field].toString()] = field;
      };

      inverseTables[table] = newObject;
    };

    return inverseTables;
  },

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
    if(milliseconds) {
      var date = new Date( parseInt(milliseconds) );
      var month = this.formatDateElement((date.getUTCMonth() + 1));
      var day = this.formatDateElement(date.getUTCDate());

      date = [month, day, date.getUTCFullYear()].join("-");

      return date;
    } else {
      return ' ';
    }
  },

  dateTimeToString: function(milliseconds, timeZone) {
    var today = new Date();
    var timeZone = timeZone ? timeZone.toLowerCase().trim() : this.options.timeZone.toLowerCase();

    Date.prototype.stdTimezoneOffset = function() {
      var jan = new Date(this.getFullYear(), 0, 1);
      var jul = new Date(this.getFullYear(), 6, 1);
      return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    }

    Date.prototype.dst = function() {
      return this.getTimezoneOffset() < this.stdTimezoneOffset();
    }

    var zoneOffsets = {
      "utc": 0,
      "eastern": today.dst() ? -4 : -5,
      "central": today.dst() ? -5 : -6,
      "mountain": today.dst() ? -6 : -7,
      "pacific": today.dst() ? -7 : -8
    };

    var offset = zoneOffsets[timeZone];

    if(milliseconds) {
      var date = new Date( parseInt(milliseconds) + (60 * 60 * 1000 * offset) );

      var year = this.formatDateElement((date.getUTCFullYear));
      var month = this.formatDateElement((date.getUTCMonth() + 1));
      var day = this.formatDateElement(date.getUTCDate());
      var hours = this.formatDateElement(date.getUTCHours());
      var minutes = this.formatDateElement(date.getUTCMinutes());
      var seconds = this.formatDateElement(date.getUTCSeconds());

      var dateTime = [month, day, date.getUTCFullYear()].join("-");
      var ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'

      dateTime += " "
      dateTime += [hours, minutes].join(":")
      dateTime += " " + ampm
      return dateTime;
    } else {
      return '';
    }
  },

  durationToString: function(milliseconds, format) {
    var ms = parseInt(milliseconds);
    var result;
    var format = format ? format.trim().toLowerCase() : this.options.format.toLowerCase();

    var formatType = {
      "days": function() {
        return ms / 86400000;
      },
      "hours": function() {
        return ms / 3600000;
      },
      "minutes": function() {
        return ms / 60000;
      },
      "seconds": function() {
        return ms / 1000;
      }
    };

    if(milliseconds) {
      if (formatType[format]) {
        result = formatType[format]();
      }
      else {
        result = formatType["hours"]();
        console.log("The format parameter passed to BaseHelpers.durationToString() was incorrect. Using the format for 'hours' instead.");
      }

      result = Math.round(result * 100) / 100;
      return result.toString();
    } else {
      return '';
    }
  },

  timeOfDayToString: function(milliseconds){
    var timeOfDay = "";

    timeOfDay = new Date()
    timeOfDay.setHours("");
    timeOfDay.setMinutes("");
    timeOfDay.setSeconds("");
    timeOfDay.setMilliseconds(milliseconds);

    var hours = timeOfDay.getHours().toString();
    var minutes = timeOfDay.getMinutes().toString();
    var ampm = hours > 12 ? "pm" : "am";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes.length > 1 ? minutes : "0" + minutes;

    timeOfDay = hours + ":" + minutes + " " + ampm

    return timeOfDay;
  },

  redirectToEditForm: function(dbid, rid, root){
    var root = root || '';
    window.location = root + "/db/"+dbid+"?a=er&rid=" + rid;
  },

  redirectToViewForm: function(dbid, rid, root){
    var root = root || '';
    window.location = root + "/db/"+dbid+"?a=dr&rid=" + rid;
  },

  downloadFile: function(dbid, rid, fid, version){
    var version = version || 0;

    window.location = "https://www.quickbase.com/up/"+dbid+"/a/r"+rid+"/e"+fid+"/v" + version;
  }
};