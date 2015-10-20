/*global kontext, describe, afterEach, beforeEach, it, expect*/
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

	function noop() {
	};

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
		kontext.on('update', function(model, key, old) {
			if (key === 'onoffFoo') {
				++notes;
				expect(old).toBe('bar');

				kontext.off('update');
			}
		});

		model.on('update', function(model, key, old) {
			if (key === 'onoffFoo') {
				++notes;

				expect(notes).toBe(2);
				expect(old).toBe('bar');

				model.off('update');
				model.onoffFoo = 'nope';
			}
		});

		model.onoffFoo = 'baz';

		setTimeout(function() {
			expect(notes).toBe(2);
			done();
		}, 100);
	});
});
