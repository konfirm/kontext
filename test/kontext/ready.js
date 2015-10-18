/*global kontext, describe, afterEach, beforeEach, it, expect*/

describe('Kontext Ready', function() {
	'use strict';

	it('triggers each ready handler once', function(done) {
		var result = [];

		kontext.ready(function(error) {
			result.push('first');
		});

		kontext.ready(function(error) {
			result.push('second');

			expect(result.length).toBe(2);
			expect(result[0]).toBe('first');
			expect(result[1]).toBe('second');

			done();
		});
	});
});
