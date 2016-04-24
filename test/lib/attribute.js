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
			expect(config).toEqual({name: element.nodeName.toLowerCase()});
		});
	});
});
