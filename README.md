#AIS QuickBase JavaScript Library

QuickBase API Javascript Library w/ JSON

Versions
* 2.3 - https://s3.amazonaws.com/ais_libraries/BaseJS/2.3/base.min.js
* 2.2 - https://s3.amazonaws.com/ais_libraries/BaseJS/2.2/base.min.js
* 2.1 - https://s3.amazonaws.com/ais_libraries/BaseJS/2.1/base.min.js

Related Libraries
* jQuery - https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
* bootstrap.css - https://s3.amazonaws.com/ais_libraries/Bootstrap/3.2/css/bootstrap.min.css
* bootstrap.js - https://s3.amazonaws.com/ais_libraries/Bootstrap/3.2/js/bootstrap.min.js

##Documentation

* **Main**
  - <b>[New Connection](#new-connection)</b>

* **Application and table metadata**
  - [API_FindDBByName](#api-find-db-by-name) **missing
  - [API_GetAncestorInfo](#api-get-ancestor-info) **missing
  - [API_GetAppDTMInfo](#api-get-app-dtm-info) **missing
  - [API_GetDBInfo](#api-get-db-info) **missing
  - [API_GetSchema](#api-get-schema) **missing
  - [Helper_GetTableFields](#helper_gettablefields)
  - [Helper_GetTableReports](#helper_gettablereports)
  - [API_GrantedDBs](#api-granted-dbs) **missing

* **Creating, copying, and deleting applications**
  - [API_CloneDatabase](#api_clone_database) **missing
  - [API_CreateDatabase](#api-create-database) **missing
  - [API_DeleteDatabase](#api-delete-database) **missing
  - [API_RenameApp](#api-rename-app) **missing

* **Uploading and downloading files**
  - [API_UploadFile](#api-upload-file) **missing

* **Secure access to QuickBase**
  - [Get Ticket](#get-ticket)
  - [API_Authenticate](#api-authenticate) **missing
  - [API_SignOut](#api-sign-out) **missing

* **Table and field management**
  - [API_AddField](#api-add-field) **missing
  - [API_CreateTable](#api-create-table) **missing
  - [API_DeleteField](#api-delete-field) **missing
  - [API_FieldAddChoices](#api-field-add-choices) **missing
  - [API_SetFieldProperties](#api-set-field-properties) **missing
  - [API_SetKeyField](#api-set-key-field) **missing

* **Record (data) management**
  - <b>[API_AddRecord](#api_addrecord)</b>
  - <b>[API_EditRecord](#api_editrecord)</b>
  - [API_ChangeRecordOwner](#api-change-record-owner) **missing
  - [API_CopyMasterDetail](#api_copymasterdetail)
  - [API_DeleteRecord](#api_deleterecord)
  - <b>[API_DoQuery](#api_doquery)</b>
  - [API_DoQueryCount](#api-do-query-count)
  - [Find Single Record](#find-single-record)
  - [Find First Record](#find-first-record)
  - [Find Last Record](#find-last-record)
  - [Find All Records](#find-all-records)
  - [Find RID's](#find-rids)
  - [API_GenAddRecordForm](#api-gen-add-record-form) **missing
  - [API_GenResultsTable](#api-gen-results-table) **missing
  - [API_GetNumRecords](#api-get-num-records) **missing
  - [API_GetRecordAsHTML](#api-get-record-as-html) **missing
  - [API_GetRecordInfo](#api_getrecordinfo) **missing
  - <b>[API_ImportFromCSV](#api_importfromcsv)</b>
  - <b>[API_PurgeRecords](#api_purgerecords)</b>
  - [API_RunImport](#api-run-import) **missing

* **Managing user access**
  - [API_AddUserToRole](#api-add-user-to-role) **missing
  - [API_ChangeUserRole](#api_changeuserrole)
  - [API_ChangeRecordOwner](#api-change-record-owner) **missing
  - [API_ChangeManager](#api-change-manager) **missing
  - [API_GetRoleInfo](#api-get-role-info) **missing
  - [API_GetUserInfo](#api_getuserinfo)
  - [API_GetUserRole](#api-get-user-role) **missing
  - [API_ProvisionUser](#api-provision-user) **missing
  - [API_RemoveUserFromRole](#api-remove-user-from-role) **missing
  - [API_SendInvitation](#api-send-invitation) **missing
  - [API_UserRoles](#api_userroles)

* **Managing groups**
  - [API_AddGroupToRole](#api-add-group-to-role) **missing
  - [API_AddSubGroup](#api-add-sub-group) **missing
  - [API_AddUserToGroup](#api-add-user-to-group) **missing
  - [API_ChangeGroupInfo](#api-change-group-info) **missing
  - [API_CopyGroup](#api-copy-group) **missing
  - [API_CreateGroup](#api-create-group) **missing
  - [API_DeleteGroup](#api-delete-group) **missing
  - [API_GetGroupRole](#api-get-group-role) **missing
  - [API_GetUsersInGroup](#api-get-users-in-group) **missing
  - [API_GrantedDBsForGroup](#api-granted-dbs-for-group) **missing
  - [API_GrantedGroups](#api-granted-groups) **missing
  - [API_RemoveGroupFromRole](#api-remove-group-from-role) **missing
  - [API_RemoveSubgroup](#api-remove-subgroup) **missing
  - [API_RemoveUserFromGroup](#api-remove-user-from-group) **missing

* **Miscellaneous functions**
  - [API_AddReplaceDBPage](#api_addreplacedbpage)
  - [API_GetDBPage](#api-get-db-page) **missing
  - [API_GetDBVar](#api_getdbvar)
  - [API_SetDBVar](#api_setdbvar)

* **JS Helper Functions**
  - [Get URL Parameter](#get-url-parameter)
  - [DateToString](#datetostring)
  - [DateTimeToString](#datetimetostring)
  - [DurationToString](#durationtostring)
  - [TimeOfDayToString](#timeofdaytostring)
  - [RedirectToEditForm](#redirecttoeditform)
  - [RedirectToViewForm](#redirecttoviewform)
  - [Download File](#download-file)

###New Connection

```javascript
var api = new Base(apptoken, async);
```

###Get Ticket
**getTicket() => [string] ticket**

```javascript
var ticket = api.getTicket();
=> "6adfasdf8338adfadfbhkieoa874k494kadjff4774hfj334953"
```

```javascript
var ticket = api.getTicket(function(ticket){
  console.log(ticket);
});
```

###API_SetDBVar
**setDBVar(dbid, name, value) => [bool] success?**

```javascript
var callSuccessful = api.setDBVar("bdjwmnj33", "appName", "Project Manager");
=> true
```

###API_GetDBVar
**getDBVar(dbid, name) => [string] value**

```javascript
var value = api.getDBVar("bdjwmnj33", "appName");
=> "Project Manager"
```

###API_AddReplaceDBPage
**uploadPage(dbid, id, name, body) => [string] pageId**

```javascript
var pageId = api.uploadPage("bdjwmnj33", null, "test.txt", "hello world");
=> "6"
```

###Delete Page
**deletePage(dbid, id) => [bool] success?**

```javascript
var deleted = api.deletePage("bdjwmnj33", "6");
=> true
```

##Retrieving Records
###API_DoQuery
**doQuery(dbid, queryOptions) => [array] records**

"queryOptions" expects a hash containing any of the following options:

* "query" - typical Quickbase query string. ex: `"{3.EX.'123'}"`
* "qid" - report or query id to load (should not be used with `query` or `qname`)
* "clist" - a list (Array or Period-separated string) of fields to return
* "slist" - a list (Array or Period-separated string) of fields to sort by
* "options" - string of additional options. ex: `"num-200.skp-#{records_processed}"`

```javascript
var records = api.doQuery("bdjwmnj33", {"query": "{3.EX.'123'}", "clist": "3.6.10"});
=>  [
     {1: "14029302955", 7: "Lord of the Flies", 8: "William Golding"}, 
     {1: "14029302927", 7: "A Tale of Two Cities", 8: "Charles Dickens"}
    ]
```

###API_DoQueryCount
**doQueryCount(dbid, query)** => **[int] # of records in query**

```javascript
var count = api.doQueryCount("bdjwmnj33", "{'3'.EX.'123'}");
=> 39
```

###Find Single Record
**find(dbid, rid)** => **[json] record**
```javascript
var record = api.find("bdjwmnj33", "12");
=> {1: "1402930292", 7: "Lord of the Flies", 8: "William Golding"}
```

###Find First Record
**first(dbid, queryOptions)** => **[json] record**
```javascript
var record = api.first("bdjwmnj33", {"query": "{'3'.XEX.''}", "slist" : "3"});
=> {1: "1402930292", 7: "Lord of the Flies", 8: "William Golding"}
```

###Find Last Record
**last(dbid, queryOptions)** => **[json] record**
```javascript
var record = api.last("bdjwmnj33", {"query": "{'3'.XEX.''}", "slist": "3"});
=> {1: "1402933332", 7: "Animal Farm", 8: "George Orwell"}
```

###Find All Records
**all(dbid, queryOptions)** => **[array] records**
```javascript
var record = api.all("bdjwmnj33", {"slist": "3"});
=> [{1: "1402933332", 7: "Animal Farm", 8: "George Orwell"}]
```

###Find Rids
**findRids(dbid, queryOptions)** => **[array] rids**
```javascript
var rids = api.findRids("bdjwmnj33", {"query": "{'3'.GT.'100'}"});
=> ["101", "102", "103", "104"]
```

###API_ImportFromCSV
**importFromCSV(dbid, data)** => **[array] new rids**

```javascript
var new_data = [
  {7: "Lord of the Flies", 8: "William Golding"},
  {7: "A Tale of Two Cities", 8: "Charles Dickens"},
  {7: "Animal Farm", 8: "George Orwell"}
];

rids = api.importFromCSV("abcd1234", new_data);
=> [13, 14, 15]
````

###API_AddRecord
**addRecord(dbid, newRecord)** => **[int] new rid**

```javascript
var newRecord = {6: "Book", 7: "My New Title", 8: "John Smith"};
var newRid = api.addRecord("abcd1234", newRecord);
=> 13
````

###API_EditRecord
**editRecord(dbid, rid, updatedRecord )** => **[bool] success?**

```javascript
var updatedRecord = {7: "My Second Title", 8: "John Smith"};
var callSuccessful = api.editRecord("abcd1234", 136, updatedRecord);
=> false
````

###Copy Records
**copyMasterDetail(dbid, options)** => **[int] # of records copied**
```javascript
var numberCopied = api.copyMasterDetail("abcd1234", {destrid: "0", sourcerid: "1204", copyfid: "8"});
=> 1
````

###API_DeleteRecord
**deleteRecord(dbid, rid)** => **[bool] success?**

```javascript
var callSuccessful = api.deleteRecord("abcd1234", 136);
=> true
````

###API_PurgeRecords
**purgeRecords(dbid, query)** => **[int] # of records deleted**

```javascript
var numberOfRecordsDeleted = api.purgeRecords("abcd1234", "{3.EX.'123'}");
=> 9
````

###API_GetUserInfo
**getUserInfo(email)** => **[json] user**
######Ignore email parameter to get current user info

```javascript
var userInfo = api.getUserInfo();
=> {"id":"57527431.cnhu","firstName":"Kit","lastName":"Hensel","login":"kith","email":"khensel@advantagequickbase.com","screenName":"kith","isVerified":"1","externalAuth":"0"}
````

###Get User Roles
**getUserInfo(dbid)** => **[array] users & roles**

```javascript
var userInfo = api.getUserRoles("abcd1234");
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
**changeUserRole(dbid, userId, roleId, newRoleId, callback)** => **[bool] success?**

```javascript
var userInfo = api.changeUserRole("abcd1234", "57527431.cnhu", "12", "11");
=> true
````

###API_GetRecordInfo
**getRecordInfo(dbid, rid)** => **{obj} fid's and values**

```javascript
var fields = api.getRecordInfo("abcd1234", "098");
=>  { 
      "fid" : "value"... 
    }
````

###HELPER_GetTableFields
**getTableFields(dbid)** => **{obj} fields**

```javascript
var fields = api.getTableFields("abcd1234");
````

###HELPER_GetTableReports
**getTableReports(dbid)** => **{obj} fields**

```javascript
var reports = api.getTableReports("abcd1234");
````

##Base Helpers
###Get URL Parameter
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
**BaseHelpers.dateTimeToString(milliseconds)** => **[string] date/time format**

```javascript
var dateTime = BaseHelpers.dateTimeToString("1410454590146");
=> "09-01-2014 12:03 pm"
````

###DurationToString
**BaseHelpers.durationToString(milliseconds)** => **[string] hour format**

```javascript
var duration = BaseHelpers.durationToString("1410454590146");
=> "3 hours"
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

###Download File
**BaseHelpers.downloadFile(dbid, rid, fid, version)**

```javascript
BaseHelpers.downloadFile("abcd1234", 12, 5);
````

##Example
```javascript
//Initiate connection to application
var client = new Base();

//Get Ticket
var response = client.getTicket();

//Add Record
var newRecordHash = { 8: "Mike", 9: "Johnson", 10: {filename: "test.csv", body: "hello world"} }
var rid = client.addRecord(demoDbid, newRecordHash);

//Edit Record
var editRecordHash = { 8: "Stephan", 9: "Smith" }
var response = client.editRecord(demoDbid, rid, editRecordHash);

//Find
var response = client.find(demoDbid, rid);

//DoQuery
var query = "{'3'.XEX.''}"
var response = client.doQuery(demoDbid, {"query": query});

var qid = "1"
var response = client.doQuery(demoDbid, {"qid": qid, "clist": ["1", "2", "3", "4", "5"]});

var dateCreated = BaseHelpers.dateToString(response[0]["1"]);
var dateModified = BaseHelpers.dateTimeToString(response[0]["2"]);
