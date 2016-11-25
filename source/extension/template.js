/* global kontext: true, Template: true */
(function(kontext) {
	'use strict';

	//@include ../lib/template

	//  construct the Template module once, as it does not contain state, it can be re-used
	var template = new Template();

	/**
	 *  Replace the contents of an element with a template
	 *  @name     Template
	 *  @package  Kontext
	 *  @syntax   <span data-kontext="template: foo">replaced</span>
	 *            <span data-kontext="template: foo#bar">replaced</span>
	 *            <span data-kontext="template: #bar">replaced</span>
	 *            <span data-kontext="template: {path: /path/to/template}">replaced</span>
	 *            <span data-kontext="template: {path: /path/to/template, selector: #bar}">replaced</span>
	 *            <span data-kontext="template: {selector: #bar}">replaced</span>
	 *            <span data-kontext="template: {value: myTemplate}">replaced</span>
	 */
	kontext.extension('template', function(element, model, config) {
		var delegate;

		element.style.display = 'none';

		/**
		 *  Update the contents of the bound element to contain the assigned template contents
		 *  @name    update
		 *  @access  internal
		 *  @param   mixed  value
		 *  @return  void
		 */
		function update(value) {
			template.load(value, function(error, fragment) {
				if (error) {
					return element.setAttribute('data-kontext-error', error);
				}

				//  truncate the element (only done if no errors occured)
				while (element.lastChild) {
					element.removeChild(element.lastChild);
				}

				//  bind the model to the elements children
				kontext.bind(model, fragment);

				//  append the document fragment to the element
				element.appendChild(fragment);

				element.style.display = '';
			});
		}

		//  if the template replacement is a one time action, it is replaced and then
		//  the template extension is done.
		if (typeof config !== 'object' || !('value' in config)) {
			return update(config);
		}

		//  Obtain a delegate for the `value` property and update (replace) the template
		//  whenever the `value` changes
		delegate = model.delegation(config.value);

		if (delegate) {
			delegate.on('update', function() {
				update(delegate());
			})();
		}
	});

})(kontext);
