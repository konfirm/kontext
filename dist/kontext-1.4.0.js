/*global Attribute, Emission, Observer, Settings, Text*/
/*
 *       __    Kontext (version 1.4.0 - 2016-02-01)
 *      /\_\
 *   /\/ / /   Copyright 2015, Konfirm (Rogier Spieker)
 *   \  / /    Released under the GPL-2.0 license
 *    \/_/     More information: http://konfirm.net/kontext
 *
 *  Contributors:
 *  - Daan van Ham <daan@vanham.io>
 */
;(function(global) {
	'use strict';

	/*
	 *  BUILD INFO
	 *  ---------------------------------------------------------------------
	 *    date: Mon Feb 01 2016 14:55:08 GMT+0100 (CET)
	 *    time: 4.45ms
	 *    size: 39.08KB
	 */

	//  load dependencies

	//BEGIN INCLUDE: lib/settings
	//  strict mode (already enabled)

	/**
	 *  Settings helper
	 *  @name     Settings
	 *  @package  Kontext
	 */
	function /*jshint unused: false*/Settings()/*jshint unused: true*/ {
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

	//END INCLUDE: lib/settings [854.71µs, 1.81KB]
	//BEGIN INCLUDE: lib/emission
	//  strict mode (already enabled)

	/**
	 *  Event Emission wrapper
	 *  @name     Emission
	 *  @package  Kontext
	 */
	function /*jshint unused: false*/Emission()/*jshint unused: true*/ {
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
						if (--config.invoke <= 0) {
							emission.remove(type, config.handle);
						}

						return config.invoke >= 0 ? config.handle : false;
					})
					.filter(function(callback) {
						return typeof callback === 'function';
					});

			/* istanbul ignore next */
			if (arguments.length < 3 && typeof arguments[arguments.length - 1] === 'function') {
				done = arg;
				arg = [];
			}

			//  pass on the list of handles to be triggered
			/* istanbul ignore next */
			trigger(list, [].concat(arg), function() {
				if (done) {
					done();
				}
			});
		};
	}

	//END INCLUDE: lib/emission [256.51µs, 2.85KB]
	//BEGIN INCLUDE: lib/observer
	/*global global*/
	//  strict mode (already enabled)

	/**
	 *  Observer wrapper (choosing wisely between MutationObserver and MutationEvents)
	 *  @name     Observer
	 *  @package  Kontext
	 */
	function /*jshint unused: false*/Observer()/*jshint unused: true*/ {
		var observer = this,
			mutation;

		/**
		 */
		function init() {
			var mutationObserver = global.MutationObserver || global.webkitMutationObserver || false;

			/* istanbul ignore next */
			if (mutationObserver) {
				mutation = {
					observer: mutationObserver,
					config: {
						characterData: true,
						characterDataOldValue: true
					}
				};
			}
		}

		/**
		 *  Cast a value into the same type as the origin, enabling coercion
		 *  @name    cast
		 *  @access  internal
		 *  @param   mixed  origin
		 *  @param   mixed  value
		 *  @return  mixed  casted value
		 */
		function cast(origin, value) {
			var type = typeof origin;

			switch (type) {
				case 'boolean':
					return !!value;

				case 'number':
					return +value;
			}

			return value;
		}

		/**
		 *  Persist a value to the model
		 *  @name    persist
		 *  @access  internal
		 *  @param   function  delegate
		 *  @param   mixed     value
		 *  @return  void
		 */
		function persist(delegation, value) {
			var current = delegation(),
				casted = cast(current, value);

			if (casted !== current) {
				delegation(casted);
			}
		}

		/**
		 *  Observe the DOMElement(s) bound to the model key and persist changes from outside Kontext
		 *  @name    monitor
		 *  @access  public
		 *  @param   DOMText   text
		 *  @param   function  delegate
		 *  @return  void
		 */
		observer.monitor = function(text, delegation) {
			/* istanbul ignore next */
			if (mutation) {
				new mutation.observer(function(mutations) {
					mutations.forEach(function(mutated) {
						persist(delegation, mutated.target.nodeValue);
					});
				}).observe(text, mutation.config);
			}
			else if (text.addEventListener) {
				text.addEventListener('DOMCharacterDataModified', function(event) {
					persist(delegation, event.newValue);
				});
			}
		};

		init();
	}

	//END INCLUDE: lib/observer [172.07µs, 1.98KB]
	//BEGIN INCLUDE: lib/text
	//  strict mode (already enabled)

	/**
	 *  Text node wrapper
	 *  @name     Text
	 *  @package  Kontext
	 */
	function /*jshint unused: false*/Text(pattern)/*jshint unused: false*/ {
		var text = this;

		/**
		 *  Obtain all textNodes residing within given element
		 *  @name    textNodes
		 *  @access  internal
		 *  @param   DOMElement
		 *  @return  Array  textNodes
		 */
		function textNodes(element) {
			var result = [],
				walker, node;

			if (element.nodeType === 3) {
				result.push(element);
			}
			else {
				walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
				while ((node = walker.nextNode())) {
					result.push(node);
				}
			}

			return result;
		}

		/**
		 *  Split a DOMText node into placeholder and non-placeholder parts, returning an array of all DOMText nodes
		 *  containing a placeholder
		 *  @name   splitter
		 *  @access internal
		 *  @param  DOMText node
		 *  @return array   DOMText nodes
		 */
		function splitter(node) {
			var match = node.nodeValue.match(pattern),
				content = match ? (match.index === 0 ? node : node.splitText(match.index)) : null,
				remainder = match ? content.splitText(match[0].length) : null,
				result = [];

			if (content) {
				result.push({
					node: content,
					key: match[2],
					initial: match[3] || ''
				});
				content.original = content.nodeValue;
			}

			if (remainder) {
				result = result.concat(splitter(remainder));
			}

			return result;
		}

		/**
		 *  Obtain all placeholder DOMText nodes within given element
		 *  @name    placeholders
		 *  @access  public
		 *  @param   DOMNode element
		 *  @return  array   DOMText nodes
		 */
		function placeholders(element) {
			var result = [];

			//  traverse all textnodes and split them in order to obtain only the placeholder nodes
			textNodes(element).forEach(function(node) {
				result = result.concat(splitter(node));
			});

			return result;
		}

		/**
		 *  Obtain all placeholder DOMText nodes withing given element and apply the callback to it
		 *  @name    placeholders
		 *  @access  public
		 *  @param   DOMNode   element
		 *  @param   function  callback
		 *  @return  void
		 */
		text.placeholders = function(element, callback) {
			placeholders(element).forEach(function(text) {
				callback.apply(null, [text.node, text.key, text.initial]);
			});
		};
	}

	//END INCLUDE: lib/text [268.95µs, 2.23KB]
	//BEGIN INCLUDE: lib/attribute
	/*global JSONFormatter*/
	//  strict mode (already enabled)

	/**
	 *  Attribute wrapper
	 *  @name     Attribute
	 *  @package  Kontext
	 */
	function /*jshint unused: false*/Attribute()/*jshint unused: true*/ {
		var attribute = this,
			json;


		//BEGIN INCLUDE: json-formatter
		//  strict mode (already enabled)

		/**
		 *  Format a string containing (valid) js variables into proper JSON so it can be handled by JSON.parse
		 *  @name       JSONFormatter
		 *  @package    Kontext
		 */
		function /*jshint unused: false*/JSONFormatter()/*jshint unused: true*/ {
			//  Implement a Singleton pattern and allow JSONFormatter to be invoked without the `new` keyword
			/* istanbul ignore next */
			if (typeof JSONFormatter.prototype.__instance !== 'undefined' || !(this instanceof JSONFormatter)) {
				return JSONFormatter.prototype.__instance || new JSONFormatter();
			}

			//  Maintain a reference to the first instance (which - if exists - is returned in the flow above)
			JSONFormatter.prototype.__instance = this;

			var formatter = this,
				special = '\'":,{}[] ',
				quotation = '"',
				pattern = {
					escape: /["\\\/\b\f\n\r\t]/,
					noquote: /^(?:true|false|null|-?[0-9]+(?:\.[0-9]+)?)$/i,
					trailer: /[,]+$/
				};

			/**
			 *  Determine is a token is a special character
			 *  @name    isSpecial
			 *  @access  internal
			 *  @param   string  token
			 *  @return  bool  special
			 */
			function isSpecial(token) {
				return special.indexOf(token) >= 0;
			}

			/**
			 *  Add quotes if required
			 *  @name    addQuotation
			 *  @access  internal
			 *  @param   string  token
			 *  @param   bool    force
			 *  @return  string  JSON-token
			 */
			function addQuotation(token, force) {
				var quote = quotation;

				//  if quotation is not enforced, we must skip application of quotes for certain tokens
				if (!force && (isSpecial(token) || pattern.noquote.test(token))) {
					quote = '';
				}

				return quote + token + quote;
			}

			/**
			 *  Remove trailing commas from the result stack
			 *  @name    removeTrailing
			 *  @access  internal
			 *  @param   Array  result
			 *  @return  Array  result
			 */
			function removeTrailing(result) {
				return pattern.trailer.test(result) ? removeTrailing(result.substr(0, result.length - 1)) : result;
			}

			/**
			 *  Handle a quoted string, ensuring proper escaping for double quoted strings
			 *  @name    escapeQuotedInput
			 *  @access  internal
			 *  @param   string  token
			 *  @array   Array   list
			 *  @return  Array   result
			 */

			/* istanbul ignore next */
			function escapeQuotedInput(token, list) {
				var result = [],
					character;

				//  token is the initial (opening) quotation character, we are not (yet) interested in this,
				//  as we need to process the stuff in list, right until we find a matching token
				while (list.length) {
					character = list.shift();

					//  reduce provided escaping
					if (character[character.length - 1] === '\\') {
						if (!pattern.escape.test(list[0])) {
							//  remove the escape character
							character = character.substr(0, character.length - 1);
						}

						//  add the result
						result.push(character);

						//  while we are at it, we may aswel move the (at least previously) escaped
						//  character to the result
						result.push(list.shift());
						continue;
					}
					else if (character === token) {
						//  with the escaping taken care of, we now know the string has ended
						break;
					}

					result.push(character);
				}

				return addQuotation(result.join(''));
			}

			/**
			 *  Compile the JSON-formatted string from a list of 'tokenized' data
			 *  @name    compiler
			 *  @access  internal
			 *  @param   Array   list
			 *  @return  string  JSON-formatted
			 */
			function compiler(list) {
				var result = '';

				while (list.length) {
					result = nibble(result, list);
				}

				return result;
			}

			/**
			 *  Nibble the next token from the list and handle it
			 *  @name    nibble
			 *  @access  internal
			 *  @param   string  result
			 *  @param   array   tokens
			 *  @return  string  result
			 *  @TODO    There is an issue with quotation symbols inside strings
			 *           e.g. 'hello"world' becomes '"hello""world"' while it should become '"hello\"world"'
			 */
			function nibble(result, list) {
				var token = list.shift();

				switch (token) {
					//  ignore whitespace outside of quoted patterns
					case ' ':
						break;

					//  remove any trailing commas and whitespace
					case '}':
					case ']':
						result = removeTrailing(result) + token;
						break;

					//  add/remove escaping
					case '"':
					case '\'':
						result += escapeQuotedInput(token, list);
						break;

					//  determine if the value needs to be quoted (always true if the next item in the list is a separator)
					default:
						result += addQuotation(token, list[0] === ':');
						break;
				}

				return result;
			}

			/**
			 *  Tokenize the input, adding each special character to be its own item in the resulting array
			 *  @name    tokenize
			 *  @access  internal
			 *  @param   string  input
			 *  @result  Array   tokens
			 */
			function tokenize(input) {
				var result = [],
					i;

				//  check each character in the string
				for (i = 0; i < input.length; ++i) {
					//  if there is not result or the current or previous input is special, we create a new result item
					if (result.length === 0 || isSpecial(input[i]) || isSpecial(result[result.length - 1])) {
						result.push(input[i]);
					}

					//  extend the previous item
					else {
						result[result.length - 1] += input[i];
					}
				}

				return result;
			}

			/**
			 *  Apply Object or Array notation (string.replace helper for an expression resulting in ':' or ',')
			 *  @name    notation
			 *  @access  internal
			 *  @param   string  full match
			 *  @param   string  matching symbol
			 *  @return  string  wrapped
			 */

			/* istanbul ignore next */
			function notation(match, symbol) {
				var character = symbol === ':' ? '{}' : '[]',
					position = match.indexOf(symbol),
					string = (match.match(/"/g) || []).length === 2 && match.indexOf('"') < position && match.lastIndexOf('"') > position;

				//  figure out if the notation should be added or may be skipped
				return !string && match[0] !== character[0] ? character[0] + removeTrailing(match) + character[1] : match;
			}

			/**
			 *  Prepare a string to become a JSON-representation
			 *  @name    prepare
			 *  @access  public
			 *  @param   string  input
			 *  @return  string  JSON-formatted
			 */
			formatter.prepare = function(input) {
				/* istanbul ignore next */
				if (typeof input !== 'string') {
					return '';
				}

				//  tokenize the input and feed it to the compiler in one go
				return compiler(tokenize(input))
					.replace(/^.*?([:,]).*$/, notation)
				;
			};

			/**
			 *  Prepare a string and parse it using JSON.parse
			 *  @name    parse
			 *  @access  public
			 *  @param   string  input
			 *  @return  mixed   parsed
			 */
			formatter.parse = function(input) {
				var prepared = formatter.prepare(input);

				return prepared ? JSON.parse(prepared) : null;
			};
		}

		//END INCLUDE: json-formatter [220.56µs, 6.41KB]
		/**
		 *  Initializer - setting up the defaults
		 *  @name    init
		 *  @access  internal
		 *  @return  void
		 */
		function init() {
			json = new JSONFormatter();
		}

		/**
		 *  Obtain all nodes containing the data attribute residing within given element
		 *  @name    attributes
		 *  @access  internal
		 *  @param   string  attribute name
		 *  @param   object  DOMElement
		 *  @return  Array  DOMElement
		 */
		function attributes(attr, element) {
			var result = [],
				list, i;

			switch (element.nodeType) {
				case 1:  //  DOMElement
					if (element.hasAttribute(attr)) {
						result.push(element);
					}
					/*falls through*/
				case 9:   //  DOMDocument (DOMElement if fallen through)
				case 11:  //  DocumentFragment
					list = element.querySelectorAll('[' + attr + ']');
					for (i = 0; i < list.length; ++i) {
						result.push(list[i]);
					}

					break;
			}

			return result;
		}

		/**
		 *  Search for elements containing the specificed attribute within the given element,
		 *  invoking the callback with the matching element and the JSON parsed contents
		 *  @name    find
		 *  @access  public
		 *  @param   string     attribute
		 *  @param   DOMElement element
		 *  @param   function   callback
		 *  @return  void
		 */
		attribute.find = function(name, element, callback) {
			attributes(name, element)
				.forEach(function(node) {
					callback(node, json.parse(node.getAttribute(name)));
				});
		};

		init();
	}

	//END INCLUDE: lib/attribute [603.49µs, 8.32KB]
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
				abbreviateExtensions: true,
				attribute: 'data-kontext',
				pattern: /(\{(\$?[a-z0-9_-]+)(?::([^\}]+))?\})/i
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
		 *  Verify the target contains specific properties
		 *  @name    contains
		 *  @access  internal
		 *  @param   Object  target
		 *  @param   Array   list
		 *  @param   number  minimum matches  [optional, default undefined - must contain all in list]
		 *  @return  bool    contains
		 */
		function contains(target, list, min) {
			var keys = [].concat(list),
				match = keys.filter(function(key) {
					return key in target;
				});

			return match.length >= (min ? min : keys.length);
		}

		/**
		 *  Basic compatibility check
		 *  @name    compatible
		 *  @access  internal
		 *  @return  void
		 */
		function compatible() {
			return contains(document, 'addEventListener') &&
				contains(Object, ['defineProperties', 'getOwnPropertyDescriptor']);
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
		 *  @return  Array  value  [if given value cannot be cast to an array, null is returned]
		 */
		function castToArray(cast) {
			return cast && cast.length ? Array.prototype.slice.call(cast) : null;
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
			var ext = settings._('extension') || {},
				abbreviated;

			//  if a handler is provided, update the registered extension to add/overwrite the handler
			//  to be used for given name
			if (handler) {
				ext[name] = handler;
				settings._('extension', ext);
			}

			//  if the name does not represent a registered extension, we will not be showing an error
			//  immediately but instead return a function which triggers an error upon use
			//  this should ensure Kontext to fully function and deliver more helpful error messages to
			//  the developer
			if (!(name in ext)) {
				abbreviated = settings.public('abbreviateExtensions') ? abbreviateExtension(name, ext) : null;

				return abbreviated || extensionError(
					'Unknown extension "%s"',
					name
				);
			}

			return ext[name];
		}

		/**
		 *  Find all extensions of which the first characters match given name
		 *  @name    abbreviateExtension
		 *  @access  internal
		 *  @param   string    name
		 *  @param   object    extensions
		 *  @return  function  handler
		 */
		function abbreviateExtension(name, ext) {
			var list = Object.keys(ext).filter(function(key) {
					return name === key.substr(0, name.length);
				}).sort();

			//  if multiple extensions match, we do not try to find the intended one, but log
			//  an error instead
			if (list.length > 1) {
				return extensionError('Multiple extensions match "%s": %s', name, list);
			}

			return list.length ? ext[list[0]] : null;
		}

		/**
		 *  Obtain an extension which is only capable of logging an error
		 *  @name    extensionError
		 *  @access  internal
		 *  @param   string    message  ['%s' will be replaced with additional argument values]
		 *  @param   string    replacement
		 *  @return  function  handler
		 */
		function extensionError() {
			var arg = castToArray(arguments),
				error = arg.reduce(function(prev, current) {
					return prev.replace('%s', current);
				});

			return function() {
				console.error('Kontext: ' + error);
			};
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

			if (!('on' in model && 'off' in model && 'delegation')) {
				//  replace any key with a delegate
				eachKey(model, function(key, value) {
					var handle;

					if (!getDelegate(model, key)) {
						handle = delegate(value, model, key);

						//  add the delegated handle as both getter and setter on the model/key
						define(model, key, true, handle, handle);

						//  a change emission on a property will trigger an update on the model
						handle.on('update', function() {
							emitter.trigger('update', [model, key, value, model[key]]);
						});
					}

					//  if the value is an object, we prepare it aswel so we can actually work with
					//  scoped properties
					if (value && typeof value === 'object' && !(value instanceof Array)) {
						//  prepare the submodel
						prepare(value);

						//  register a handler to pass on the update events to the parent model with the key prefixed
						value.on('update', function(parent, property, old, val) {
							emitter.trigger('update', [model, key + '.' + property, old, val]);
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
			var proto = Array.prototype,
				numeric = /^[0-9]+$/;

			//  determine if the list has been given additional properties and delegate those
			eachKey(list, function(key, value) {
				var handle;

				if (!(numeric.test(key) || key in proto || isDelegate(value))) {
					handle = delegate(value, list, key);

					//  add the delegated handle as both getter and setter on the list key
					define(list, key, true, handle, handle);
				}
			});

			//  iterator over every item in the list and ensure it is a model on its own
			list.forEach(function(item, index) {
				if (typeof list[index] === 'object') {
					list[index] = prepare(item, config.model, config.key);
					list[index].on('update', function() {
						config.emission.trigger('update', [config.model, config.key, config.value]);
					});
				}
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

				if (append) {
					append.forEach(function(node) {
						//  add observers to monitor changes
						observer.monitor(node, result);
					});

					//  update the newly added elements
					update(append, result);

					//  append the new elements to the existing ones (if any)
					config.element = config.element.concat(append);
				}

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
				property = key.split('.'),
				desc;

			//  deal with scoped keys such as 'foo.bar', which needs to address the 'bar' property in the submodel
			//  residing in model.foo
			property.forEach(function(name, index, all) {
				if (key) {
					key = name in model ? name : null;

					if (index < all.length - 1) {
						model = model[key];
					}
				}
			});

			if (key && key in model) {
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
		 *  Register or obtain bindings
		 *  @name    bindings
		 *  @access  internal
		 *  @param   DOMNode  element
		 *  @param   Object   model
		 *  @return  mixed    result  [if a model was provided - void, the list of models for given element]
		 */
		function bindings(element, model) {
			var list = settings._('bindings') || [],
				ancestry;

			//  if a model is provided, we associate it with the element, otherwise a list of models
			//  already associated with the element will be returned
			if (model) {
				list.push({model: model, target: element});
				settings._('bindings', list);
			}
			else {
				ancestry = [element];

				//  obtain a the ancestry (parent relations) for the given element
				while (ancestry[ancestry.length - 1].parentNode) {
					ancestry.push(ancestry[ancestry.length - 1].parentNode);
				}

				return list

					//  narrow the list down to all bindings having an element in the ancestry-list
					.filter(function(binding) {
						return ancestry.indexOf(binding.target) >= 0;
					})

					//  map the left over bindings to represent only models
					.map(function(binding) {
						return binding.model;
					})

					//  narrow down the list so the returned models are unique
					.filter(function(model, index, all) {
						return index === all.indexOf(model);
					});
			}
		}

		/**
		 *  Expand all DOMNode(List) in the provided list to individual and unique DOMNodes
		 *  @name    expandNodeList
		 *  @access  internal
		 *  @param   mixed  key    [one of: string key, object, undefined]
		 *  @param   mixed  value  [optional (ignored if key is an object), default undefined - no value]
		 *  @return  mixed  value  [if a string key is provided, the value for the key, all options otherwise]
		 */
		function expandNodeList(list) {
			return !list.length ? [document.body] : list
				.reduce(function(all, current) {
					return all.concat(current.nodeName ? [current] : castToArray(current));
				}, [])
				.filter(function(node, index, all) {
					return all.indexOf(node) === index;
				});
		}

		/**
		 *  Get/set the default options
		 *  @name    defaults
		 *  @access  public
		 *  @param   mixed  key    [one of: string key, object, undefined]
		 *  @param   mixed  value  [optional (ignored if key is an object), default undefined - no value]
		 *  @return  mixed  value  [if a string key is provided, the value for the key, all options otherwise]
		 */
		kontext.defaults = function(key, value) {
			if (key) {
				return settings.public(key, value);
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

			//  register the callback for the 'ready' emission, to be executed only once
			emission.add('ready', callback, 1);

			//  the internal state is undefined for as long as the 'ready' emission has not been
			//  triggered, it will be true/false afterwards
			if (state !== undefined) {
				emission.trigger('ready', [state !== true ? state : undefined, state === true ? kontext : undefined]);
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
		 *  @param   DOMNode  element...  [optional, default undefined - the document.body]
		 *  @param   Object   options     [optional, default undefined - use the default settings]
		 *  @return  object   model
		 */
		kontext.bind = function() {
			var arg = castToArray(arguments),
				model = prepare(arg.shift()),
				pop = arg.length && !contains(arg[arg.length - 1], ['nodeType', 'length'], 1),
				options = settings.combine(pop ? arg.pop() : {});

			//  bind the model to each element provided
			expandNodeList(arg).forEach(function(element) {
				//  register the bond, so we can retrieve it later on
				bindings(element, model);

				//  work through all data-kontext (or configured override thereof) attributes
				//  within (inclusive) given element
				new Attribute().find(options.attribute, element, function(target, settings) {
					//  Verify the model exists in the bindings for the current element
					if (bindings(target).indexOf(model) < 0) {
						return;
					}

					//  traverse all the keys present in the attribute value, for these represent
					//  individual extensions
					eachKey(settings, function(key, config) {
						var ext = extension(key);

						ext(target, model, config, kontext);
					});
				});

				//  work through all placeholders in DOMText nodes within (inclusive) within the element
				new Text(options.pattern).placeholders(element, function(text, key, initial) {
					var delegated = getDelegate(model, key);

					//  if there is a delegation, we provide the scope
					//  (only effective if no scope has been set)
					if (delegated) {
						delegated.scope(model, key);

						//  if there is no (false-ish) value, we set the initial value from the textNode
						//  (which may still be an empty string)
						if (!delegated()) {
							delegated(initial);
						}
					}
					else if (options.greedy) {
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
			});

			return model;
		};

		/**
		 *  Obtain the model(s) influencing the provided element
		 *  @name    ties
		 *  @access  public
		 *  @param   DOMNode  element  [optional, default undefined - the document.body element]
		 *  @return  Array    models
		 */
		kontext.bindings = function(element) {
			return bindings(element || document.body);
		};

		init();
	}

	//  create a new Kontext instance in the global scope
	global.kontext = global.kontext || new Kontext();

})(window);
/*global kontext*/
/**
 *  Manage attributes/values with Kontext
 *  @name     Attribute
 *  @package  Kontext
 *  @syntax   <div data-kontext="attribute: {data-foo: foo, ...}">...</div>
 */
kontext.extension('attribute', function(element, model, config) {
	'use strict';

	/**
	 *  Update the attribute, removing it whenever the value is false-ish, adding/updating it otherwise
	 *  @name    update
	 *  @access  internal
	 *  @param   string  attribute
	 *  @param   mixed   value
	 *  @return  void
	 */
	function update(attribute, value) {
		element[(value ? 'set' : 'remove') + 'Attribute'](attribute, value);
	}

	//  traverse all configure attributes, resolve the variable scope within the model
	//  and start listening for updates
	Object.keys(config)
		.forEach(function(attribute) {
			var delegate = model.delegation(config[attribute]);

			if (delegate) {
				delegate.on('update', function() {
					update(attribute, delegate());
				})();
			}
		});
});
/*global kontext*/
(function(kontext) {
	'use strict';

	/**
	 *  Update the classList to remove or add the className to the element
	 *  @name    classList
	 *  @access  internal
	 *  @param   DOMNode  element
	 *  @param   string   className
	 *  @param   bool     state
	 *  @return  void
	 */
	function classList(element, className, state) {
		//  update the class using the classList attribute if present,
		//  falling back onto a more tradional approach otherwise
		if ('classList' in element) {
			element.classList[state ? 'add' : 'remove'](className);
		}
		else {
			element.className = element.className.replace(new RegExp('(?:^|\\s+)' + className + '(\\s+|$)'), function(match, after) {
				return after || '';
			}) + (state ? ' ' + className : '');
		}
	}

	/**
	 *  Manage css classes from data-kontext attributes
	 *  @name     CSS
	 *  @package  Kontext
	 *  @syntax   <div data-kontext="css: {awesome: cool, ...}">...</div>
	 */
	kontext.extension('css', function(element, model, config) {
		Object.keys(config)
			.forEach(function(className) {
				var delegate = model.delegation(config[className]);

				if (delegate) {
					delegate.on('update', function() {
						classList(element, className, delegate());
					})();
				}
			});
	});

})(kontext);
/*global kontext*/
/**
 *  Work with array from data-kontext attributes
 *  @name     Each
 *  @package  Kontext
 *  @syntax   <ul data-kontext="each: <key>"><li>...</li></ul>
 *            <ul data-kontext="each: {target: <key>}"><li>...</li></ul>
 *            <ul data-kontext="each: {target: <key>, filter|map: <function>}"><li>...</li></ul>
 *            <ul data-kontext="each: {target: <key>, filter|map: [<function>, ...]}"><li>...</li></ul>
 */
kontext.extension('each', function(element, model, config) {
	'use strict';

	var template = [],
		cache = [],
		state;

	/**
	 *  Initialize the extension
	 *  @name    init
	 *  @access  internal
	 *  @return  void
	 */
	function init() {
		var delegate = target(config);

		//  absorb all childNodes into the template
		truncate(element, function(child) {
			template.push(child.cloneNode(true));
		});

		delegate.on('update', function() {
			update(delegate);
		});

		update(delegate);
	}

	/**
	 *  Obtain the configured target delegate
	 *  @name    target
	 *  @access  internal
	 *  @param   mixed  config
	 *  @return  function  delegate
	 */
	function target(key) {
		var result = typeof key === 'object' ? (key.target || null) : String(key);

		if (!result) {
			throw new Error('Missing target for "each"');
		}

		return model.delegation(result);
	}

	/**
	 *  Truncate all childNodes from given element, applying a callback if provided
	 *  @name    truncate
	 *  @access  internal
	 *  @param   DOMNode   node
	 *  @param   function  callback  [optional, default undefined]
	 *  @return  void
	 */
	function truncate(node, fn) {
		var which = (fn ? 'first' : 'last') + 'Child';

		while (element[which]) {
			if (fn) {
				fn(element[which]);
			}

			element.removeChild(element[which]);
		}
	}

	/**
	 *  Refine the provided array by applying any configured `map` and/or `filter` method
	 *  @name    refine
	 *  @access  internal
	 *  @param   Array  result
	 *  @return  Array  refined
	 */
	function refine(result) {
		if (typeof config === 'object') {
			['map', 'filter'].forEach(function(method) {
				if (method in config) {
					[].concat(config[method])
						.forEach(function(name) {
							if (typeof model[name] === 'function') {
								result = result[method](model[name]);
							}
							else if (typeof window[name] === 'function') {
								result = result[method](window[name]);
							}
							else {
								throw new Error(name + ' is not a ' + method + ' function');
							}
						});
				}
			});
		}

		return result;
	}

	/**
	 *  Obtain the cached item, creating it if it is not available yet
	 *  @name    fetch
	 *  @access  internal
	 *  @param   mixed   value
	 *  @return  Object  item
	 */
	function fetch(value) {
		var filtered = cache.filter(function(o) {
				return o.item === value;
			}),
			result = filtered.length ? filtered[0] : null,
			nodeList;

		if (!result) {
			nodeList = template.map(function(node) {
				return node.cloneNode(true);
			});

			result = {
				item: value,
				model: kontext.bind(typeof value === 'object' ? value : {}, nodeList),
				nodes: nodeList
			};

			result.model.$item = value;

			cache.push(result);
		}

		return result;
	}

	/**
	 *  Determine the differences between two array and return a boolean verdict
	 *  @name    differ
	 *  @access  internal
	 *  @param   Array a
	 *  @param   Array b
	 *  @return  bool  verdict
	 */
	function differ(a, b) {
		return a.length !== b.length || a.filter(function(value, index) {
			return b[index] !== value;
		}).length !== 0;
	}

	/**
	 *  Update the internal state and trigger a redraw whenever there are differences between
	 *  the previous and current state.
	 *  @name    update
	 *  @access  internal
	 *  @param   Array  collection
	 *  @return  void
	 */
	function update(delegate) {
		var collection = refine(delegate());

		//  if there is no state, of the state has changed, we update the internal state and
		//  trigger a redraw
		if (!state || differ(state, collection)) {
			state = collection.slice();
			redraw(collection, delegate);
		}
	}

	/**
	 *  Redraw all the submodels in the give collection
	 *  @name    redraw
	 *  @access  internal
	 *  @param   Array  collection
	 *  @return  void
	 */
	function redraw(collection, delegate) {
		var output = [];

		collection.forEach(function(value, index) {
			var item = fetch(value);

			item.model.$index = index;
			if (!('$parent' in item.model)) {
				item.model.$parent = delegate;
			}

			output = output.concat(item.nodes);
		});

		output.forEach(function(node, index) {
			if (element.childNodes.length > index) {
				if (element.childNodes[index] !== node) {
					element.insertBefore(node, element.childNodes[index]);
				}
			}
			else {
				element.appendChild(node);
			}
		});

		while (element.childNodes.length > output.length) {
			element.removeChild(element.childNodes[output.length]);
		}
	}

	init();
});
/*global kontext*/
/**
 *  Manage events from data-kontext attributes
 *  @name     Event
 *  @package  Kontext
 *  @syntax   <div data-kontext="event: {click: key|method}">...</div>
 *            <div data-kontext="event: {click: [key|method, key|method]}">...</div>
 *            <div data-kontext="event: {click: {key|method: value}}">...</div>
 */
kontext.extension('event', function(element, model, config) {
	'use strict';

	//  register the event handler
	function register(type, key, defaults) {
		element.addEventListener(type, function(event) {
			var delegate = model.delegation(key),
				value = delegate ? delegate() : false;

			if (delegate) {
				//  if the delegate is a function, apply it
				if (typeof value === 'function') {
					value.apply(null, [event, model, key, defaults]);
				}

				//  otherwise set the settingsured value
				else {
					delegate(defaults);
				}
			}
		}, false);
	}

	//  process the configuration for given event type
	function configure(type, settings) {
		if (typeof settings === 'object') {
			//  process both objects and arrays
			(settings instanceof Array ? settings : Object.keys(settings))
				.forEach(function(key) {
					register(type, key, key in settings ? settings[key] : undefined);
				});
		}
		else {
			//  process simple strings
			register(type, settings);
		}
	}

	//  traverse the config and configure each setting
	Object.keys(config)
		.forEach(function(key) {
			configure(key, config[key]);
		});
});
/*global kontext*/
/**
 *  Manage html from data-kontext attributes
 *  @name	  HTML
 *  @package  Kontext
 *  @syntax   <span data-kontext="html: foo">replaced</span>
 *            <span data-kontext="html: foo">replaced<strong> stuff</strong></span>
 */
kontext.extension('html', function(element, model, key) {
	'use strict';

	var delegate = model.delegation(key);

	if (delegate) {
		delegate.on('update', function() {
			element.innerHTML = delegate();
		})();
	}
});
/*global kontext*/
(function(kontext) {
	'use strict';

	/**
	 *  Select-element handling module
	 *  @name     Select
	 *  @package  Kontext
	 */
	function Select(element, model, config) {
		var delegate = {};

		/**
		 *  Set up the module basics (delegates, model updates, change events)
		 *  @name    init
		 *  @access  internal
		 *  @return  void
		 */
		function init() {
			//  find the relevant delegates
			['default', 'options', 'value']
				.forEach(function(key) {
					delegate[key] = key in config ? (model.delegation(config[key]) || config[key]) : null;
				});

			//  subscribe a handler to `default` updates
			subscribe(delegate.default, function() {
				options(resolve(delegate.value));
			});

			//  subscribe a handler to `options` updates
			subscribe(delegate.options, function() {
				options(resolve(delegate.value));
			});

			//  subscribe a handler to `value` updates
			subscribe(delegate.value, function() {
				selection(resolve(delegate.value));
			});

			//  listen for changes and persist those in the model value
			element.addEventListener('change', persist, false);
		}

		/**
		 *  Subscribe to the 'update'-events of a delegate, also immediately invoking the handler to
		 *  ensure initial values
		 *  @name    subscribe
		 *  @param   mixed     delegation  [if not a delegate function, nothing is done]
		 *  @param   function  handler
		 *  @return  void
		 */
		function subscribe(delegation, handler) {
			if (typeof delegation === 'function') {
				delegation.on('update', handler)();
			}
		}

		/**
		 *  Resolve the value, if it is a delegate (or function) it is invoked to extract the value
		 *  @name    resolve
		 *  @access  internal
		 *  @param   mixed  value
		 *  @return  mixed  resolved
		 */
		function resolve(value) {
			return typeof value === 'function' ? value() : value;
		}

		/**
		 *  Convenience method to create new Options
		 *  @name    option
		 *  @access  internal
		 *  @param   mixed   value  [one of: string value, object {[value: string] [, label: string]}]
		 *  @param   string  label  [optional, default undefined, always ignored if value is an object]
		 *  @return  Object  Option
		 */
		function option(value, label) {
			if (typeof value === 'object' && value) {
				label = value.label || value.value || '';
				value = value.value || '';
			}

			return new Option(label, value || '');
		}

		/**
		 *  Persist values from the <select>-element back onto the model
		 *  @name    persist
		 *  @access  internal
		 *  @return  void
		 */
		function persist() {
			var selected = resolve(delegate.value),
				item, position, i;

			//  if multiple selection is not allowed, the delegated value is set to the
			//  single selected option and exit the function
			if (!element.multiple) {
				return delegate.value(element.options[element.selectedIndex].value);
			}

			//  traverse all options and make sure only the currently selected options
			//  are in the value delegate
			for (i = 0; i < element.options.length; ++i) {
				item = element.options[i];
				position = selected.indexOf(item.value);

				//  if the item is selected, but not amongst the selected values, its value
				//  is pushed in (the order in which the values are is the order in which the selection
				//  was done)
				//  if an item is not selected but exists in the selection, it is spliced out
				if (item.selected && position < 0) {
					selected.push(item.value);
				}
				else if (!item.selected && position >= 0) {
					selected.splice(position, 1);
				}
			}
		}

		/**
		 *  Update the selection from the model back onto the <select>-element
		 *  @name    selection
		 *  @access  internal
		 *  @param   mixed  selected  [one of: Array values or string value]
		 *  @return  void
		 */
		function selection(selected) {
			var values = [].concat(selected),
				i;

			for (i = 0; i < element.options.length; ++i) {
				element.options[i].selected = values.indexOf(element.options[i].value) >= 0;
			}
		}

		/**
		 *  Update the options (if derived from the model)
		 *  @name    options
		 *  @access  internal
		 *  @param   mixed  selected  [one of: Array values or string value]
		 *  @return  void
		 */
		function options(selected) {
			var first = resolve(delegate.default),
				list = resolve(delegate.options),
				offset = 0;

			//  the list may be an object, for which the keys become the option value
			//  and the values become the option label
			if (!(list instanceof Array)) {
				list = Object.keys(list)
					.map(function(key) {
						return {
							value: key,
							label: list[key]
						};
					});
			}

			//  first represents a default option, if present put it first in the list
			if (first) {
				element.options[offset] = option(null, first);
				++offset;
			}

			//  remove all the options
			element.options.length = offset;

			//  update all the options
			list
				.forEach(function(item, index) {
					element.options[offset + index] = option(item);
				});

			//  allow or prevent multiple selection based on whether `selected` is an array,
			element.multiple = selected instanceof Array;

			//  trigger the selection update
			selection(selected);
		}

		//  initialize the module
		init();
	}

	/**
	 *  Determine the type of element
	 *  @name    type
	 *  @access  internal
	 *  @param   DOMNode  node
	 *  @return  string   type
	 */
	function type(node) {
		return node.getAttribute('type') || (/^select/i.test(node.nodeName) ? 'select' : 'text');
	}

	/**
	 *  Control form elements from data-kontext attributes
	 *  @name     Input
	 *  @package  Kontext
	 *  @example  <input data-kontext="input: {value: key}">
	 *            <input type=checkbox data-kontext="input: {checked: key}">
	 *            <select data-kontext="input: {value: key, options: optionsKey}"></select>
	 *            <select data-kontext="input: {value: key, options: optionsKey, default: choose}"</select>
	 */
	kontext.extension('input', function(element, model, config) {
		var property = ['value'];

		switch (type(element)) {
			//  select boxes are a special kind of input, these will be handled in
			//  an entirely different flow
			case 'select':
				return new Select(element, model, config);

			//  checkbox/radio elements need to keep the 'checked' attribute in sync
			case 'checkbox':
			case 'radio':
				property.push('checked');
				break;
		}

		//  traverse the property list (always 'value', 'checked' only for checkbox/radio inputs)
		property.forEach(function(key) {
			var	delegate = key in config ? model.delegation(config[key]) : null;

			if (delegate) {
				['input', 'change'].forEach(function(event) {
					element.addEventListener(event, function() {
						delegate(element[key]);
					}, false);
				});

				delegate.on('update', function() {
					element[key] = delegate();
				})();
			}
		});
	});
})(kontext);
/*global kontext*/
(function(kontext) {
	'use strict';

	/**
	 *  Template handling module
	 *  @name     Template
	 *  @package  Kontext
	 *  @note     The Template module uses the singleton pattern to ensure the caching is per page
	 */
	function Template() {
		if (!(typeof Template.prototype.__instance === 'undefined' && this instanceof Template)) {
			return Template.prototype.__instance || new Template();
		}

		Template.prototype.__instance = this;

		var template = this,
			cache = {};

		/**
		 *  Load a template file from given path and execute the callback
		 *  @name    load
		 *  @access  internal
		 *  @param   string    path
		 *  @param   function  callback
		 *  @return  void
		 */
		function load(path, done) {
			var xhr = new XMLHttpRequest();

			//  register the load handler to take care of the DOM creation of the loaded data
			xhr.addEventListener('load', function() {
				var data = this.responseText,
					dom;

				if (this.status >= 400) {
					return done(data);
				}

				dom = document.createElement('div');
				dom.innerHTML = data;

				done(null, dom);
			});

			xhr.open('GET', path);
			xhr.send();
		}

		/**
		 *  Resolve the configured input from cache, creating it when needed
		 *  @name    resolve
		 *  @access  internal
		 *  @param   Object    config  {path: <string>, selector: <string>}
		 *  @param   function  callback
		 *  @return  void
		 */
		function resolve(input, done) {
			var buffer = entry(input.path);

			//  if there is no data in the buffer, the template is external and not yet loaded
			if (!buffer.data) {
				//  add a callback to the internal queue
				buffer.callback.push(function() {
					resolve(input, done);
				});

				//  if there is only one (actually one or less, which means one)
				//  the template will be loaded
				if (buffer.callback.length <= 1) {
					load(input.path, function(error, dom) {
						//  add the data property
						buffer.data = {
							error: error,
							content: dom
						};

						//  trigger all queued callbacks
						trigger(buffer.callback);
					});
				}

				return;
			}

			//  if the given selector is not yet known in the internal selectors for the template path
			//  it will be created from the available data.content (or be empty otherwise)
			if (!(input.selector in buffer.selector)) {
				buffer.selector[input.selector] = buffer.data.content ? clone(buffer.data.content, input.selector) : [];
			}

			//  if an error was encountered, it will always be provided to the callback
			if (buffer.data.error) {
				return done(buffer.data.error);
			}

			//  invoke the callback with a fresh clone of the prepared template
			done(null, buffer.selector[input.selector].cloneNode(true));
		}

		/**
		 *  Obtain the entry for given source from the cache, creating a default entry if it does not yet exist
		 *  @name    entry
		 *  @access  internal
		 *  @param   string  source
		 *  @return  Object  entry  {data: <Object>, callback: <Array>, selector: <Object>}
		 */
		function entry(source) {
			if (!(source in cache)) {
				cache[source] = {
					data: source ? null : {content: document, error: null},
					callback: [],
					selector: {}
				};
			}

			return cache[source];
		}

		/**
		 *  Create a new DocumentFragment containing the nodes from list
		 *  @name    fragment
		 *  @access  internal
		 *  @param   Array  nodes
		 *  @return  DocumentFragment
		 *  @note    The nodes from the list are cloned deep
		 */
		function clone(dom, selector) {
			var node = selector ? dom.querySelector(selector) : dom,
				fragment = document.createDocumentFragment(),
				i;

			for (i = 0; i < node.childNodes.length; ++i) {
				fragment.appendChild(node.childNodes[i].cloneNode(true));
			}

			return fragment;
		}

		/**
		 *  Trigger a list of callbacks in sequence, relaxing it by triggering one at a time
		 *  @name    trigger
		 *  @access  internal
		 *  @param   Array  list
		 *  @return  void
		 */
		function trigger(list) {
			var callback;

			if (list.length) {
				callback = list.shift();

				setTimeout(function() {
					callback();
					trigger(list);
				}, 0);
			}
		}

		/**
		 *  Process the input into the provider object we want to work with
		 *  @name    provider
		 *  @access  internal
		 *  @param   mixed  input [one of: string (path)(#id), object {[path:..] [,selector:..]}]
		 *  @return  Object  {path:.., selector:..}
		 */
		function provider(input) {
			var result = {
					path: '',
					selector: ''
				},
				parse;

			//  if the input is a string, we parse it to obtain the path and/or selector
			if (typeof input === 'string') {
				parse = input.match(/^([^#]+)?(#.*)?$/);

				//  there is (should) be no need to test for the parse result as the pattern
				//  is very greedy and will always match
				result.path     = parse[1] || result.path;
				result.selector = parse[2] || result.selector;
			}
			else if (input && typeof input === 'object') {
				//  overwrite the default settings - if provided
				Object.keys(result)
					.forEach(function(key) {
						if (key in input) {
							result[key] = input[key] || result[key];
						}
					});
			}

			return result;
		}

		/**
		 *  Load the desired template using the settings
		 *  @name    load
		 *  @access  public
		 *  @param   mixed     input  [one of: string (path)(#id), object {[path:..] [,selector:..]}]
		 *  @param   function  callback
		 *  @return  void
		 */
		template.load = function(input, done) {
			var config = provider(input);

			if (!(config.path || config.selector)) {
				return done('No path and selector');
			}

			resolve(config, function(error, dom) {
				if (error) {
					return done(error);
				}

				done(null, dom);
			});
		};
	}

	/**
	 *  Replace the contents of an element with a template
	 *  @name     Template
	 *  @package  Kontext
	 *  @syntax   <span data-kontext="template: foo">replaced</span>
	 *            <span data-kontext="template: foo#bar">replaced</span>
	 *            <span data-kontext="template: #bar">replaced</span>
	 *            <span data-kontext="template: {path: /path/to/template}">replaced</span>
	 *            <span data-kontext="template: {path: /path/to/template, selector: #bar}">replaced</span>
	 *            <span data-kontext="template: {selector: #bar}">replaced</span>
	 *            <span data-kontext="template: {value: myTemplate}">replaced</span>
	 */
	kontext.extension('template', function(element, model, config) {
		var template = Template(),
			delegate;

		element.style.display = 'none';

		/**
		 *  Update the contents of the bound element to contain the assigned template contents
		 *  @name    update
		 *  @access  internal
		 *  @param   mixed  value
		 *  @return  void
		 */
		function update(value) {
			template.load(value, function(error, fragment) {
				if (error) {
					return element.setAttribute('data-kontext-error', error);
				}

				//  truncate the element (only done if no errors occured)
				while (element.lastChild) {
					element.removeChild(element.lastChild);
				}

				//  bind the model to the elements children
				kontext.bind(model, fragment);

				//  append the document fragment to the element
				element.appendChild(fragment);

				element.style.display = '';
			});
		}

		//  if the template replacement is a one time action, it is replaced and then
		//  the template extension is done.
		if (typeof config !== 'object' || !('value' in config)) {
			return update(config);
		}

		//  Obtain a delegate for the `value` property and update (replace) the template
		//  whenever the `value` changes
		delegate = model.delegation(config.value);

		if (delegate) {
			delegate.on('update', function() {
				update(delegate());
			})();
		}
	});

})(kontext);
/*global kontext*/
/**
 *  Manage text from data-kontext attributes
 *  @name     Text
 *  @package  Kontext
 *  @syntax   <span data-kontext="text: foo">replaced</span>
 *            <span data-kontext="text: foo">replaced<strong> stuff</strong></span>
 */
kontext.extension('text', function(element, model, key) {
	'use strict';

	var text = element.firstChild && element.firstChild.nodeType === 3 ? element.firstChild : document.createTextNode(model[key]),
		delegate = model.delegation(key);

	if (delegate) {
		//  ensure the existence of the text element
		if (text.parentNode !== element && text !== element.firstChild) {
			element.insertBefore(text, element.firstChild);
		}

		//  add the element to the elements which push/receive updates by Kontext
		delegate.element(text);
	}
});
