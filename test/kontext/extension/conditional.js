/*global kontext, describe, it, expect*/
describe('Kontext Extension Conditional', function() {
	'use strict';

	function prepare(fn) {
		var model = {
				num: 0,
				arr: [],
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

	describe('adds/changes/removes itself', function() {
		it('$eq', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$eq: 3}}');
				kontext.bind(model, main);
				model.on('update', function() {
					expect(element.parentNode).toBe(model.num === 3 ? main : null);

					if (model.num === 4) {
						done();
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$eq (shorthand)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: 3}');
				kontext.bind(model, main);
				model.on('update', function() {
					expect(element.parentNode).toBe(model.num === 3 ? main : null);

					if (model.num === 4) {
						done();
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$lt', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$lt: 3}}');
				kontext.bind(model, main);
				model.on('update', function() {
					expect(element.parentNode).toBe(model.num < 3 ? main : null);

					if (model.num === 4) {
						done();
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$lte', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$lte: 3}}');
				kontext.bind(model, main);
				model.on('update', function() {
					expect(element.parentNode).toBe(model.num <= 3 ? main : null);

					if (model.num === 4) {
						done();
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$gt', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$gt: 2}}');
				kontext.bind(model, main);
				model.on('update', function() {
					expect(element.parentNode).toBe(model.num > 2 ? main : null);

					if (model.num === 4) {
						done();
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$gte', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$gte: 2}}');
				kontext.bind(model, main);
				model.on('update', function() {
					expect(element.parentNode).toBe(model.num >= 2 ? main : null);

					if (model.num === 4) {
						done();
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$ne', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$ne: 2}}');
				kontext.bind(model, main);
				model.on('update', function() {
					expect(element.parentNode).toBe(model.num !== 2 ? main : null);

					if (model.num === 4) {
						done();
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$in', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$in: [1, 2]}}');
				kontext.bind(model, main);

				model.on('update', function() {
					expect(element.parentNode).toBe(model.num <= 2 ? main : null);

					if (model.num === 4) {
						done();
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$nin', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$nin: [1, 2]}}');
				kontext.bind(model, main);

				model.on('update', function() {
					expect(element.parentNode).toBe(model.num > 2 ? main : null);

					if (model.num === 4) {
						done();
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$nin (changing array)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$in: arr}}');
				kontext.bind(model, main);

				model.on('update', function() {
					expect(element.parentNode).toBe(model.arr.indexOf(model.num) >= 0 ? main : null);

					if (model.arr.length > 4) {
						done();
					}
					else {
						model.arr.push(model.arr.length);
					}
				});

				model.arr.push(model.arr.length);
			});
		});

		it('$or', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {$or: [{num: 1}, {num: {$gt:2}}]}');
				kontext.bind(model, main);

				model.on('update', function() {
					expect(element.parentNode).toBe(model.num === 1 || model.num > 2 ? main : null);

					if (model.num > 4) {
						done();
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$and', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {$and: [{num: 1}, {str: {$in:[world]}}]}');
				kontext.bind(model, main);

				model.on('update', function() {
					expect(element.parentNode).toBe(model.num === 1 && model.str === 'world' ? main : null);

					if (model.num > 4) {
						done();
					}
					else if (model.num === 1 && model.str === 'hello') {
						model.str = 'world';
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$and (shorthand)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: [{num: 2}, {str: {$in:[world]}}]');
				kontext.bind(model, main);

				model.on('update', function() {
					expect(element.parentNode).toBe(model.num === 2 && model.str === 'world' ? main : null);

					if (model.num > 4) {
						done();
					}
					else if (model.num === 2 && model.str === 'hello') {
						model.str = 'world';
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$not', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {$not: [{num: 1}, {str: {$in:[world]}}]}');
				kontext.bind(model, main);

				model.on('update', function() {
					expect(element.parentNode).toBe(model.num === 1 && model.str === 'world' ? null : main);

					if (model.num > 4) {
						done();
					}
					else if (model.num === 1 && model.str === 'hello') {
						model.str = 'world';
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$nor', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {$nor: [{num: 1}, {num: {$gt:2}}]}');
				kontext.bind(model, main);

				model.on('update', function() {
					expect(element.parentNode).toBe(model.num === 1 || model.num > 2 ? null : main);

					if (model.num > 4) {
						done();
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$exists (must exist but does not)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {field: {$exists: true}}');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(null);

					done();
				}, 20);
			});
		});

		it('$exists (shorthand)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: field');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(null);

					done();
				}, 20);
			});
		});

		it('$exists (must not exist and does not)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {field: {$exists: false}}');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(main);

					done();
				}, 20);
			});
		});

		it('$exists (must exist and does)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$exists: true}}');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(main);

					done();
				}, 20);
			});
		});

		it('$exists (shorthand)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: num');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(main);

					done();
				}, 20);
			});
		});

		it('$exists (shorthand, scoped)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: path.to.nested');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(main);

					done();
				}, 20);
			});
		});

		it('$exists (must not exist but does)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$exists: false}}');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(null);

					done();
				}, 20);
			});
		});

		it('$type (number = number)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$type: number}}');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(main);

					done();
				}, 20);
			});
		});

		it('$type (number = n)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$type: n}}');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(main);

					done();
				}, 20);
			});
		});

		it('$type (number = string)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$type: string}}');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(null);

					done();
				}, 20);
			});
		});

		it('$type (array = array)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {arr: {$type: array}}');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(main);

					done();
				}, 20);
			});
		});

		it('$type (array = a)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {arr: {$type: a}}');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(main);

					done();
				}, 20);
			});
		});

		it('$type (array = bool)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {arr: {$type: bool}}');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(null);

					done();
				}, 20);
			});
		});

		it('$mod [3, 1]', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$mod: [3, 1]}}');
				kontext.bind(model, main);
				model.on('update', function() {
					expect(element.parentNode).toBe(model.num % 3 === 1 ? main : null);

					if (model.num > 4) {
						done();
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$mod [3, 0]', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$mod: [3, 0]}}');
				kontext.bind(model, main);
				model.on('update', function() {
					expect(element.parentNode).toBe(model.num % 3 === 0 ? main : null);

					if (model.num > 4) {
						done();
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$mod [3] (implicit remainder 0)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$mod: [3]}}');
				kontext.bind(model, main);
				model.on('update', function() {
					expect(element.parentNode).toBe(model.num % 3 === 0 ? main : null);

					if (model.num > 4) {
						done();
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$mod 3 (no array, implicit remainder 0)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$mod: 3}}');
				kontext.bind(model, main);
				model.on('update', function() {
					expect(element.parentNode).toBe(model.num % 3 === 0 ? main : null);

					if (model.num > 4) {
						done();
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$regex (str, ello)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {str: {$regex: ello}}');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(main);

					done();
				}, 20);
			});
		});

		it('$regex (str, ^ello)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {str: {$regex: ^ello}}');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(null);

					done();
				}, 20);
			});
		});

		it('$regex (str, ^hell)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {str: {$regex: ^hell}}');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(main);

					done();
				}, 20);
			});
		});

		it('$regex (str, /^hel+o$/i)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {str: {$regex: /^hel+o$/i}}');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(main);

					done();
				}, 20);
			});
		});

		it('$regex (num, 3)', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {num: {$regex: 3}}');
				kontext.bind(model, main);
				model.on('update', function() {
					expect(element.parentNode).toBe(model.num === 3 ? main : null);

					if (model.num > 4) {
						done();
					}
					else {
						++model.num;
					}
				});

				++model.num;
			});
		});

		it('$all', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {arr: {$all: [1, 3, 4]}}');
				kontext.bind(model, main);
				model.on('update', function() {
					expect(element.parentNode).toBe(model.arr.length > 4 ? main : null);

					if (model.arr.length > 6) {
						done();
					}
					else {
						model.arr.push(model.arr.length);
					}
				});

				model.arr.push(model.arr.length);
			});
		});

		it('$elemMatch', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {arr: {$elemMatch: {$gte: 2, $lt: 4}}}');
				kontext.bind(model, main);
				model.on('update', function() {
					var exp = model.arr.length >= 3 ? main : null;

					expect(element.parentNode).toBe(exp);

					if (model.arr.length > 6) {
						done();
					}
					else {
						model.arr.push(model.arr.length);
					}
				});

				model.arr.push(model.arr.length);
			});
		});

		it('$size', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: {arr: {$size: 3}}');
				kontext.bind(model, main);
				model.on('update', function() {
					var exp = model.arr.length === 3 ? main : null;

					expect(element.parentNode).toBe(exp);

					if (model.arr.length > 6) {
						done();
					}
					else {
						model.arr.push(model.arr.length);
					}
				});

				model.arr.push(model.arr.length);
			});
		});

		it('null as condition', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: null');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(null);

					done();
				}, 20);
			});
		});

		it('number as condition', function(done) {
			prepare(function(model, element, main) {
				element.setAttribute('data-kontext', 'conditional: 123');
				kontext.bind(model, main);

				setTimeout(function() {
					expect(element.parentNode).toBe(null);

					done();
				}, 20);
			});
		});

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
