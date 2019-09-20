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
		name: "title",
	}
};

function deepClone(data) {
	return JSON.parse(JSON.stringify(data));
}

describe("json transform mutationSpec test", function() {

	it("should not manipulate the raw data", function() {

		var clone = deepClone(data);
		var jsonTransform = JsonTransform(data, map).make();
        assert.deepEqual(clone,data);

	});

	it("should not manipulate the raw data", function() {

		var clone = deepClone(map);
		var jsonTransform = JsonTransform(data, map).make();
        assert.deepEqual(clone,map);

	});

});