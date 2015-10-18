'use strict';

/**
 *  Event Emission wrapper
 *  @name     Emission
 *  @package  Kontext
 */
function Emission() {
	var emission = this,
		collection = [];

	/**
	 *  Trigger an array of callbacks, stopping if a handler returns false
	 *  @name    trigger
	 *  @access  internal
	 *  @param   array     callbacks
	 *  @param   array     arguments
	 *  @param   function  callback
	 *  @return  void
	 */
	function trigger(list, arg, done) {
		setTimeout(function() {
			if (list.length && list.shift().apply(null, arg) !== false) {
				return trigger(list, arg, done);
			}

			done();
		}, 0);
	}

	/**
	 *  Add a handler for type
	 *  @name    add
	 *  @access  public
	 *  @param   string  type
	 *  @param   function  handle
	 *  @param   number    invocations  [optional, default undefined - Infinite invocations]
	 *  @return  function  handle
	 */
	emission.add = function(type, handle, invocations) {
		collection.push({
			type: type,
			handle: handle,
			invoke: invocations || Infinity
		});

		return handle;
	};

	/**
	 *  Remove handles by type and/or handle
	 *  @name    remove
	 *  @access  public
	 *  @param   string    type    [optional, default undefined - don't consider the type]
	 *  @param   function  handle  [optional, default undefined - don't consider the handle]
	 *  @return  array     removed
	 */
	emission.remove = function(type, handle) {
		var removed = [];

		//  filter the collection, keeping track of every item filtered out
		collection = collection.filter(function(config) {
			if ((!type || config.type === type) && (!handle || config.handle === handle)) {
				removed.push(config.handle);

				return false;
			}

			return true;
		});

		return removed;
	};

	/**
	 *  List all registered handles optionally filtered by type
	 *  @name    list
	 *  @access  public
	 *  @param   string  type
	 *  @return  array   handlers
	 */
	emission.list = function(type) {
		return collection.filter(function(config) {
			return !type || type === '*' || config.type === type;
		});
	};

	/**
	 *  List all registered handles optionally filtered by type
	 *  @name    list
	 *  @access  public
	 *  @param   string  type
	 *  @return  array   handlers
	 */
	emission.trigger = function(type, arg, done) {
		var list = emission.list(type)
				.map(function(config) {
					if (config.invoke < Infinity) {
						return function() {
							if (--config.invoke <= 0) {
								emission.remove(type, config.handle);
							}

							return config.handle.apply(null, arguments);
						};
					}

					return config.handle;
				});

		if (arguments.length < 3 && typeof arguments[arguments.length - 1] === 'function') {
			done = arg;
			arg = [];
		}

		//  pass on the list of handles to be triggered
		trigger(list, arg instanceof Array ? arg : [arg], function() {
			if (done) {
				done();
			}
		});
	};
}
