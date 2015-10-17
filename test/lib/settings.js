/*global Settings, describe, beforeEach, it, expect*/
describe('Settings', function() {
	'use strict';

	var settings = new Settings();

	['_', 'public'].forEach(function(name) {
		var method = settings[name] || undefined;

		describe('`' + name + '` (internal) method', function() {
			it('is available', function() {
				expect(typeof method).toBe('function');
				expect(method()).toEqual({});
			});

			it('handles (string) key operations', function() {
				expect(method('foo')).toBe(undefined);
				expect(method('foo', 'bar')).toBe('bar');
				expect(method('foo')).toBe('bar');
				expect(method()).toEqual({foo:'bar'});
			});

			it('handles (object) key operations', function() {
				expect(method()).toEqual({foo:'bar'});

				expect(method({foo:'baz', bar:false})).toEqual({foo:'baz', bar:false});
				expect(method('foo')).toBe('baz');
				expect(method('bar')).toBe(false);

				expect(method({a: {b: 'c', d: 'e'}})).toEqual({foo: 'baz', bar: false, a: {b: 'c', d: 'e'}});
				expect(method({a: {f: 'g'}})).toEqual({foo: 'baz', bar: false, a: {b: 'c', d: 'e', f: 'g'}});
				expect(method({foo: null, bar: null, a: null})).toEqual({foo: null, bar: null, a: null});
			});
		});
	});
});
