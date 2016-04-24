/*global Observer, describe, it, expect*/
describe('Observer', function() {
	'use strict';

	/**
	 *  create a delegation function
	 */
	function delegate(value) {
		return function() {
			if (arguments.length) {
				value = arguments[0];
			}

			return value;
		};
	}

	/**
	 *  runs tests on the observer
	 */
	function test(observer, done) {
		var nodes = [],
			count = 0;

		['foo', 1, false].forEach(function(v) {
			var tmp = {
				value: v,
				node: document.body.appendChild(document.createTextNode(v)),
				delegate: delegate(v)
			};

			observer.monitor(tmp.node, tmp.delegate);

			nodes.push(tmp);
		});

		nodes.forEach(function(o) {
			switch (typeof o.value) {
				case 'string':
					o.node.nodeValue = 'bar';
					setTimeout(function() {
						expect(o.delegate()).toBe('bar');
						++count;

						o.node.nodeValue = 'bar';
						setTimeout(function() {
							expect(o.delegate()).toBe('bar');
							++count;
						}, 10);
					}, 10);

					break;

				case 'number':
					o.node.nodeValue = 2;
					setTimeout(function() {
						expect(o.delegate()).toBe(2);
						++count;
					}, 10);

					break;

				case 'boolean':
					o.node.nodeValue = 'true';
					setTimeout(function() {
						expect(o.delegate()).toBe(true);
						++count;
					}, 10);

					break;
			}
		});

		setTimeout(function() {
			expect(count).toBe(4);

			done();
		}, 200);
	}

	it('Uses the MutationObserver if available', function(done) {
		//  as the Observer module does not use the window scope per se, we provide a cultivated `global` scope
		//  allowing to provide alternative environments and test all possible observation flows
		window.global = window;

		test(new Observer(), done);
	});

	it('Uses the webkitMutationEvents alternatively', function(done) {
		//  as the Observer module does not use the window scope per se, we provide a cultivated `global` scope
		//  allowing to provide alternative environments and test all possible observation flows
		window.global = {
			webkitMutationObserver: window.webkitMutationObserver
		};

		test(new Observer(), done);
	});

	it('Uses the MutationEvents alternatively', function(done) {
		//  as the Observer module does not use the window scope per se, we provide a cultivated `global` scope
		//  allowing to provide alternative environments and test all possible observation flows
		window.global = {};

		test(new Observer(), done);
	});

});
