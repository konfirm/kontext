/*global JSONFormatter, describe, it, expect*/
describe('JSONFormatter', function() {
	'use strict';

	it('is a singleton', function() {
		expect(JSONFormatter()).toBe(JSONFormatter());
		expect(JSONFormatter()).toBe(new JSONFormatter());
		expect(new JSONFormatter()).toBe(JSONFormatter());
		expect(new JSONFormatter()).toBe(new JSONFormatter());
	});

	it('ignores non-string values', function() {
		var json = new JSONFormatter();

		[1, Math.PI, true, false, [], {}, [1,'a'], {a:1}].forEach(function(v) {
			expect(json.prepare(v)).toBe('');
			expect(json.parse(v)).toBe(null);
		});
	});

	it('parses proper JSON syntax', function() {
		var json = new JSONFormatter();

		expect(json.parse('hello')).toBe('hello');

		expect(json.parse('true')).toBe(true);
		expect(json.parse('false')).toBe(false);

		expect(json.parse('123')).toBe(123);
		expect(json.parse('123.45')).toBe(123.45);

		expect(json.parse('[1, 2, 3]')).toEqual([1, 2, 3]);

		expect(json.parse('{"int":1, "float": -1.23, "boolfalse": false, "booltrue": true, "string": "string", "array":[1, 2]}')).toEqual({
			int: 1,
			float: -1.23,
			boolfalse: false,
			booltrue: true,
			string: 'string',
			array: [1, 2]
		});
	});

	it('is relaxed about the outer wrapping', function() {
		var json = new JSONFormatter();

		expect(json.parse('hello, world')).toEqual(['hello', 'world']);
		expect(json.parse('hello: world')).toEqual({hello:'world'});
		expect(json.parse('foo: bar, baz: true')).toEqual({foo:'bar', baz:true});
	});

	it('is relaxed about trailing commas', function() {
		var json = new JSONFormatter();

		expect(json.prepare('1, 2,')).toBe('[1,2]');
		expect(json.parse('3, 4,')).toEqual([3,4]);

		expect(json.prepare('hello: world,')).toBe('{"hello":"world"}');
		expect(json.parse('hello: world,')).toEqual({hello:'world'});
	});

	it('respects quoted values', function() {
		var json = new JSONFormatter();

		expect(json.prepare('"hello:world"')).toBe('"hello:world"');
		expect(json.parse('"hello:world"')).toBe('hello:world');

		expect(json.prepare('"hello,world"')).toBe('"hello,world"');
		expect(json.parse('"hello,world"')).toBe('hello,world');

		expect(json.prepare('"hello,\'world"')).toBe('"hello,\'world"');
		expect(json.parse('"hello,\'world"')).toBe('hello,\'world');

		expect(json.prepare('"hello,\'world\'"')).toBe('"hello,\'world\'"');
		expect(json.parse('"hello,\'world\'"')).toBe('hello,\'world\'');
	});

	it('trims keys and values', function() {
		var json = new JSONFormatter();

		expect(json.parse('    hello    ')).toEqual('hello');
		expect(json.parse('    hello    :    world    ')).toEqual({hello:'world'});
	});

	it('allows keywords and numbers to be used as object keys', function() {
		var json = new JSONFormatter();

		expect(json.prepare('true:true')).toBe('{"true":true}');
		expect(json.parse('true:true')).toEqual({true:true});

		expect(json.prepare('false:false')).toBe('{"false":false}');
		expect(json.parse('false:false')).toEqual({false:false});

		expect(json.prepare('null:null')).toBe('{"null":null}');
		expect(json.parse('null:null')).toEqual({null:null});

		expect(json.prepare('123:456')).toBe('{"123":456}');
		expect(json.parse('123:456')).toEqual({123:456});

		expect(json.prepare('true: true, false: false')).toBe('{"true":true,"false":false}');
		expect(json.parse('true: true, false: false')).toEqual({true:true,false:false});
	});
});
