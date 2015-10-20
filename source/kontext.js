/*global Attribute, Emission, Observer, Settings, Text*/
;(function(global) {
	'use strict';

	//  load dependencies
	//@include lib/settings
	//@include lib/emission
	//@include lib/observer
	//@include lib/text
	//@include lib/attribute

	function Kontext() {
		var kontext = this,
			settings = new Settings(),
			emission = new Emission(),
			observer = new Observer();

		/**
		 *  Initializer, set up Kontext defaults
		 *  @name    init
		 *  @access  internal
		 *  @return  void
		 */
		function init() {
			/* istanbul ignore next */
			if (!compatible()) {
				return setTimeout(function() {
					emission.trigger('ready', ['Unsupported browser']);
				}, 0);
			}

			//  internal settings
			settings._({
				rAF: global.requestAnimationFrame || function(f) {
					setTimeout(f, 1e3 / 60);
				}
			});

			//  public settings (this is what is provided/changed when using the kontext.defaults method)
			settings.public({
				greedy: true,
				attribute: 'data-kontext'
			});

			//  register our own ready handler, ensuring to be the first in line
			emission.add('ready', function(error) {
				settings._('ready', error || true);
			}, 1);

			//  add the DOMContentLoaded event to the document, so we can trigger the 'ready' handlers early on
			document.addEventListener('DOMContentLoaded', function() {
				//  call any registered 'ready' handler
				emission.trigger('ready', [undefined, kontext]);
			}, false);
		}

		/**
		 *  Basic compatibility check
		 *  @name    compatible
		 *  @access  internal
		 *  @return  void  [throws Error is not compatible]
		 */
		function compatible() {
			var result = true;

			result = result && 'addEventListener' in document;
			result = result && 'defineProperties' in Object;
			result = result && 'getOwnPropertyDescriptor' in Object;

			return result;
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
				definition.set = setter;
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
		 *  Update elements to reflect a new value
		 *  @name    update
		 *  @access  internal
		 *  @param   Array     elements
		 *  @param   function  delegation
		 *  @return  void
		 */
		function update(list, delegation) {
			var nodeValue = '' + delegation();

			list
				.filter(function(element) {
					return nodeValue !== element.nodeValue;
				})
				.forEach(function(element) {
					element.nodeValue = nodeValue;
				});
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

			if (!('on' in model && 'off' in model && 'delegation' )) {
				//  replace any key with a delegate
				eachKey(model, function(key, value) {
					var handle;

					if (!getDelegate(model, key)) {
						handle = delegate(value, model, key);

						//  add the delegated handle as both getter and setter on the model/key
						define(model, key, true, handle, handle);

						//  a change emission on a property will trigger an update on the model
						handle.on('update', function() {
							emitter.trigger('update', [model, key, value]);
						});
					}
				});

				//  add the emission methods
				emitter = emitable(model);

				//  add the delegation method
				define(model, 'delegation', true, function(key) {
					return getDelegate(model, key);
				}, false);
			}

			return model;
		}

		/**
		 *  Prepare a list of (possible) models
		 *  @name    listPrepare
		 *  @access  internal
		 *  @param   array   list
		 *  @param   object  config
		 *  @param   array   subscriber
		 */
		function listPrepare(list, config) {
			list.forEach(function(item, index) {
				list[index] = prepare(item, config.model, config.key);
				list[index].on('update', function() {
					config.emission.trigger('update', [config.model, config.key, config.value]);
				});
			});
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

					//  update the value if the value argument was provided
					if (change) {
						config.value = value;
					}

					//  emit the appropriate event
					config.emission.trigger(change ? 'update' : 'access', [config.model, config.key, config.value, value]);

					return config.value;
				},

				//  store a relevant value in an object, which can be passed on internally
				config = {
					emission: emitable(result),
					element: [],
					value: initial,
					model: model,
					key: key
				};

			//  if we are dealing with arrays, we'd like to know about mutations
			if (initial instanceof Array) {
				['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'].forEach(function(key) {
					var original;

					if (typeof initial[key] === 'function') {
						original = initial[key];
						initial[key] = function() {
							var result = original.apply(initial, arguments);

							//  map the changes
							listPrepare(initial, config);
							config.emission.trigger('update', [config.model, config.key, config.value]);

							return result;
						};
					}
				});

				listPrepare(initial, config);
			}

			//  create the scope method, used to register the scope (model + key) for delegates created externally
			result.scope = function() {
				if (!model && arguments.length > 0) {
					model = arguments[0];
				}

				if (!key && arguments.length > 1) {
					key = arguments[1];
				}
			};

			//  create the element method, used to register elements to the delegate
			result.element = function() {
				var append = castToArray(arguments);

				append.forEach(function(node) {
					//  add observers to monitor changes
					observer.monitor(node, result);
				});

				//  update the newly added elements
				update(append, result);

				//  append the new elements to the existing ones (if any)
				config.element = config.element.concat(append);

				//  return all configured elements
				return config.element;
			};

			//  listen for changes so these can be updated in the associated elements
			config.emission.add('update', function() {
				settings._('rAF')(function() {
					update(config.element, result);
				});
			});

			return result;
		}

		/**
		 *  Determine wether or not the provided value is a delegate
		 *  @name    isDelegate
		 *  @access  internal
		 *  @param   mixed  value
		 *  @return  bool   is delegate
		 */
		function isDelegate(value) {
			return typeof value === 'function' && typeof value.element === 'function';
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
				desc;

			if (key in model) {
				//  if a model key is an explicitly assigned delegate, we utilize it
				if (isDelegate(model[key])) {
					result = model[key];
				}

				//  otherwise we need to get the property descriptor first
				else {
					desc = Object.getOwnPropertyDescriptor(model, key);
					result = desc.get;
				}
			}

			return result;
		}

		/**
		 *  Get/set the default options
		 *  @name    defaults
		 *  @param   mixed  key    [one of: string key, object options]
		 *  @param   mixed  value  [optional (ignored if key is an object), default undefined - no value]
		 *  @return  Object  default options
		 */
		kontext.defaults = function(key, value) {
			if (key) {
				settings.public(key, value);
			}

			return settings.public();
		};

		/**
		 *  Register a handler to be invoked when Kontext is ready (DOM-ready)
		 *  @name    ready
		 *  @access  public
		 *  @param   function  callback
		 *  @return  object    kontext
		 */
		kontext.ready = function(callback) {
			var state = settings._('ready');

			emission.add('ready', callback, 1);

			if (state !== undefined) {
				emission.trigger('ready', state !== true ? state : undefined);
			}

			return kontext;
		};

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
		 *  Register extentions
		 *  @name    extension
		 *  @access  public
		 *  @param   string    name
		 *  @param   function  handle
		 *  @return  void
		 */
		kontext.extension = extension;

		/**
		 *  Create a delegation value with an initial value
		 *  @name    delegate
		 *  @access  public
		 *  @param   mixed     initial value
		 *  @return  function  delegate
		 */
		kontext.delegate = function(initial) {
			return delegate(initial);
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
					delegated.scope(model, key);

					if (!delegated()) {
						delegated(initial);
					}
				}
				else if (settings.public('greedy')) {
					//  create the delegate function
					delegated = delegate(initial, model, key);

					//  add the delegate function as getter/setter on the model
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

		init();
	}

	//  create a new Kontext instance in the global scope
	global.kontext = global.kontext || new Kontext();

})(window);
