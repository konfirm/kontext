/*global kontext: true, describe: true, it: true, expect: true*/
describe('Kontext Extension CSS', function() {
	'use strict';

	it('adds/removes classes', function(done) {
		var element = document.createElement('div'),
			model;

		element.setAttribute('data-kontext', 'css: {first: first, second: second}');

		model = kontext.bind({first: true, second: false}, element);
		expect(element.className).toContain('first');
		expect(element.className).not.toContain('second');

		model.on('update', function() {
			if (!model.first) {
				expect(element.className).not.toContain('first');
			}
			else {
				expect(element.className).toContain('first');
			}

			if (!model.second) {
				expect(element.className).not.toContain('second');
			}
			else {
				expect(element.className).toContain('second');
			}

			if (!model.first && model.second) {
				done();
			}
			else {
				model.second = true;
			}
		});

		model.first = false;
	});

	it('allows for scoped variables', function(done) {
		var element = document.createElement('div'),
			model;

		element.setAttribute('data-kontext', 'css: {first: sub.first, second: sub.second}');

		model = kontext.bind({sub: {first: true, second: false}}, element);
		expect(element.className).toContain('first');
		expect(element.className).not.toContain('second');

		model.on('update', function() {
			if (!model.sub.first) {
				expect(element.className).not.toContain('first');
			}
			else {
				expect(element.className).toContain('first');
			}

			if (!model.sub.second) {
				expect(element.className).not.toContain('second');
			}
			else {
				expect(element.className).toContain('second');
			}

			if (!model.sub.first && model.sub.second) {
				done();
			}
			else {
				model.sub.second = true;
			}
		});

		model.sub.first = false;
	});
});
