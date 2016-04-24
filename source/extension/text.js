/*global kontext: true*/
/**
 *  Manage text from data-kontext attributes
 *  @name     Text
 *  @package  Kontext
 *  @syntax   <span data-kontext="text: foo">replaced</span>
 *            <span data-kontext="text: foo">replaced<strong> stuff</strong></span>
 */
kontext.extension('text', function(element, model, key) {
	'use strict';

	var text = element.firstChild && element.firstChild.nodeType === 3 ? element.firstChild : document.createTextNode(model[key]),
		delegate = model.delegation(key);

	if (delegate) {
		//  ensure the existence of the text element
		if (text.parentNode !== element && text !== element.firstChild) {
			element.insertBefore(text, element.firstChild);
		}

		//  add the element to the elements which push/receive updates by Kontext
		delegate.element(text);
	}
});
