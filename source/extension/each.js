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
kontext.extension('each', function(element, model, key) {
	'use strict';

	var template = [],
		cache = [],
		target, state;

	if (typeof key === 'object') {
		target = key.target || false;

		if (!target) {
			throw new Error('Missing target for "each"');
		}
	}
	else {
		target = key;
	}

	//  absorb all childNodes into the template
	while (element.firstChild) {
		template.push(element.removeChild(element.firstChild).cloneNode(true));
	}

	//  apply the map and filter methods, if configured
	function refine(result) {
		var apply;

		['map', 'filter'].forEach(function(method) {
			if (method in key) {
				apply = key[method] instanceof Array ? key[method] : [key[method]];
				apply.forEach(function(name) {
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

		return result;
	}

	//  fetch a configuration from the internal cache
	function fetch(item) {
		var result = cache.filter(function(o) {
				return o.item === item;
			});

		return result.length ? result[0] : null;
	}

	//  prepare a value to be bound as model, and preserving the template
	function prepare(item) {
		var result = fetch(item),
			nodeList;

		if (!result) {
			nodeList = template.map(function(node) {
				return node.cloneNode(true);
			});

			result = {
				item: item,
				model: kontext.bind.apply(kontext, [typeof item === 'object' ? item : {}].concat(nodeList)),
				nodes: nodeList
			};

			result.model.$index = null;
			result.model.$item = item;
			result.model.$parent = model[key];

			cache.push(result);
		}

		return result;
	}

	//  determine the changes between two arrays
	function differ(a, b) {
		return a.length !== b.length || a.filter(function(value, index) {
			return b[index] !== value;
		}).length !== 0;
	}

	//  update the contents if there are changes
	function update() {
		var output = [],
			collection = model[target],
			changed = false,
			refined;

		if (typeof key === 'object') {
			collection = refine(collection);
			refined = true;
		}

		if (!state || differ(state, collection)) {
			state = collection.slice();
			changed = true;
		}

		//  if changed or we are looking at a refined list, redraw everything
		if (changed || refined) {
			collection.forEach(function(value, index) {
				var config = prepare(value);

				config.model.$index = index;

				output = output.concat(config.nodes);
			});

			//  clear the element and redraw the new output
			while (element.lastChild) {
				element.removeChild(element.lastChild);
			}

			output.forEach(function(node) {
				element.appendChild(node);
			});
		}
	}

	model.on('update', function(model, key) {
		if (key === target) {
			update();
		}
	});

	update();
});
