/*global kontext, describe, beforeEach, it, expect*/
describe('Kontext', function() {
	'use strict';

	var model;

	beforeEach(function() {
		document.body.insertBefore(document.createTextNode('a {foo:fool} walks into a {bar:trap}'), document.body.firstChild);

		model = kontext.bind({
			foo: 'bar',
			bar: 'baz'
		}, document.body);
	});

	it('notifies change', function(done) {
		var notes = 0;

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
