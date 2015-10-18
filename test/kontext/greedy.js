/*global kontext, describe, afterEach, beforeEach, it, expect, spyOn*/
describe('Kontext Greedy', function() {
	'use strict';

	beforeEach(function(done) {
		var content = '<p>{foo:fool}</p>',
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
		var model = kontext.bind({}, document.body);

		expect('foo' in model).toBe(true);
		expect(model.foo).toBe('fool');

		done();
	});

	it('respecs greediness to be turned off using defaults', function(done) {
		var model;

		kontext.defaults({greedy: false});

		model = kontext.bind({}, document.body);

		expect('foo' in model).toBe(false);

		done();
	});
});