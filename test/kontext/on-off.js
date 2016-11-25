/* global setup: true, kontext: true, describe: true, beforeEach: true, it: true, expect: true */
describe('Kontext On-Off', function() {
	'use strict';

	var scope = setup();

	beforeEach(function(done) {
		scope.append('<p>A {onoffFoo:fool} walks into a {onoffBar:trap}</p>');

		done();
	});

	/**
	 *  no-operation function
	 */
	function noop() {
	}

	it('notifies change', function(done) {
		var notes = 0,
			model = kontext.bind({
				onoffFoo: 'bar',
				onoffBar: 'baz'
			}, document.body);

		kontext.on('update', noop);
		expect(kontext.off('update', noop)).toEqual([noop]);

		model.on('update', noop);
		expect(model.off('update', noop)).toEqual([noop]);

		//  kontext itself emits before the model
		kontext.on('update', function(mod, key, old) {
			if (key === 'onoffFoo') {
				++notes;
				expect(old).toBe('bar');

				kontext.off('update');
			}
		});

		model.on('update', function(mod, key, old) {
			if (key === 'onoffFoo') {
				++notes;

				expect(notes).toBe(2);
				expect(old).toBe('bar');

				mod.off('update');
				mod.onoffFoo = 'nope';

				scope.delay(function() {
					expect(notes).toBe(2);

					done();
				}, 100);
			}
		});

		scope.delay(function() {
			model.onoffFoo = 'baz';
		});
	});


	it('recursively triggers for submodels', function(done) {
		var model = kontext.bind({
				foo: {
					bar: {
						baz: 'ok'
					}
				}
			}, document.createElement('div')),
			result = [];

		model.on('update', function(m, k) {
			result.push(k);

			expect(k).toBe('foo.bar.baz');
			expect(result[0]).toBe('baz');
			expect(result[1]).toBe('bar.baz');
			expect(result[2]).toBe(k);

			done();
		});

		model.foo.on('update', function(m, k) {
			result.push(k);

			expect(k).toBe('bar.baz');
		});

		model.foo.bar.on('update', function(m, k) {
			result.push(k);

			expect(k).toBe('baz');
		});

		scope.delay(function() {
			model.foo.bar.baz = 'changed';
		});
	});
});
