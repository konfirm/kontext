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

				//  always update the index, as we do not know where items end up
				item.$index = index;

				//  if the item was painted before, it has the `_append` method, utilize it
				if ('_append' in item) {
					item._append(output);
				}
				else {
					nodeList = [];
					item.$item   = value;
					item.$parent = model[key];

					//  create the _append method
					item._append = function(append) {
						nodeList.forEach(function(node) {
							append.appendChild(node);
						});
					};

					//  add a fresh clone of every element in the template to the nodeList
					template
						.forEach(function(node) {
							nodeList.push(node.cloneNode(true));
						});

					//  add the nodeList to the arguments we will be feeding to kontext.bind
					arg = arg.concat(nodeList);

					//  append the elements to the output
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
