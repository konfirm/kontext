/*global Attribute: true, describe: true, it: true, expect: true*/
describe('Attribute', function() {
	'use strict';

	it('finds and parses all attribute values', function(done) {
		var result = [];

		new Attribute().find('nope', document.body, function(element, config) {
			result.push(config);
		});

		expect(result.length).toBe(0);

		new Attribute().find('type', document.body, function(element, config) {
			if (result.indexOf(config) < 0) {
				result.push(config);
			}
		});

		expect(result.length).toBe(1);
		expect(result[0]).toBe('text/javascript');

		done();
	});

	it('finds attributes on the provided element itself', function() {
		var element = document.createElement('div');

		element.setAttribute('data-kontext', 'foo:bar');

		new Attribute().find('data-kontext', element, function(elm, config) {
			expect(elm.nodeName).toBe('DIV');
			expect(config).toEqual({foo: 'bar'});
		});
	});

	it('finds attributes in document fragments', function() {
		var fragment = document.createDocumentFragment(),
			element = ['span', 'div'];

		element.forEach(function(name) {
			var node = fragment.appendChild(document.createElement(name));

			node.setAttribute('data-kontext', 'name:' + name);
		});

		new Attribute().find('data-kontext', fragment, function(elm, config) {
			expect(config).toEqual({name: elm.nodeName.toLowerCase()});
		});
	});

	it('does not trip over non-elements', function() {
		expect(function() {
			new Attribute().find('data-stuff', null, function() {});
		}).not.toThrow(Error);
	});

	describe('prevents handling removed childNodes', function() {
		var main, element, removal;

		beforeEach(function(done) {
			main = document.createElement('main'),
			element = main.appendChild(document.createElement('div')),
			removal = main.appendChild(document.createElement('div')),

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

			new Attribute().find('data-kontext', node, function(target, config) {
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
