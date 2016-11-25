/* global JSONFormatter: true */
'use strict';

/**
 *  Attribute wrapper
 *  @name     Attribute
 *  @package  Kontext
 */
function Attribute() {  //  eslint-disable-line no-unused-vars
	var attribute = this;

	//@include json-formatter

	/**
	 *  Obtain all nodes containing the data attribute residing within given element
	 *  @name    attributes
	 *  @access  internal
	 *  @param   string  attribute name
	 *  @param   object  DOMElement
	 *  @return  Array  DOMElement
	 */
	function attributes(attr, element) {
		var result = [],
			list, i;

		switch (element.nodeType) {
			case 1:  //  DOMElement
				if (element.hasAttribute(attr)) {
					result.push(element);
				}

				/* falls through */
			case 9:   //  DOMDocument (DOMElement if fallen through)
			case 11:  //  DocumentFragment
				list = element.querySelectorAll('[' + attr + ']');
				for (i = 0; i < list.length; ++i) {
					result.push(list[i]);
				}

				break;
		}

		return result;
	}

	/**
	 *  Verify whether the target resides in the element (regardless of its type)
	 *  @name    contains
	 *  @access  internal
	 *  @param   DOMNode  element
	 *  @param   DOMNode  target
	 *  @return  bool  contains
	 */
	function contains(element, target) {
		var i;

		switch (element.nodeType) {
			case 1:  //  DOMElement
				return element.contains(target);

			case 9:  //  DOMDocument
				return element.body.contains(target);

			case 11:  //  DocumentFragment
				for (i = 0; i < element.childNodes.length; ++i) {
					if (contains(element.childNodes[i], target)) {
						return true;
					}
				}
		}

		return false;
	}

	/**
	 *  Search for elements containing the specificed attribute within the given element,
	 *  invoking the callback with the matching element and the JSON parsed contents
	 *  @name    find
	 *  @access  public
	 *  @param   string     attribute
	 *  @param   DOMElement element
	 *  @param   function   callback
	 *  @return  void
	 */
	attribute.find = function(name, element, callback) {
		if (element) {
			attributes(name, element)
				.forEach(function(node) {
					var options;

					if (contains(element, node)) {
						options = new JSONFormatter().parse(node.getAttribute(name));
					}

					if (options) {
						callback(node, options);
					}
				});
		}
	};
}
