/*global JSONFormatter: true, describe: true, it: true, expect: true*/
describe('JSONFormatter TODO', function() {
	'use strict';

	//  This tests contains pitfalls that we know of

	it('trips over nested quotation symbols', function() {
		var json = new JSONFormatter();

		//  The desired result is not matched
		expect(json.prepare('hello"world')).not.toBe('"hello\\"world"');

		//  The current result
		expect(json.prepare('hello"world')).toBe('"hello""world"');
	});

	//  If you know of any other failing syntaxes, please: report them and fix and/or add those as a test
});
