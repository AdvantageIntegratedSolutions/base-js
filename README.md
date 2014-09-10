#BaseJS

QuickBase API Javascript Library w/ JSON

version 1.0
https://s3.amazonaws.com/ais_libraries/BaseJS/1.0/base.js

##Example
```javascript
//Create a new API connection
api = new Base();

// Load all of the Books in our table
queryOptions = {"query": "{6.EX.'Book'}", "clist": "7"}
books = api.doQuery('booksDbid', queryOptions)

// => [{"7" => "Lord of the Flies"}, {"7" => "The Giver"}]
```

##API Documentation
###New Connection

```javascript
api = new Base();
```

###Query Records
**doQuery(dbid, queryOptions) => [Array] records

"queryOptions" expects a hash containing any of the following options:

* "query" - typical Quickbase query string. ex: `"{3.EX.'123'}"`
* "qid" - report or query id to load (should not be used with `query` or `qname`)
* "clist" - a list (Period-separated string) of fields to return
* "slist" - a list (Period-separated string) of fields to sort by
* "options" - string of additional options. ex: `"num-200.skp-#{records_processed}"`

```javascript
records = api.doQuery("bdjwmnj33", {"query": "{3.EX.'123'}", "clist": "3.6.10"})
```

###Count Queried Record
**doQueryCount(dbid, query)** => **[string] Number of found in Query**

```javascript
count = api.doQueryCount("bdjwmnj33", "{'3'.EX.'123'}")
```

###Find Single Record
**find( dbid, rid)** => **[json] record**
```javascript
record = api.find("bdjwmnj33", "12")
```

###Add Record
**addRecord(dbid, newRecord)** => **[string] New Record Id**

```javascript
newRecord = {6 => "Book", 7 => "My New Title", 8 => "John Smith"}
newRid = api.addRecord("abcd1234", newRecord)
````

###Edit Record
**editRecord(dbid, rid, updatedRecord )** => **[bool] Success?**

```javascript
updatedRecord = {7 => "My Second Title", 8 => "John Smith"}
callSuccessful = api.editRecord("abcd1234", 136, updatedRecord)
````

###Delete Record
**deleteRecord(dbid, rid)** => **[bool] Success?**

```javascript
callSuccessful = api.deleteRecord("abcd1234", 136)
````

###Delete Mass Records
**purgeRecords(dbid, options)** => **[string] # of records deleted**

`options` expects a hash containing any of the following options:

* `query` - typical Quickbase query string. ex: `"{3.EX.'123'}"`

```javascript
numberOfRecordsDeleted = api.purgeRecords('abcd1234', "{3.EX.'123'}")
````

###Get Table Fields
Get the complete list of fields for a table

**getTableFields(dbid)**

```javascript
fields = api.getTableFields("abcd1234")
````

###Import Records
**importRecords(dbid, data)** => **[array] New Record Ids**

```javascript
new_data = [
  {"7": "Lord of the Flies", "8": "William Golding"},
  {"7": "A Tale of Two Cities", "8": "Charles Dickens"},
  {"7": "Animal Farm", "8": "George Orwell"}
]

rids = api.importRecords("abcd1234", new_data )
````