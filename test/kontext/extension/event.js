/*global kontext, describe, afterEach, beforeEach, it, expect, spyOn*/
describe('Kontext Extension Event', function() {
	'use strict';

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

	it('handles events', function(done) {
		var element = document.createElement('div'),
			model;

		element.setAttribute('data-kontext', 'event: {mouseover: {foo: yes}, mouseout: {foo: no}}');

		model = kontext.bind({
			foo: 'unknown'
		}, element);

		model.on('update', function(m, k) {
			expect(k).toBe('foo');

			if (m[k] === 'no') {
				done();
			}
			else {
				expect(m[k]).toBe('yes');

				triggerEvent(element, 'mouseout');
			}
		});

		expect(model.foo).toBe('unknown');

		triggerEvent(element, 'mouseover');
	});

	it('applies function calls if the referenced value is a model method', function(done) {
		var element = document.createElement('div'),
			model;

		element.setAttribute('data-kontext', 'event: {click: {check: yes}}');

		model = kontext.bind({
			check: function(e, m, k, v) {
				expect(m).toBe(model);
				expect(k).toBe('check');
				expect(v).toBe('yes');

				done();
			}
		}, element);

		triggerEvent(element, 'click');
	});

	it('does not trigger Errors when accessing non-existent keys', function(done) {
		var element = document.createElement('div'),
			model;

		element.setAttribute('data-kontext', 'event: {click: {noop: yes}}');

		model = kontext.bind({}, element);

		triggerEvent(element, 'click');

		setTimeout(done, 100);
	});
});
