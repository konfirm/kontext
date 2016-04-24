/*global kontext: true, describe: true, it: true, expect: true*/
describe('Kontext Extension Input', function() {
	'use strict';

	/**
	 *  Trigger an event with the given name on the target
	 */
	function triggerEvent(target, name) {
		var type = 'CustomEvent',
			Evt = type in window && typeof window[type] === 'function' ? window[type] : false,
			trigger = false;

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

	/**
	 *  simulate text input by triggering the input event
	 */
	function simulateTextInput(target, text) {
		//  change the value
		target.value = text;

		triggerEvent(target, 'input');
	}

	/**
	 *  simulate selection input by triggering change event
	 */
	function simulateSelectionInput(target, index) {
		//  change the value
		target.selectedIndex = index;

		triggerEvent(target, 'change');
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

			it('handles scoped properties in ' + type, function(done) {
				var element = document.createElement('input'),
					model;

				element.setAttribute('data-kontext', 'input: {value: sub.text}');

				if (type) {
					element.setAttribute('type', type);
				}

				model = kontext.bind({sub: {
					text: 'first'
				}}, element);

				model.sub.on('update', function(m, k) {
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
				model.sub.text = 'second';
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
			var element = document.createElement('select');

			element.setAttribute('multiple', '');
			element.setAttribute('data-kontext', 'input: {value: selection, options: list}');

			expect(element.hasAttribute('multiple')).toBe(true);

			kontext.bind({
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
			expect(model.list.indexOf(model.selection)).toBe(-1);
			expect(element.querySelectorAll('option').length).toBe(model.list.length + 1);
			expect(element.querySelectorAll('option')[0].selected).toBe(true);

			model.on('update', function(m, k) {
				expect(m[k]).toBe('c');
				expect(model.list.indexOf(m[k])).toBe(2);

				done();
			});

			model.selection = 'c';
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
			var element = document.createElement('select');

			expect(element.getAttribute('multiple')).toBe(null);

			element.setAttribute('data-kontext', 'input: {value: selection, options: list}');

			kontext.bind({
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

	it('uses options from html if no options are in the model', function(done) {
		var element = document.createElement('select'),
			options = [
				'a', 'b', 'c', 'd'
			],
			model;

		element.setAttribute('type', 'select');
		element.setAttribute('data-kontext', 'input: {value: selection}');
		options.forEach(function(v) {
			var opt = element.appendChild(document.createElement('option'));

			opt.appendChild(document.createTextNode(v));
		});

		model = kontext.bind({
			selection: 'b'
		}, element);

		expect(element.options.length).toBe(options.length);
		expect(element.selectedIndex).toBe(1);

		options.forEach(function(v, i) {
			var index = model.selection === v;

			expect(element.options[i].selected).toBe(index);
		});

		done();
	});

	describe('handles changes in selection', function() {
		it('single select', function(done) {
			var element = document.createElement('select'),
				model;

			element.setAttribute('data-kontext', 'input: {value: selection, options: list}');

			model = kontext.bind({
				selection: 'a',
				list: [
					'a', 'b', 'c', 'd'
				]
			}, element);

			model.on('update', function(m, k) {
				expect(m[k]).toBe('c');
				expect(element.selectedIndex).toBe(model.list.indexOf(m[k]));
				expect(element.options[element.selectedIndex].value).toBe(m[k]);

				done();
			});

			expect(element.selectedIndex).toBe(0);
			expect(element.options[element.selectedIndex].value).toBe('a');

			simulateSelectionInput(element, model.list.indexOf('c'));
		});

		it('multi select', function(done) {
			var element = document.createElement('select'),
				model;

			element.setAttribute('data-kontext', 'input: {value: selection, options: list}');

			model = kontext.bind({
				selection: ['a', 'c'],
				list: [
					'a', 'b', 'c', 'd'
				]
			}, element);

			model.on('update', function() {
				model.selection.forEach(function(v) {
					var index = model.list.indexOf(v);

					expect(element.options[index].selected).toBe(true);
				});

				if (model.selection.length === 1) {
					element.options[0].selected = true;
					element.options[3].selected = true;
					triggerEvent(element, 'change');
				}
				else {
					//  expect the order to be the order in which the elements were selected
					//  ('a' was turned off, then on again, 'd' was added)
					expect(model.selection.join(',')).toBe('c,a,d');
					done();
				}
			});

			model.selection.forEach(function(v) {
				var index = model.list.indexOf(v);

				expect(element.options[index].selected).toBe(true);
			});

			expect(model.selection.length).toBe(2);

			element.options[0].selected = false;
			triggerEvent(element, 'change');
		});
	});

	it('allows working with array properties for options', function(done) {
		var element = document.createElement('select'),
			selection = ['a', 'd'],
			model = {
				selection: selection
			};

		selection.opt = [
			'a', 'b', 'c', 'd', 'e'
		];

		element.setAttribute('data-kontext', 'input: {value: selection, options: selection.opt}');

		model = kontext.bind(model, element);

		expect(model.selection.opt.length).toBe(5);
		expect(element.options.length).toBe(model.selection.opt.length);

		selection.opt.forEach(function(opt, index) {
			var selected = selection.indexOf(opt) >= 0;

			expect(element.options[index].value).toBe(selection.opt[index]);
			expect(element.options[index].selected).toBe(selected);
		});

		done();
	});
});
