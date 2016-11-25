/* global kontext: true, beforeEach: true, afterEach: true, describe: true, it: true, expect: true */
describe('Kontext Extension Template', function() {
	'use strict';

	var element;

	beforeEach(function(done) {
		element = document.body.appendChild(document.createElement('div'));

		done();
	});

	afterEach(function(done) {
		if (element) {
			while (element.lastChild) {
				element.removeChild(element.lastChild);
			}

			if (element.parentNode) {
				element.parentNode.removeChild(element);
			}

			element = null;
		}

		done();
	});

	it('postpones callbacks while loading the same template multiple times', function(done) {
		var wrapper = element.appendChild(document.createElement('section')),
			extensionA = wrapper.appendChild(document.createElement('div')),
			extensionB = wrapper.appendChild(document.createElement('div'));

		extensionA.setAttribute('data-kontext', 'template: {path: /base/test/data/template.html, selector: \'[data-template=inner-attr]\'}');
		extensionA.appendChild(document.createElement('span')).appendChild(document.createTextNode('hi there'));

		extensionB.setAttribute('data-kontext', 'template: /base/test/data/template.html#inner-id');
		extensionB.appendChild(document.createElement('span')).appendChild(document.createTextNode('hi there'));

		expect(extensionA.firstChild.nodeName).toBe('SPAN');
		expect(extensionA.firstChild.innerHTML).toBe('hi there');

		expect(extensionB.firstChild.nodeName).toBe('SPAN');
		expect(extensionB.firstChild.innerHTML).toBe('hi there');

		kontext.bind({name: 'replaced'}, wrapper);

		setTimeout(function() {
			expect(extensionA.firstChild.nodeName).toBe('STRONG');
			expect(extensionA.firstChild.innerHTML).toBe('inner-attr replaced');
			expect(extensionB.firstChild.nodeName).toBe('EM');
			expect(extensionB.firstChild.innerHTML).toBe('inner-id replaced');

			done();
		}, 200);
	});

	it('loads templates by id internally', function(done) {
		var template = element.appendChild(document.createElement('div')),
			extension = element.appendChild(document.createElement('div'));

		template.setAttribute('id', 'test');
		template.appendChild(document.createElement('strong')).appendChild(document.createTextNode('Hello {hello}'));

		extension.setAttribute('data-kontext', 'template: #test');
		extension.appendChild(document.createElement('span')).appendChild(document.createTextNode('hi there'));

		expect(extension.firstChild.nodeName).toBe('SPAN');
		expect(extension.firstChild.innerHTML).toBe('hi there');

		kontext.bind({hello: 'world'}, extension);

		setTimeout(function() {
			expect(extension.firstChild.nodeName).toBe('STRONG');
			expect(extension.firstChild.innerHTML).toBe('Hello world');

			done();
		}, 40);
	});

	it('loads templates by id externally', function(done) {
		var extension = element.appendChild(document.createElement('div'));

		extension.setAttribute('data-kontext', 'template: /base/test/data/template.html#inner-id');
		extension.appendChild(document.createElement('span')).appendChild(document.createTextNode('hi there'));

		expect(extension.firstChild.nodeName).toBe('SPAN');
		expect(extension.firstChild.innerHTML).toBe('hi there');

		kontext.bind({name: 'replaced'}, extension);

		setTimeout(function() {
			expect(extension.firstChild.nodeName).toBe('EM');
			expect(extension.firstChild.innerHTML).toBe('inner-id replaced');

			done();
		}, 100);
	});

	it('loads templates by alternative selector', function(done) {
		var extension = element.appendChild(document.createElement('div'));

		extension.setAttribute('data-kontext', 'template: {path: /base/test/data/template.html, selector: "[data-template=inner-attr]"}');
		extension.appendChild(document.createElement('span')).appendChild(document.createTextNode('hi there'));

		expect(extension.firstChild.nodeName).toBe('SPAN');
		expect(extension.firstChild.innerHTML).toBe('hi there');

		kontext.bind({name: 'replaced'}, extension);

		setTimeout(function() {
			expect(extension.firstChild.nodeName).toBe('STRONG');
			expect(extension.firstChild.innerHTML).toBe('inner-attr replaced');

			done();
		}, 100);
	});

	describe('loads templates without selector', function() {
		it('configures from string', function(done) {
			var extension = element.appendChild(document.createElement('div'));

			extension.setAttribute('data-kontext', 'template: /base/test/data/template.html');
			extension.appendChild(document.createElement('span')).appendChild(document.createTextNode('hi there'));

			expect(extension.firstChild.nodeName).toBe('SPAN');
			expect(extension.firstChild.innerHTML).toBe('hi there');

			kontext.bind({name: 'not checked'}, extension);

			setTimeout(function() {
				expect(extension.firstElementChild.nodeName).toBe('SECTION');

				done();
			}, 100);
		});

		it('configures from object', function(done) {
			var extension = element.appendChild(document.createElement('div'));

			extension.setAttribute('data-kontext', 'template: {path: /base/test/data/template.html}');
			extension.appendChild(document.createElement('span')).appendChild(document.createTextNode('hi there'));

			expect(extension.firstChild.nodeName).toBe('SPAN');
			expect(extension.firstChild.innerHTML).toBe('hi there');

			kontext.bind({}, extension);

			setTimeout(function() {
				expect(extension.firstElementChild.nodeName).toBe('SECTION');

				done();
			}, 100);
		});
	});

	it('can be configured using variables', function(done) {
		var extension = element.appendChild(document.createElement('div')),
			model;

		extension.setAttribute('data-kontext', 'template: {value: display}');
		extension.appendChild(document.createElement('span')).appendChild(document.createTextNode('hi there'));

		expect(extension.firstChild.nodeName).toBe('SPAN');
		expect(extension.firstChild.innerHTML).toBe('hi there');

		model = kontext.bind({
			hello: 'new template',
			display: '/base/test/data/template.html'
		}, extension);

		setTimeout(function() {
			expect(extension.firstElementChild.nodeName).toBe('SECTION');

			model.display = '#test';

			setTimeout(function() {
				expect(extension.firstChild.nodeName).toBe('STRONG');
				expect(extension.firstChild.innerHTML).toBe('Hello new template');

				done();
			}, 100);

		}, 100);
	});

	it('allows for scoped variables', function(done) {
		var extension = element.appendChild(document.createElement('div')),
			model;

		extension.setAttribute('data-kontext', 'template: {value: sub.display}');
		extension.appendChild(document.createElement('span')).appendChild(document.createTextNode('hi there'));

		expect(extension.firstChild.nodeName).toBe('SPAN');
		expect(extension.firstChild.innerHTML).toBe('hi there');

		model = kontext.bind({
			hello: 'new template',
			sub: {
				display: '/base/test/data/template.html'
			}
		}, extension);

		setTimeout(function() {
			expect(extension.firstElementChild.nodeName).toBe('SECTION');

			model.sub.display = '#test';

			setTimeout(function() {
				expect(extension.firstChild.nodeName).toBe('STRONG');
				expect(extension.firstChild.innerHTML).toBe('Hello new template');

				done();
			}, 100);

		}, 100);
	});

	it('sets an error attribute if the template is not found', function(done) {
		var extension = element.appendChild(document.createElement('div')),
			before;

		extension.setAttribute('data-kontext', 'template: {path: /does/not/exist}');
		extension.appendChild(document.createElement('span')).appendChild(document.createTextNode('hi there'));

		before = extension.innerHTML;

		kontext.bind({}, extension);

		setTimeout(function() {
			expect(extension.innerHTML).toBe(before);
			expect(extension.hasAttribute('data-kontext-error')).toBe(true);
			expect(extension.getAttribute('data-kontext-error')).toBe('NOT FOUND');

			done();
		}, 100);
	});

	it('sets an error attribute if no path and selector can be matched', function(done) {
		var extension = element.appendChild(document.createElement('div'));

		extension.setAttribute('data-kontext', 'template: {selector: null}');
		kontext.bind({}, extension);

		setTimeout(function() {
			expect(extension.hasAttribute('data-kontext-error')).toBe(true);
			expect(extension.getAttribute('data-kontext-error')).toBe('No path and selector');

			done();
		}, 100);
	});
});
