/*global JSONFormatter: true*/
'use strict';

/**
 *  Attribute wrapper
 *  @name     Attribute
 *  @package  Kontext
 */
function Attribute() {  //  eslint-disable-line no-unused-vars
	var attribute = this,
		json;

	//@include json-formatter

	/**
	 *  Initializer - setting up the defaults
	 *  @name    init
	 *  @access  internal
	 *  @return  void
	 */
	function init() {
		json = new JSONFormatter();
	}

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

				/*falls through*/
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
		attributes(name, element)
			.forEach(function(node) {
				callback(node, json.parse(node.getAttribute(name)));
			});
	};

	init();
}
