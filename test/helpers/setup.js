function each(list, fn) {
	for (var i = 0; i < list.length; ++i) {
		fn(list[i], i, list);
	}
}

function remove(node) {
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}

	return node;
}

function setup() {
	var state = [],
		scope = {
			node: null,
			delay: function(fn, time) {
				setTimeout(fn, time || 0);
			},
			append: function(mixed) {
				var node = mixed,
					tmp;

				if (typeof mixed === 'string') {
					tmp = document.createElement('div');
					tmp.innerHTML = mixed;

					node = document.createDocumentFragment();
					while (tmp.firstChild) {
						node.appendChild(tmp.firstChild);
					}
				}

				if (node && typeof node.nodeType === 'number') {
					return scope.node.appendChild(node);
				}

				return false;
			}
		};

	each(document.body.childNodes, function(node) {
		state.push(node);
	});

	beforeEach(function(done) {
		scope.node = document.body.appendChild(document.createElement('main'));

		done();
	});

	afterEach(function(done) {
		each(document.body.childNodes, function(node) {
			if (state.indexOf(node) < 0) {
				remove(node);
			}
		});

		done();
	});

	return scope;
}
