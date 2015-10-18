/*global Emission, describe, beforeEach, it, expect*/
describe('Emission', function() {
	'use strict';
	var emission, result;

	function foo(value) {
		result.push({type: 'foo', value: value});
	}

	function foo2(value) {
		result.push({type: 'foo2', value: value});
	}

	function bar(value) {
		result.push({type: 'bar', value: value});
	}

	function bar2(value) {
		result.push({type: 'bar2', value: value});

		return false;
	}

	function bar3(value) {
		result.push({type: 'bar3', value: value});

		return false;
	}

	beforeEach(function() {
		emission = new Emission();
		result = [];

		emission.add('foo', foo);
		emission.add('foo', foo2);
		emission.add('bar', bar);
	});

	it('executes exact type (2x foo)', function(done) {
		emission.trigger('foo', 'test', function() {
			expect(result.length).toBe(2);

			expect(result.filter(function(v) {
				return /^foo/.test(v.type) && v.value === 'test';
			}).length).toBe(2);

			expect(result.filter(function(v) {
				return /^bar/.test(v.type) && v.value === 'test';
			}).length).toBe(0);

			done();
		});
	});

	it('executes exact type (1x bar)', function(done) {
		emission.trigger('bar', 'test', function() {
			expect(result.length).toBe(1);

			expect(result.filter(function(v) {
				return /^bar/.test(v.type) && v.value === 'test';
			}).length).toBe(1);

			expect(result.filter(function(v) {
				return /^foo/.test(v.type) && v.value === 'test';
			}).length).toBe(0);

			done();
		});
	});

	it('executes * type (1x bar + 2x foo, 3x test value)', function(done) {
		emission.trigger('*', 'test', function() {
			expect(result.length).toBe(3);

			expect(result.filter(function(v) {
				return /^bar/.test(v.type) && v.value === 'test';
			}).length).toBe(1);

			expect(result.filter(function(v) {
				return /^foo/.test(v.type) && v.value === 'test';
			}).length).toBe(2);

			expect(result.filter(function(v) {
				return v.value === 'test';
			}).length).toBe(3);

			done();
		});
	});

	it('removes handler by type: foo', function(done) {
		var removed = emission.remove('foo');

		expect(removed.length).toBe(2);
		expect(emission.list('foo').length).toBe(0);
		expect(emission.list('bar').length).toBe(1);
		expect(emission.list().length).toBe(1);

		emission.trigger('foo', 'test', function() {
			expect(result.length).toBe(0);

			emission.trigger('bar', 'test', function() {
				expect(result.length).toBe(1);

				done();
			});
		});
	});

	it('removes handler by type: bar', function(done) {
		var removed = emission.remove('bar');

		expect(removed.length).toBe(1);
		expect(emission.list('foo').length).toBe(2);
		expect(emission.list('bar').length).toBe(0);
		expect(emission.list().length).toBe(2);

		emission.trigger('bar', 'test', function() {
			expect(result.length).toBe(0);

			emission.trigger('foo', 'test', function() {
				expect(result.length).toBe(2);

				done();
			});
		});
	});

	it('removes handler by handle: foo', function(done) {
		var removed = emission.remove(null, foo);

		expect(removed.length).toBe(1);
		expect(removed[0]).toBe(foo);
		expect(emission.list('foo').length).toBe(1);
		expect(emission.list('bar').length).toBe(1);
		expect(emission.list().length).toBe(2);

		emission.trigger('foo', 'test', function() {
			expect(result.length).toBe(1);

			//  reset result, so we get a clean reading
			result = [];

			emission.trigger('bar', 'test', function() {
				expect(result.length).toBe(1);

				done();
			});
		});
	});

	it('removes handler by handle: foo2', function(done) {
		var removed = emission.remove(null, foo2);

		expect(removed.length).toBe(1);
		expect(removed[0]).toBe(foo2);
		expect(emission.list('foo').length).toBe(1);
		expect(emission.list('bar').length).toBe(1);
		expect(emission.list().length).toBe(2);

		emission.trigger('foo', 'test', function() {
			expect(result.length).toBe(1);

			//  reset result, so we get a clean reading
			result = [];

			emission.trigger('bar', 'test', function() {
				expect(result.length).toBe(1);

				done();
			});
		});
	});

	it('removes handler by handle: bar', function(done) {
		var removed = emission.remove(null, bar);

		expect(removed.length).toBe(1);
		expect(removed[0]).toBe(bar);
		expect(emission.list('foo').length).toBe(2);
		expect(emission.list('bar').length).toBe(0);
		expect(emission.list().length).toBe(2);

		emission.trigger('foo', 'test', function() {
			expect(result.length).toBe(2);

			//  reset result, so we get a clean reading
			result = [];

			emission.trigger('bar', 'test', function() {
				expect(result.length).toBe(0);

				done();
			});
		});
	});

	it('ignores mismatch type/handle', function() {
		var removed = emission.remove('foo', bar);

		expect(removed.length).toBe(0);
	});

	it('removes specific type/handler: foo', function() {
		var removed = emission.remove('foo', foo);

		expect(removed.length).toBe(1);
		expect(removed[0]).toBe(foo);
	});

	it('removes specific type/handler: foo2', function() {
		var removed = emission.remove('foo', foo2);

		expect(removed.length).toBe(1);
		expect(removed[0]).toBe(foo2);
	});

	it('allows triggers with no arguments, only a callback', function(done) {
		emission.trigger('bar', function() {
			expect(result.length).toBe(1);

			done();
		});
	});

	it('allows triggers with no arguments', function(done) {
		setTimeout(function() {
			expect(result.length).toBe(1);
			done();
		}, 100);

		emission.trigger('bar');
	});

	it('stops if a handle returns false', function(done) {
		var removed = emission.remove();

		expect(removed.length).toBe(3);

		emission.add('bar', bar2);
		emission.add('bar', bar3);

		expect(emission.list('foo').length).toBe(0);
		expect(emission.list('bar').length).toBe(2);
		expect(emission.list().length).toBe(2);

		emission.trigger('bar', 'test', function() {
			expect(result.length).toBe(1);

			done();
		});
	});

	it('respects the invocation limits', function(done) {
		var once = 0,
			twice = 0;

		emission.add('once', function() {
			++once;
			emission.trigger('once');
		}, 1);

		emission.add('twice', function() {
			++twice;
			emission.trigger('twice');
		}, 2);

		setTimeout(function() {
			expect(once).toBe(1);
			expect(twice).toBe(2);

			done();
		}, 1000);

		emission.trigger('once');
		emission.trigger('twice');
	});
});
