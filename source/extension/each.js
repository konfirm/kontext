/*global kontext: true*/
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
		offset, state;

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
			nodeList, bind;

		if (!result) {
			nodeList = template.map(function(node) {
				return node.cloneNode(true);
			});

			//  ensure we will be binding an object
			bind = typeof value === 'object' ? value : {};

			//  prepare the custom properties provided by the each extension
			//  by providing them during the binding, we make sure they are treated
			//  as normal model members (which also means they become visible)
			bind.$item   = value;
			bind.$index  = 0;
			bind.$parent = null;
			bind.$model  = model;

			result = {
				item: value,
				model: kontext.bind(bind, nodeList),
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
		var output = [];

		collection.forEach(function(value, index) {
			var item = fetch(value);

			item.model.$index = index;
			if (!('$parent' in item.model && item.model.$parent)) {
				item.model.$parent = delegate();
			}

			output = output.concat(item.nodes);
		});

		if (offset) {
			redrawElementSiblings(output);
		}
		else {
			redrawElementChildren(output);
		}
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
	 *  Initialize the extension
	 *  @name    init
	 *  @access  internal
	 *  @return  void
	 */
	function init() {
		var delegate = target(config),
			attribute = kontext.defaults().attribute,
			marker = document.createTextNode('');

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

			//  always remove the kontext initializer attribute from the element
			element.removeAttribute(attribute);
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
