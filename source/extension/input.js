/*global kontext*/
/**
 *  Control form elements from data-kontext attributes
 *  @name     Input
 *  @package  Kontext
 *  @example  <input data-kontext="input: {value: key}">
 *            <input type=checkbox data-kontext="input: {checked: key}">
 *            <select data-kontext="input: {value: key, options: optionsKey}"></select>
 *            <select data-kontext="input: {value: key, options: optionsKey}"</select>
 */
kontext.extension('input', function(element, model, config) {
	'use strict';

	var select = /^select/i,
		handlers = {},
		property, delegate;

	function type(node) {
		if (!node.hasAttribute('type')) {
			return select.test(node.nodeName) ? 'select-' + (node.multiple ? 'multiple' : 'one') : 'text';
		}

		return node.getAttribute('type');
	}

	function handle(property) {
		if (!(property in handlers)) {
			handlers[property] = {
				model: function() {
					delegate(element[property]);
				},

				element: function(model, key) {
					element[property] = model[key];
				}
			};
		}

		return handlers[property];
	}

	function selection() {
		var defaultOption = 'default' in config ? {value: null, label: config.default} : false,
			update = function() {
				var offset = 0;

				if ('options' in config && config.options in model) {
					if (defaultOption) {
						element.options[offset] = new Option(defaultOption.label, defaultOption.value);
						++offset;
					}

					element.options.length = offset;

					if (typeof model[config.options] === 'object') {
						if (model[config.options] instanceof Array) {
							model[config.options]
								.forEach(function(value, index) {
									if (typeof value === 'object') {
										element.options[index + offset] = new Option(
											value.label || value.value || '',
											value.value || ''
										);
									}
									else {
										element.options[index + offset] = new Option(value);
									}
								});
						}
						else {
							Object.keys(model[config.options])
								.forEach(function(value, index) {
									element.options[index + offset] = new Option(model[config.options][value], value);
								});
						}
					}
				}
			},

			select = function(value) {
				var i;

				for (i = 0; i < element.options.length; ++i) {
					if (value instanceof Array) {
						element.options[i].selected = value.indexOf(element.options[i].value) >= 0;
					}
					else {
						element.options[i].selected = element.options[i].value === value;
					}
				}
			},

			delegatedList = 'options' in config ? model.delegation(config.options) : false,
			delegated = 'value' in config ? model.delegation(config.value) : false,
			initial = delegated ? delegated() : null;

		if (delegated) {
			if (initial instanceof Array) {
				element.setAttribute('multiple', '');
			}
			else {
				element.removeAttribute('multiple');
			}

			element.addEventListener('change', function() {
				var i, n;

				if (element.options.length) {
					if (initial instanceof Array) {
						for (i = 0; i < element.options.length; ++i) {
							if (element.options[i].selected && model[config.value].indexOf(element.options[i].value) < 0) {
								model[config.value].push(element.options[i].value);
							}
							else if (!element.options[i].selected && (n = model[config.value].indexOf(element[i].value)) >= 0) {
								model[config.value].splice(n, 1);
							}
						}
					}
					else {
						delegated(element.options[element.selectedIndex].value);
					}
				}
			}, false);

			delegated.on('update', function(model, key) {
				select(model[key]);
			});
		}

		if (delegatedList || delegated) {
			update();

			select(initial);
		}
	}

	switch (type(element)) {
		case 'checkbox':
		case 'radio':
			property = 'checked';
			break;

		case 'select':
		case 'select-one':
		case 'select-multiple':

			//  select boxes are a very special kind of input, these must be handled differently
			selection();
			break;

		default:
			property = 'value';
			break;
	}

	if (property) {
		delegate = model.delegation(config[property]);

		if (delegate) {
			element.addEventListener('input', handle(property).model, false);
			element.addEventListener('change', handle(property).model, false);
			delegate.on('update', handle(property).element);

			element[property] = delegate();
		}
	}
});
