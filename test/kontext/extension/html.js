/*global kontext: true, describe: true, it: true, expect: true*/
describe('Kontext Extension HTML', function() {
	'use strict';

	it('sets content as html', function(done) {
		var element = document.createElement('div'),
			model;

		element.setAttribute('data-kontext', 'html: content');

		model = kontext.bind({content: '<h1>Title</h1><p>This is some text</p>'}, element);

		expect(element.children.length).toBe(2);
		expect(element.children[0].tagName).toBe('H1');

		model.on('update', function() {
			expect(element.children.length).toBe(1);
			expect(element.children[0].tagName).toBe('H2');

			done();
		});

		model.content = '<h2>New title</h2>';
	});

	it('allows for scoped variables', function(done) {
		var element = document.createElement('div'),
			model;

		element.setAttribute('data-kontext', 'html: sub.content');

		model = kontext.bind({sub: {content: '<h1>Title</h1><p>This is some text</p>'}}, element);

		expect(element.children.length).toBe(2);
		expect(element.children[0].tagName).toBe('H1');

		model.on('update', function() {
			expect(element.children.length).toBe(1);
			expect(element.children[0].tagName).toBe('H2');

			done();
		});

		model.sub.content = '<h2>New title</h2>';
	});
});
