#AIS QuickBase JavaScript Library

QuickBase API Javascript Library w/ JSON

Versions
* 4.7 - https://s3.amazonaws.com/ais_libraries/BaseJS/4.7/base.min.js (http proxy)
* 4.6 - https://s3.amazonaws.com/ais_libraries/BaseJS/4.6/base.min.js (change structure of .getTableFields response)
* 4.5 - https://s3.amazonaws.com/ais_libraries/BaseJS/4.5/base.min.js

Related Libraries
* jQuery - https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
* bootstrap.css - https://s3.amazonaws.com/ais_libraries/Bootstrap/3.2/css/bootstrap.min.css
* bootstrap.js - https://s3.amazonaws.com/ais_libraries/Bootstrap/3.2/js/bootstrap.min.js

##Documentation

* **Main**
  - [New Connection](#new-connection)

* **Application and table metadata**
  - [API_FindDBByName](#api_finddbbyname)
  - [API_GetAncestorInfo](#api_getancestorinfo)
  - [API_GetAppDTMInfo](#api_getappdtminfo)
  - [API_GetDBInfo](#api_getdbinfo)
  - [API_GetSchema]
    - [GetTableFields](#gettablefields)
    - [GetTableReports](#gettablereports)
  - [API_GrantedDBs](#api_granteddbs)

* **Creating, copying, and deleting applications**
  - [API_CloneDatabase](#api_clonedatabase)
  - [API_CreateDatabase](#api_createdatabase)
  - [API_DeleteDatabase](#api_deletedatabase)
  - [API_RenameApp](#api_renameapp)

* **Secure access to QuickBase**
  - [API_GetOneTimeTicket](#api_getonetimeticket)
  - [API_Authenticate](#api_authenticate)
  - [API_SignOut](#api_signout)

* **Table and field management**
  - [API_AddField]
  - [API_CreateTable]
  - [API_DeleteField]
  - [API_FieldAddChoices]
  - [API_SetFieldProperties](#api_setfieldproperties)
  - [API_SetKeyField]

* **Record (data) management**
  - [API_AddRecord](#api_addrecord)
  - [API_EditRecord](#api_editrecord)
  - [API_ChangeRecordOwner](#api_changerecordowner)
  - [API_CopyMasterDetail](#api_copymasterdetail)
  - [API_DeleteRecord](#api_deleterecord)
  - [API_DoQuery](#api_doquery)
    - [Find](#find)
    - [First](#first)
    - [Last](#last)
    - [All](#all)
    - [GetRids](#getrids)
  - [API_DoQueryCount](#api_doquerycount)
  - [API_GenAddRecordForm](#api_genaddrecordform)
  - [API_GenResultsTable]
  - [API_GetNumRecords](#api_getnumrecords)
  - [API_GetRecordInfo](#api_getrecordinfo)
  - [API_ImportFromCSV](#api_importfromcsv)
  - [API_PurgeRecords](#api_purgerecords)

* **Managing user access**
  - [API_AddUserToRole]
  - [API_ChangeUserRole](#api_changeuserrole)
  - [API_ChangeManager]
  - [API_GetRoleInfo]
  - [API_GetUserInfo](#api_getuserinfo)
  - [API_GetUserRole]
  - [API_ProvisionUser]
  - [API_RemoveUserFromRole]
  - [API_SendInvitation]
  - [API_UserRoles](#api_userroles)

* **Miscellaneous functions**
  - [API_AddReplaceDBPage]
    - [UploadPage](#uploadpage)
    - [DeletePage](#deletepage)
  - [API_GetDBPage](#getdbpage)
  - [API_GetDBVar](#api_getdbvar)
  - [API_SetDBVar](#api_setdbvar)

* **Misc Helper Functions**
  - [GetURLParam](#geturlparam)
  - [DateToString](#datetostring)
  - [DateTimeToString](#datetimetostring)
  - [DurationToString](#durationtostring)
  - [TimeOfDayToString](#timeofdaytostring)
  - [RedirectToEditForm](#redirecttoeditform)
  - [RedirectToViewForm](#redirecttoviewform)
  - [DownloadFile](#downloadfile)

###New Connection

```javascript
var config = {
  token: "cgfsmfcdc5vyp5k5s7h6b6v3m9v",
  async: false,
  databaseId: "bjbsgxy2r",
  tables: {
    teachers: {
      dbid: "bjbsgxy3t",
      rid: 3,
      recordOwner: 5,
      firstName: 8,
      lastName: 9
    }
  }
};

var db = new Base(config);
```

###Async Options
The 'async' option for the config object defaults to false, but when passed anything 'truthy' will return promises.

###API_GetOneTimeTicket
**getOneTimeTicket() => [string] ticket**

```javascript
var ticket = db.getOneTimeTicket();
=> "6adfasdf8338adfadfbhkieoa874k494kadjff4774hfj334953"
```

###API_Authenticate
**authenticate(ticket, hours) => [string] ticket**

```javascript
var ticket = db.authenticate("6adfasdf8338adfadfbhkieoa874k494kadjff4774hfj334953", 12);
=> "6adfasdf8338adf44322ieoa874k494kadjff477444443953"
```

###API_SignOut
**signOut() => [bool] success?**

```javascript
var signedOut = db.signOut();
=> true;
```

###API_SetFieldProperties
**setFieldProperties(fid, propertiesObj) => [bool] success?**

```javascript
var properties = { "required": "1", "unique": "0" };
var propertiesSet = db.teachers.setFieldProperties(13, properties);
=> true;
```

###API_SetDBVar
**setDBVar(name, value) => [bool] success?**

```javascript
var callSuccessful = db.setDBVar("appName", "Project Manager");
=> true
```

###API_GetDBVar
**getDBVar(name) => [string] value**

```javascript
var value = db.getDBVar("appName");
=> "Project Manager"
```

###UploadPage
**uploadPage(id, name, body) => [string] pageId**

```javascript
var pageId = db.uploadPage(null, "test.txt", "hello world");
=> "6"
```

###DeletePage
**deletePage(id) => [bool] success?**

```javascript
var deleted = db.deletePage("6");
=> true
```

###API_GetDBPage
**getDbPage(id) => [html] pageBody**

```javascript
var page = db.getDbPage("6");
=> <html></html>
```

##Retrieving Records
###API_DoQuery
**doQuery(query, queryOptions) => [array] records**

"queryOptions" expects a hash containing any of the following options:

* "query" - object of fieldnames/values
* "qid" - report or query id to load (should not be used with `query` or `qname`)
* "clist" - a list (Array or Period-separated string) of fields to return
* "slist" - a list (Array or Period-separated string) of fields to sort by
* "options" - string of additional options. ex: `"num-200.skp-#{records_processed}"`

```javascript
var query = { rid: 123 }
var records = db.teachers.doQuery(query, { clist: "rid.firstName.lastName"});
=>  [
     { rid: "14029302955", firstName: "Lord of the Flies", lastName: "William Golding" },
     { rid: "14029302927", firstName: "A Tale of Two Cities", lastName: "Charles Dickens" }
    ]
```

###API_DoQueryCount
**doQueryCount(query)** => **[int] # of records in query**

```javascript
var count = db.teachers.doQueryCount({ rid: 123 });
=> 39
```

###API_GenAddRecordForm
**genAddRecordForm(fids)** => **[html] html rendered add record form

```javascript
var count = db.teachers.genAddRecordForm({ lastName: "Golding" });
=> <html></html>
```

###API_GetNumRecords
**getNumRecords()** => **[int] number of records in table

```javascript
var count = db.teachers.getNumRecords();
=> 2
```

###API_GetRecordInfo
**getRecordInfo(rid)** => **{obj} record info

```javascript
var count = db.teachers.getRecordInfo(103);
=> { rid: "3676", num_fields: "16", update_id: "1422057167760", fields: Object }
```

###Find
**find(rid)** => **[json] record**
```javascript
var record = db.teachers.find("12");
=> { rid: "1402930292", firstName: "Lord of the Flies", lastName: "William Golding" }
```

###First
**first(query, queryOptions)** => **[json] record**
```javascript
var record = db.teachers.first({ firstName: "William" }, { slist : "3" });
=> { rid: "1402930292", firstName: "Lord of the Flies", lastName: "William Golding" }
```

###Last
**last(query, queryOptions)** => **[json] record**
```javascript
var record = db.teachers.last({ rid: { XEX: "" } }, { slist: "3" });
=> { rid: "1402933332", firstName: "Animal Farm", lastName: "George Orwell" }
```

###All
**all(queryOptions)** => **[array] records**
```javascript
var record = db.teachers.all({ "slist": "3" });
=> [{ rid: "1402933332", firstName: "Animal Farm", lastName: "George Orwell" }]
```

###GetRids
**getRids(query)** => **[array] rids**
```javascript
var rids = db.teachers.getRids({ rid: { GT: 100 } });
=> ["101", "102", "103", "104"]
```

###API_ImportFromCSV
**importFromCSV(data)** => **[array] new rids**

```javascript
var newData = [
  { firstName: "Lord of the Flies", lastName: "William Golding" },
  { firstName: "A Tale of Two Cities", lastName: "Charles Dickens" },
  { firstName: "Animal Farm", lastName: "George Orwell" }
];

rids = db.database.importFromCSV(newData);
=> [13, 14, 15]
````

###API_AddRecord
**addRecord(newRecord)** => **[int] new rid**

```javascript
var newRecord = { firstName: "My New Title", lastName: "John Smith" };
var newRid = db.teachers.addRecord(newRecord);
=> 13
````

###API_EditRecord
**editRecord(rid, updatedRecord )** => **[bool] success?**

```javascript
var updatedRecord = { firstName: "My Second Title", lastName: "John Smith"};
var callSuccessful = db.teachers.editRecord(136, updatedRecord);
=> false
````

###API_ChangeRecordOwner
**changeRecordOwner(rid, user)** => **[bool] success?**

```javascript
var callSuccessful = db.teachers.changeRecordOwner(136, "zsiglin@advantagequickbase.com");
=> true
````

###API_CopyMasterDetail
**copyMasterDetail(options)** => **[int] record IDs of new copies or the record ID of the record to which the data was copied.**
```javascript
var numberCopied = db.teachers.copyMasterDetail({ destrid: "0", sourcerid: "1204", copyfid: "8" });
=> 1
````

###API_DeleteRecord
**deleteRecord(rid)** => **[bool] success?**

```javascript
var callSuccessful = db.teachers.deleteRecord(136);
=> true
````

###API_PurgeRecords
**purgeRecords(query)** => **[int] # of records deleted**

```javascript
var numberOfRecordsDeleted = db.teachers.purgeRecords({ rid: in[1, 2, 3] });
=> 9
````

###API_GetUserInfo
**getUserInfo(email)** => **[json] user**
######Ignore email parameter to get current user info

```javascript
var userInfo = db.getUserInfo();
=> {
      "id":"57527431.cnhu",
      "firstName":"Kit",
      "lastName":"Hensel",
      "login":"kith",
      "email":"khensel@advantagequickbase.com",
      "screenName":"kith",
      "isVerified":"1",
      "externalAuth":"0"
    }
````

###Get User Roles
**getUserInfo()** => **[array] users & roles**

```javascript
var userInfo = db.teachers.getUserRoles();
=> [
    {
      "id", "57527431.cnhu",
      "firstName": "Kit",
      "lastName": "Hensel",
      "lastAccess": "1418230947817",
      "lastAccessAppLocal": "12-10-2014 10:02 AM",
      "roles": [{"id": "12", "access": "Administrator", "name": "Administrator"}]
    }
  ]
````

###API_ChangeUserRole
**changeUserRole(userId, roleId, newRoleId, callback)** => **[bool] success?**

```javascript
var userInfo = db.changeUserRole("57527431.cnhu", "12", "11");
=> true
````

###GetTableFields
**getTableFields()** => **{obj} fields**

```javascript
var fields = db.teachers.getTableFields();
````

###GetTableReports
**getTableReports()** => **{obj} fields**

```javascript
var reports = db.teachers.getTableReports();
````

###API_FindDBByName
**findDbByName(name)** => **[string] dbid**

```javascript
var dbid = db.findDbByName("BaseJS Testing");
=> b3dkifkg
````

###API_GetAppDTMInfo
**getAppDtmInfo()** => **{obj} application access times**

```javascript
var applicationAccess = db.getAppDtmInfo();
=> { "requestTime": "149494949494",
     "requestNextAllowedTime": "140509599595",
     "lastModifiedTime": "14959595959",
     "lastRecModTime": "14959695938",
     "tables": { "bedfeag5": { "lastModifiedTime": 149392928283, "lastRecModTime": 14959583922 } }
    }
````

###API_GetDBInfo
**getDbInfo()** => **{obj} db info**

```javascript
var info = db.getDbInfo();
=> { createdTime: "1410366888912", dbname: "BaseJS Testing", lastRecModTime: "1422054152243", mgrID: "57527431.cnhu", mgrName: "kith", numRecords: "0"time_zone: "(UTC-07:00) Mountain Time (US & Canada)"version: "2.0" }
````

###API_GrantedDBs
**grantedDbs(params)** => **[array] databases**

```javascript
var databases = db.grantedDbs("abc1234");
````

###API_CloneDatabase
**cloneDatabase(params)** => **[string] dbid**

```javascript
var dbid = db.cloneDatabase({ "newdbname": "BaseClone", "newdbdesc": "Testing clone" });
````

###API_CreateDatabase
**createDatabase(name, description, generateAppToken)** => **[string] dbid**

```javascript
var dbid = db.createDatabase("New Base Testing", "New app for testing", false);
````

###API_DeleteDatabase
**deleteDatabase()** => **[bool] success?**

```javascript
var databaseDeleted = db.deleteDatabase();
````

###API_RenameApp
**renameApp(name)** => **[bool] success?**

```javascript
var appRenamed = db.renameApp("BaseTesting2");
````

##Base Helpers
BaseHelpers has an options property that can be used to set a global time zone for all dateTimeToString() calls and a format for all durationToString() calls.

```javascript
BaseHelpers.options = {
  timeZone: 'Mountain',
  format: 'Minutes'
};
````

###GetUrlParam
**BaseHelpers.getUrlParam(name)** => **[string] param value**

```javascript
var name = BaseHelpers.getUrlParam("name");
=> "William Golding"
````

###DateToString
**BaseHelpers.dateToString(milliseconds)** => **[string] date format**

```javascript
var date = BaseHelpers.dateToString("1410454590146");
=> "09-01-2014"
````

###DateTimeToString
**BaseHelpers.dateTimeToString(milliseconds [, timeZone])** => **[string] date/time format**

The optional timeZone parameter accepts a case-insensitive string timezone name. BaseHelpers.dateTimeToString() is aware of DST and will adjust accordingly. If no time zone is given the returned value will default to UTC format. Possible options include:

* "UTC"
* "Eastern"
* "Central"
* "Mountain"
* "Pacific"

```javascript
var dateTime = BaseHelpers.dateTimeToString("1420138800000");
=> "01-01-2015 07:00 PM"
````

```javascript
var dateTime = BaseHelpers.dateTimeToString("1420138800000", 'mountain');
=> "01-01-2015 12:00 PM"
````

###DurationToString
**BaseHelpers.durationToString(milliseconds [, format])** => **[string] hour format**

The optional format parameter accepts a case-insensitive string unit of measure. If no format is given the returned value will default to "hours." Possible options include:

* "days"
* "hours"
* "minutes"
* "seconds"

```javascript
var duration = BaseHelpers.durationToString("28800000");
=> "8"
````

```javascript
var duration = BaseHelpers.durationToString("28800000", "minutes");
=> "480"
````

###TimeOfDayToString
**BaseHelpers.timeOfDayToString(milliseconds)** => **[string] time of day format**

```javascript
var timeOfDay = BaseHelpers.timeOfDayToString("1410454590146");
=> "3:00 pm"
````

###RedirectToEditForm
**BaseHelpers.redirectToEditForm(dbid, rid)**

```javascript
BaseHelpers.redirectToEditForm("abcd1234", 12);
````

###RedirectToViewForm
**BaseHelpers.redirectToViewForm(dbid, rid)**

```javascript
BaseHelpers.redirectToViewForm("abcd1234", 12);
````

###DownloadFile
**BaseHelpers.downloadFile(dbid, rid, fid, version)**

```javascript
BaseHelpers.downloadFile("abcd1234", 12, 5);
````

##Example
```javascript
var config = {
  token: "cgfsmfcdc5vyp5k5s7h6b6v3m9v",
  async: false,
  databaseId: "bjbsgxy2r",
  tables: {
    teachers: {
      dbid: "bjbsgxy3t",
      rid: 3,
      recordOwner: 5,
      firstName: 8,
      lastName: 9
    }
  }
};

var database = new Base(config);

var queries = [
  { firstName: "Kit" },
  { firstName: { XEX: "Kit" } },
  { firstName: "Kit", lastName: "Hensel" },
  { or: [{ firstName: "Kit" }, { lastName: "Hensel" }] },
  { or: [{ firstName: { XEX: "Kit"} }, { lastName: "Hensel" }] },
  { or: [{ firstName: { CT: "Kit"} }, { lastName: "Hensel" }, { firstName: { CT: "Jack" } }] },
  { firstName: "Kit", or: [{ lastName: "Hensel" }] },
  { firstName: "Kit", or: [{ lastName: "Hensel" }], rid: 3 },
  { firstName: { in: ["Kit", "Jack"]}}
];

queries.forEach(function(query){
  var response = database.teachers.doQuery(query)
  console.log(response)
});

var newRecordHash = { firstName: "Mike&Ike", lastName: "Johnson" }
var rid = database.teachers.addRecord(newRecordHash);
console.log("ADD RECORD: " + rid);

var newRecordHash = { firstName: "Mike", lastName: "Johnson"}
var rid2 = database.teachers.addRecord(newRecordHash);

var numberOfRecords = database.teachers.getNumRecords();
console.log(numberOfRecords);

//Edit Record
var editRecordHash = { firstName: "Stephan", lastName: "Smith" }
var response = database.teachers.editRecord("3924", editRecordHash);
console.log("EDIT RECORD: " + response);
