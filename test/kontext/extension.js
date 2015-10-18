/*global kontext, describe, afterEach, beforeEach, it, expect, spyOn*/
describe('Kontext Extension', function() {
	'use strict';

	beforeEach(function(done) {
		var content = '<p data-kontext="basic: foo">foo</p>',
			wrapper = document.body.insertBefore(document.createElement('div'), document.body.firstChild);

		wrapper.setAttribute('class', 'fixture');
		wrapper.innerHTML = content;

		document.body.insertBefore(wrapper, document.body.firstChild);

		done();
	});

	afterEach(function(done) {
		var list = document.querySelectorAll('.fixture'),
			i;

		for (i = 0; i < list.length; ++i) {
			list[i].parentNode.removeChild(list[i]);
		}

		done();
	});

	function basic(element, model, key) {
		model.on('update', function(m, k) {
			element.setAttribute('data-basic', m[k]);
		});

		element.setAttribute('data-basic', model[key]);
	}

	it('informs about unknown extensions', function(done) {
		var unknown = kontext.extension('unknown');

		spyOn(console, 'error');

		unknown();

		expect(console.error).toHaveBeenCalled();
		expect(console.error).toHaveBeenCalledWith('Kontext: Unknown extension "unknown"');

		done();
	});

	it('registers custom handlers', function(done) {
		var list = document.querySelectorAll('[data-kontext*=basic]'),
			model;

		kontext.extension('basic', basic);

		model = kontext.bind({
			foo: 'bar'
		}, document.body);

		model.on('update', function(model, key, old) {
			expect(list[0].getAttribute('data-basic')).toBe('baz');

			done();
		});

		setTimeout(function() {
			expect(list[0].getAttribute('data-basic')).toBe('bar');

			model.foo = 'baz';
		}, 60);
	});
});
