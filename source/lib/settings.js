'use strict';

/**
 *  Settings helper
 *  @name     Settings
 *  @package  Kontext
 */
function Settings() {
	var settings = this;

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
	 *  Merge two objects, adding/overruling values from b onto a
	 *  @name    merge
	 *  @access  internal
	 *  @param   Object  a
	 *  @param   Object  b
	 *  @return  Object  a
	 */
	function merge(a, b) {
		Object.keys(b)
			.forEach(function(key) {
				if (typeof b[key] === 'object' && b[key]) {
					a[key] = merge(typeof a[key] === 'object' ? a[key] : b[key] instanceof RegExp ? b[key] : {}, b[key]);
				}
				else {
					a[key] = b[key];
				}
			});

		return a;
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
	 *  Combine the given object with the public settings without changing the default settings
	 *  @name    combine
	 *  @access  public
	 *  @param   object  override
	 *  @return  object  combined
	 */
	settings.combine = function(override) {
		return merge(merge({}, settings.public()), override || {});
	};

	init();
}
