/*global kontext, describe, it, expect*/
describe('Kontext Extension Text', function() {
	'use strict';

	it('replaces model values in text nodes', function(done) {
		var element = document.createElement('div'),
			model;

		element.setAttribute('data-kontext', 'text: greet');

		model = kontext.bind({greet: 'hello'}, element);

		expect(element.firstChild.data).toBe('hello');

		done();
	});

	it('uses the firstChild if it is a textnode', function(done) {
		var element = document.createElement('div'),
			nest = element.appendChild(document.createTextNode('hello world')),
			model;

		element.setAttribute('data-kontext', 'text: greet');

		model = kontext.bind({greet: 'hello'}, element);

		expect(element.firstChild.data).toBe('hello');
		expect(element.firstChild).toBe(nest);

		done();
	});

	it('creates a textnode and puts it in first', function(done) {
		var element = document.createElement('div'),
			nest = element.appendChild(document.createElement('span')),
			model;

		element.setAttribute('data-kontext', 'text: greet');

		model = kontext.bind({greet: 'hello'}, element);

		expect(element.firstChild.data).toBe('hello');
		expect(element.firstChild.nextSibling).toBe(nest);

		done();
	});
});
