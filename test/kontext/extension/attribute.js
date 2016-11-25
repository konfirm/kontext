/* global kontext: true, describe: true, it: true, expect: true */
describe('Kontext Extension Attribute', function() {
	'use strict';

	it('adds/changes/removes attributes', function(done) {
		var element = document.createElement('div'),
			model;

		element.setAttribute('data-kontext', 'attribute: {data-first: first, data-second: second}');

		model = kontext.bind({first: 'one', second: null}, element);

		model.on('update', function() {
			expect(element.hasAttribute('data-first')).toBe(false);
			expect(element.hasAttribute('data-second')).toBe(true);
			expect(element.getAttribute('data-second')).toBe('two');

			done();
		});

		expect(element.hasAttribute('data-first')).toBe(true);
		expect(element.getAttribute('data-first')).toBe('one');
		expect(element.hasAttribute('data-second')).toBe(false);

		model.first = null;
		model.second = 'two';
	});

	it('allows for scoped variables', function(done) {
		var element = document.createElement('div'),
			model;

		element.setAttribute('data-kontext', 'attribute: {data-first: sub.first, data-second: sub.second}');

		model = kontext.bind({sub: {first: 'one', second: null}}, element);

		model.on('update', function() {
			expect(element.hasAttribute('data-first')).toBe(false);
			expect(element.hasAttribute('data-second')).toBe(true);
			expect(element.getAttribute('data-second')).toBe('two');

			done();
		});

		expect(element.hasAttribute('data-first')).toBe(true);
		expect(element.getAttribute('data-first')).toBe('one');
		expect(element.hasAttribute('data-second')).toBe(false);

		model.sub.first = null;
		model.sub.second = 'two';
	});
});
