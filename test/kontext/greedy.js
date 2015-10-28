/*global kontext, describe, afterEach, beforeEach, it, expect*/
describe('Kontext Greedy', function() {
	'use strict';

	beforeEach(function(done) {
		var content = '<p>{foo:fool}, {bar} and {baz}</p>',
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

	it('adds properties not in model but in document by default', function(done) {
		var model = kontext.bind({baz:null}, document.body);

		expect('foo' in model).toBe(true);
		expect(model.foo).toBe('fool');

		expect('bar' in model).toBe(true);
		expect(model.bar).toBe('');

		expect('baz' in model).toBe(true);
		expect(model.baz).toBe('');

		done();
	});

	it('respecs greediness to be turned off using defaults', function(done) {
		var model;

		kontext.defaults({greedy: false});

		model = kontext.bind({baz:null}, document.body);

		expect('foo' in model).toBe(false);
		expect('bar' in model).toBe(false);
		expect('baz' in model).toBe(true);
		expect(model.baz).toBe('');

		done();
	});
});
