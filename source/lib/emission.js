'use strict';

function Emission() {
	var emission = this,
		collection = [];

	function trigger(list, arg) {
		if (list.length && list.shift().apply(null, arg) !== false) {
			trigger(list, arg);
		}
	}

	emission.add = function(type, handle) {
		collection.push({
			type: type,
			handle: handle
		});
	};

	emission.list = function(type) {
		return collection.filter(function(config) {
			return type === '*' || config.type === type;
		});
	};

	emission.remove = function(type, handle) {
		var removed = [];

		collection = collection.filter(function(config) {
			if ((!type || config.type === type) && (!handle || config.handle === handle)) {
				removed.push(config.handle);

				return false;
			}

			return true;
		});

		return removed;
	};

	emission.trigger = function() {
		var arg = Array.prototype.slice.call(arguments),
			type = typeof arg[0] === 'string' ? arg.shift() : '*',
			list = emission.list(type)
				.map(function(config) {
					return config.handle;
				});

		trigger(list, arg);
	};
}
