/*global kontext: true, describe: true, afterEach: true, beforeEach: true, it: true, expect: true*/
describe('Kontext Bind', function() {
	'use strict';

	var scope = setup();

	it('binds a model multiple times, without side-effects', function() {
		var model = {baz: null},
			a, b;

		a = kontext.bind(model, scope.node);
		b = kontext.bind(model, scope.node);

		expect(a === b).toBe(true);

		expect(kontext.bindings(scope.node).length).toBe(1);

		expect(kontext.bindings(scope.node)[0]).toBe(a);
		expect(kontext.bindings(scope.node)[0]).toBe(b);
	});

	it('binds without any arguments', function() {
		var model;

		scope.append('out of the {color:blue}');

		model = kontext.bind();

		expect(typeof model).toBe('object');

		each(['on', 'off', 'define', 'delegation'], function(name) {
			expect(typeof model[name]).toBe('function');
		})

		expect('color' in model).toBe(true);
		expect(model.color).toBe('blue');
	});

	it('binds arrays', function(done) {
		var model = kontext.bind({
				list: [
					{hello: 'world'}
				]
			}, scope.node);

		model.on('update', function(mdl, key) {
			expect(key).toBe('list');

			expect(mdl[key][0].hello).toBe('world');
			expect(mdl[key][1].hello).toBe('planet');

			if (mdl[key].length === 2) {
				mdl[key].push({hello: 'universe'});
			}
			else {
				expect(mdl[key][2].hello).toBe('universe');

				done();
			}
		});

		model.list.push({hello: 'planet'});
	});

	it('binds to DOMText nodes', function(done) {
		var text = document.createTextNode('A {foo} walks into a {bar}'),
			model;

		scope.append(text);
		model = kontext.bind({foo: 'fool', bar: 'trap'}, text);

		model.on('update', function(mdl, key, prior, current) {
			expect(scope.node.innerText).toBe('A clown walks into a trap');

			done();
		});

		scope.delay(function() {
			model.foo = 'clown';
		});
	});

	describe('binds to elements matching a string selector', function() {
		var model, element;

		beforeEach(function(done) {
			element = document.body.appendChild(document.createElement('div'));

			['a', 'b', 'c']
				.forEach(function(key) {
					var child = element.appendChild(document.createElement('span'));

					child.setAttribute('data-child', key);
					child.setAttribute('data-kontext', 'text: name');
					child.appendChild(document.createTextNode('-'));
				});

			model = {
				name: 'child'
			};

			done();
		});

		afterEach(function(done) {
			if (element && element.parentNode) {
				element.parentNode.removeChild(element);
			}

			done();
		});

		['a', 'b', 'c']
			.forEach(function(key, index) {
				it('single selector - select one ([data-child=' + key + '])', function() {
					var expectation = ['-', '-', '-'];

					kontext.bind(model, '[data-child=' + key + ']');
					expectation[index] = 'child';

					expect(element.innerText).toBe(expectation.join(''));
				});
			});

		it('selects all using multiple string arguments', function() {
			kontext.bind(model, '[data-child=a]', '[data-child=b]', '[data-child=c]');

			expect(element.innerText).toBe('childchildchild');
		});

		it('selects all using multiple string arguments', function() {
			kontext.bind(model, '[data-child=a],[data-child=b]', '[data-child=c]');

			expect(element.innerText).toBe('childchildchild');
		});

		it('selects all using array of strings + string', function() {
			kontext.bind(model, ['[data-child=a]', '[data-child=b]'], '[data-child=c]');

			expect(element.innerText).toBe('childchildchild');
		});

		it('selects all using multiple arrays of strings', function() {
			kontext.bind(model, ['[data-child=a]', '[data-child=b]'], ['[data-child=c]', '[data-child=b]']);

			expect(element.innerText).toBe('childchildchild');
		});
	});

	describe('does not trip over empty attributes', function() {
		it('explicitly empty', function() {
			var container = document.createElement('div');

			container.setAttribute('data-kontext', '');

			kontext.bind({}, container);
		});

		it('implicitly empty (comma)', function() {
			var container = document.createElement('div');

			container.setAttribute('data-kontext', ',');

			kontext.bind({}, container);
		});
	});

	describe('placeholder syntax', function() {
		it('supports scoped variables', function() {
			var element = document.createElement('div');

			element.appendChild(document.createTextNode('{sub.greet} world'));

			kontext.bind({sub: {greet: 'hello'}}, element);

			expect(element.firstChild.data).toBe('hello');
			expect(element.innerText).toBe('hello world');
			expect(element.firstChild.nodeType).toBe(3);
		});
	});
});
