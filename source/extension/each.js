/* global kontext: true */
/**
 *  Work with array from data-kontext attributes
 *  @name     Each
 *  @package  Kontext
 *  @syntax   <ul data-kontext="each: <key>"><li>...</li></ul>
 *            <ul data-kontext="each: {target: <key>}"><li>...</li></ul>
 *            <ul data-kontext="each: {target: <key>, filter|map: <function>}"><li>...</li></ul>
 *            <ul data-kontext="each: {target: <key>, filter|map: [<function>, ...]}"><li>...</li></ul>
 */
kontext.extension('each', function(element, model, config, options) {
	'use strict';

	var template = [],
		cache = [],
		self = 'self',
		configuration, offset, state;

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
	 *  Shorthand function for insertBefore operations
	 *  @name    before
	 *  @access  internal
	 *  @param   DOMNode  insert
	 *  @param   DOMNode  before
	 *  @return  DOMNode  inserted
	 */
	function before(insert, relative) {
		return relative.parentNode.insertBefore(insert, relative);
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
	 *  Decorate a property onto an object (which may or may not be a model already)
	 *  @name    decorate
	 *  @access  internal
	 *  @param   Object  object
	 *  @param   string  property
	 *  @param   mixed   value
	 *  @return  void
	 *  @note    This method does not change any pre-existing property
	 */
	function decorate(object, property, value) {
		if (!(property in object)) {
			if (typeof object.define === 'function') {
				object.define(property, value);
			}
			else {
				object[property] = value;
			}
		}
	}

	/**
	 *  Obtain the cached item, creating it if it is not available yet
	 *  @name    fetch
	 *  @access  internal
	 *  @param   mixed     value
	 *  @param   function  delegate
	 *  @return  Object    item
	 */
	function fetch(value, delegate) {
		var filtered = cache.filter(function(o) {
				return o.item === value;
			}),

			result = filtered.length ? filtered[0] : null,
			nodeList, fragment, bind;

		if (!result) {
			fragment = document.createDocumentFragment();
			nodeList = template.map(function(node) {
				//  append a fresh clone to the fragment and return the clone itself
				//  The appending is done to ensure the cloned node does have a parentNode
				//  which enables extensions to be work (mostly as normal) even before `each`
				//  has actually appended the elements to the real document
				return fragment.appendChild(node.cloneNode(true));
			});

			//  ensure we will be binding an object
			bind = typeof value === 'object' ? value : {};

			//  prepare the custom properties provided by the each extension
			//  by providing them during the binding, we make sure they are treated
			//  as normal model members (which also means they become visible)
			decorate(bind, '$index', 0);
			decorate(bind, '$item', value);
			decorate(bind, '$parent', delegate());
			decorate(bind, '$model', model);

			result = {
				item: value,
				model: kontext.bind(bind, nodeList, configuration),
				nodes: nodeList
			};

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
	 *  Redraw the submodels within the initial element
	 *  @name    redrawElementChildren
	 *  @access  internal
	 *  @param   Array  nodes
	 *  @return  void
	 */
	function redrawElementChildren(output) {
		output.forEach(function(node, index) {
			if (element.childNodes.length > index) {
				if (element.childNodes[index] !== node) {
					before(node, element.childNodes[index]);
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

	/**
	 *  Redraw the submodels between the generated comment nodes (used if outer: true is provided)
	 *  @name    redrawElementSiblings
	 *  @access  internal
	 *  @param   Array  nodes
	 *  @return  void
	 */
	function redrawElementSiblings(output) {
		var compare = offset.start.nextSibling,
			rm;

		output.forEach(function(node) {
			if (compare !== node) {
				compare = before(node, compare).nextSibling;
			}
			else {
				compare = node.nextSibling;
			}
		});

		while (compare && compare !== offset.end) {
			rm = compare;
			compare = compare.nextSibling;
			rm.parentNode.removeChild(rm);
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
		var redrawFunction = offset ? redrawElementSiblings : redrawElementChildren;

		redrawFunction(collection.reduce(function(result, value, index) {
			var item = fetch(value, delegate);

			//  update the index, slightly delayed
			//  this "works around" an issue Kontext has when testing against PhantomJS 2+ which does not
			//  occur in earlier versions (1.9.*)
			setTimeout(function() {
				item.model.$index = index;
			}, 0);

			return result.concat(item.nodes);
		}, []));
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
	 *  Attempt to remove just the 'each'-extension configuration
	 *  @name    removeEachAttribute
	 *  @access  internal
	 *  @param   DOMElement  node
	 *  @param   string      attribute name  [default 'data-kontext', could be overridden]
	 *  @param   string      extension name  [default 'each', could be shortened/renamed]
	 *  @return  void
	 */
	function removeEachAttribute(node, attribute, extension) {
		var value = node.getAttribute(attribute),

			//  the pattern _only_ tries to match the object configuration and assumes no nested objects
			//  e.g.  each: {...}
			pattern = new RegExp('([\'"])?(?:' + extension + ')\\1\\s*:\\s*\\{[^\\}]+\\}'),
			remain = value
				.replace(pattern, '')
				.replace(/(?:,\s*)+/, ',')
				.replace(/^[,\s]+|[,\s]+$/, '');

		node.setAttribute(attribute, remain);
	}

	/**
	 *  Initialize the extension
	 *  @name    init
	 *  @access  internal
	 *  @return  void
	 */
	function init() {
		var delegate = target(config),
			marker = document.createTextNode(''),
			attributeSettings;

		//  preserve the settings used to bind this extenstion
		//  so it can be used to configure subsequent bindings
		configuration = options.settings;

		attributeSettings = configuration.provider.attribute.settings;

		//  tell Kontext not to descend into the children of our element
		options.stopDescend();

		if (!delegate) {
			return;
		}

		if (typeof config === 'object' && self in config && config[self]) {
			offset = {
				start: before(marker, element),
				end: before(marker.cloneNode(), element)
			};

			//  always remove the extension from the attribute
			removeEachAttribute(element, attributeSettings.attribute, options.extension);

			//  add the element to the template
			template.push(element.parentNode.removeChild(element));
		}
		else {
			//  absorb all childNodes into the template
			while (element.firstChild) {
				template.push(element.removeChild(element.firstChild));
			}
		}

		delegate.on('update', function() {
			update(delegate);
		});

		update(delegate);
	}

	init();
});
