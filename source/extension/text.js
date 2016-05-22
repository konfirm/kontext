/*global kontext: true*/
/**
 *  Manage text from data-kontext attributes
 *  @name     Text
 *  @package  Kontext
 *  @syntax   <span data-kontext="text: foo">replaced</span>
 *            <span data-kontext="text: foo">replaced<strong> stuff</strong></span>
 */
(function(kontext) {
	/**
	 *  Obtain the value of an object key, null if not found
	 *  @name    objectKey
	 *  @access  internal
	 *  @param   Object  search
	 *  @param   string  key
	 *  @return  mixed   value  [undefined if not found]
	 */
	function objectKey(object, key) {
		return object && typeof object === 'object' && key in object ? object[key] : undefined;
	}

	/**
	 *  Determine if the variable is a DOMText node
	 *  @name    isText
	 *  @access  internal
	 *  @param   mixed  node
	 *  @return  bool   is text
	 */
	function isText(node) {
		return objectKey(node, 'nodeType') === 3;
	}

	/**
	 *  Obtain a DOMText element to associate with updates
	 *  @name    ensureText
	 *  @access  internal
	 *  @param   DOMNode  element
	 *  @return  DOMText  text
	 *  @note    DOMText is:
	 *           - DOMNode.firstChild, if it exists and is a DOMText instance
	 *           - new DOMText, created as first child of DOMElement
	 *           - provided directly  (since the introduction of Kontext providers)
	 */
	function ensureText(element) {
		if (isText(element)) {
			return element;
		}
		else if (isText(element.firstChild)) {
			return element.firstChild;
		}

		//  create a new (empty string) DOMText element and append it to the element
		return element.insertBefore(document.createTextNode(''), element.firstChild);
	}

	//  register the Text extension to kontext
	kontext.extension('text', function(element, model, config, options) {
		'use strict';

		var key = objectKey(config, 'target') || config,
			initial = objectKey(config, 'initial'),
			delegate = key ? model.delegation(key) : null;

		if (options.settings.greedy && !delegate) {
			delegate = model.define(key, initial || '');
		}

		//  if a delegate is found, ensure a DOMText node
		if (delegate) {
			if (!delegate() && initial !== undefined) {
				delegate(initial);
			}

			//  add the element to the elements which push/receive updates by Kontext
			delegate.element(ensureText(element));
		}
	});
})(kontext);
