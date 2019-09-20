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

var mapOnNull = {
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
		on: null
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

describe('json transform intentional failure test', function(){
	
	it("transform data with undefined data", function() {

		assert.deepEqual(JsonTransform(undefined, map).make(),[]);
	});
	
    it("transform data foreach with non array / object", function() {

		assert.throws(() => {JsonTransform(deepClone(data), map).foreach('tester',(key) => {
            console.log(key);
        })},Error);
    });
    
    it("transform data operate with on null", function() {

        var result = JsonTransform(deepClone(data), mapOnNull).make();
        assert.deepEqual(result,[ { name: 'TITLE1',
        info: 'mike',
        text: 'This is a blog.',
        date: '11/4/2013',
        link: 'http://goo.cm' } ]);
	});
	
	it('catch error in makeAsync', function(){
        JsonTransform(deepClone(data), map).makeAsync().then(function(table) {

        },function(err){
            return err;
        });
    });
    
});