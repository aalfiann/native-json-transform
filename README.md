# native-json-transform
[![NPM](https://nodei.co/npm/native-json-transform.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/native-json-transform/)  
  
[![npm version](https://img.shields.io/npm/v/native-json-transform.svg?style=flat-square)](https://www.npmjs.org/package/native-json-transform)
[![Build Status](https://travis-ci.com/aalfiann/native-json-transform.svg?branch=master)](https://travis-ci.com/aalfiann/native-json-transform)
[![Coverage Status](https://coveralls.io/repos/github/aalfiann/native-json-transform/badge.svg?branch=master)](https://coveralls.io/github/aalfiann/native-json-transform?branch=master)
[![Known Vulnerabilities](https://snyk.io//test/github/aalfiann/native-json-transform/badge.svg?targetFile=package.json)](https://snyk.io//test/github/aalfiann/native-json-transform?targetFile=package.json)
![NPM download/month](https://img.shields.io/npm/dm/native-json-transform.svg)
![NPM download total](https://img.shields.io/npm/dt/native-json-transform.svg)  
Restructuring and performing operations on JSON on the fly for NodeJS.

## Background
This is a fork version form original [node-json-transform](https://github.com/bozzltron/node-json-transform).  
The difference about this with original version is that we already removed `Lodash` dependencies. So this library has no dependencies anymore. That is why we call it `native-json-transform`.

**Note:**
- Code slightly different with original but all features is same.
- Minimum requirement `NodeJS 6`.

## Install use NPM
```bash
$ npm install native-json-transform
```

## Usage

### Basic Example

```javascript
var JsonTransform = require("native-json-transform").JsonTransform;
```

First we need some data.

```javascript
var data = {
	posts : [
		{
			title : "title1",
			description: "description1",
			blog: "This is a blog.",
			date: "11/4/2013",
			extra : {
				link : "http://goo.cm"
			},
			list1:[
				{
					name:"mike"
				}
			],
			list2:[
				{
					item: "thing"
				}
			],
			clearMe: "text"
		}
	]
};
```

The map defines how the output will be structured and which operations to run.

```javascript
var map = {
	list : 'posts',
	item: {
		name: "title",
		info: "description",
		text: "blog",
		date: "date",
		link: "extra.link",
		item: "list1.0.name",
		clearMe: "",
		fieldGroup: ['title', 'extra']
	},
	operate: [
		{
			run: "Date.parse", on: "date"
		},
		{
			run: function(val) { return val + " more info"}, on: "info"
		}
	],
	each: function(item){
		// make changes
		item.iterated = true;
		return item;
	}
}
};
```
You can read this as follows:
- Get the array of objects in "posts".
- Map the name to title, info to description etc.
- Run Data.parse on the date value.
- Run each function on all items after mapping and operations.

Run it synchronously
```javascript
var jsonTransform = JsonTransform(data, map);
var result = jsonTransform.make();
console.log(result);
```
... or asynchronously
```javascript
var jsonTransform = JsonTransform(data, map);
var promise = jsonTransform.makeAsync();
promise.then((function(result){
	console.log(result);
});
```

The expected output.
```javascript
[
	{
		name : "title1",
		info: "description1",
		text: "This is a blog.",
		date: 1383544800000,
		link: "http://goo.cm",
		info: "mike more info",
		clearMe: "",
		fieldGroup: ['title1', { link : "http://goo.cm" }],
		iterated: true
	}
]
```


### Advanced Example

```
var map = {
	list: 'items',
	item: {
		id: 'id',
		sku: 'sku',
		zero: 'zero',
		toReplace: 'sku',
		errorReplace: 'notFound',
		simpleArray: ['id', 'sku','sku'],
		complexArray: [ {node: 'id'} , { otherNode:'sku' } , {toReplace:'sku'} ],
		subObject: {
			node1: 'id',
			node2: 'sku',
			subSubObject: {
				node1: 'id',
				node2: 'sku',
			}
		},
		remove: ['unwanted']
	},
	defaults: {
		"missingData": true
	},
	operate: [
		{
			run: (val) => 'replacement',
			on: 'subObject.subSubObject.node1'
		},
		{
			run: (val) => 'replacement',
			on: 'errorReplace'
		},
		{
			run: (val) => 'replacement',
			on: 'toReplace'
		},
			{
			run: (val) => 'replacement',
			on: 'simpleArray.2'
		},
		{
			run: (val) => 'replacement',
			on: 'complexArray.2.toReplace'
		}
	]
};

var object = {
	items:[
		{
			id: 'books',
			zero: 0,
			sku:'10234-12312',
			unwanted: true
		}
	]
};

var result = JsonTransform(data, map).make();
```

The expected output.
```
[
	{
	    "id": "books",
	    "sku": "10234-12312",
	    "zero": 0,
	    "toReplace": "replacement",
	    "errorReplace": "replacement",
	    "simpleArray": [
	        "books",
	        "10234-12312",
	        "replacement"
	    ],
	    "complexArray": [
	        {
	            "node": "books"
	        },
	        {
	            "otherNode": "10234-12312"
	        },
	        {
	            "toReplace": "replacement"
	        }
	    ],
	    "subObject": {
	        "node1": "books",
	        "node2": "10234-12312",
	        "subSubObject": {
	            "node1": "replacement",
	            "node2": "10234-12312"
	        }
	    },
		"missingData": true
	}
]
```

### Multi-template Example

```
var data = {
    products: [{
        id: 'books0',
        zero: 0,
        sku: '00234-12312',
        subitems: [
            { subid: "0.0", subsku: "subskuvalue0.0" },
            { subid: "0.1", subsku: "subskuvalue0.1" }
        ]
    }, {
        id: 'books1',
        zero: 1,
        sku: '10234-12312',
        subitems: [
            { subid: "1.0", subsku: "subskuvalue1.0" },
            { subid: "1.1", subsku: "subskuvalue1.1" }
        ]
    }]
};

var baseMap = {
	'list': 'products',
	'item' : {
		'myid': 'id',
		'mysku': 'sku',
		'mysubitems': 'subitems'
	},
    operate: [
        {
            'run': function(ary) { 
            	return JsonTransform({list:ary}, nestedMap).make();
            }, 
            'on': 'mysubitems'
        }
    ]
};

var nestedMap = {
	'list': 'list',
	'item' : {
		'mysubid': 'subid',
		'mysubsku': 'subsku'
	}
};

var result = JsonTransform(data, baseMap).make();
```

The expected output.

```
[
	{
	    "myid": "books0",
	    "mysku": "00234-12312",
	    "mysubitems": [
	    	{ "mysubid": "0.0", "mysubsku": "subskuvalue0.0" }, 
	    	{ "mysubid": "0.1", "mysubsku": "subskuvalue0.1"}
	    ]
	}, 
	{
	    "myid": "books1",
	    "mysku": "10234-12312",
	    "mysubitems": [
	    	{ "mysubid": "1.0", "mysubsku": "subskuvalue1.0" }, 
	    	{ "mysubid": "1.1", "mysubsku": "subskuvalue1.1" }
	    ]
	}
]
```

### Context Example

First we need some data.

```javascript
    var data = {
        posts : [
            {
                title : "title1",
                description: "description1"
            }
        ]
    };
```

The map defines how the output will be structured and which operations to run.

```javascript
    var map = {
        list : 'posts',
        item: {
            name: "title",
            info: "description"
        },
        operate: [
            {
                run: function(val, context) { return val + " more info for" + context.type},
                on: "info"
            }
        ],
        each: function(item, index, collection, context){
            // make changes
            item.type = context.type;
            return item;
        }
    };
```

Run it
```javascript
    var jsonTransform = JsonTransform(data, map);
    var context = { type: 'my-type' };
    var result = jsonTransform.make(context);
    console.log(result);
```

The expected output.
```javascript
    [
        {
            name : "title1",
            info: "description1 more info for my-type",
            type: 'my-type'
        }
    ]
```


Enjoy!


## Unit Test
Unit test has been replaced from `jasmine-node` to `mocha` for better unit test.
```bash
$ npm test
```