/*global kontext, describe, afterEach, beforeEach, it, expect, spyOn*/
describe('Kontext Delegate', function() {
	'use strict';

	it('automatically creates delegates', function(done) {
		var model = kontext.bind({
				foo: 'bar'
			}, document.body),
			desc = Object.getOwnPropertyDescriptor(model, 'foo');

		expect(typeof desc).toBe('object');
		expect(typeof desc.get).toBe('function');
		expect(typeof desc.set).toBe('function');
		expect(desc.get).toBe(desc.set);

		done();
	});

	it('does not meddle with implicitly created delegates', function(done) {
		var model = {
				foo: 'bar'
			},
			a, b, desc;

		a = kontext.bind(model, document.body);

		desc = Object.getOwnPropertyDescriptor(a, 'foo');
		expect(typeof desc).toBe('object');
		expect(typeof desc.get).toBe('function');
		expect(typeof desc.set).toBe('function');
		expect(desc.get).toBe(desc.set);

		b = kontext.bind(a, document.body);

		desc = Object.getOwnPropertyDescriptor(b, 'foo');
		expect(typeof desc).toBe('object');
		expect(typeof desc.get).toBe('function');
		expect(typeof desc.set).toBe('function');
		expect(desc.get).toBe(desc.set);

		expect(a).toBe(b);

		done();
	});

	it('does not meddle with explicitly created delegates', function(done) {
		var model = {
				foo: 'bar'
			},
			dlgt = kontext.delegate('baz'),
			desc;

		model.bar = dlgt;

		kontext.bind(model, document.body);

		desc = Object.getOwnPropertyDescriptor(model, 'foo');

		expect(typeof desc).toBe('object');
		expect(typeof desc.get).toBe('function');
		expect(typeof desc.set).toBe('function');
		expect(desc.get).toBe(desc.set);

		expect(model.bar).toBe(dlgt);

		done();
	});
});
