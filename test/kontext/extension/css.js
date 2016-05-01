/*global kontext: true, describe: true, it: true, expect: true*/
describe('Kontext Extension CSS', function() {
	'use strict';

	it('adds/removes classes', function(done) {
		var element = document.createElement('div'),
			model;

		element.setAttribute('data-kontext', 'css: {first: first, second: second}');

		model = kontext.bind({first: true, second: false}, element);
		expect(element.className).toContain('first');
		expect(element.className).not.toContain('second');

		model.on('update', function() {
			if (!model.first) {
				expect(element.className).not.toContain('first');
			}
			else {
				expect(element.className).toContain('first');
			}

			if (!model.second) {
				expect(element.className).not.toContain('second');
			}
			else {
				expect(element.className).toContain('second');
			}

			if (!model.first && model.second) {
				done();
			}
			else {
				model.second = true;
			}
		});

		model.first = false;
	});

	it('allows for scoped variables', function(done) {
		var element = document.createElement('div'),
			model;

		element.setAttribute('data-kontext', 'css: {first: sub.first, second: sub.second}');

		model = kontext.bind({sub: {first: true, second: false}}, element);
		expect(element.className).toContain('first');
		expect(element.className).not.toContain('second');

		model.on('update', function() {
			if (!model.sub.first) {
				expect(element.className).not.toContain('first');
			}
			else {
				expect(element.className).toContain('first');
			}

			if (!model.sub.second) {
				expect(element.className).not.toContain('second');
			}
			else {
				expect(element.className).toContain('second');
			}

			if (!model.sub.first && model.sub.second) {
				done();
			}
			else {
				model.sub.second = true;
			}
		});

		model.sub.first = false;
	});

	it('does not trip over non-existent properties', function() {
		var element = document.createElement('div');

		element.setAttribute('data-kontext', 'css: {first: first, second: sub.second}');

		expect(function() {
			kontext.bind({sub: {}}, element);
		}).not.toThrow(Error);
	});

	it('falls back on the className property if classList does not exist', function(done) {
		var faux = {className: 'foo bar baz'},
			ext = kontext.extension('css'),
			noop = document.createElement('div'),
			model;

		//  we need to call the extension directly, as we need to emulate a DOMElement without
		//  support for classList
		model = kontext.bind({bar: true, baz: false}, noop);

		expect(faux.className).toBe('foo bar baz');

		//  apply the faux element to the extension
		ext(faux, model, {bar: 'bar', baz: 'baz'});

		expect(faux.className).toBe('foo bar');

		model.on('update', function(m, k) {
			if (k === 'bar') {
				if (!model.bar) {
					expect(faux.className).toBe('foo');
					model.bar = true;
				}
				else {
					expect(faux.className).toBe('foo bar');
					model.baz = true;
				}
			}
			else if (k === 'baz') {
				expect(faux.className).toBe('foo bar baz');

				done();
			}
		});

		model.bar = false;
	});
});
