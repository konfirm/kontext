/* global setup: true, kontext: true, describe: true, beforeEach: true, it: true, expect: true */
describe('Kontext Greedy', function() {
	'use strict';

	var scope = setup();

	beforeEach(function(done) {
		scope.append('<p>{foo:fool}, {bar} and {baz}</p>');

		done();
	});

	it('adds properties not in model but in document by default', function(done) {
		var model = kontext.bind({baz: null}, scope.node);

		scope.delay(function() {
			expect('foo' in model).toBe(true);
			expect(model.foo).toBe('fool');

			expect('bar' in model).toBe(true);
			expect(model.bar).toBe('');

			expect('baz' in model).toBe(true);
			expect(model.baz).toBe('');

			done();
		});
	});

	it('does not change default behavious when `null` is explicitly provided as option', function(done) {
		var model = kontext.bind({baz: null}, scope.node, null);

		scope.delay(function() {
			expect('foo' in model).toBe(true);
			expect('bar' in model).toBe(true);
			expect('baz' in model).toBe(true);
			expect(model.baz).toBe('');

			done();
		});
	});

	it('respects greediness to be turned off using bind options', function(done) {
		var model = kontext.bind({baz: null}, document.body, {greedy: false});

		scope.delay(function() {
			expect('foo' in model).toBe(false);
			expect('bar' in model).toBe(false);
			expect('baz' in model).toBe(true);
			expect(model.baz).toBe('');

			done();
		});
	});

	it('respects greediness to be turned off using defaults', function(done) {
		var model;

		kontext.defaults({greedy: false});

		model = kontext.bind({baz: null}, document.body);

		scope.delay(function() {
			expect('foo' in model).toBe(false);
			expect('bar' in model).toBe(false);
			expect('baz' in model).toBe(true);
			expect(model.baz).toBe('');

			done();
		});
	});
});
