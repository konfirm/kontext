/*global kontext: true, describe: true, it: true, expect: true*/
describe('Kontext Provider Text', function() {
	'use strict';

	var provider = kontext.provider('text');

	it('text provider exists', function() {
		expect(typeof provider).toBe('object');
		expect(typeof provider.handler).toBe('function');
		expect(typeof provider.settings).toBe('object');
		expect(provider.settings.pattern instanceof RegExp).toBe(true);
	});

	it('finds all placeholders', function() {
		var main = document.createElement('main'),
			collect = [];

		main.appendChild(document.createTextNode('hello {greet}'));
		main.appendChild(document.createElement('div'))
			.appendChild(document.createTextNode('a {foo:fool} walks into a {bar:trap}.'));
		main.appendChild(document.createTextNode('goodbye {target}!'));

		provider.handler(provider.settings, main, function(target, options) {
			expect(target.nodeType).toBe(3);

			expect('text' in options).toBe(true);
			expect(typeof options.text).toBe('object');
			expect('target' in options.text).toBe(true);
			expect('initial' in options.text).toBe(true);

			if (options.text.target === 'foo') {
				expect(options.text.initial).toBe('fool');
			}
			else if (options.text.target === 'bar') {
				expect(options.text.initial).toBe('trap');
			}
			else {
				expect(options.text.initial).toBe(undefined);
			}

			collect.push(options.text.target);
		});

		expect(collect.length).toBe(4);
		expect(collect.indexOf('greet') >= 0).toBe(true);
		expect(collect.indexOf('foo') >= 0).toBe(true);
		expect(collect.indexOf('bar') >= 0).toBe(true);
		expect(collect.indexOf('target') >= 0).toBe(true);
	});
});
