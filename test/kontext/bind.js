/*global kontext, describe, afterEach, beforeEach, it, expect, spyOn*/
describe('Kontext Bind', function() {
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

	it('binds a model multiple times, never meddles with prepared models', function(done) {
		var model = {baz:null},
			a, b, c, d;

		a = kontext.bind(model, document.body);
		b = kontext.bind(model, document.body);
		c = kontext.bind(a, document.body);
		d = kontext.bind(b, document.body);

		expect(a).toBe(b);
		expect(b).toBe(c);
		expect(c).toBe(d);
		expect(d).toBe(a);

		done();
	});
});
