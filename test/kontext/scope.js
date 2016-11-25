/* global kontext: true, describe: true, it: true, expect: true */
describe('Kontext Scope', function() {
	'use strict';

	var scopes = [
		{
			model: {foo: 'bar'},
			expectation: {foo: 'bar', bar: false}
		},
		{
			model: {foo: {bar: 'baz'}},
			expectation: {'foo.bar': 'baz', bar: false, foo: {bar: 'baz'}}
		},
		{
			model: {foo: {bar: {baz: {qux: {xyzzy: 'hello'}}}}},
			expectation: {
				'foo.bar.baz.qux.xyzzy': 'hello',
				'xyxxy.qux.baz.bar.foo': false,
				'foo.bar.baz': {qux: {xyzzy: 'hello'}}
			}
		},
		{
			model: {'a.b.c.d': 'a.b.c.d', 'a.b': {'c.d': 'a.b - c.d', c: 'a.b - c'}},
			expectation: {
				'a.b.c.d': 'a.b.c.d',
				'a.b.c': 'a.b - c',
				'a.b': {'c.d': 'a.b - c.d', c: 'a.b - c'},
				a: false
			}
		}
	];

	scopes.forEach(function(scope) {
		describe('resolves ' + JSON.stringify(scope.model), function() {
			var element = document.createElement('main'),
				model = kontext.bind(scope.model, element);

			Object.keys(scope.expectation)
				.forEach(function(key) {
					var outcome = scope.expectation[key];

					it(key + ' resolves to ' + JSON.stringify(outcome), function() {
						var delegation = model.delegation(key);

						if (outcome) {
							expect(JSON.stringify(delegation())).toBe(JSON.stringify(outcome));
						}
						else {
							expect(delegation).toBe(false);
						}
					});
				});
		});
	});
});
