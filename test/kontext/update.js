/*global kontext: true, describe: true, afterEach: true, beforeEach: true, it: true, expect: true*/
describe('Kontext Updates', function() {
	'use strict';

	beforeEach(function(done) {
		var wrapper = document.body.insertBefore(document.createElement('div'), document.body.firstChild);

		wrapper.setAttribute('class', 'fixture');

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

	describe('preserves type in model for textNode changes', function() {
		it('casts number to string', function(done) {
			var element = document.querySelector('.fixture'),
				text = element.appendChild(document.createTextNode('{variable}')),
				model = kontext.bind({
					variable: 'string'
				}, element);

			model.on('update', function(mod, key) {
				expect(typeof mod[key]).toBe('string');
				expect(mod[key]).toBe('1');

				done();
			});

			text.data = 1;
		});

		it('casts boolean to string', function(done) {
			var element = document.querySelector('.fixture'),
				text = element.appendChild(document.createTextNode('{variable}')),
				model = kontext.bind({
					variable: 'string'
				}, element);

			model.on('update', function(mod, key) {
				expect(typeof mod[key]).toBe('string');
				expect(mod[key]).toBe('true');

				done();
			});

			text.data = true;
		});

		it('casts string to number', function(done) {
			var element = document.querySelector('.fixture'),
				text = element.appendChild(document.createTextNode('{variable}')),
				model = kontext.bind({
					variable: 123
				}, element);

			model.on('update', function(mod, key) {
				expect(typeof mod[key]).toBe('number');
				expect(mod[key]).toBe(456);

				done();
			});

			text.data = '456';
		});

		it('casts empty string to boolean - false', function(done) {
			var element = document.querySelector('.fixture'),
				text = element.appendChild(document.createTextNode('{variable}')),
				model = kontext.bind({
					variable: true
				}, element);

			model.on('update', function(mod, key) {
				expect(typeof mod[key]).toBe('boolean');
				expect(mod[key]).toBe(true);

				done();
			});

			text.data = '';
		});
	});

	describe('sends the previous value in updates', function() {
		it('delegate', function(done) {
			var element = document.querySelector('.fixture'),
				model = kontext.bind({num: 0}, element),
				delegate = model.delegation('num');

			delegate.on('update', function(mod, key, prev, current) {
				expect(mod).toBe(model);
				expect(key).toBe('num');
				expect(current).toBe(model.num);

				if (model.num === 2) {
					expect(prev).toBe(0);

					model.num = 5;
				}
				else {
					expect(prev).toBe(2);

					done();
				}
			});

			model.num = 2;
		});

		it('model', function(done) {
			var element = document.querySelector('.fixture'),
				model = kontext.bind({num: 0}, element);

			model.on('update', function(mod, key, prev, current) {
				expect(mod).toBe(model);
				expect(key).toBe('num');
				expect(current).toBe(model.num);

				if (model.num === 2) {
					expect(prev).toBe(0);

					model.num = 5;
				}
				else {
					expect(prev).toBe(2);

					done();
				}
			});

			model.num = 2;
		});

		it('kontext', function(done) {
			var element = document.querySelector('.fixture'),
				model = kontext.bind({num: 0}, element);

			kontext.on('update', function(mod, key, prev, current) {
				expect(mod).toBe(model);
				expect(key).toBe('num');
				expect(current).toBe(model.num);

				if (model.num === 2) {
					expect(prev).toBe(0);

					model.num = 5;
				}
				else {
					expect(prev).toBe(2);

					done();
				}
			});

			model.num = 2;
		});
	});

	it('triggers the access event', function(done) {
		var element = document.querySelector('.fixture'),
			model = kontext.bind({hello: 'world'}, element),
			delegate = model.delegation('hello');

		delegate.on('access', function(mod, key, prev, current) {
			expect(mod).toBe(model);
			expect(key).toBe('hello');
			expect(prev).toBe(current);
			expect(model.hello).toBe(current);

			done();
		});

		expect(model.hello).toBe('world');
	});
});
