/* global kontext: true */
(function(kontext) {
	'use strict';

	/**
	 *  Update the classList to remove or add the className to the element
	 *  @name    classList
	 *  @access  internal
	 *  @param   DOMNode  element
	 *  @param   string   className
	 *  @param   bool     state
	 *  @return  void
	 */
	function classList(element, className, state) {
		//  update the class using the classList attribute if present,
		//  falling back onto a more tradional approach otherwise
		if ('classList' in element) {
			element.classList[state ? 'add' : 'remove'](className);
		}
		else {
			element.className = element.className.replace(new RegExp('(?:^|\\s+)' + className + '(\\s+|$)'), function(match, after) {
				return after || '';
			}) + (state ? ' ' + className : '');
		}
	}

	/**
	 *  Manage css classes from data-kontext attributes
	 *  @name     CSS
	 *  @package  Kontext
	 *  @syntax   <div data-kontext="css: {awesome: cool, ...}">...</div>
	 */
	kontext.extension('css', function(element, model, config) {
		Object.keys(config)
			.forEach(function(className) {
				var delegate = model.delegation(config[className]);

				if (delegate) {
					delegate.on('update', function() {
						classList(element, className, delegate());
					})();
				}
			});
	});

})(kontext);
