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

		//  clear the element and redraw the new output
		truncate(element);

		output.forEach(function(node) {
			element.appendChild(node);
		});
	}

	init();
});
