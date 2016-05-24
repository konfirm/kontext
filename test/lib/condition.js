/*global Condition: true, describe: true, it: true, expect: true*/
describe('Condition', function() {
	'use strict';

	var condition = new Condition(),
		model = {
			a: 3,
			b: 7,
			c: {
				d: 4,
				e: 12
			},
			f: [3, 4, 5, 6, 7],
			g: ['a', 'b'],
			h: 'hello world',
			i: 3,
			j: true,
			k: false,
			l: [
				{m: 'n'},
				{m: 'o'},
				{m: 'p'},
				{m: 'q'}
			],
			r: '/^[0-9\.-]+$/i'
		};

	it('does not trip on unexpected/empty config', function() {
		expect(condition.evaluate(null, model)).toBe(false);
		expect(condition.evaluate(undefined, model)).toBe(false);
		expect(condition.evaluate(1, model)).toBe(false);
		expect(condition.evaluate(Math.PI, model)).toBe(false);
		expect(condition.evaluate(Infinity, model)).toBe(false);
		expect(condition.evaluate({}, model)).toBe(false);
		expect(condition.evaluate([], model)).toBe(false);
		expect(condition.evaluate(true, model)).toBe(false);
		expect(condition.evaluate(false, model)).toBe(false);
	});

	it('throws error on not implemented', function() {
		var test = [
			//  Evaluation
			'text', 'where',

			//  Geospatial
			'geoWithin', 'geoIntersects', 'near', 'nearSphere',

			//  Bitwise
			'bitsAllSet', 'bitsAnySet', 'bitsAllClear', 'bitsAnyClear',

			//  Fantasy
			'foo', 'bar'
		];

		test.forEach(function(name) {
			var cond = {};
			cond['$' + name] = false;

			expect(function() {
				condition.evaluate({field: cond}, model);
			}).toThrow(new Error('Operator "$' + name + '" not implemented'));
		});
	});

	it('$eq', function() {
		expect(condition.evaluate({a: {$eq: 2}}, model)).toBe(false);
		expect(condition.evaluate({a: {$eq: 3}}, model)).toBe(true);
		expect(condition.evaluate({a: {$eq: 'b'}}, model)).toBe(false);
		expect(condition.evaluate({zz: {$eq: 'b'}}, model)).toBe(false);
		expect(condition.evaluate({a: {$eq: 'i'}}, model)).toBe(true);
		expect(condition.evaluate({'c.d': {$eq: 'i'}}, model)).toBe(false);
		expect(condition.evaluate({'c.zz': {$eq: 'i'}}, model)).toBe(false);
	});

	it('$eq (shorthand)', function() {
		expect(condition.evaluate({a: 2}, model)).toBe(false);
		expect(condition.evaluate({a: 3}, model)).toBe(true);
		expect(condition.evaluate({a: 'b'}, model)).toBe(false);
		expect(condition.evaluate({a: 'i'}, model)).toBe(true);
		expect(condition.evaluate({a: 'c.d'}, model)).toBe(false);
	});

	it('$lt', function() {
		expect(condition.evaluate({a: {$lt: 2}}, model)).toBe(false);
		expect(condition.evaluate({a: {$lt: 3}}, model)).toBe(false);
		expect(condition.evaluate({a: {$lt: 4}}, model)).toBe(true);
		expect(condition.evaluate({a: {$lt: 'b'}}, model)).toBe(true);
		expect(condition.evaluate({a: {$lt: 'i'}}, model)).toBe(false);
		expect(condition.evaluate({a: {$lt: 'c.d'}}, model)).toBe(true);
	});

	it('$lte', function() {
		expect(condition.evaluate({a: {$lte: 2}}, model)).toBe(false);
		expect(condition.evaluate({a: {$lte: 3}}, model)).toBe(true);
		expect(condition.evaluate({a: {$lte: 4}}, model)).toBe(true);
		expect(condition.evaluate({a: {$lte: 'b'}}, model)).toBe(true);
		expect(condition.evaluate({a: {$lte: 'i'}}, model)).toBe(true);
		expect(condition.evaluate({'c.d': {$lte: 'c.e'}}, model)).toBe(true);
		expect(condition.evaluate({'c.e': {$lte: 'c.d'}}, model)).toBe(false);
	});

	it('$ne', function() {
		expect(condition.evaluate({a: {$ne: 2}}, model)).toBe(true);
		expect(condition.evaluate({a: {$ne: 3}}, model)).toBe(false);
		expect(condition.evaluate({a: {$ne: 'b'}}, model)).toBe(true);
		expect(condition.evaluate({a: {$ne: 'i'}}, model)).toBe(false);
		expect(condition.evaluate({'c.d': {$ne: 'i'}}, model)).toBe(true);
	});

	it('$in', function() {
		expect(condition.evaluate({a: {$in: [2, 3, 4]}}, model)).toBe(true);
		expect(condition.evaluate({b: {$in: [2, 3, 4]}}, model)).toBe(false);
		expect(condition.evaluate({'c.d': {$in: [2, 3, 4]}}, model)).toBe(true);
		expect(condition.evaluate({a: {$in: 'f'}}, model)).toBe(true);
		expect(condition.evaluate({b: {$in: 'f'}}, model)).toBe(true);
		expect(condition.evaluate({'c.d': {$in: 'f'}}, model)).toBe(true);
	});

	it('$nin', function() {
		expect(condition.evaluate({a: {$nin: [2, 3, 4]}}, model)).toBe(false);
		expect(condition.evaluate({b: {$nin: [2, 3, 4]}}, model)).toBe(true);
		expect(condition.evaluate({'c.d': {$nin: [2, 3, 4]}}, model)).toBe(false);
		expect(condition.evaluate({a: {$nin: 'f'}}, model)).toBe(false);
		expect(condition.evaluate({b: {$nin: 'f'}}, model)).toBe(false);
		expect(condition.evaluate({'c.d': {$nin: 'f'}}, model)).toBe(false);
	});

	it('$exists', function() {
		expect(condition.evaluate({a: {$exists: true}}, model)).toBe(true);
		expect(condition.evaluate({a: {$exists: false}}, model)).toBe(false);
		expect(condition.evaluate({zz: {$exists: true}}, model)).toBe(false);
		expect(condition.evaluate({zz: {$exists: false}}, model)).toBe(true);
		expect(condition.evaluate({'c.d': {$exists: true}}, model)).toBe(true);
		expect(condition.evaluate({'c.d': {$exists: false}}, model)).toBe(false);
		expect(condition.evaluate({'c.zz': {$exists: true}}, model)).toBe(false);
		expect(condition.evaluate({'c.zz': {$exists: false}}, model)).toBe(true);
	});

	it('$exists (shorthand)', function() {
		expect(condition.evaluate('a', model)).toBe(true);
		expect(condition.evaluate('zz', model)).toBe(false);
		expect(condition.evaluate('c.d', model)).toBe(true);
		expect(condition.evaluate('c.zz', model)).toBe(false);
	});

	it('$type', function() {
		expect(condition.evaluate({a: {$type: 'number'}}, model)).toBe(true);
		expect(condition.evaluate({a: {$type: 'numb'}}, model)).toBe(true);
		expect(condition.evaluate({a: {$type: 'n'}}, model)).toBe(true);

		expect(condition.evaluate({'c.d': {$type: 'number'}}, model)).toBe(true);
		expect(condition.evaluate({'c.d': {$type: 'numb'}}, model)).toBe(true);
		expect(condition.evaluate({'c.d': {$type: 'n'}}, model)).toBe(true);

		expect(condition.evaluate({a: {$type: 'string'}}, model)).toBe(false);
		expect(condition.evaluate({a: {$type: 'str'}}, model)).toBe(false);
		expect(condition.evaluate({a: {$type: 's'}}, model)).toBe(false);

		expect(condition.evaluate({f: {$type: 'array'}}, model)).toBe(true);
		expect(condition.evaluate({f: {$type: 'arr'}}, model)).toBe(true);
		expect(condition.evaluate({f: {$type: 'a'}}, model)).toBe(true);

		expect(condition.evaluate({h: {$type: 'string'}}, model)).toBe(true);
		expect(condition.evaluate({h: {$type: 'str'}}, model)).toBe(true);
		expect(condition.evaluate({h: {$type: 's'}}, model)).toBe(true);

		expect(condition.evaluate({j: {$type: 'boolean'}}, model)).toBe(true);
		expect(condition.evaluate({j: {$type: 'bool'}}, model)).toBe(true);
		expect(condition.evaluate({j: {$type: 'b'}}, model)).toBe(true);

		expect(condition.evaluate({k: {$type: 'boolean'}}, model)).toBe(true);
		expect(condition.evaluate({k: {$type: 'bool'}}, model)).toBe(true);
		expect(condition.evaluate({k: {$type: 'b'}}, model)).toBe(true);
	});

	it('$all', function() {
		expect(condition.evaluate({f: {$all: [1, 2, 3]}}, model)).toBe(false);
		expect(condition.evaluate({f: {$all: [2, 3, 4]}}, model)).toBe(false);
		expect(condition.evaluate({f: {$all: [3, 4, 5]}}, model)).toBe(true);
		expect(condition.evaluate({f: {$all: 'g'}}, model)).toBe(true);
		expect(condition.evaluate({g: {$all: 'f'}}, model)).toBe(false);
		expect(condition.evaluate({f: {$all: ['a', 'b', 'c.d']}}, model)).toBe(true);
		expect(condition.evaluate({f: {$all: ['a', 'b', 'c.e']}}, model)).toBe(false);
		expect(condition.evaluate({f: {$all: ['a']}}, model)).toBe(true);
		expect(condition.evaluate({g: {$all: [3, 4]}}, model)).toBe(false);
		expect(condition.evaluate({g: {$all: [3, 5]}}, model)).toBe(false);
		expect(condition.evaluate({g: {$all: [3, 6]}}, model)).toBe(false);
		expect(condition.evaluate({g: {$all: [3, 7]}}, model)).toBe(true);
		expect(condition.evaluate({g: {$all: ['a', 7]}}, model)).toBe(true);
	});

	it('$elemMatch (direct value)', function() {
		expect(condition.evaluate({f: {$elemMatch: {$gte: 2, $lt: 4}}}, model)).toBe(true);
		expect(condition.evaluate({f: {$elemMatch: {$gt: 7, $lt: 10}}}, model)).toBe(false);
		expect(condition.evaluate({f: {$elemMatch: {$gte: 3, $lt: 6}}}, model)).toBe(true);
		expect(condition.evaluate({f: {$elemMatch: {$gte: 6, $lt: 10}}}, model)).toBe(true);
		expect(condition.evaluate({f: {$elemMatch: {$gt: 7, $lt: 10}}}, model)).toBe(false);

		expect(condition.evaluate({g: {$elemMatch: {$eq: 'a'}}}, model)).toBe(true);
		expect(condition.evaluate({g: {$elemMatch: {$eq: 'b'}}}, model)).toBe(true);
		expect(condition.evaluate({g: {$elemMatch: {$eq: 'c'}}}, model)).toBe(false);
	});

	it('$elemMatch (object value)', function() {
		expect(condition.evaluate({l: {$elemMatch: {m: {$eq: 'n'}}}}, model)).toBe(true);
		expect(condition.evaluate({l: {$elemMatch: {m: {$eq: 'r'}}}}, model)).toBe(false);
	});

	it('$size', function() {
		expect(condition.evaluate({g: {$size: 1}}, model)).toBe(false);
		expect(condition.evaluate({g: {$size: 2}}, model)).toBe(true);
		expect(condition.evaluate({g: {$size: 3}}, model)).toBe(false);
	});

	it('$mod', function() {
		expect(condition.evaluate({a: {$mod: 2}}, model)).toBe(false);
		expect(condition.evaluate({a: {$mod: 3}}, model)).toBe(true);
		expect(condition.evaluate({a: {$mod: [2]}}, model)).toBe(false);
		expect(condition.evaluate({a: {$mod: [3]}}, model)).toBe(true);
		expect(condition.evaluate({a: {$mod: [2, 0]}}, model)).toBe(false);
		expect(condition.evaluate({a: {$mod: [3, 0]}}, model)).toBe(true);
		expect(condition.evaluate({a: {$mod: [2, 1]}}, model)).toBe(true);
		expect(condition.evaluate({a: {$mod: [3, 1]}}, model)).toBe(false);
		expect(condition.evaluate({'c.d': {$mod: [3, 1]}}, model)).toBe(true);
		expect(condition.evaluate({'c.d': {$mod: [4, 0]}}, model)).toBe(true);
	});

	it('$regex', function() {
		expect(condition.evaluate({a: {$regex: 3}}, model)).toBe(true);
		expect(condition.evaluate({a: {$regex: '[0-9]+'}}, model)).toBe(true);
		expect(condition.evaluate({a: {$regex: '/[0-9]+/'}}, model)).toBe(true);
		expect(condition.evaluate({a: {$regex: '/^[0-9]+/'}}, model)).toBe(true);
		expect(condition.evaluate({a: {$regex: '/^[0-9]+$/i'}}, model)).toBe(true);
		expect(condition.evaluate({a: {$regex: 'r'}}, model)).toBe(true);
		expect(condition.evaluate({h: {$regex: 3}}, model)).toBe(false);
		expect(condition.evaluate({h: {$regex: '[0-9]+'}}, model)).toBe(false);
		expect(condition.evaluate({h: {$regex: '/[0-9]+/'}}, model)).toBe(false);
		expect(condition.evaluate({h: {$regex: '/^[0-9]+/'}}, model)).toBe(false);
		expect(condition.evaluate({h: {$regex: '/^[0-9]+$/i'}}, model)).toBe(false);
		expect(condition.evaluate({h: {$regex: 'r'}}, model)).toBe(false);
		expect(condition.evaluate({h: {$regex: 'hello'}}, model)).toBe(true);
		expect(condition.evaluate({h: {$regex: 'hellos'}}, model)).toBe(false);
		expect(condition.evaluate({h: {$regex: 'world'}}, model)).toBe(true);
		expect(condition.evaluate({h: {$regex: '^world'}}, model)).toBe(false);
		expect(condition.evaluate({h: {$regex: 'world$'}}, model)).toBe(true);
	});

	it('$or', function() {
		expect(condition.evaluate({$or: [{b: {$eq: 3}}, {b: {$eq: 7}}]}, model)).toBe(true);
		expect(condition.evaluate({$or: [{a: {$eq: 3}}, {a: {$eq: 7}}]}, model)).toBe(true);
		expect(condition.evaluate({$or: [{a: {$eq: 1}}, {a: {$eq: 2}}]}, model)).toBe(false);
	});

	it('$and', function() {
		expect(condition.evaluate({$and: {a: {$eq: 3}}}, model)).toBe(true);
		expect(condition.evaluate({$and: {a: 3}}, model)).toBe(true);
		expect(condition.evaluate({$and: [{a: {$eq: 3}}, {a: {$eq: 7}}]}, model)).toBe(false);
		expect(condition.evaluate({$and: [{b: {$eq: 3}}, {b: {$eq: 7}}]}, model)).toBe(false);
		expect(condition.evaluate({$and: [{b: {$eq: 3}}, {a: {$eq: 7}}]}, model)).toBe(false);
		expect(condition.evaluate({$and: [{a: {$eq: 3}}, {b: {$eq: 7}}]}, model)).toBe(true);
	});

	it('$and (shorthand)', function() {
		expect(condition.evaluate([{a: {$eq: 3}}, {a: {$eq: 7}}], model)).toBe(false);
		expect(condition.evaluate([{b: {$eq: 3}}, {b: {$eq: 7}}], model)).toBe(false);
		expect(condition.evaluate([{b: {$eq: 3}}, {a: {$eq: 7}}], model)).toBe(false);
		expect(condition.evaluate([{a: {$eq: 3}}, {b: {$eq: 7}}], model)).toBe(true);
	});

	it('$not', function() {
		expect(condition.evaluate({$not: [{a: {$eq: 3}}, {a: {$eq: 7}}]}, model)).toBe(true);
		expect(condition.evaluate({$not: [{b: {$eq: 3}}, {b: {$eq: 7}}]}, model)).toBe(true);
		expect(condition.evaluate({$not: [{b: {$eq: 3}}, {a: {$eq: 7}}]}, model)).toBe(true);
		expect(condition.evaluate({$not: [{a: {$eq: 3}}, {b: {$eq: 7}}]}, model)).toBe(false);
		expect(condition.evaluate({$not: {a: 3}}, model)).toBe(false);
		expect(condition.evaluate({$not: {a: 7}}, model)).toBe(true);
	});

	it('$nor', function() {
		expect(condition.evaluate({$nor: [{a: {$eq: 3}}, {a: {$eq: 7}}]}, model)).toBe(false);
		expect(condition.evaluate({$nor: [{b: {$eq: 3}}, {b: {$eq: 7}}]}, model)).toBe(false);
		expect(condition.evaluate({$nor: [{b: {$eq: 3}}, {a: {$eq: 7}}]}, model)).toBe(true);
		expect(condition.evaluate({$nor: [{a: {$eq: 3}}, {b: {$eq: 7}}]}, model)).toBe(false);
		expect(condition.evaluate({$nor: {a: 3}}, model)).toBe(false);
		expect(condition.evaluate({$nor: {a: 7}}, model)).toBe(true);
	});
});
