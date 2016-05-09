'use strict';

/**
 *  Settings helper
 *  @name     Settings
 *  @package  Kontext
 */
function Settings() {  //  eslint-disable-line no-unused-vars
	var settings = this;

	/**
	 *  Determine if the provided value is an object that can be inherited (e.g. not null, Array, RegExp)
	 *  @name    isInheritable
	 *  @access  internal
	 *  @param   mixed  target
	 *  @return  bool   inheritable
	 */
	function isInheritable(obj) {
		return obj && typeof obj === 'object' && !(obj instanceof RegExp || obj instanceof Array);
	}

	/**
	 *  Merge two objects, adding/overruling values from b onto a
	 *  @name    merge
	 *  @access  internal
	 *  @param   Object  a
	 *  @param   Object  b
	 *  @return  Object  a
	 */
	function merge(a, b) {
		Object.keys(b)
			.filter(function(key) {
				return b.hasOwnProperty(key);
			})
			.forEach(function(key) {
				var value = b[key];

				a[key] = isInheritable(value) ? merge(isInheritable(a[key]) ? a[key] : {}, value) : value;
			});

		return a;
	}

	/**
	 *  Resolve any object key containing a (presumed) path (e.g. 'some.nesting') to its full
	 *  object representation
	 *  @name    expand
	 *  @param   Object  source
	 *  @return  Object  expanded
	 */
	function expand(source) {
		var result = {};

		Object.keys(source)
			.forEach(function(path) {
				var target = result;

				path.split('.')
					.forEach(function(key, index, all) {
						if (index === all.length - 1) {
							target[key] = isInheritable(source[path]) ? expand(source[path]) : source[path];
						}
						else {
							if (!(key in target)) {
								target[key] = {};
							}
							target = target[key];
						}
					});
			});

		return result;
	}

	/**
	 *  Decorate an accessor method on the Settings module with the signature ([key, [value]])
	 *  The method will have private access to its own specific storage
	 *  @name    accessor
	 *  @access  internal
	 *  @param   string  name
	 *  @return  void
	 */
	function accessor(name) {
		var collection = {};

		settings[name] = function(key, value) {
			if (typeof key === 'string') {
				if (arguments.length > 1) {
					collection[key] = value;
				}

				return collection[key];
			}
			else if (typeof key === 'object') {
				merge(collection, key);
			}

			return collection;
		};
	}

	/**
	 *  Initializer - setting up the defaults
	 *  @name    init
	 *  @access  internal
	 *  @return  void
	 */
	function init() {
		//  All values in the array will become methods for the Settings module
		['_', 'public'].forEach(accessor);
	}

	/**
	 *  Combine the given object with the public settings without changing the default settings
	 *  @name    combine
	 *  @access  public
	 *  @param   object  override
	 *  @return  object  combined
	 */
	settings.combine = function(override) {
		return merge(merge({}, settings.public()), expand(override || {}));
	};

	init();
}
