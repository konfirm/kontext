/*global kontext: true, describe: true, it: true, expect: true*/
describe('Kontext Delegate', function() {
	'use strict';

	it('automatically creates delegates', function() {
		var model = kontext.bind({
				foo: 'bar'
			}, document.body),
			desc = Object.getOwnPropertyDescriptor(model, 'foo');

		expect(typeof desc).toBe('object');
		expect(typeof desc.get).toBe('function');
		expect(typeof desc.set).toBe('function');
		expect(desc.get).toBe(desc.set);
	});

	it('accepts explicit delegates and sets the scope to the model/key if not done already', function() {
		var element = document.createElement('div'),
			model;

		element.appendChild(document.createTextNode('Hello {delegateFoo}!'));
		model = kontext.bind({
			delegateFoo: kontext.delegate('bar')
		}, element);

		model.delegateFoo('baz');

		expect(model.delegateFoo()).toBe('baz');
	});

	it('provides `delegation` method on models', function() {
		var model = kontext.bind({foo: 'bar'}, document.createElement('div')),
			delegate;

		expect(model.foo).toBe('bar');
		expect(typeof model.delegation).toBe('function');
		delegate = model.delegation('foo');
		expect(typeof delegate).toBe('function');
		expect(delegate('baz')).toBe('baz');
		expect(model.foo).toBe('baz');
	});

	it('can obtain a list of bound elements from a delegate', function() {
		var element = document.createElement('div'),
			model, length;

		element.appendChild(document.createTextNode('a: {a}, b: {b}, b again: {b}'));
		model = kontext.bind({a: 'first', b: 'second'}, element);

		length = model.delegation('a').element().length;
		expect(length).toBe(1);

		length = model.delegation('b').element().length;
		expect(length).toBe(2);
	});

	it('does not meddle with implicitly created delegates', function() {
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
	});

	it('does not meddle with explicitly created delegates', function() {
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
	});
});
