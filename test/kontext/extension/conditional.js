/*global kontext: true, describe: true, it: true, expect: true*/
describe('Kontext Extension Conditional', function() {
	'use strict';

	/**
	 *  prepare a model and elements which are passed on to a function
	 */
	function prepare(fn) {
		var model = {
				num: 0,
				arr: [2, 4],
				str: 'hello',
				path: {
					to: {
						nested: true
					}
				}
			},
			main = document.createElement('main'),
			element = main.appendChild(document.createElement('div'));

		fn(model, element, main);
	}

	/**
	 * create a very isolated test
	 */
	function runner(name, cond, no, yes, conditioner) {
		var first = true,
			ready = false;

		prepare(function(model, element, main) {
			it(name, function(done) {
				element.setAttribute('data-kontext', conditioner(cond));
				kontext.bind(model, main);

				model.on('update', function() {
					// console.log(name, model.num, element.parentNode);

					if (ready) {
						return console.log('MODEL.UPDATE after ready');
					}

					if (first) {
						first = false;
						expect(element.parentNode).toBe(null);

						if (typeof yes === 'function') {
							yes(model);
						}
						else {
							model.num = yes;
						}
					}
					else {
						expect(element.parentNode).toBe(main);
						ready = true;
						done();
					}
				});

				if (no === null) {
					expect(element.parentNode).toBe(yes ? main : null);
					done();
				}
				else if (typeof no === 'function') {
					no(model);
				}
				else {
					model.num = no;
				}
			});
		});
	}

	/**
	 *  create a runner whose condition is used in full for the data-kontext="conditional: .."
	 */
	function elaborate(name, cond, no, yes) {
		return runner(name, cond, no, yes, function(c) {
			return 'conditional: ' + c;
		});
	}

	/**
	 *  create a runner whose condition is wrapped with {num: <cond>} for the data-kontext="conditional: .."
	 */
	function comparison(name, cond, no, yes) {
		return runner(name, cond, no, yes, function(c) {
			return 'conditional: {num: ' + c + '}';
		});
	}

	describe('adds/changes/removes itself', function() {
		describe('comparison', function() {
			comparison('$eq', '{$eq: 3}', 2, 3);
			comparison('$eq (short)', '7', 6, 7);

			comparison('$lt', '{$lt: 3}', 3, 2);
			comparison('$lte (<)', '{$lte: 4}', 8, 1);
			comparison('$lte (=)', '{$lte: 3}', 7, 3);

			comparison('$gt', '{$gt: 3}', 3, 7);
			comparison('$gte (>)', '{$gte: 4}', 1, 8);
			comparison('$gte (=)', '{$gte: 7}', 2, 7);

			comparison('$ne', '{$ne: 1}', 1, 2);

			comparison('$in', '{$in: [1, 2]}', 4, 2);
			comparison('$in (resolved, num change)', '{$in: arr}', 3, 2);
			comparison('$in (resolved, arr change)', '{$in: arr}', 3, function(model) {
				model.arr.push(3);
			});

			comparison('$nin', '{$nin: [1, 2]}', 2, 4);
			comparison('$nin (resolved, num change)', '{$nin: arr}', 2, 3);
			comparison('$nin (resolved, arr change)', '{$nin: arr}', 2, function(model) {
				model.arr.shift();
			});
		});

		describe('logical', function() {
			elaborate('$or', '{$or: [{num: 1}, {num: {$gt:2}}]}', 2, 3);

			elaborate('$and', '{$and: [{num: 1}, {str: {$in: [world]}}]}', 1, function(model) {
				model.str = 'world';
			});

			elaborate('$and (short)', '[{num: 2}, {str: {$in: [hello]}}]', 1, 2);

			elaborate('$not', '{$not: [{num: 1}, {str: hello}]}', 1, 2);

			elaborate('$nor', '{$nor: [{num: 1}, {str: hello}]}', 2, function(model) {
				model.str = 'world';
			});
		});

		describe('element', function() {
			elaborate('$exist (short, true)', 'str', null, true);
			elaborate('$exist (short, false)', 'foo', null, false);

			elaborate('$exist (scoped: short, true)', 'path.to.nested', null, true);
			elaborate('$exist (scoped: short, false)', 'path.to.foo', null, false);

			elaborate('$exist (yes, true)', '{str: {$exists: true}}', null, true);
			elaborate('$exist (no, true)', '{foo: {$exists: false}}', null, true);
			elaborate('$exist (no, false)', '{str: {$exists: false}}', null, false);
			elaborate('$exist (yes, false)', '{foo: {$exists: true}}', null, false);

			elaborate('$exist (scoped: yes, true)', '{path.to.nested: {$exists: true}}', null, true);
			elaborate('$exist (scoped: no, true)', '{path.to.foo: {$exists: false}}', null, true);
			elaborate('$exist (scoped: no, false)', '{path.to.nested: {$exists: false}}', null, false);
			elaborate('$exist (scoped: yes, false)', '{path.foo: {$exists: true}}', null, false);

			elaborate('$type (number = number)', '{num: {$type: number}}', null, true);
			elaborate('$type (number = n)', '{num: {$type: n}}', null, true);

			elaborate('$type (number != string)', '{num: {$type: string}}', null, false);
			elaborate('$type (number != s)', '{num: {$type: s}}', null, false);

			elaborate('$type (array = array)', '{arr: {$type: array}}', null, true);
			elaborate('$type (array = a)', '{arr: {$type: a}}', null, true);

			elaborate('$type (array != boolean)', '{array: {$type: boolean}}', null, false);
			elaborate('$type (array != b)', '{array: {$type: b}}', null, false);
		});

		describe('evaluation', function() {
			elaborate('$mod [3, 1]', '{num: {$mod: [3, 1]}}', 3, 4);
			elaborate('$mod [5, 0]', '{num: {$mod: [5, 0]}}', 4, 5);
			elaborate('$mod [7]', '{num: {$mod: [7]}}', 2, 14);
			elaborate('$mod 4', '{num: {$mod: 4}}', 2, 8);

			elaborate('$regex (str, ello)', '{str: {$regex: ello}}', null, true);
			elaborate('$regex (str, ^ello)', '{str: {$regex: ^ello}}', null, false);
			elaborate('$regex (str, ^hell)', '{str: {$regex: ^hell}}', null, true);
			elaborate('$regex (str, /^Hel+o$/)', '{str: {$regex: /^Hel+o$/}}', null, false);
			elaborate('$regex (str, /^Hel+o$/i)', '{str: {$regex: /^Hel+o$/i}}', null, true);
			elaborate('$regex (num, 3)', '{num: {$regex: 3}}', 2, 3);
		});

		describe('array', function() {
			elaborate('$all', '{arr: {$all: [1, 3, 4]}}', function(model) {
				model.arr.push(1);
			}, function(model) {
				model.arr.push(3);
			});

			elaborate('$elemMatch', '{arr: {$elemMatch: {$gte: 2, $lt: 4}}}', function(model) {
				model.arr.shift();
			}, function(model) {
				model.arr.push(3);
			});

			elaborate('$size', '{arr: {$size: 4}}', function(model) {
				model.arr.push('foo');
			}, function(model) {
				model.arr.push('bar');
			});
		});

		describe('invalid conditions', function() {
			elaborate('null condition', 'null', null, false);
			elaborate('number condition', '123', null, false);

			it('unavailable condition', function(done) {
				prepare(function(model, element, main) {
					element.setAttribute('data-kontext', 'conditional: {field: {$meh: false}}');

					expect(function() {
						kontext.bind(model, main);
					}).toThrow(new Error('Operator "$meh" not implemented'));

					done();
				});
			});
		});
	});
});
