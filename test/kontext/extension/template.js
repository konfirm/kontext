/*global kontext, beforeEach, afterEach, describe, it, expect*/
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

		kontext.bind({}, extension);

		setTimeout(function() {
			expect(extension.firstChild.nodeName).toBe('EM');
			expect(extension.firstChild.innerHTML).toBe('inner-id');

			done();
		}, 100);
	});

	it('loads templates by alternative selector', function(done) {
		var extension = element.appendChild(document.createElement('div'));

		extension.setAttribute('data-kontext', 'template: {path: /base/test/data/template.html, selector: \'[data-template=inner-attr]\'}');
		extension.appendChild(document.createElement('span')).appendChild(document.createTextNode('hi there'));

		expect(extension.firstChild.nodeName).toBe('SPAN');
		expect(extension.firstChild.innerHTML).toBe('hi there');

		kontext.bind({}, extension);

		setTimeout(function() {
			expect(extension.firstChild.nodeName).toBe('STRONG');
			expect(extension.firstChild.innerHTML).toBe('inner-attr');

			done();
		}, 100);
	});

	it('loads templates without selector', function(done) {
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

		extension.setAttribute('data-kontext', 'template: {}');
		kontext.bind({}, extension);

		setTimeout(function() {
			console.log(extension.innerHTML);
			expect(extension.hasAttribute('data-kontext-error')).toBe(true);
			expect(extension.getAttribute('data-kontext-error')).toBe('No path and selector');

			done();
		}, 100);
	});
});
