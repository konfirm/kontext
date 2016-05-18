/*global JSONFormatter: true, describe: true, it: true, expect:true*/
describe('JSONFormatter', function() {
	'use strict';

	function series(description, list, debug) {
		describe(description, function() {
			var json = new JSONFormatter();

			list.forEach(function(item) {
				var title = 'interprets ' + JSON.stringify(item.data) + ' as ' + JSON.stringify(item.expect);

				it(title, function(done) {
					if (debug) {
						console.log(JSON.stringify(json.ast(item.data), null, 2));
					}
					expect(json.prepare(item.data)).toBe(JSON.stringify(item.expect));
					expect(json.parse(item.data)).toEqual(item.expect);

					done();
				});
			});
		});
	}

	it('ignores non-string values', function() {
		var json = new JSONFormatter();

		[1, Math.PI, true, false, [], {}, [1,'a'], {a: 1}].forEach(function(v) {
			expect(json.prepare(v)).toBe('');
			expect(json.parse(v)).toBe(null);
		});
	});

	describe('handles various notations', function() {
		series('parses proper JSON syntax', [
			{data: 'null', expect: null},
			{data: 'true', expect: true},
			{data: 'false', expect: false},
			{data: 'hello', expect: 'hello'},
			{data: '123', expect: 123},
			{data: '123.45', expect: 123.45},
			{data: '-123.45', expect: -123.45},
			{data: '[1, 2, 3]', expect: [1, 2, 3]},
			{
				data: '{"int":1, "float": -1.23, "boolfalse": false, "booltrue": true, "string": "string", "array":[1, 2]}',
				expect: {
					int: 1,
					float: -1.23,
					boolfalse: false,
					booltrue: true,
					string: 'string',
					array: [1, 2]
				}
			}
		]);

		series('does not required bracket to differ between array and objects', [
			{data: 'hello, world', expect: ['hello', 'world']},
			{data: 'hello: world', expect: {hello: 'world'}},
			{data: 'foo: bar, baz: true', expect: {foo: 'bar', baz: true}},
			{data: '1, 2, 3', expect: [1, 2, 3]},
			{data: '1, 2,', expect: [1, 2]},
			{data: 'hello: world,', expect: {hello: 'world'}},
		]);

		series('respects quoted values', [
			{data: '"hello:world"', expect: 'hello:world'},
			{data: '"hello,world"', expect: 'hello,world'},
			{data: '"hello,\'world"', expect: 'hello,\'world'},
			{data: '"hello,\'world\'"', expect: 'hello,\'world\''},
		]);

		series('trims keys and values', [
			{data: '     hello     ', expect: 'hello'},
			{data: '     hello     :     world     ', expect: {hello: 'world'}},
			{data: '\t\t\thello:\n\t\tworld', expect: {hello: 'world'}},
		]);

		series('allows keywords and numbers to be used as object keys', [
			{data: 'true:true', expect: {true: true}},
			{data: 'false:false', expect: {false: false}},
			{data: 'null:null', expect: {null: null}},
			{data: '123:456', expect: {123: 456}},
			{data: 'true: true, false: false', expect: {true: true,false: false}},
		]);

		series('escaped nested quotation marks', [
			{data: 'hello"world', expect: 'hello\"world'}
		]);

		series('removes comments from input', [
			{data: 'hello/*world*/', expect: 'hello'},
			{data: '/*hello*/world', expect: 'world'},
			{data: 'a:b,c:d,/*e:f,*/g:h', expect: {a:'b', c: 'd', g: 'h'}},
		]);

		series('allows for dashes in keys and values', [
			{data: 'foo-bar', expect: 'foo-bar'},
			{data: 'foo-bar: sample-value', expect: {'foo-bar': 'sample-value'}},
			{data: '"[foo-bar=sample-value]"', expect: '[foo-bar=sample-value]'},
		]);

		series('extension use cases', [
			{
				data: 'template: {path: /base/test/data/template.html, selector: \'[data-template=inner-attr]\'}',
				expect: {template: {
					path: '/base/test/data/template.html',
					selector: '[data-template=inner-attr]'
				}}
			}
		]);
	});
});
