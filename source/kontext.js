/*global Attribute, Emission, Settings, Text*/
;(function(global) {
	'use strict';

	//  load dependencies
	//@include lib/settings
	//@include lib/emission
	//@include lib/text
	//@include lib/attribute

	function Kontext() {
		var kontext = this,
			settings = new Settings(),
			emission = new Emission();

		/**
		 *  Initializer, set up Kontext defaults
		 *  @name    init
		 *  @access  internal
		 *  @return  void
		 */
		function init() {
			//  internal settings
			settings._({
				rAF: global.requestAnimationFrame || function(f) {
					setTimeout(f, 1e3 / 60);
				},

				extension: {}
			});

			//  public settings (this is what is provided/changed when using the kontext.defaults method)
			settings.public({
				greedy: true,
				attribute: 'data-kontext'
			});
		}

		/**
		 *  Iterator over all properties and apply the callback function on each
		 *  @name    eachKey
		 *  @access  internal
		 *  @param   object    target
		 *  @param   function  callback
		 *  @return  void
		 */
		function eachKey(target, fn) {
			Object.keys(target).forEach(function(key, index) {
				fn(key, target[key], index);
			});
		}

		/**
		 *  Convert given array-like value to be a true array
		 *  @name    castToArray
		 *  @access  internal
		 *  @param   Array-like  value
		 *  @return  Array  value
		 */
		function castToArray(cast) {
			return Array.prototype.slice.call(cast);
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

			//  if the setter is a boolean value, there will be no getter/setter function but a value
			//  the boolean value in setter indicates whether the value is writable
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
		 *  Obtain and/or register an extension to be defined in the data attribute
		 *  @name    extension
		 *  @access  internal
		 *  @param   string    name
		 *  @param   function  handler  [optional, default undefined - obtain the extension]
		 *  @return  function  handler
		 */
		function extension(name, handler) {
			var ext = settings._('extension') || {};

			if (handler) {
				ext[name] = handler;
				settings._('extension', ext);
			}

			if (!(name in ext)) {
				return function() {
					console.error('Kontext: Unknown extension "' + name + '"');
				};
			}

			return ext[name];
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

			//  define the (immutable) on/off methods
			define(model, 'on', true, result.add, false);
			define(model, 'off', true, result.remove, false);

			//  kontext itself can (and will) emit update 'events' when models are updated
			//  therefor we subscribe to model updates and re-send them
			if (typeof model === 'object') {
				model.on('update', function() {
					emission.trigger('update', castToArray(arguments));
				});
			}

			//  return the emission
			return result;
		}

		/**
		 *  Prepare models so all properties become delegates (if not already) and it becomes an emitable
		 *  @name    prepare
		 *  @access  internal
		 *  @param   model
		 *  @return  model
		 */
		function prepare(model) {
			var emitter;

			//  replace any key with a delegate
			eachKey(model, function(key, value) {
				var handle = delegate(value, model, key);

				//  add the delegated handle as both getter and setter on the model/key
				define(model, key, true, handle, handle);

				//  a change emission on a property will trigger an update on the model
				handle.on('change', function() {
					emitter.trigger('update', [model, key, value]);
				});
			});

			if (!('on' in model && 'off' in model)) {
				emitter = emitable(model);
			}

			return model;
		}

		/**
		 *  Create a delegation function, responsible for keeping track of updates, associated elements and providing the data
		 *  @name    delegate
		 *  @access  internal
		 *  @param   mixed     initial value
		 *  @param   object    model  [optional, default undefined - no model]
		 *  @param   string    key    [optional, default undefined - no key]
		 *  @return  function  delegate
		 */
		function delegate(initial, model, key) {
			var result = function(value) {
					var change = arguments.length > 0;

					//  emit the appropriate event
					config.emission.trigger(change ? 'change' : 'access', [model, key, config.value, value]);

					//  update the value if the value argument was provided
					if (change) {
						config.value = value;
					}

					return config.value;
				},

				//  store a relevant value in an object, which can be passed on internally
				config = {
					emission: emitable(result),
					element: [],
					value: initial
				};

			//  create the element method, used to register elements to the delegate
			result.element = function() {
				var append = castToArray(arguments);

				//  @add observers to monitor changes
				//  @update the element value

				config.element = config.element.concat(append);
			};

			return result;
		}

		/**
		 *  Obtain the delegate function applied to a model property by Kontext
		 *  @name    getDelegate
		 *  @access  internal
		 *  @param   object    model
		 *  @param   string    key
		 *  @return  function  delegate  [false, if no delegate was found]
		 */
		function getDelegate(model, key) {
			var result = false,
				desc, nest;

			if (key in model) {
				//  if a model key is an explicitly assigned delegate, we utilize it
				if (typeof model[key] === 'function' && 'element' in model[key]) {
					result = model[key];
				}

				//  otherwise we need to get the property descriptor first
				else {
					desc = Object.getOwnPropertyDescriptor(model, key);
					result = desc.get;
				}
			}
			else {
				nest = key.indexOf('.');
				if (nest > 0 && key.substr(0, nest) in model) {
					return getDelegate(model[key.substr(0, nest)], key.substr(nest + 1));
				}
			}

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
			model = prepare(model);

			new Text().placeholders(element, function(text) {
				var placeholder = text.nodeValue.substr(1, text.nodeValue.length - 2).split(/:/),
					key = placeholder.shift(),
					initial = placeholder.length ? placeholder.join(':') : '',
					delegated = getDelegate(model, key);

				if (delegated) {
					if (!delegated()) {
						delegated(initial);
					}
				}

				// else if (options.greedy) {
				else {
					delegated = delegate(initial, model);
					define(model, key, true, delegated, delegated);
				}

				//  if Kontext created the delegate, we should register the element to the delegation
				if (delegated) {
					delegated.element(text);
				}
			});

			new Attribute().find(settings.public('attribute'), element, function(target, settings) {
				eachKey(settings, function(key, config) {
					var ext = extension(key);

					ext(target, model, config, kontext);
				});
			});

			return model;
		};

		/**
		 *  Get/set the default options
		 *  @name    defaults
		 *  @param   Object  options  [optional, default undefined - do not set anything]
		 *  @return  Object  default options
		 */
		kontext.defaults = function(options) {
			if (options && typeof options === 'object') {
				eachKey(options, function(key, value) {
					settings.public(key, value);
				});
			}

			return settings.public();
		};

		init();
	}

	//  create a new Kontext instance in the global scope
	global.kontext = global.kontext || new Kontext();

})(window);
