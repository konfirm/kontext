/*global describe, beforeEach, it*/
describe('Emission', function() {
	'use strict';
	var emission;

	beforeEach(function() {
		emission = new Emission();
	});

	it('adds multiple handlers for the same type', function() {
		var count = [];

		emission.add('test', function(value) {
			count.push({value: value});
		});

		emission.add('test', function(value) {
			count.push({value: value});
		});

		emission.trigger('test', 'foo');

		expect(count.length).toBe(2);

		expect(count.filter(function(v) {
			return v.value === 'foo';
		}).length).toBe(2);

		expect(count.filter(function(v) {
			return v.value === 'bar';
		}).length).toBe(0);
	});
});
