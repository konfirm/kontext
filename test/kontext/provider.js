/* global spyOn: true, kontext: true, describe: true, afterEach: true, beforeEach: true, it: true, expect: true */
describe('Kontext Providers', function() {
	'use strict';

	describe('registers the default providers', function() {
		it('has text', function() {
			var defaults = kontext.defaults();

			expect('provider' in defaults).toBe(true);
			expect('text' in defaults.provider).toBe(true);
		});

		it('has attribute', function() {
			var defaults = kontext.defaults();

			expect('provider' in defaults).toBe(true);
			expect('attribute' in defaults.provider).toBe(true);
		});
	});

	it('informs about unknown providers', function() {
		var unknown = kontext.provider('unknown');

		spyOn(console, 'error');

		unknown();

		expect(console.error).toHaveBeenCalled();
		expect(console.error).toHaveBeenCalledWith('Kontext: Unknown provider "unknown"');
	});


	describe('providers can be disabled', function() {
		var wait = 40;

		describe('using defaults', function() {
			var restore = {},
				model, element;

			beforeEach(function(done) {
				var defaults = kontext.defaults(),
					node;

				restore = {
					provider: {
						attribute: {
							handler: defaults.provider.attribute.handler,
							settings: defaults.provider.attribute.settings
						},
						text: {
							handler: defaults.provider.text.handler,
							settings: defaults.provider.text.settings
						}
					}
				};

				element = document.createElement('div');

				node = element.appendChild(document.createElement('strong'));
				node.setAttribute('data-kontext', 'text: a');

				element.appendChild(document.createTextNode('{b}'));

				document.body.appendChild(element);

				model = {
					a: 'this is A',
					b: 'this is B'
				};

				done();
			});

			afterEach(function(done) {
				kontext.defaults(restore);

				if (element.parentNode) {
					element.parentNode.removeChild(element);
				}
				element = null;

				done();
			});

			it ('attribute', function(done) {
				kontext.defaults('provider.attribute', false);

				kontext.bind(model, element);

				setTimeout(function() {
					expect(element.innerHTML).toBe('<strong data-kontext="text: a"></strong>this is B');

					done();
				}, wait);
			});

			it ('attribute.handler', function(done) {
				kontext.defaults('provider.attribute.handler', false);

				kontext.bind(model, element);

				setTimeout(function() {
					expect(element.innerHTML).toBe('<strong data-kontext="text: a"></strong>this is B');

					done();
				}, wait);
			});

			it ('text', function(done) {
				kontext.defaults('provider.text', false);

				kontext.bind(model, element);

				setTimeout(function() {
					expect(element.innerHTML).toBe('<strong data-kontext="text: a">this is A</strong>{b}');

					done();
				}, wait);
			});

			it ('text.handler', function(done) {
				kontext.defaults('provider.text.handler', false);

				kontext.bind(model, element);

				setTimeout(function() {
					expect(element.innerHTML).toBe('<strong data-kontext="text: a">this is A</strong>{b}');

					done();
				}, wait);
			});
		});

		describe('using bind options parameter', function() {
			var model, element;

			beforeEach(function(done) {
				var node;

				element = document.createElement('div');

				node = element.appendChild(document.createElement('em'));
				node.setAttribute('data-kontext', 'text: b');

				element.appendChild(document.createTextNode('{a}'));

				document.body.appendChild(element);

				model = {
					a: 'this is A',
					b: 'this is B'
				};

				done();
			});

			afterEach(function(done) {
				if (element.parentNode) {
					element.parentNode.removeChild(element);
				}
				element = null;

				done();
			});

			it ('attribute', function(done) {
				kontext.bind(model, element, {'provider.attribute': false});

				setTimeout(function() {
					expect(element.innerHTML).toBe('<em data-kontext="text: b"></em>this is A');

					done();
				}, wait);
			});

			it ('attribute.handler', function(done) {
				kontext.bind(model, element, {'provider.attribute.handler': false});

				setTimeout(function() {
					expect(element.innerHTML).toBe('<em data-kontext="text: b"></em>this is A');

					done();
				}, wait);
			});

			it ('text', function(done) {
				kontext.bind(model, element, {'provider.text': false});

				setTimeout(function() {
					expect(element.innerHTML).toBe('<em data-kontext="text: b">this is B</em>{a}');

					done();
				}, wait);
			});

			it ('text.handler', function(done) {
				kontext.bind(model, element, {'provider.text.handler': false});

				setTimeout(function() {
					expect(element.innerHTML).toBe('<em data-kontext="text: b">this is B</em>{a}');

					done();
				}, wait);
			});
		});
	});

	describe('providers can be added', function() {
		var wait = 20,
			main, model;

		/**
		 *  crude 'custom' provider.
		 */
		function custom(settings, element, callback) {
			var list = element.querySelectorAll('kontext-custom'),
				i;

			for (i = 0; i < list.length; ++i) {
				callback(list[i], {text: 'custom'});
			}
		}

		beforeEach(function(done) {
			model = {custom: 'custom works'};
			main = document.createElement('main');

			main.appendChild(document.createElement('kontext-custom'))
				.appendChild(document.createTextNode('should be replaced'));

			done();
		});

		afterEach(function(done) {
			if (main.parentNode) {
				main.parentNode.removeChild(main);
			}
			main = null;

			done();
		});

		it('does not do anything by default', function(done) {
			kontext.bind(model, main);

			setTimeout(function() {
				expect('custom' in kontext.defaults().provider).toBe(false);
				expect(main.innerHTML).toBe('<kontext-custom>should be replaced</kontext-custom>');

				done();
			}, wait);
		});

		it('as option for kontext.bind', function(done) {
			kontext.bind(model, main, {'provider.custom.handler': custom});


			setTimeout(function() {
				expect('custom' in kontext.defaults().provider).toBe(false);
				expect(main.innerHTML).toBe('<kontext-custom>custom works</kontext-custom>');

				done();
			}, wait);
		});

		it('by registering as provider', function(done) {
			kontext.provider('custom', custom);
			kontext.bind(model, main);

			setTimeout(function() {
				expect('custom' in kontext.defaults().provider).toBe(true);
				expect(main.innerHTML).toBe('<kontext-custom>custom works</kontext-custom>');

				done();
			}, wait);
		});

		it('does not do anything after reset', function(done) {
			kontext.defaults('provider.custom', null);

			kontext.bind(model, main);

			setTimeout(function() {
				expect('custom' in kontext.defaults().provider).toBe(true);
				expect(kontext.defaults().provider.custom).toBe(null);
				expect(main.innerHTML).toBe('<kontext-custom>should be replaced</kontext-custom>');

				done();
			}, wait);
		});

		it('by manipulating the defaults directly', function(done) {
			kontext.defaults('provider.custom.handler', custom);
			kontext.bind(model, main);

			setTimeout(function() {
				expect('custom' in kontext.defaults().provider).toBe(true);
				expect(main.innerHTML).toBe('<kontext-custom>custom works</kontext-custom>');

				done();
			}, wait);
		});
	});
});
