/* global kontext: true, describe: true, afterEach: true, beforeEach: true, it: true, expect: true, spyOn: true */
describe('Kontext Extension', function() {
	'use strict';

	beforeEach(function(done) {
		var content = '<p data-kontext="basic: foo">foo</p>',
			wrapper = document.body.insertBefore(document.createElement('div'), document.body.firstChild);

		wrapper.setAttribute('class', 'fixture');
		wrapper.innerHTML = content;

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

	/**
	 * set a data-basic attribute on given element
	 */
	function basic(element, model, key) {
		model.on('update', function(m, k) {
			element.setAttribute('data-basic', m[k]);
		});

		element.setAttribute('data-basic', model[key]);
	}

	it('informs about unknown extensions', function() {
		var unknown = kontext.extension('unknown');

		spyOn(console, 'error');

		unknown();

		expect(console.error).toHaveBeenCalled();
		expect(console.error).toHaveBeenCalledWith('Kontext: Unknown extension "unknown"');
	});

	it('default allows for abbreviated extension names', function() {
		var a = kontext.extension('attribute'),
			b = kontext.extension('attr'),
			c = kontext.extension('at'),
			d = kontext.extension('a');

		expect(a).toBe(b);
		expect(b).toBe(c);
		expect(c).toBe(d);
		expect(d).toBe(a);
	});

	it('turn off abbreviated extension names', function() {
		var attr;

		kontext.defaults('abbreviateExtensions', false);

		attr = kontext.extension('attr');

		spyOn(console, 'error');

		attr();

		expect(console.error).toHaveBeenCalled();
		expect(console.error).toHaveBeenCalledWith('Kontext: Unknown extension "attr"');

		//  bring back the defaults
		kontext.defaults('abbreviateExtensions', true);
	});

	it('triggers an error if an abbreviated extension name leads to multiple options', function() {
		var ambiguous = kontext.extension('e'),
			event = kontext.extension('ev'),
			each = kontext.extension('ea');

		spyOn(console, 'error');

		ambiguous();
		expect(console.error).toHaveBeenCalled();
		expect(console.error).toHaveBeenCalledWith('Kontext: Multiple extensions match "e": each,event');

		expect(event).not.toBe(each);
	});

	it('registers custom handlers', function(done) {
		var list = document.querySelectorAll('[data-kontext*=basic]'),
			model;

		kontext.extension('basic', basic);

		model = kontext.bind({
			foo: 'initial'
		}, document.body);

		model.on('update', function() {
			if (model.foo === 'bar') {
				expect(list[0].getAttribute('data-basic')).toBe('bar');
				model.foo = 'baz';
			}
			else {
				expect(list[0].getAttribute('data-basic')).toBe('baz');
				done();
			}
		});

		model.foo = 'bar';
	});
});
