/*global kontext, describe, afterEach, beforeEach, it, expect*/
describe('Kontext', function() {
	'use strict';

	beforeEach(function(done) {
		var content = '<p>A {foo:fool} walks into a {bar:trap}',
			wrapper = document.body.insertBefore(document.createElement('div'), document.body.firstChild);

		wrapper.setAttribute('id', 'fixture');

		document.body.insertBefore(wrapper, document.body.firstChild);

		done();
	});

	afterEach(function(done) {
		var wrapper = document.querySelector('#fixture');

		if (wrapper) {
			wrapper.parentNode.removeChild(wrapper);
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

			expect(old).toBe('bar');
		});

		model.on('update', function(model, key, old) {
			++notes;

			expect(old).toBe('bar');
			expect(notes).toBe(2);

			done();
		});

		model.foo = 'baz';
	});
});
