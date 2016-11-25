/* global Observer, describe, it, expect */
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
			expectation = [];

		['foo', 1, false].forEach(function(v) {
			var tmp = {
				value: v,
				node: document.body.appendChild(document.createTextNode(v)),
				delegate: delegate(v),
				expect: null
			};

			observer.monitor(tmp.node, tmp.delegate);

			nodes.push(tmp);
		});

		nodes.forEach(function(o) {
			expectation.push(o);

			switch (typeof o.value) {
				case 'string':
					o.expect = 'bar';
					o.node.nodeValue = o.expect;
					break;

				case 'number':
					o.expect = 2;
					o.node.nodeValue = o.expect;
					break;

				case 'boolean':
					o.expect = true;
					o.node.nodeValue = JSON.stringify(o.expect);
					break;
			}
		});

		setTimeout(function() {
			expect(expectation.length).toBe(3);

			expectation.forEach(function(tmp) {
				var compare = typeof tmp.expect !== 'string' ? JSON.stringify(tmp.expect) : tmp.expect;

				expect(tmp.expect).not.toBe(null);
				expect(tmp.node.nodeValue).toBe(compare);
			});

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
