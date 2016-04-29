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

	/**
	 *  Obtain the value of an object key, null if not found
	 *  @name    value
	 *  @access  internal
	 *  @param   Object  search
	 *  @param   string  key
	 *  @return  mixed   value  [null is not found]
	 */
	function value(object, key) {
		return object && typeof object === 'object' && key in object ? object[key] : null;
	}

	/**
	 *  Determine if the variable is a DOMText node
	 *  @name    isText
	 *  @access  internal
	 *  @param   mixed  node
	 *  @return  bool   is text
	 */
	function isText(node) {
		return value(node, nodeType) === 3;
	}

	//  register the Text extension to kontext
	kontext.extension('text', function(element, model, config) {
		'use strict';

		var key = config,
			delegate = key ? model.delegation(key) : null,
			text;

		//  if a delegate is found, ensure a DOMText node, which is either:
		//  - DOMElement.firstChild, if it exists and is a DOMText instance
		//  - new DOMText, created as first child of DOMElement
		//  - provided directly  (since the introduction of Kontext providers)
		if (delegate) {
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
				text = element.insertBefore(document.createTextNode(delegate()), element.firstChild);
			}

			//  add the element to the elements which push/receive updates by Kontext
			delegate.element(text);
		}
	});
})(kontext);
