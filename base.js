function Base(apptoken){
  this.apptoken = apptoken;
  this.httpConnection = null;

  BaseConnect.initHttpConnection();

  this.getTicket = function(){
    var response = BaseConnect.post("main", "GetOneTimeTicket")
    var ticket = BaseConnect.getNode(response, "ticket");
    return ticket;
  }

  this.addRecord = function(dbid, fieldParams){
    var response = BaseConnect.post(dbid, "AddRecord", fieldParams);
    var rid = parseInt(BaseConnect.getNode(response, "rid"));
    return rid;
  }

  this.editRecord = function(dbid, rid, fieldParams){
    var response = BaseConnect.post(dbid, "EditRecord", fieldParams, {"rid": rid});
    var rid = BaseConnect.getNode(response, "rid");

    if(rid){
      return true;
    }else{
      return false;
    }
  }

  this.deleteRecord = function(dbid, rid){
    var response = BaseConnect.post(dbid, "DeleteRecord", {}, {"rid": rid})
    var rid = BaseConnect.getNode(response, "rid");

    if(rid){
      return true;
    }else{
      return false;
    }
  }

  this.find = function(dbid, rid){
    var query = [];
    
    if(Object.prototype.toString.call(rid) == "[object Array]"){
      for(var i=0; i < rid.length; i++){
        query.push("{'3'.EX.'"+rid[i]+"'}");
      };
    }else{
      query.push("{'3'.EX.'"+rid+"'}");
    }

    query = query.join("OR");

    var records = this.doQuery(dbid, {"query": query});

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

  this.first = function(dbid, query, slist){
    var records = this.doQuery(dbid, {"query": query, "slist": slist})

    if(records.length > 0){
      return records[0];
    }else{
      return {};
    };
  };

  this.last = function(dbid, query, slist){
    var records = this.doQuery(dbid, {"query": query, "slist": slist})

    if(records.length > 0){
      return records[records.length - 1];
    }else{
      return {};
    };
  };

  this.doQuery = function(dbid, params){
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

    var response = BaseConnect.post(dbid, "DoQuery", {}, queryParams);
    var records = BaseConnect.getRecords(response, "records");
    return records;
  }

  this.doQueryCount= function(dbid, query){
    var records = this.doQuery(dbid, {"query": query, "clist": "3"});
    return records.length;
  };

  this.purgeRecords = function(dbid, query){
    var response = BaseConnect.post(dbid, "PurgeRecords", {}, {"query": query});
    var numberOfRecordDeleted = BaseConnect.getNode(response, "num_records_deleted");
    return parseInt(numberOfRecordDeleted);
  }

  this.importRecords = function(dbid, csvArray){
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
        value = value.replace(/"/g, '""');
        rowValues.push('"' + value + '"');
      };

      rowValues.join(",")
      rowValues += "\n"

      csv += (rowValues);
    };

    var response = BaseConnect.post(dbid, "ImportFromCSV", {}, {"clist": clist}, csv);
    var rids = BaseConnect.getRids(response);
    return rids;
  };

  this.getTableFields = function(dbid){
    var response = BaseConnect.post(dbid, "GetSchema");
    var fields = BaseConnect.getFields(response);
    return fields;
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
    var date = new Date(parseInt(milliseconds));

    var month = BaseConnect.formatDateElement((date.getMonth() + 1));
    var day = BaseConnect.formatDateElement(date.getDate());

    date = [month, day, date.getFullYear()].join("-");
    return date;
  },

  dateTimeToString: function(milliseconds){
    var date = new Date(parseInt(milliseconds));

    var month = BaseConnect.formatDateElement((date.getMonth() + 1));
    var day = BaseConnect.formatDateElement(date.getDate());
    var hours = BaseConnect.formatDateElement(date.getHours());
    var minutes = BaseConnect.formatDateElement(date.getMinutes());
    var seconds = BaseConnect.formatDateElement(date.getSeconds());

    var dateTime = [month, day, date.getFullYear()].join("-");
    dateTime += " "
    dateTime += [hours, minutes, seconds].join(":")
    return dateTime;
  }
};

var BaseConnect = {
  post: function(dbid, action, fieldParams, params, csvData){
    var request = this.buildRequest();

    for(key in params){
      var value = params[key];

      if(key == "clist" || key == "slist" || key == "options"){
        if(Object.prototype.toString.call(value) == "[object Array]"){
          value = value.join(".");
        };
      };

      this.addParameter(request, key, value);
    };

    for(key in fieldParams){
      this.addFieldParameter(request, key, fieldParams[key]);
    };

    if(csvData){
      var records_csv = request.createElement("records_csv");
      records_csv.appendChild(request.createCDATASection(csvData));
      request.documentElement.appendChild(records_csv);
    };

    response = this.xmlPost(dbid, "API_" + action, request);
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
    var fields = $(response).find("fields").find("field");
    var fieldsArray = [];

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

      fieldsArray.push(fieldHash);
    };

    return fieldsArray;
  },

  createDocument: function(){
    try{
      if(window.ActiveXObject !== undefined){
        return new ActiveXObject("Microsoft.XmlDom");
      }

      if(document.implementation && document.implementation.createDocument){
        var doc = document.implementation.createDocument( "", "", null );
        return doc;
      }
    }
    catch(ex){}
    throw new Error("Sorry. Your browser does not support Base.js.");
  },

  buildRequest: function(){
    var request = this.createDocument();
    request.async = false;
    request.resolveExternals = false;

    var root = request.createElement("qdbapi");

    try{
      request.removeChild(request.documentElement);
    }
    catch(e){}

    request.appendChild(root);

    if(this.apptoken){
      this.addParameter(request, "apptoken", this.apptoken);
    }

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
    fieldTag.setAttribute("fid", fid)

    var node = request.createTextNode(value);
    fieldTag.appendChild(node);
    mainElement.appendChild(fieldTag);
  },

  xmlPost: function(dbid, action, request){
    var script = "/db/" + dbid + "?act=" + action; 
    Base.httpConnection.open("POST", script, false);

    if((/MSIE 1/i).test(navigator.appVersion) || window.ActiveXObject !== undefined){
      try { Base.httpConnection.responseType = 'msxml-document'; } catch (e) { }
    };
        
    Base.httpConnection.setRequestHeader("Content-Type", "text/xml");
    Base.httpConnection.send(request);

    var xml = Base.httpConnection.responseXML;

    var errorCode = BaseConnect.getNode(xml, "errcode");
    if(errorCode != "0"){
      throw new Error("ERROR: code - " + errorCode + " message - " + BaseConnect.getNode(xml, "errtext"));
    };

    this.ticket = BaseConnect.getNode(xml, "ticket");
    return xml;
  },

  initHttpConnection: function(){
    try{
      if(!Base.httpConnection){
        Base.httpConnection = new XMLHttpRequest();
      }
    }
    catch(e){
    }
    try{
      if(!Base.httpConnection){
        Base.httpConnection = new ActiveXObject("Msxml2.XMLHTTP");
      } 
    }
    catch(e){
    }
    try{
      if(!Base.httpConnection){
        Base.httpConnection = new ActiveXObject("Microsoft.XMLHTTP");
      };
    }
    catch(e){
      alert("Sorry. This browser does not support QuickBaseClient.");
    }
  }
}