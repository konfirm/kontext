/*global kontext: true*/
/**
 *  Manage text from data-kontext attributes
 *  @name     Text
 *  @package  Kontext
 *  @syntax   <span data-kontext="text: foo">replaced</span>
 *            <span data-kontext="text: foo">replaced<strong> stuff</strong></span>
 */
(function(kontext) {
	var nodeType = 'nodeType';

	function isText(node) {
		return node && typeof node === 'object' && nodeType in node && node[nodeType] === 3;
	}

	kontext.extension('text', function(element, model, key) {
		'use strict';

		var delegate = model.delegation(key),
			text;

		//  the text extension can be used on both DOMText and DOMElement nodes
		if (isText(element)) {
			text = element;
		}
		else if (isText(element.firstChild)) {
			//  the firstChild is a DOMText node, which will be used by the text extension
			text =  element.firstChild;
		}
		else {
			//  create a new DOMText element and append it to the element
			text = element.insertBefore(document.createTextNode(model[key]), element.firstChild);
		}

		//  if a delegate is found, ensure a DOMText node, which is either:
		//  - DOMElement.firstChild, if it exists and is a DOMText instance
		//  - new DOMText, created as first child of DOMElement
		//  - provided directly  (since the introduction of Kontext providers)
		if (delegate) {
			//  add the element to the elements which push/receive updates by Kontext
			delegate.element(text);
		}
	});
})(kontext);
