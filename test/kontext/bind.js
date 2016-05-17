/*global kontext: true, describe: true, afterEach: true, beforeEach: true, it: true, expect: true*/
describe('Kontext Bind', function() {
	'use strict';

	beforeEach(function(done) {
		var content = '<p>{foo:fool}, {bar} and {baz}</p>',
			wrapper = document.body.insertBefore(document.createElement('div'), document.body.firstChild);

		wrapper.setAttribute('class', 'fixture');
		wrapper.innerHTML = content;

		document.body.insertBefore(wrapper, document.body.firstChild);

		done();
	});

	afterEach(function(done) {
		var list = document.querySelectorAll('.fixture'),
			i;

		for (i = 0; i < list.length; ++i) {
			list[i].parentNode.removeChild(list[i]);
		}

		done();
	});

	it('binds a model multiple times, never meddles with prepared models', function() {
		var model = {baz: null},
			a, b, c, d;

		a = kontext.bind(model, document.body);
		b = kontext.bind(model, document.body);
		c = kontext.bind(a);
		d = kontext.bind(b);

		expect(a).toBe(b);
		expect(b).toBe(c);
		expect(c).toBe(d);
		expect(d).toBe(a);

		expect(kontext.bindings(document.body).length).toBe(1);
		expect(kontext.bindings(document.body)[0]).toBe(a);
		expect(kontext.bindings(document.body)[0]).toBe(b);
		expect(kontext.bindings()[0]).toBe(c);
		expect(kontext.bindings()[0]).toBe(d);
	});

	it('allows for argument-less binds', function() {
		var text = document.body.appendChild(document.createTextNode('{blue:out of the}')),
			model;

 		model = kontext.bind();

		expect(typeof model.on).toBe('function');
		expect(typeof model.off).toBe('function');
		expect(typeof model.define).toBe('function');
		expect(typeof model.delegation).toBe('function');
		expect('blue' in model).toBe(true);
		expect(model.blue).toBe('out of the');

		document.body.removeChild(text);
	});

	it('binds arrays', function(done) {
		var model = kontext.bind({
				list: [
					{hello: 'world'}
				]
			}, document.body),
			count = 0;

		model.on('update', function(mod, key) {
			if (key === 'list') {
				++count;

				expect(mod[key].length).toBe(2);
				expect(mod[key][1].hello).toBe(count === 2 ? 'planet' : 'universe');

				if (count === 1) {
					mod[key][1].hello = 'planet';
				}
				else {
					done();
				}
			}
		});

		model.list.push({hello: 'universe'});
	});

	// not sure why one would do this, but it is an option so we test it
	it('binds to DOMText nodes', function(done) {
		var container = document.createElement('div'),
			textNode = container.appendChild(document.createTextNode('A {foo} walks into a {bar}')),
			model = kontext.bind({foo: 'fool', bar: 'trap'}, textNode);

		model.on('update', function() {
			expect(container.innerText).toBe('A clown walks into a trap');

			done();
		});

		model.foo = 'clown';
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
