/*global kontext: true, describe: true, it: true, expect: true*/
describe('Kontext Provider Attribute', function() {
	'use strict';

	var provider = kontext.provider('attribute');

	it('attribute provider exists', function() {
		expect(typeof provider).toBe('function');
	});

	describe('finds all placeholders', function() {
		var main, collect, a, b;

		beforeEach(function(done) {
			main = document.createElement('main');

			main.setAttribute('data-kontext', 'hello: world');

			a = main.appendChild(document.createElement('div'));
			a.setAttribute('data-kontext', 'nested: {key: value}');

			b = main.appendChild(document.createElement('div'));
			b.setAttribute('data-kontext', 'first: true, third: true, second: true');

			collect = [];

			done();
		});

		afterEach(function(done) {
			if (main.parentNode) {
				main.parentNode.removeChild(main);
			}

			done();
		});

		function runner(node, conclusion) {
			provider(kontext.defaults(), node, function(target, options) {
				expect(target.nodeType).toBe(1);

				if (target === main) {
					expect(options).toEqual({hello: 'world'});
				}
				else if (target === a) {
					expect(options).toEqual({nested: {key: 'value'}});
				}
				else if (target === b) {
					expect(options).toEqual({first: true, second: true, third: true});
				}

				collect.push(target);
			});

			conclusion();
		}

		it('elements', function() {
			runner(main, function() {
				expect(collect).toEqual([main, a, b]);
			});
		});

		it('empty elements', function() {
			runner(document.createElement('div'), function() {
				expect(collect).toEqual([]);
			});
		});

		it('DOMDocumentFragment', function() {
			var fragment = document.createDocumentFragment();

			fragment.appendChild(main);

			runner(fragment, function() {
				expect(collect).toEqual([main, a, b]);
			});
		});

		it('empty DOMDocumentFragment', function() {
			runner(document.createDocumentFragment(), function() {
				expect(collect).toEqual([]);
			});
		});

		it('DOMDocument', function() {
			document.body.appendChild(main);

			runner(document, function() {
				expect(collect).toEqual([main, a, b]);
			});
		});

		it('empty DOMDocument', function() {
			runner(document, function() {
				expect(collect).toEqual([]);
			});
		});
	});
});
