/*global kontext: true, describe: true, afterEach: true, beforeEach: true, it: true, expect: true*/
describe('Kontext On-Off', function() {
	'use strict';

	beforeEach(function(done) {
		var content = '<p>A {onoffFoo:fool} walks into a {onoffBar:trap}</p>',
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
			}
		});

		model.onoffFoo = 'baz';

		setTimeout(function() {
			expect(notes).toBe(2);
			done();
		}, 100);
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

		model.foo.bar.baz = 'changed';
	});
});
