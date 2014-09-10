#BaseJS

QuickBase API Javascript Library

##Example
```javascript
//Create a new API connection
qbApi = new Base();

# Load all of the Books in our table
query_options = {"query": "{6.EX.'Book'}", "clist": "7"}
books = qbApi.DoQuery('books_db_id', query_options)

console.log(books)
# => [ {"7" => "Lord of the Flies"}, {"7" => "The Giver"} ]
```

##API Documentation
###New Connection

```javascript
qbApi = new Base();

###Do Query

**DoQuery(dbid, queryOptions) => [json] record
**do\_query( db\_id, query\_options )** => **[json] records**

`query_options` expects a hash containing any of the following options:

* `query` - typical Quickbase query string. ex: `"{3.EX.'123'}"`
* `qid` - report or query id to load (should not be used with `query` or `qname`)
* `clist` - a list (Array or period-separated string) of fields to return
* `slist` - a list (Array or period-separated string) of fields to sort by
* `options` - string of additional options. ex: `"num-200.skp-#{records_processed}"`


```javascript
records = qbApi.DoQuery( 'bdjwmnj33', {query: "{3.EX.'123'}", clist: "3.6.10"} )
```

###Add Record
**AddRecord( dbid, newData)** => **[string] New Record Id**

```javascript
newData = { 6 => 'Book', 7 => 'My New Title', 8 => 'John Smith'}
newRecordId = qbApi.AddRecord( 'abcd1234', newData )
````

###Edit Record
**EditRecord( dbid, recordID, newData )** => **[bool] Success?**

```javascript
newData = { 7 => 'My Second Title', 8 => 'John Smith'}
callSuccessful = qbApi.EditRecord( 'abcd1234', 136, newData )
````

###Delete Record
**DeleteRecord( dbid, recordID )** => **[bool] Success?**

```javascript
callSuccessful = qbApi.DeleteRecord( 'abcd1234', 136 )
````

###Purge Records
**PurgeRecords( dbid, options )** => **[string] Records Deleted**

`options` expects a hash containing any of the following options:

* `query` - typical Quickbase query string. ex: `"{3.EX.'123'}"`

```javascript
recordDeleted = qbApi.PurgeRecords( 'abcd1234', {query: "{3.EX.'123'}"} )
````

###Get Table Fields
Get the complete list of fields for a table


**GetTableFields(dbid)**

```javascript
fields = qbApi.GetTableFields( 'abcd1234' )
````

###Import From CSV
**ImportFromCSV( dbid, data)** => **[array] New Record Ids**

```javascript
new_data = [
  {'7': 'Lord of the Flies', '8': William Golding'],
  {'7': 'A Tale of Two Cities', '8': 'Charles Dickens'],
  {'7': 'Animal Farm', '8': 'George Orwell']
]
record_ids = qbApi.ImportFromCSV( 'abcd1234', new_data )
````