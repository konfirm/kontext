/*global kontext, describe, afterEach, beforeEach, it, expect, spyOn*/
describe('Kontext Extension Input', function() {
	'use strict';

	function simulateTextInput(target, text) {
		var name = 'input',
			type = 'CustomEvent',
			Evt = type in window && typeof window[type] === 'function' ? window[type] : false,
			trigger = false;

		//  change the value
		target.value = text;

		if (Evt) {
			trigger = new Evt(name, {cancelable: true});
		}
		else if ('createEvent' in document) {
			trigger = document.createEvent(type);
			trigger.initEvent(name, false, true);
		}

		if ('dispatchEvent' in target) {
			target.dispatchEvent(trigger);
		}
	}

	describe('textual inputs', function() {
		['', 'text', 'password', 'date'].forEach(function(type) {

			it(type, function(done) {
				var element = document.createElement('input'),
					model;

				element.setAttribute('data-kontext', 'input: {value: text}');

				if (type) {
					element.setAttribute('type', type);
				}

				model = kontext.bind({
					text: 'first'
				}, element);

				model.on('update', function(m, k) {
					expect(m[k]).toBe(element.value);

					if (m[k] === 'second') {
						expect(element.value).toBe('second');

						//  change the element value, which should reflect the change in the model key
						simulateTextInput(element, 'last');
					}
					else {
						expect(m[k]).toBe('last');

						done();
					}
				});

				expect(element.value).toBe('first');

				//  change the bound model key, which should reflect the change in the element value
				model.text = 'second';
			});
		});
	});

	it('handles checkboxes', function(done) {
		var element = document.createElement('input'),
			model;

		element.setAttribute('type', 'checkbox');
		element.setAttribute('data-kontext', 'input: {checked: toggle}');
		model = kontext.bind({
			toggle: false
		}, element);

		model.on('update', function(m, k) {
			expect(m[k]).toBe(element.checked);
			expect(m[k]).toBe(true);

			done();
		});

		expect(element.checked).toBe(false);

		model.toggle = true;
	});

	describe('single select', function() {
		it('removes the multiple attribute if the value cannot reflect multiple selection', function(done) {
			var element = document.createElement('select'),
				model;

			element.setAttribute('multiple', '');
			element.setAttribute('data-kontext', 'input: {value: selection, options: list}');

			expect(element.hasAttribute('multiple')).toBe(true);

			model = kontext.bind({
				selection: null,
				list: [
					'a', 'b', 'c', 'd'
				]
			}, element);

			expect(element.hasAttribute('multple')).toBe(false);

			done();
		});

		it('no initial', function(done) {
			var element = document.createElement('select'),
				model;

			element.setAttribute('data-kontext', 'input: {value: selection, options: list}');
			model = kontext.bind({
				selection: null,
				list: [
					'a', 'b', 'c', 'd'
				]
			}, element);

			model.on('update', function(m, k) {
				var index = model.list.indexOf(m[k]),
					options = element.querySelectorAll('option'),
					i;

				expect(m[k]).toBe('b');
				expect(index).toBe(1);

				for (i = 0; i < options.length; ++i) {
					expect(options[i].selected).toBe(i === index);
				}

				done();
			});

			expect(model.selection).toBe(null);
			expect(element.querySelectorAll('option').length).toBe(model.list.length);

			model.selection = 'b';
		});

		it('selects initial value', function(done) {
			var element = document.createElement('select'),
				model;

			element.setAttribute('data-kontext', 'input: {value: selection, options: list}');
			model = kontext.bind({
				selection: 'c',
				list: [
					'a', 'b', 'c', 'd'
				]
			}, element);

			expect(model.selection).toBe('c');
			expect(element.querySelectorAll('option').length).toBe(model.list.length);
			expect(element.querySelectorAll('option')[2].selected).toBe(true);

			done();
		});

		it('adds default', function(done) {
			var element = document.createElement('select'),
				model;

			element.setAttribute('data-kontext', 'input: {value: selection, options: list, default: choose}');
			model = kontext.bind({
				selection: null,
				list: [
					'a', 'b', 'c', 'd'
				]
			}, element);

			expect(model.selection).toBe(null);
			expect(element.querySelectorAll('option').length).toBe(model.list.length + 1);
			expect(element.querySelectorAll('option')[0].selected).toBe(true);

			done();
		});

		it('accepts objects options', function(done) {
			var element = document.createElement('select'),
				model;

			element.setAttribute('data-kontext', 'input: {value: selection, options: opt}');
			model = kontext.bind({
				selection: 'c',
				opt: {
					a: 'A',
					b: 'B',
					c: 'C',
					d: 'D'
				}
			}, element);

			expect(model.selection).toBe('c');
			expect(element.querySelectorAll('option').length).toBe(Object.keys(model.opt).length);
			expect(element.querySelectorAll('option')[2].selected).toBe(true);

			done();
		});

		it('accepts objects with label and/or value for options', function(done) {
			var element = document.createElement('select'),
				model;

			element.setAttribute('data-kontext', 'input: {value: selection, options: list}');
			model = kontext.bind({
				selection: 'b',
				list: [
					{label: 'a'},
					{value: 'b'},
					{label: 'C', value: 'c'},
					{something: 'else'}
				]
			}, element);

			expect(model.selection).toBe('b');
			expect(element.querySelectorAll('option').length).toBe(model.list.length);
			expect(element.querySelectorAll('option')[1].selected).toBe(true);

			done();
		});
	});

	describe('multi select', function() {
		it('adds the multiple attribute if the value can reflect multiple selection', function(done) {
			var element = document.createElement('select'),
				model;

			expect(element.getAttribute('multiple')).toBe(null);

			element.setAttribute('data-kontext', 'input: {value: selection, options: list}');

			model = kontext.bind({
				selection: [],
				list: [
					'a', 'b', 'c', 'd'
				]
			}, element);

			expect(element.hasAttribute('multiple')).toBe(true);
			expect(element.multiple).toBe(true);

			done();
		});

		it('selects all initial values', function(done) {
			var element = document.createElement('select'),
				model;

			element.setAttribute('data-kontext', 'input: {value: selection, options: list}');

			model = kontext.bind({
				selection: ['b', 'c'],
				list: [
					'a', 'b', 'c', 'd'
				]
			}, element);

			expect(model.selection.length).toBe(2);
			model.list.forEach(function(v, i) {
				var index = model.selection.indexOf(v);

				expect(element.options[i].selected).toBe(index >= 0);
			});

			done();
		});
	});
});
