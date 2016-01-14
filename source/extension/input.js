/*global kontext*/
(function(kontext) {
	'use strict';

	/**
	 *  Select-element handling module
	 *  @name     Select
	 *  @package  Kontext
	 */
	function Select(element, model, config) {
		var delegate = {};

		/**
		 *  Set up the module basics (delegates, model updates, change events)
		 *  @name    init
		 *  @access  internal
		 *  @return  void
		 */
		function init() {
			//  find the relevant delegates
			['default', 'options', 'value']
				.forEach(function(key) {
					delegate[key] = key in config ? (model.delegation(config[key]) || config[key]) : null;
				});

			//  subscribe a handler to `default` updates
			subscribe(delegate.default, function() {
				options(resolve(delegate.value));
			});

			//  subscribe a handler to `options` updates
			subscribe(delegate.options, function() {
				options(resolve(delegate.value));
			});

			//  subscribe a handler to `value` updates
			subscribe(delegate.value, function() {
				selection(resolve(delegate.value));
			});

			//  listen for changes and persist those in the model value
			element.addEventListener('change', persist, false);
		}

		/**
		 *  Subscribe to the 'update'-events of a delegate, also immediately invoking the handler to
		 *  ensure initial values
		 *  @name    subscribe
		 *  @param   mixed     delegation  [if not a delegate function, nothing is done]
		 *  @param   function  handler
		 *  @return  void
		 */
		function subscribe(delegation, handler) {
			if (typeof delegation === 'function') {
				delegation.on('update', handler)();
			}
		}

		/**
		 *  Resolve the value, if it is a delegate (or function) it is invoked to extract the value
		 *  @name    resolve
		 *  @access  internal
		 *  @param   mixed  value
		 *  @return  mixed  resolved
		 */
		function resolve(value) {
			return typeof value === 'function' ? value() : value;
		}

		/**
		 *  Convenience method to create new Options
		 *  @name    option
		 *  @access  internal
		 *  @param   mixed   value  [one of: string value, object {[value: string] [, label: string]}]
		 *  @param   string  label  [optional, default undefined, always ignored if value is an object]
		 *  @return  Object  Option
		 */
		function option(value, label) {
			if (typeof value === 'object' && value) {
				label = value.label || value.value || '';
				value = value.value || '';
			}

			return new Option(label, value || '');
		}

		/**
		 *  Persist values from the <select>-element back onto the model
		 *  @name    persist
		 *  @access  internal
		 *  @return  void
		 */
		function persist() {
			var selected = resolve(delegate.value),
				item, position, i;

			//  if multiple selection is not allowed, the delegated value is set to the
			//  single selected option and exit the function
			if (!element.multiple) {
				return delegate.value(element.options[element.selectedIndex].value);
			}

			//  traverse all options and make sure only the currently selected options
			//  are in the value delegate
			for (i = 0; i < element.options.length; ++i) {
				item = element.options[i];
				position = selected.indexOf(item.value);

				//  if the item is selected, but not amongst the selected values, its value
				//  is pushed in (the order in which the values are is the order in which the selection
				//  was done)
				//  if an item is not selected but exists in the selection, it is spliced out
				if (item.selected && position < 0) {
					selected.push(item.value);
				}
				else if (!item.selected && position >= 0) {
					selected.splice(position, 1);
				}
			}
		}

		/**
		 *  Update the selection from the model back onto the <select>-element
		 *  @name    selection
		 *  @access  internal
		 *  @param   mixed  selected  [one of: Array values or string value]
		 *  @return  void
		 */
		function selection(selected) {
			var values = [].concat(selected),
				i;

			for (i = 0; i < element.options.length; ++i) {
				element.options[i].selected = values.indexOf(element.options[i].value) >= 0;
			}
		}

		/**
		 *  Update the options (if derived from the model)
		 *  @name    options
		 *  @access  internal
		 *  @param   mixed  selected  [one of: Array values or string value]
		 *  @return  void
		 */
		function options(selected) {
			var first = resolve(delegate.default),
				list = resolve(delegate.options),
				offset = 0;

			//  the list may be an object, for which the keys become the option value
			//  and the values become the option label
			if (!(list instanceof Array)) {
				list = Object.keys(list)
					.map(function(key) {
						return {
							value: key,
							label: list[key]
						};
					});
			}

			//  first represents a default option, if present put it first in the list
			if (first) {
				element.options[offset] = option(null, first);
				++offset;
			}

			//  remove all the options
			element.options.length = offset;

			//  update all the options
			list
				.forEach(function(item, index) {
					element.options[offset + index] = option(item);
				});

			//  allow or prevent multiple selection based on whether `selected` is an array,
			element.multiple = selected instanceof Array;

			//  trigger the selection update
			selection(selected);
		}

		//  initialize the module
		init();
	}

	/**
	 *  Determine the type of element
	 *  @name    type
	 *  @access  internal
	 *  @param   DOMNode  node
	 *  @return  string   type
	 */
	function type(node) {
		return node.getAttribute('type') || (/^select/i.test(node.nodeName) ? 'select' : 'text');
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

		switch (type(element)) {
			//  select boxes are a special kind of input, these will be handled in
			//  an entirely different flow
			case 'select':
				return new Select(element, model, config);

			//  checkbox/radio elements need to keep the 'checked' attribute in sync
			case 'checkbox':
			case 'radio':
				property.push('checked');
				break;
		}

		//  traverse the property list (always 'value', 'checked' only for checkbox/radio inputs)
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
	});
})(kontext);
