/*global kontext, describe, afterEach, beforeEach, it, expect*/
describe('Kontext', function() {
	'use strict';

	beforeEach(function(done) {
		var content = '<p>A {foo:fool} walks into a {bar:trap}</p>',
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

	it('notifies change', function(done) {
		var notes = 0,
			model = kontext.bind({
				foo: 'bar',
				bar: 'baz'
			}, document.body);

		//  kontext itself emits before the model
		kontext.on('update', function(model, key, old) {
			++notes;

			if (key === 'foo') {
				expect(old).toBe('bar');

				kontext.off('update');
			}
		});

		model.on('update', function(model, key, old) {
			++notes;

			// expect(old).toBe('bar');
			expect(notes).toBe(2);

			if (key === 'foo') {
				expect(old).toBe('bar');

				model.off('update');
			}

			model.foo = 'nope';
		});

		model.foo = 'baz';

		setTimeout(function() {
			expect(notes).toBe(2);
			done();
		}, 100);
	});
});
