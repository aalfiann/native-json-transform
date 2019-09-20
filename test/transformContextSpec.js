const assert = require('assert');
const JsonTransform = require('../src/nativeJsonTransform.js').JsonTransform;

var data = {
	posts: [{
		title: "title1"
	}]
};

var map = {
	list: 'posts',
	item: {
		greeting: "title"
	},
	operate: [{
		run: function customFn( item, context ){
			return context.intro + item;
		},
		on: "greeting"
	}]
};

var mapEach = {
	list: 'posts',
	item: {
		greeting: "title"
	},
	each: function eachFn( item, index, collection, context ){
		item.greeting = context.intro + item;
		return item;
	}
};

function deepClone(data) {
	return JSON.parse(JSON.stringify(data));
}

describe("json transform ContextSpec test", function() {

	it("should pass the context to operate.run", function() {

		var jsonTransform = JsonTransform(deepClone(data), map);

		var context = {
			intro: 'Hi '
		};

        assert.deepEqual(jsonTransform.make(context),[{
			greeting: "Hi title1"
		}]);

	});

	it("should pass the context to each", function() {

        var jsonTransform = JsonTransform(deepClone(data), map);

        var context = {
            intro: 'Hi '
        };

        assert.deepEqual(jsonTransform.make(context),[{
            greeting: "Hi title1"
        }]);

	});

	it("should always return an array", function() {

        var jsonTransform = JsonTransform({}, {});
        assert.deepEqual(Array.isArray(jsonTransform.make()),true);

	});

});