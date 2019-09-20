const assert = require('assert');
const JsonTransform = require('../src/nativeJsonTransform.js').JsonTransform;

var data = {
	posts: [{
		title: "title1",
		description: "description1",
		blog: "This is a blog.",
		date: "11/4/2013",
		clearMe: "text to remove",
		extra: {
			link: "http://goo.cm"
		},
		list1: [{
			name: "mike"
		}],
		list2: [{
			item: "thing"
		}]
	}]
};

var map = {
	list: 'posts',
	item: {
		name: "title",
		info: "description",
		text: "blog",
		date: "date",
		link: "extra.link",
		info: "list1.0.name"
	},
	operate: [{
		run: "Date.parse",
		on: "date"
	},{
		run: function customFn( item ){
			if( 'string' === typeof item )
				return item.toUpperCase();
			return item.toString().toUpperCase();
		},
		on: "name"
	}]
};

function deepClone(data) {
	return JSON.parse(JSON.stringify(data));
}

describe("json transform Spec test", function() {

	it("should extract values", function() {

		var dataTransform = JsonTransform(deepClone(data), map);

        assert.deepEqual(dataTransform.getValue(data, "posts.0.description"),"description1");

	});

	it("should transform data", function() {

		var dataTransform = JsonTransform(deepClone(data), map);

		assert.deepEqual(dataTransform.make(),[{
			name: "TITLE1",
			info: "description1",
			text: "This is a blog.",
			date: Date.parse('11/4/2013'),
			link: "http://goo.cm",
			info: "mike"
		}]);

	});

	it("should transform data asynchronously", function(done) {
		this.timeout(10000);
		
		var jsonTransform = JsonTransform(deepClone(data), map);
		jsonTransform.makeAsync().then(function(result){
			assert.deepEqual(result,[{
				name: "TITLE1",
				info: "description1",
				text: "This is a blog.",
				date: Date.parse('11/4/2013'),
				link: "http://goo.cm",
				info: "mike"
			}]);
			done();
		});
	});

	it("should allow you to clear out fields", function() {

		// Add a map item to  clear out the "clearMe" field.
		var newMap = Object.assign({},map);
		newMap.item = deepClone(map.item);
		newMap.item.clearMe = "";

		var jsonTransform = JsonTransform(deepClone(data), newMap);

		assert.deepEqual(jsonTransform.make(),[{
			name: "TITLE1",
			info: "description1",
			text: "This is a blog.",
			date: Date.parse('11/4/2013'),
			link: "http://goo.cm",
			info: "mike",
			clearMe: ""
		}]);

	});

	it("should allow you to set fields", function() {

		// Add a map item to  clear out the "clearMe" field.
		var newMap = Object.assign({},map);
		newMap.item = deepClone(map.item);
		newMap.item.fieldThatDoesntExist = "";

		var dataTransform = JsonTransform(deepClone(data), newMap);

		assert.deepEqual(dataTransform.make(),[{
			name: "TITLE1",
			text: "This is a blog.",
			date: Date.parse('11/4/2013'),
			link: "http://goo.cm",
			info: "mike",
			fieldThatDoesntExist: ""
		}]);

	});

	it("should allow you to map arrays", function() {

		// Add a map item to  clear out the "clearMe" field.
		var newMap = {
			list: 'posts',
			item: {
				fieldGroup: ["title", "description", "blog", "extra"]
			}
		};

		var jsonTransform = JsonTransform(deepClone(data), newMap);

		assert.deepEqual(jsonTransform.make(),[{
			fieldGroup: [
				"title1",
				"description1",
				"This is a blog.", {
					link: "http://goo.cm"
				}
			]
		}]);

	});

	it("should allow you to pass arrays without specifying a list", function() {

		// Add a map item to  clear out the "clearMe" field.
		var newMap = {
			item: {
				fieldGroup: ["title", "description", "blog", "extra"]
			}
		};

		var data = [{
			title: "title1",
			description: "description1",
			blog: "This is a blog.",
			date: "11/4/2013",
			clearMe: "text to remove",
			extra: {
				link: "http://goo.cm"
			},
			list1: [{
				name: "mike"
			}],
			list2: [{
				item: "thing"
			}]
		}];

		var jsonTransform = JsonTransform(deepClone(data), newMap);

		assert.deepEqual(jsonTransform.make(),[{
			fieldGroup: [
				"title1",
				"description1",
				"This is a blog.", {
					link: "http://goo.cm"
				}
			]
		}]);

	});

	it("should allow you to use custom functions as operators", function(){
		var newMap = deepClone(map);

		newMap.operate = [{
			run: function (val){ 
				return val + " more info"; 
			}, 
			on: "info"
		}];

		var jsonTransform = JsonTransform(data, newMap);

		var result = jsonTransform.make();
		assert.deepEqual(result,[{ 
			name: 'title1',
		    info: 'mike more info',
		    text: 'This is a blog.',
		    date: '11/4/2013',
		    link: 'http://goo.cm' 
		}]);
	})

	it("should allow multiple operators", function(){
		var newMap = deepClone(map);

		newMap.operate = [
			{
				run: function (val){ 
					return val + " more info"; 
				}, 
				on: "info"
			},
			{
				run: function (val){ 
					return val + " more text"; 
				}, 
				on: "text"
			}
		];

		var jsonTransform = JsonTransform(data, newMap);

		var result = jsonTransform.make();
		assert.deepEqual(result,[{ 
			name: 'title1',
		    info: 'mike more info',
		    text: 'This is a blog. more text',
		    date: '11/4/2013',
		    link: 'http://goo.cm' 
		}]);
	})


	it("should allow each function to run on all items", function(){
		
		var data = {
			posts: [
				{name: "peter"},
				{name: "paul"},
				{name: "marry"}
			]
		};

		var map = {
			list: 'posts',
			each: function(item){
				item.iterated = true;
				return item;
			}
		};

		var jsonTransform = JsonTransform(data, map);

		var result = jsonTransform.make();
		assert.deepEqual(result,[
			{name: "peter", iterated: true},
			{name: "paul", iterated: true},
			{name: "marry", iterated: true}
		]);

	});

	it("should be able to combine mapping with each", function(){
		
		var data = {
			posts: [
				{name: "peter"},
				{name: "paul"},
				{name: "marry"}
			]
		};

		var map = {
			list: 'posts',
			item: {
				title: 'name',
			},
			each: function(item){
				item.iterated = true;
				return item;
			}
		};

		var jsonTransform = JsonTransform(data, map);

		var result = jsonTransform.make();
		assert.deepEqual(result,[
			{title: "peter", iterated: true},
			{title: "paul", iterated: true},
			{title: "marry", iterated: true}
		]);

	});

	it("should delete attributes", function(){
		
		var data = {
			posts: [
				{name: "peter", unwanted: true},
				{name: "paul", unwanted: true},
				{name: "marry", unwanted: true}
			]
		};

		var map = {
			list: 'posts',
			remove: ['unwanted']
		};

		var jsonTransform = JsonTransform(data, map);

		var result = jsonTransform.make();

		assert.deepEqual(result,[
			{name: "peter"},
			{name: "paul"},
			{name: "marry"}
		]);

	});

	it("should use default attributes for missing data", function(){
		
		var data = {
			posts: [
				{name: "peter", valid: true},
				{name: "paul", valid: true},
				{name: "marry"}
			]
		};

		var map = {
			list: 'posts',
			item: {
				verified: 'valid',
				name: 'name'
			},
			defaults: {
				verified: false
			}
		};

		var jsonTransform = JsonTransform(data, map);

		var result = jsonTransform.make();

		assert.deepEqual(result,[
			{name: "peter", verified:true},
			{name: "paul", verified:true},
			{name: "marry", verified:false}
		]);

	});

	it("should exclude data if not specified", function(){
		
		var data = {
			posts: [
				{name: "peter", unwanted: true},
				{name: "paul", unwanted: true},
				{name: "marry", unwanted:true}
			]
		};

		var map = {
			list: 'posts',
			item: {
				name: 'name'
			}
		};

		var jsonTransform = JsonTransform(data, map);

		var result = jsonTransform.make();

		assert.deepEqual(result,[
			{name: "peter"},
			{name: "paul"},
			{name: "marry"}
		]);

	});

});