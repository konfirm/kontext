/*global kontext: true, describe: true, afterEach: true, beforeEach: true, it: true, expect: true*/
describe('Kontext Providers', function() {
	'use strict';

	describe('registers the default providers', function() {
		it('has text', function() {
			var defaults = kontext.defaults();

			expect('providers' in defaults).toBe(true);
			expect(defaults.providers.indexOf('text') >= 0).toBe(true);
		});

		it('has attribute', function() {
			var defaults = kontext.defaults();

			expect('providers' in defaults).toBe(true);
			expect(defaults.providers.indexOf('attribute') >= 0).toBe(true);
		});
	});

});
