/*global beforeEach: true, afterEach: true*/
/**
 *  Traverse any array-like structure and call a function on each item
 *  @name    each
 *  @access  public
 *  @param   Array-ish list
 *  @param   function  callback
 *  @return  void
 */
function each(list, fn) {
	for (var i = 0; i < list.length; ++i) {
		fn(list[i], i, list);
	}
}

/**
 *  Remove a node from its parent, if it has one
 *  @name    remove
 *  @access  public
 *  @param   DOMNode  node
 *  @return  DOMNode  node
 */
function remove(node) {
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}

	return node;
}

/**
 *  Determine the state of the document.body and clean up after the test is done
 *  provides access to the created node, a convenience `append` function to append
 *  new contents (string or DOMNode) and a delay function
 *  @name    setup
 *  @access  public
 *  @return  Object  scope
 */
function setup() {  //  eslint-disable-line no-unused-vars
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
