// JsonTransform

exports.JsonTransform = function(data, map){

	return {

		foreach(data,callback) {
			if(this.isObject(data)) {
				var keys = Object.keys(data);
				var values = Object.values(data);
				var i =0;
				var l = keys.length;
				for(i;i<l;i++){
					callback(values[i],keys[i]);
				}
			} else {
				if(Array.isArray(data)) {
					data.forEach(function(value,key){
						callback(value,key);
					});
				} else {
					throw new Error('Failed to iteration. Data is not an array or object.');
				}
			}
		},

		isObject (value) {
			return value && typeof value === 'object' && value.constructor === Object;
		},

		isEmptyObject: function(value) {
			return (value === undefined || value === null || (Object.keys(value).length === 0 && value.constructor === Object));
		},

		defaultOrNull: function(key) {
			return key && map.defaults ? map.defaults[key] : null;
		},

		getValue : function(obj, key, newKey) {

			if(typeof obj === 'undefined') {
				return;
			}

			if(key == undefined || key == null || key == '') {
				return obj;
			}

			var value = obj;
			var keys = null;

			keys = key.split('.');
			for(var i = 0; i < keys.length; i++ ) {
				if(typeof(value) !== "undefined" && 
					keys[i] in value) {
					value = value[keys[i]];
				} else {
					return this.defaultOrNull(newKey);
				}
			}
			
			return value;

		},

		setValue : function(obj, key, newValue) {

			if(typeof obj === "undefined" || key == undefined || key == '') {
				return;
			}
			
			var keys = key.split('.');
			var target = obj;
			var i = 0;
			var l = keys.length;
			for(i; i < l; i++ ) {
				if(i === keys.length - 1) {
					target[keys[i]] = newValue;
					return;
				}
				if(keys[i] in target)
					target = target[keys[i]];
				else return;
			}
		},

		getList: function(){
			return this.getValue(data, map.list);
		},

		make : function(context) {

			var value = this.getValue(data, map.list);
			var normalized = [];

			if(!this.isEmptyObject(value)) {
				var list = this.getList();
				normalized = map.item ? list.map(this.iterator.bind(this, map.item)) : list;
				normalized = this.operate.bind(this, normalized)(context);
				normalized = this.each(normalized, context);
				normalized = this.removeAll(normalized);
			}
			
			return normalized;

		},

		makeAsync : function(context) {
			return new Promise(function(resolve) {
				resolve(this.make(context));
			}.bind(this));
		},

		removeAll: function(data){
			if (Array.isArray(map.remove)) {
				this.foreach(data, this.remove);
			}
			return data;
		},

		remove: function(item){
			map.remove.forEach(function (key) {
				delete item[key];
			})
			return item;
		},

		operate: function(data, context) {

			if(map.operate) {
				this.foreach(map.operate,function(method){
					data = data.map(function(item){
						var fn;
						if( 'string' === typeof method.run ) {
							fn = eval( method.run );
						} else {
							fn = method.run;
						}
						this.setValue(item,method.on,fn(this.getValue(item,method.on), context));
						return item;
					}.bind(this));
				}.bind(this));
			}
			return data;

		},

		each: function(data, context){
			if( map.each ) {
				data.forEach(function (value, index, collection) {
					return map.each(value, index, collection, context);
				});
			}  
			return data;
		},

		iterator : function(map, item) {

			var obj = {};

			//to support simple arrays with recursion
			if(typeof map === 'string') {
				return this.getValue(item, map);
			}
			
			this.foreach(map, function(oldkey, newkey) {
				if(typeof oldkey === 'string' && oldkey.length > 0) {
					obj[newkey] = this.getValue(item, oldkey, newkey);
				} else if( Array.isArray(oldkey) ) {
					var array = oldkey.map(function(item,map) {return this.iterator(map,item)}.bind(this , item));//need to swap arguments for bind
					obj[newkey] = array;
				}  else if(typeof oldkey === 'object'){
					var bound = this.iterator.bind(this, oldkey,item);
					obj[newkey] = bound();
				}
				else {
					obj[newkey] = "";
				}
			}.bind(this));
			
			return obj;

		}

	};

};
