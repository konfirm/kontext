/*global setup: true, kontext: true, describe: true, it: true, expect: true*/
describe('Kontext Delegate', function() {
	'use strict';

	var scope = setup();

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

	it('accepts explicit delegates and sets the scope to the model/key if not done already', function(done) {
		var element = document.createElement('div'),
			model = {
				delegateFoo: kontext.delegate('bar')
			};

		element.appendChild(document.createTextNode('Hello {delegateFoo}!'));
		model = kontext.bind(model, element);

		model.on('update', function(m, k, o, n) {
			expect(m).toBe(model);
			expect(k).toBe('delegateFoo');

			if (o === 'bar') {
				expect(n).toBe('baz');

				expect(model.delegateFoo()).toBe('baz');
				expect(typeof model.delegateFoo).toBe('function');

				// call scope 'manually' (useless)
				model.delegateFoo.scope(m, k);

				model.delegateFoo('qux');
			}
			else {
				expect(o).toBe('baz');
				expect(n).toBe('qux');

				expect(model.delegateFoo()).toBe('qux');

				done();
			}
		});

		scope.delay(function() {
			model.delegateFoo('baz')
		});
	});

	it('allows adding elements to explicit delegates, and these are synced with the current value', function(done) {
		var element = document.createElement('div'),
			model = {
				delegateFoo: kontext.delegate('bar')
			};

		element.appendChild(document.createTextNode('hello {delegateFoo}.'));

		kontext.bind(model, element);

		expect(typeof model.delegateFoo.element).toBe('function');
		model.delegateFoo.element(element.appendChild(document.createTextNode('lolwut')));

		expect(model.delegateFoo.element().length).toBe(2);

		model.on('update', function(m, k, o, n) {
			expect(m).toBe(model);
			expect(k).toBe('delegateFoo');
			expect(o).toBe('bar');
			expect(n).toBe('qux');

			scope.delay(function() {
				expect(element.innerText).toBe('hello qux.qux');

				done();
			}, 20);
		});

		scope.delay(function() {
			expect(element.innerText).toBe('hello bar.bar');

			model.delegateFoo('qux');
		}, 20);
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
