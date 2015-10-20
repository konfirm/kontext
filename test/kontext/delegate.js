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

	it('accepts explicit delegates and sets the scope to the model/key if not done already', function(done) {
		var element = document.createElement('div'),
			model;

		element.appendChild(document.createTextNode('Hello {delegateFoo}!'));
		model = kontext.bind({
			delegateFoo: kontext.delegate('bar')
		}, element);

		model.on('update', function() {
			console.log('update', arguments);
		});

		model.delegateFoo('baz');

		expect(model.delegateFoo()).toBe('baz');
		done();
	});

	it('provides `delegation` method on models', function(done) {
		var model = kontext.bind({foo: 'bar'}, document.createElement('div')),
			delegate;

		expect(model.foo).toBe('bar');
		expect(typeof model.delegation).toBe('function');
		delegate = model.delegation('foo');
		expect(typeof delegate).toBe('function');
		expect(delegate('baz')).toBe('baz');
		expect(model.foo).toBe('baz');

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
