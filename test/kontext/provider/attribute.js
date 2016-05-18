/*global kontext: true, describe: true, it: true, expect: true, beforeEach: true, afterEach: true*/
describe('Kontext Provider Attribute', function() {
	'use strict';

	var provider = kontext.provider('attribute');

	it('attribute provider exists', function() {
		expect(typeof provider).toBe('object');
		expect(typeof provider.handler).toBe('function');
		expect(typeof provider.settings).toBe('object');
		expect(provider.settings.attribute).toBe('data-kontext');
	});

	describe('finds all attributes', function() {
		var main, a, b;

		beforeEach(function(done) {
			main = document.createElement('main');

			main.setAttribute('data-kontext', 'hello: world');

			a = main.appendChild(document.createElement('div'));
			a.setAttribute('data-kontext', 'nested: {key: value}');

			b = main.appendChild(document.createElement('div'));
			b.setAttribute('data-kontext', 'first: true, third: true, second: true');

			done();
		});

		afterEach(function(done) {
			if (main.parentNode) {
				main.parentNode.removeChild(main);
			}

			done();
		});

		function runner(node, conclusion) {
			var collect = [];

			provider.handler(provider.settings, node, function(target, options) {
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

			conclusion(collect);
		}

		it('elements', function() {
			runner(main, function(collect) {
				expect(collect).toEqual([main, a, b]);
			});
		});

		it('empty elements', function() {
			runner(document.createElement('div'), function(collect) {
				expect(collect).toEqual([]);
			});
		});

		it('DOMDocumentFragment', function() {
			var fragment = document.createDocumentFragment();

			fragment.appendChild(main);

			runner(fragment, function(collect) {
				expect(collect).toEqual([main, a, b]);
			});
		});

		it('empty DOMDocumentFragment', function() {
			runner(document.createDocumentFragment(), function(collect) {
				expect(collect).toEqual([]);
			});
		});

		it('DOMDocument', function() {
			document.body.appendChild(main);

			runner(document, function(collect) {
				expect(collect).toEqual([main, a, b]);
			});
		});

		it('empty DOMDocument', function() {
			runner(document, function(collect) {
				expect(collect).toEqual([]);
			});
		});
	});

	it('allows for whitespace (newlines,tabs) in attribute', function() {
		var main = document.createElement('main'),
			handled = false;

		main.setAttribute('data-kontext', '  foo: {bar: baz},\n\t\t\t\t\r   last: false\n\n\n\t\t\t,\n\n\n\t\t\t\t    \t\n  \rfinal: "tru\\"e"  ,  ');

		provider.handler(provider.settings, main, function(target, config) {
			expect('foo' in config).toBe(true);
			expect('bar' in config.foo).toBe(true);
			expect(config.foo.bar).toBe('baz');

			expect('last' in config).toBe(true);

			//  (not boolean, as there is whitespace before the 'end' comma)
			expect(typeof config.last).toBe('boolean');
			expect(config.last).toBe(false);

			expect('final' in config).toBe(true);
			expect(config.final).toBe('tru"e');

			handled = true;
		});

		expect(handled).toBe(true);
	});

	describe('provides json for various markup notations', function() {
		var list = [
				//  caution with escaped characters
				{data: 'foo: "bar\'baz"', expect: {foo: 'bar\'baz'}},
				{data: 'foo: "bar\\"baz"', expect: {foo: 'bar"baz'}},
				{data: 'foo"bar', expect: 'foo"bar'},

				//  true json notation
				{data: '{"foo": "bar"}', expect: {foo: 'bar'}},
				{data: '["foo", "bar", 1.2]', expect: ['foo', 'bar', 1.2]},
				{data: '[{foo: bar}, 1.2]', expect: [{foo: 'bar'}, 1.2]},
				{data: '"foo: bar"', expect: 'foo: bar'},

				//  lazy json notation
				{data: '1, 2, 3.4, -5.7, foo, 8', expect: [1, 2, 3.4, -5.7, 'foo', 8]},
				{data: 'foo:bar,baz:qux', expect: {foo: 'bar', baz: 'qux'}},
				{data: '1', expect: 1},
				{data: '1,2', expect: [1,2]}
			];

		list.forEach(function(item) {
			it('handles data-kontext="' + item.data + '"', function() {
				var main = document.createElement('main'),
					handled;

				main.setAttribute('data-kontext', item.data);

				provider.handler(provider.settings, main, function(target, config) {
					expect(config).toEqual(item.expect);

					handled = true;
				});

				expect(handled).toBe(true);
			});
		});
	});

	it('does not trip over non-elements', function() {
		var collect = [];

		provider.handler(provider.settings, null, function(target) {
			collect.push(target);
		});

		expect(collect.length).toBe(0);
	});

	describe('does not trip over empty attributes', function() {
		['', null, '   ', 0, false, '\t\n\r ']
			.forEach(function(data) {
				it(JSON.stringify(data), function() {
					var main = document.createElement('main'),
						collect = [];

					main.setAttribute('data-kontext', '');

					provider.handler(kontext.defaults(), main, function(target, config) {
						collect.push(config);
					});

					expect(collect.length).toBe(0);
				});
			});
	});

	describe('prevents handling removed childNodes', function() {
		var main, element, removal;

		beforeEach(function(done) {
			main = document.createElement('main');
			element = main.appendChild(document.createElement('div'));
			removal = main.appendChild(document.createElement('div'));

			element.setAttribute('data-kontext', 'available: yes');
			removal.setAttribute('data-kontext', 'available: no');

			done();
		});

		afterEach(function(done) {
			if (main.parentNode) {
				main.parentNode.removeChild(main);
			}

			done();
		});

		function runner(node, conclusion) {
			var collect = [];

			provider.handler(provider.settings, node, function(target, config) {
				collect.push(target);

				expect(target).toBe(element);
				expect('available' in config).toBe(true);
				expect(config.available).toBe('yes');

				removal.parentNode.removeChild(removal);
			});

			conclusion(collect);
		}

		it('elements', function() {
			runner(main, function(collect) {
				expect(collect.length).toBe(1);
				expect(collect.indexOf(element)).toBe(0);
				expect(collect.indexOf(removal)).toBe(-1);
			});
		});

		it('DOMDocumentFragment', function() {
			var fragment = document.createDocumentFragment();

			fragment.appendChild(main);

			runner(fragment, function(collect) {
				expect(collect.length).toBe(1);
				expect(collect.indexOf(element)).toBe(0);
				expect(collect.indexOf(removal)).toBe(-1);
			});
		});

		it('DOMDocument', function() {
			document.body.appendChild(main);

			runner(document, function(collect) {
				expect(collect.length).toBe(1);
				expect(collect.indexOf(element)).toBe(0);
				expect(collect.indexOf(removal)).toBe(-1);
			});
		});
	});
});
