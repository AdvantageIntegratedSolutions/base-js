#BaseJS

QuickBase API Javascript Library w/ JSON

version 1.0
https://s3.amazonaws.com/ais_libraries/BaseJS/1.0/base.min.js

##API Documentation
###New Connection

```javascript
var api = new Base();
```

###Get Ticket
**getTicket() => [string] ticket**

```javascript
var ticket = api.getTicket();
```

###Query Records
**doQuery(dbid, queryOptions) => [array] records**

"queryOptions" expects a hash containing any of the following options:

* "query" - typical Quickbase query string. ex: `"{3.EX.'123'}"`
* "qid" - report or query id to load (should not be used with `query` or `qname`)
* "clist" - a list (Array or Period-separated string) of fields to return
* "slist" - a list (Array or Period-separated string) of fields to sort by
* "options" - string of additional options. ex: `"num-200.skp-#{records_processed}"`

```javascript
var records = api.doQuery("bdjwmnj33", {"query": "{3.EX.'123'}", "clist": "3.6.10"})
```

###Count Queried Records
**doQueryCount(dbid, query)** => **[int] # of records in query**

```javascript
var count = api.doQueryCount("bdjwmnj33", "{'3'.EX.'123'}")
```

###Find Single Record
**find(dbid, rid)** => **[json] record**
```javascript
var record = api.find("bdjwmnj33", "12")
```

###Import Records
**importRecords(dbid, data)** => **[array] new rids**

```javascript
var new_data = [
  {"7": "Lord of the Flies", "8": "William Golding"},
  {"7": "A Tale of Two Cities", "8": "Charles Dickens"},
  {"7": "Animal Farm", "8": "George Orwell"}
]

rids = api.importRecords("abcd1234", new_data )
````

###Add Record
**addRecord(dbid, newRecord)** => **[string] new rid**

```javascript
var newRecord = {6 => "Book", 7 => "My New Title", 8 => "John Smith"}
var newRid = api.addRecord("abcd1234", newRecord)
````

###Edit Record
**editRecord(dbid, rid, updatedRecord )** => **[bool] success?**

```javascript
var updatedRecord = {7 => "My Second Title", 8 => "John Smith"}
var callSuccessful = api.editRecord("abcd1234", 136, updatedRecord)
````

###Delete Record
**deleteRecord(dbid, rid)** => **[bool] success?**

```javascript
var callSuccessful = api.deleteRecord("abcd1234", 136)
````

###Delete Mass Records
**purgeRecords(dbid, options)** => **[int] # of records deleted**

```javascript
var numberOfRecordsDeleted = api.purgeRecords('abcd1234', "{3.EX.'123'}");
````

###Get Table Fields
**getTableFields(dbid)** => **[array] fields**

```javascript
var fields = api.getTableFields("abcd1234");
````
##Base Helpers

###Get URL Parameter
**BaseHelpers.getUrlParam(name)** => **[string] param value**

```javascript
var name = BaseHelpers.getUrlParam('name');
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
````

##Example
```javascript
//Initiate connection to application
var client = new Base();

//Get Ticket
var ticket = client.getTicket();

//Add Record
var newRecordHash = { 8: "Mike", 9: "Johnson" }
var rid = client.addRecord(demoDbid, newRecordHash);

//Edit Record
var editRecordHash = { 8: "Stephan", 9: "Smith" }
var response = client.editRecord(demoDbid, rid, editRecordHash);

//Find Single Record
var response = client.find(demoDbid, rid);

//Query Records
var query = "{'3'.XEX.''}"
var response = client.doQuery(demoDbid, {"query": query})

var qid = "1"
var response = client.doQuery(demoDbid, {"qid": qid, "clist": ["1", "2", "3", "4", "5"})

//Count Queried Records
var query = "{'3'.XEX.''}"
var response = client.doQueryCount(demoDbid, query)

//Delete Record
var response = client.deleteRecord(demoDbid, rid);

//Import Records
var csvArray = [
	{ 8: 'Mike"s', 9: "John" },
	{ 8: "Step,hani'e", 9: "Wallace" },
	{ 8: "Jackson", 9: "Williams" },
	{ 8: "Martin", 9: "Douglas" }
]
var response = client.importRecords(demoDbid, csvArray);

//Delete Mass Records
var response = client.purgeRecords(demoDbid, "{'3'.XEX.''}")

//Get Table Fields
var response = client.getTableFields(demoDbid);
```