/*global kontext*/
/**
 *  Manage html from data-kontext attributes
 *  @name	 HTML
 *  @package  Kontext
 *  @syntax   <span data-kontext="html: foo">replaced</span>
 *            <span data-kontext="html: foo">replaced<strong> stuff</strong></span>
 */
kontext.extension('html', function(element, model, key) {
	'use strict';

	var delegate = model.delegation(key);

	if (delegate) {
		delegate.on('update', function() {
			element.innerHTML = delegate();
		})();
	}
});
