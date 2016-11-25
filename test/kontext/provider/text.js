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

	describe('placeholders', function() {
		var main = setup();

		it('finds in DOMText', function() {
			var text = document.createTextNode('hello {world}');

			provider.handler(provider.settings, text, function(target, options) {
				expect(target.nodeType).toBe(3);

				expect('text' in options).toBe(true);
				expect(typeof options.text).toBe('object');
				expect('target' in options.text).toBe(true);
				expect('initial' in options.text).toBe(true);

				expect(options.text.target).toBe('world');
			});
		});

		it('finds in single DOMElement', function() {
			main.node.appendChild(document.createTextNode('hello {world}'));

			provider.handler(provider.settings, main.node, function(target, options) {
				expect(target.nodeType).toBe(3);

				expect('text' in options).toBe(true);
				expect(typeof options.text).toBe('object');
				expect('target' in options.text).toBe(true);
				expect('initial' in options.text).toBe(true);

				expect(options.text.target).toBe('world');
			});
		});

		it('finds in DOM structure', function() {
			var verify = ['world', 'foo', 'bar'];

			main.node
				.appendChild(document.createElement('h1'))
				.appendChild(document.createTextNode('hello {world}'));

			main.node
				.appendChild(document.createElement('script'))
				.appendChild(document.createTextNode('var foo = {skip:1}'));

			main.node
				.appendChild(document.createElement('p'))
				.appendChild(document.createTextNode('no placeholders'));

			main.node
				.appendChild(document.createElement('p'))
				.appendChild(document.createTextNode('a {foo:fool} walks into a {bar:trap}'));

			provider.handler(provider.settings, main.node, function(target, options) {
				expect(target.nodeType).toBe(3);

				expect('text' in options).toBe(true);
				expect(typeof options.text).toBe('object');
				expect('target' in options.text).toBe(true);
				expect('initial' in options.text).toBe(true);

				expect(verify.indexOf(options.text.target) >= 0).toBe(true);

				if (options.text.target === 'foo') {
					expect(options.text.initial).toBe('fool');
				}
				else if (options.text.target === 'bar') {
					expect(options.text.initial).toBe('trap');
				}
			});
		});

		it('does not trip over non-DOMNodes', function() {
			var hit = 0;

			provider.handler(provider.settings, null, function(target, options) {
				++hit;
			});

			provider.handler(provider.settings, 'nope', function(target, options) {
				++hit;
			});

			provider.handler(provider.settings, true, function(target, options) {
				++hit;
			});

			expect(hit).toBe(0);
		});
	});
});
