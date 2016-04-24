/*global Settings: true, describe: true, it: true, expect: true*/
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
				expect(method()).toEqual({foo: 'bar'});
			});

			it('handles (object) key operations', function() {
				expect(method()).toEqual({foo: 'bar'});

				expect(method({foo: 'baz', bar: false})).toEqual({foo: 'baz', bar: false});
				expect(method('foo')).toBe('baz');
				expect(method('bar')).toBe(false);

				expect(method({a: {b: 'c', d: 'e'}})).toEqual({foo: 'baz', bar: false, a: {b: 'c', d: 'e'}});
				expect(method({a: {f: 'g'}})).toEqual({foo: 'baz', bar: false, a: {b: 'c', d: 'e', f: 'g'}});
				expect(method({foo: null, bar: null, a: null})).toEqual({foo: null, bar: null, a: null});
			});
		});
	});

	it('combines overrides with public settings without changing', function() {
		var override;

		settings.public('foo', 'fool');
		settings.public('bar', 'drink');
		override = settings.combine({foo: 'diff'});

		expect(settings.public('foo')).toBe('fool');
		expect(override.foo).toBe('diff');
		expect(override.bar).toBe(settings.public('bar'));
	});

	it('combines defaults', function() {
		var override = settings.combine();

		expect(settings.public('foo')).toBe('fool');
		expect(override.foo).toBe('fool');
		expect(override.bar).toBe(settings.public('bar'));
	});
});
