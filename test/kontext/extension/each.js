/*global kontext: true, describe: true, it: true, beforeEach: true, afterEach: true, expect: true*/
describe('Kontext Extension Each', function() {
	'use strict';

	var scope = setup();

	beforeEach(function(done) {
		scope.append('<strong>{a} and {b}</strong>');

		done();
	});

	describe('reflects the items in bound array', function() {
		it('object items', function(done) {
			var model;

			scope.node.setAttribute('data-kontext', 'each: list');
			model = kontext.bind({list: []}, scope.node);

			model.on('update', function(mod, key, value) {
				if (key === 'list') {
					expect(scope.node.childNodes.length).toBe(mod[key].length);

					if (mod[key].length < 5) {
						mod[key].push({
							a: 'a' + mod[key].length,
							b: 'b' + mod[key].length
						});
					}
					else {
						done();
					}
				}
			});

			expect(scope.node.childNodes.length).toBe(0);

			scope.delay(function() {
				model.list.push({
					a: 'initial',
					b: 'initial'
				});
			});
		});

		describe('implements $-properties, which point to the correct values', function() {
			it('simple type resolves $index, $item, $parent', function(done) {
				var main = document.createElement('main'),
					repeat = main.appendChild(document.createElement('div')),
					model;

				main.setAttribute('data-kontext', 'each: list');
				repeat.appendChild(document.createTextNode('{$index} - {$item} - {$parent}'));

				model = kontext.bind({list: ['hello', 42]}, main);

				expect(typeof model.list[0]).toBe('string');
				expect(typeof model.list[1]).toBe('number');

				//  we have to wait for two things to have happened:
				//  - first, the template rending is async
				//  - second, both the $index and $parent properties are updated for each render, which is
				//            also async (so, the first async update triggers the second async update)
				scope.delay(function() {
					expect(main.childNodes.length).toBe(2);

					//  we use the mechanics of javascript which converts an array to string as if
					//  it was Array.join(',')-ed
					expect(main.childNodes[0].innerText).toBe('0 - hello - hello,42');
					expect(main.childNodes[1].innerText).toBe('1 - 42 - hello,42');

					done();
				}, 100);
			});

			it('object type has added $index, $item, $parent and $model', function(done) {
				var main = document.createElement('main'),
					repeat = main.appendChild(document.createElement('div')),
					model;

				main.setAttribute('data-kontext', 'each: list');
				repeat.appendChild(document.createTextNode('{$index} - {$item.name} - {$model.name}'));

				model = kontext.bind({
					name: 'Model',
					list: [{name: 'a'}, {name: 'b'}]
				}, main);

				expect(model.list[0].name).toBe('a');
				expect(model.list[0].$item).toBe(model.list[0]);
				expect(model.list[0].$index).toBe(0);
				expect(model.list[0].$parent).toBe(model.list);
				expect(model.list[0].$model).toBe(model);

				scope.delay(function() {
					expect(main.childNodes.length).toBe(2);

					expect(main.childNodes[0].innerText).toBe('0 - a - Model');
					expect(main.childNodes[1].innerText).toBe('1 - b - Model');

					done();
				}, 100);
			});
		});

		it('string items as {$item}', function(done) {
			var node = document.createElement('div'),
				model;

			node.appendChild(document.createElement('span'))
				.appendChild(document.createTextNode('{$item} @ {$index}'));

			node.setAttribute('data-kontext', 'each: list');
			model = kontext.bind({list: []}, node);

			model.on('update', function(mod, key) {
				var i, v;

				if (key === 'list') {
					if (mod[key].length < 5) {
						mod[key].push('a' + mod[key].length);
					}
					else {
						setTimeout(function() {
							expect(node.childNodes.length).toBe(mod[key].length);
							for (i = 0; i < node.childNodes.length; ++i) {
								v = (i > 0 ? 'a' + i + ' @ ' : 'initial @ ') + i;
								expect(node.childNodes[i].innerHTML).toBe(v);
							}

							done();
						}, 100);
					}
				}
			});

			expect(node.childNodes.length).toBe(0);

			scope.delay(function() {
				model.list.push('initial');
			});
		});

		it('string items as {text: $item}', function(done) {
			var node = document.createElement('div'),
				model;

			node.appendChild(document.createElement('span'))
				.setAttribute('data-kontext', 'text: $item');

			node.setAttribute('data-kontext', 'each: list');
			model = kontext.bind({list: []}, node);

			model.on('update', function(mod, key) {
				var i, v;

				if (key === 'list') {
					if (mod[key].length < 5) {
						mod[key].push('a' + mod[key].length);
					}
					else {
						setTimeout(function() {
							expect(node.childNodes.length).toBe(mod[key].length);
							for (i = 0; i < node.childNodes.length; ++i) {
								v = (i > 0 ? 'a' + i : 'initial');
								expect(node.childNodes[i].innerHTML).toBe(v);
							}

							done();
						}, 100);
					}
				}
			});

			expect(node.childNodes.length).toBe(0);

			model.list.push('initial');
		});
	});

	it('uses the defining element as template if `self:true` is provided', function(done) {
		var parent = document.createElement('div'),
			model, end;

		scope.node.setAttribute('data-kontext', 'each: {target:list, self:true}');
		parent.appendChild(scope.node);

		model = kontext.bind({list: []}, parent);

		model.on('update', function(mod, key) {
			var length = parent.childNodes.length,
				i, v;

			if (key === 'list') {
				expect(length).toBe(2 + mod[key].length);
				for (i = 0; i < length; ++i) {
					if (i === 0 || i === length - 1) {
						expect(parent.childNodes[i].nodeType).toBe(3);
					}
					else {
						v = mod[key][i - 1];

						expect(parent.childNodes[i].nodeType).toBe(1);
						expect(parent.childNodes[i].firstChild.nodeName).toBe('STRONG');
						expect(parent.childNodes[i].innerHTML).toBe(
							'<strong>' + v.a + ' and ' + v.b + '</strong>'
						);
					}
				}

				if (mod[key].length < 5) {
					mod[key].splice(2, 0, {
						a: 'a' + mod[key].length,
						b: 'b' + mod[key].length
					});
				}
				else if (end) {
					done();
				}
				else {
					end = true;
					mod[key].splice(2, 2);
				}
			}
		});

		expect(parent.childNodes.length).toBe(2);
		expect(parent.firstChild.nodeType).toBe(3);
		expect(parent.firstChild.nextSibling.nodeType).toBe(3);
		expect(scope.node.parentNode).toBe(null);

		model.list.push({
			a: 'initial',
			b: 'initial'
		});
	});

	it('preserves and handles all other extensions defined on the {self:true} element', function(done) {
		var parent = document.createElement('div'),
			model;

		while (scope.node.firstChild) {
			scope.node.removeChild(scope.node.firstChild);
		}

		scope.node.setAttribute('data-kontext', 'text: $item, each: {target:list, self:true}');
		parent.appendChild(scope.node);

		model = kontext.bind({list: []}, parent);

		model.on('update', function(mod, key) {
			if (key === 'list') {
				if (model.list.length === 1) {
					expect(model.list[0]).toBe('world');
					expect(parent.innerHTML).toBe('<main data-kontext="text: $item">world</main>');

					model.list.unshift('hello');
				}
				else {
					expect(model.list.length).toBe(2);
					expect(model.list[0]).toBe('hello');
					expect(model.list[1]).toBe('world');

					//  we must give the `each` extension some time to redraw the contents as this is
					//  done using a combination of requestAnimationFrame and setTimeout
					setTimeout(function() {
						expect(parent.innerHTML).toBe('<main data-kontext="text: $item">hello</main><main data-kontext="text: $item">world</main>');

						done();
					}, 100);
				}
			}
		});

		expect(parent.innerHTML).toBe('');

		model.list.push('world');
	});

	it('preserves other extensions for `{self:true}` even if the extension is abbreviated and the kontext attribute renamed', function(done) {
		var parent = document.createElement('div'),
			each = kontext.extension('each'),
			model;

		while (scope.node.firstChild) {
			scope.node.removeChild(scope.node.firstChild);
		}

		kontext.extension('bar', each);

		scope.node.setAttribute('data-foo', 'text: $item, bar: {target:list, self:true}');
		parent.appendChild(scope.node);

		model = kontext.bind({list: []}, parent, {'provider.attribute.settings.attribute': 'data-foo'});

		model.on('update', function(mod, key) {
			if (key === 'list') {
				if (model.list.length === 1) {
					expect(model.list[0]).toBe('world');
					expect(parent.innerHTML).toBe('<main data-foo="text: $item">world</main>');

					model.list.unshift('hello');
				}
				else {
					expect(model.list.length).toBe(2);
					expect(model.list[0]).toBe('hello');
					expect(model.list[1]).toBe('world');

					//  we must give the `each` extension some time to redraw the contents as this is
					//  done using a combination of requestAnimationFrame and setTimeout
					setTimeout(function() {
						expect(parent.innerHTML).toBe('<main data-foo="text: $item">hello</main><main data-foo="text: $item">world</main>');

						done();
					}, 100);
				}
			}
		});

		expect(parent.innerHTML).toBe('');

		model.list.push('world');
	});

	it('works with nested arrays', function(done) {
		var nest, model, list;

		//  clean up the element, as we want a different structure
		while (scope.node.lastChild) {
			scope.node.removeChild(scope.node.lastChild);
		}

		scope.node.setAttribute('data-kontext', 'each: list');
		nest = scope.node.appendChild(document.createElement('div'));
		nest.appendChild(document.createElement('h3')).setAttribute('data-kontext', 'text: name');

		nest = nest.appendChild(document.createElement('div'));
		nest.setAttribute('data-kontext', 'each: child');
		nest.appendChild(document.createElement('span')).setAttribute('data-kontext', 'text: name');

		model = kontext.bind({list: [
			{name: 'a', child: [{name: 'a.1'}, {name: 'a.2'}]},
			{name: 'b', child: [{name: 'b.1'}, {name: 'b.2'}]}
		]}, scope.node);

		list = scope.node.querySelectorAll('h3');
		expect(list.length).toBe(2);
		expect(list[0].firstChild.nodeValue).toBe('a');
		expect(list[1].firstChild.nodeValue).toBe('b');

		list = scope.node.querySelectorAll('span[data-kontext]');
		expect(list.length).toBe(4);
		expect(list[0].firstChild.nodeValue).toBe('a.1');
		expect(list[1].firstChild.nodeValue).toBe('a.2');
		expect(list[2].firstChild.nodeValue).toBe('b.1');
		expect(list[3].firstChild.nodeValue).toBe('b.2');

		model.on('update', function(mod, key) {
			var child;

			if (key === 'list') {
				child = scope.node.querySelectorAll('h3');
				expect(child.length).toBe(3);
				expect(child[2].firstChild.nodeValue).toBe('c');

				child = scope.node.querySelectorAll('span[data-kontext]');
				expect(child.length).toBe(5);
				expect(child[4].firstChild.nodeValue).toBe('check');

				done();
			}
		});

		model.list.push({name: 'c', child: [{name: 'check'}]});
	});

	it('works with settings in objects', function(done) {
		var model;

		scope.node.setAttribute('data-kontext', 'each: {target: list}');
		model = kontext.bind({list: []}, scope.node);

		model.on('update', function(mod, key) {
			if (key === 'list') {
				expect(scope.node.childNodes.length).toBe(mod[key].length);

				if (mod[key].length < 5) {
					mod[key].push({
						a: 'a' + mod[key].length,
						b: 'b' + mod[key].length
					});
				}
				else {
					done();
				}
			}
		});

		expect(scope.node.childNodes.length).toBe(0);

		model.list.push({
			a: 'initial',
			b: 'initial'
		});
	});

	it('filters using a single model method', function(done) {
		var model;

		scope.node.setAttribute('data-kontext', 'each: {target: list, filter: even}');
		model = kontext.bind({
			list: [],
			even: function(m, i) {
				return i % 2 === 0;
			}
		}, scope.node);

		model.on('update', function(mod, key) {
			var expectation;

			if (key === 'list') {
				expectation = model.list.filter(model.even);
				expect(scope.node.childNodes.length).toBe(expectation.length);

				if (mod[key].length < 5) {
					mod[key].push({
						a: 'a' + mod[key].length,
						b: 'b' + mod[key].length
					});
				}
				else {
					done();
				}
			}
		});

		expect(scope.node.childNodes.length).toBe(0);

		model.list.push({
			a: 'initial',
			b: 'initial'
		});
	});

	it('filters using an array of model methods and global/window functions', function(done) {
		var model;

		window.skipFirst = function(m, i) {
			return i > 0;
		};

		scope.node.setAttribute('data-kontext', 'each: {target: list, filter: [even, skipFirst]}');
		model = kontext.bind({
			list: [],
			even: function(m, i) {
				return i % 2 === 0;
			}
		}, scope.node);

		model.on('update', function(mod, key) {
			var expectation;

			if (key === 'list') {
				expectation = model.list.filter(model.even).filter(window.skipFirst);
				expect(scope.node.childNodes.length).toBe(expectation.length);

				if (mod[key].length < 5) {
					mod[key].push({
						a: 'a' + mod[key].length,
						b: 'b' + mod[key].length
					});
				}
				else {
					done();
				}
			}
		});

		expect(scope.node.childNodes.length).toBe(0);

		model.list.push({
			a: 'initial',
			b: 'initial'
		});
	});

	it('removes elements which are no longer needed', function(done) {
		var model;

		scope.node.setAttribute('data-kontext', 'each: list');
		scope.node.removeChild(scope.node.firstChild);
		scope.node.appendChild(document.createElement('div')).appendChild(document.createTextNode('{$item}'));

		model = kontext.bind({
			list: ['a', 'b', 'c']
		}, scope.node);

		model.list.splice(1, 1);

		setTimeout(function() {
			expect(scope.node.childNodes.length).toBe(model.list.length);
			expect(scope.node.childNodes[0].firstChild.data).toBe('a');
			expect(scope.node.childNodes[1].firstChild.data).toBe('c');

			done();
		}, 100);
	});

	it('throws errors if there is no target', function(done) {
		scope.node.setAttribute('data-kontext', 'each: {}');

		expect(function() {
			kontext.bind({list: []}, scope.node);
		}).toThrow(new Error('Missing target for "each"'));

		done();
	});

	it('throws errors if a filter method/function does not exist', function(done) {
		scope.node.setAttribute('data-kontext', 'each: {target: list, filter: nope}');

		expect(function() {
			kontext.bind({list: []}, scope.node);
		}).toThrow(new Error('nope is not a filter function'));

		done();
	});

	it('throws errors if a map method/function does not exist', function(done) {
		scope.node.setAttribute('data-kontext', 'each: {target: list, map: nope}');

		expect(function() {
			kontext.bind({list: []}, scope.node);
		}).toThrow(new Error('nope is not a map function'));

		done();
	});

	describe('does not trip over non-existant target', function() {
		it('object config', function(done) {
			scope.node.setAttribute('data-kontext', 'each: {target: nope}');

			expect(function() {
				kontext.bind({}, scope.node);
			}).not.toThrow(Error);

			done();
		});

		it('string config', function(done) {
			scope.node.setAttribute('data-kontext', 'each: nope');

			expect(function() {
				kontext.bind({}, scope.node);
			}).not.toThrow(Error);

			done();
		});
	});
});
