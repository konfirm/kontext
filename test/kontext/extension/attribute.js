/*global kontext, describe, afterEach, beforeEach, it, expect, spyOn*/
describe('Kontext Extension Attribute', function() {
	'use strict';

	it('adds/changes/removes attributes', function(done) {
		var element = document.createElement('div'),
			model;

		element.setAttribute('data-kontext', 'attribute: {data-first: first, data-second: second}');

		model = kontext.bind({first: 'one', second: null}, element);

		expect(element.hasAttribute('data-first')).toBe(true);
		expect(element.getAttribute('data-first')).toBe('one');
		expect(element.hasAttribute('data-second')).toBe(false);

		model.on('update', function() {
			expect(element.hasAttribute('data-first')).toBe(false);
			expect(element.hasAttribute('data-second')).toBe(true);
			expect(element.getAttribute('data-second')).toBe('two');

			done();
		});

		model.first = null;
		model.second = 'two';
	});
});