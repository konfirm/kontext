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
});
