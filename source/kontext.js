/*global Emission*/
;(function(global) {
	'use strict';

	//  load dependencies
	//@include lib/emission

	function Kontext() {
		var kontext = this,
			emission = new Emission(),
			buffer;

		/**
		 *  Iterator over all properties and apply the callback function on each
		 *  @name    iterate
		 *  @access  internal
		 *  @param   object    target
		 *  @param   function  callback
		 *  @return  void
		 */
		function iterate(target, fn) {
			Object.keys(target).forEach(function(key, index) {
				fn(key, target[key], index);
			});
		}

		/**
		 *  Convenience function to define a property
		 *  @name    define
		 *  @access  internal
		 *  @param   object  target
		 *  @param   string  key
		 *  @param   bool    expose
		 *  @param   mixed   getter
		 *  @param   mixed   setter  [optional, default undefined - no setter]
		 *  @return  void
		 */
		function define(target, key, expose, getter, setter) {
			var definition = {
					enumerable: expose
				};
			if (typeof setter === 'boolean') {
				definition.writable = setter;
				definition.value = getter;
			}
			else {
				definition.get = getter;
				if (setter) {
					definition.set = setter;
				}
			}

			Object.defineProperty(target, key, definition);
		}

		/**
		 *  Add the on/off methods and emission the emission object
		 *  @name    emitable
		 *  @access  internal
		 *  @param   object  model
		 *  @return  object  Emission
		 */
		function emitable(model) {
			var result = new Emission();

			define(model, 'on', true, result.add, false);
			define(model, 'off', true, result.remove, false);

			return result;
		}

		/**
		 *  Register an event handler
		 *  @name    on
		 *  @access  public
		 *  @param   string    type
		 *  @param   function  handle
		 *  @return  function  handle
		 */
		kontext.on = function(type, handle) {
			return emission.add(type, handle);
		};

		/**
		 *  Remove an event handler
		 *  @name    off
		 *  @access  public
		 *  @param   string    type
		 *  @param   function  handle
		 *  @return  Array     removed handles
		 */
		kontext.off = function(type, handle) {
			return emission.remove(type, handle);
		};

		/**
		 *  Bind a model to an element, this also prepares the model so event emissions can be triggered
		 *  @name    bind
		 *  @access  public
		 *  @param   object   model
		 *  @param   DOMNode  element
		 *  @return  object   model
		 */
		kontext.bind = function(model, element) {
			var emitter;

			iterate(model, function(key, value) {
				var handle = function() {
					if (arguments.length) {
						emitter.trigger('change', [model, key, value]);
						value = arguments[0];
					}
					else {
						emitter.trigger('access', [model, key, value]);
					}

					return value;
				};

				define(model, key, true, handle, handle);
			});

			if (!('on' in model && 'off' in model)) {
				emitter = emitable(model);
			}

			return model;
		};
	}

	//  create a new Kontext instance in the global scope
	global.kontext = global.kontext || new Kontext();

})(window);
