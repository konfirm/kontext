/*global kontext: true, describe: true, afterEach: true, beforeEach: true, it: true, expect: true*/
describe('Kontext Providers', function() {
	'use strict';

	describe('registers the default providers', function() {
		it('has text', function() {
			var defaults = kontext.defaults();

			expect('provider' in defaults).toBe(true);
			expect('text' in defaults.provider).toBe(true);
		});

		it('has attribute', function() {
			var defaults = kontext.defaults();

			expect('provider' in defaults).toBe(true);
			expect('attribute' in defaults.provider).toBe(true);
		});
	});

});
