/*global kontext*/
(function(kontext) {
	'use strict';

	function type(node) {
		var result = node.getAttribute('type'),
			select = /^select/i;

		if (!result && select.test(node.nodeName)) {
			result = 'select-' + (node.multiple ? 'multiple' : 'one');
		}

		return result || 'text';
	}

	/**
	 *  Control form elements from data-kontext attributes
	 *  @name     Input
	 *  @package  Kontext
	 *  @example  <input data-kontext="input: {value: key}">
	 *            <input type=checkbox data-kontext="input: {checked: key}">
	 *            <select data-kontext="input: {value: key, options: optionsKey}"></select>
	 *            <select data-kontext="input: {value: key, options: optionsKey, default: choose}"</select>
	 */
	kontext.extension('input', function(element, model, config) {
		var property = ['value'];

		function selection() {
			var defaultOption = 'default' in config ? {value: null, label: config.default} : false,
				update = function() {
					var offset = 0,
						list;

					if ('options' in config && (list = model.delegation(config.options))) {
						list = list();

						if (defaultOption) {
							element.options[offset] = new Option(defaultOption.label, defaultOption.value);
							++offset;
						}

						element.options.length = offset;

						if (typeof list === 'object') {
							if (list instanceof Array) {
								list
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
								Object.keys(list)
									.forEach(function(value, index) {
										element.options[index + offset] = new Option(list[value], value);
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
			//  select boxes are a very special kind of input, these will be handled in
			//  an entirely different flow
			case 'select':
			case 'select-one':
			case 'select-multiple':
				selection();
				break;

			//  checkbox/radio elements need to keep the 'checked' attribute in sync
			case 'checkbox':
			case 'radio':
				property.push('checked');

			/*falls through*/
			default:
				property.forEach(function(key) {
					var	delegate = key in config ? model.delegation(config[key]) : null;

					if (delegate) {
						['input', 'change'].forEach(function(event) {
							element.addEventListener(event, function() {
								delegate(element[key]);
							}, false);
						});

						delegate.on('update', function() {
							element[key] = delegate();
						})();
					}
				});
		}
	});
})(kontext);
