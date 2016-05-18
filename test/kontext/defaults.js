/*global kontext: true, describe: true, it: true, expect: true*/
describe('Kontext Defaults', function() {
	'use strict';

	it('defaults contain.. defaults', function() {
		var a = kontext.defaults();

		expect(a.greedy).toBe(true);
	});

	it('defaults can be changed, reflected in all referenced defaults', function() {
		var a = kontext.defaults();

		expect(a.greedy).toBe(true);
		expect(kontext.defaults().greedy).toBe(true);

		a.greedy = false;
		expect(a.greedy).toBe(false);
		expect(kontext.defaults().greedy).toBe(false);

		kontext.defaults({greedy: true});
		expect(a.greedy).toBe(true);
		expect(kontext.defaults().greedy).toBe(true);
	});

	it('prefers object types', function() {
		kontext.defaults({a: {b: {c: 1}}});
		kontext.defaults({a: {b: {d: 2}}});

		expect(kontext.defaults().a.b).toEqual({c: 1, d: 2});
	});

	it('allow any key to be added', function() {
		kontext.defaults('foo.bar.baz', 'qux');

		expect(kontext.defaults().foo.bar.baz).toBe('qux');
	});
});
