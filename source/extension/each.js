/*global kontext*/
/**
 *  Work with array from data-kontext attributes
 *  @name     Each
 *  @package  Kontext
 */
kontext.extension('each', function(element, model, key) {
	'use strict';

	var template = [],
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

	function differ(a, b) {
		return a.length !== b.length || a.filter(function(value, index) {
			return b[index] !== value;
		}).length !== 0;
	}

	function update() {
		var output = document.createDocumentFragment(),
			collection = model[target],
			bonds = [],
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
				var item = typeof value === 'object' ? value : {},
					arg = [item],
					nodeList;

				item.$index = index;

				if ('_append' in item) {
					item._append(output);
				}
				else {
					nodeList = [];
					item.$item   = value;
					item.$parent = model[key];
					item._append = function(append) {
						nodeList.forEach(function(node) {
							append.appendChild(node);
						});
					};

					template
						.forEach(function(node) {
							nodeList.push(node.cloneNode(true));
						});

					arg = arg.concat(nodeList);
					item._append(output);

					//  we need to postpone the `bind` to the point where the documentFragment is actually
					//  appended to the DOM
					bonds.push(function() {
						kontext.bind.apply(kontext, arg);
					});
				}
			});

			//  clear the element and redraw the new output
			while (element.lastChild) {
				element.removeChild(element.lastChild);
			}

			//  attach the documentFragment to the DOM
			element.appendChild(output);

			//  call all of the stored `bonds`
			bonds.forEach(function(bind) {
				bind();
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
