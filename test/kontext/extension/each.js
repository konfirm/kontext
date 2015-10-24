/*global kontext, describe, afterEach, beforeEach, it, expect, spyOn*/
describe('Kontext Extension Each', function() {
	'use strict';

	it('reflects the items in bound array', function(done) {
		var element = document.createElement('div'),
			model;

		element.setAttribute('data-kontext', 'each: list');
		element.appendChild(document.createElement('strong')).appendChild(document.createTextNode('{a}'));
		element.appendChild(document.createTextNode('{b} B'));

		model = kontext.bind({list: []}, element);

		model.on('update', function(mod, key) {
			expect(element.childNodes.length).toBe(mod[key].length * 3);

			if (mod[key].length < 5) {
				mod[key].push({
					a: 'a' + mod[key].length,
					b: 'b' + mod[key].length
				});
			}
			else {
				done();
			}
		});

		expect(element.childNodes.length).toBe(0);

		model.list.push({
			a: 'initial',
			b: 'initial'
		});
	});

	it('works with settings in objects', function(done) {
		var element = document.createElement('div'),
			model;

		element.setAttribute('data-kontext', 'each: {target: list}');
		element.appendChild(document.createTextNode('{b} B'));

		model = kontext.bind({list: []}, element);

		model.on('update', function(mod, key) {
			expect(element.childNodes.length).toBe(mod[key].length * 2);

			if (mod[key].length < 5) {
				mod[key].push({
					a: 'a' + mod[key].length,
					b: 'b' + mod[key].length
				});
			}
			else {
				done();
			}
		});

		expect(element.childNodes.length).toBe(0);

		model.list.push({
			a: 'initial',
			b: 'initial'
		});
	});

	it('filters using a model method', function(done) {
		var element = document.createElement('div'),
			model;

		element.setAttribute('data-kontext', 'each: {target: list, filter: even}');
		element.appendChild(document.createElement('strong')).appendChild(document.createTextNode('{a}'));
		element.appendChild(document.createTextNode('{b} B'));

		model = kontext.bind({
			list: [],
			even: function(m, i) {
				return i % 2 === 0;
			}
		}, element);

		model.on('update', function(mod, key) {
			expect(element.childNodes.length).toBe(Math.ceil(mod[key].length / 2) * 3);

			if (mod[key].length < 5) {
				mod[key].push({
					a: 'a' + mod[key].length,
					b: 'b' + mod[key].length
				});
			}
			else {
				done();
			}
		});

		expect(element.childNodes.length).toBe(0);

		model.list.push({
			a: 'initial',
			b: 'initial'
		});
	});
});
