/*global kontext: true, describe: true, afterEach: true, beforeEach: true, it: true, expect: true*/
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
							config: defaults.provider.attribute.config
						},
						text: {
							handler: defaults.provider.text.handler,
							config: defaults.provider.text.config
						}
					}
				};

				element = document.createElement('div');

				node = element.appendChild(document.createElement('strong'))
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

				node = element.appendChild(document.createElement('em'))
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
	})
});
