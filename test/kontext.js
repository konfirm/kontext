/*global kontext, describe, beforeEach, it, expect*/
describe('Kontext', function() {
	'use strict';

	var model = kontext.bind({
			foo: 'bar',
			pie: Math.PI,
			boo: false
		}, document.body);

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
