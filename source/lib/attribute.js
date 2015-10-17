/*global JSONFormatter*/
'use strict';

/**
 *  Attribute wrapper
 *  @name     Attribute
 *  @package  Kontext
 */
function Attribute() {
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
			case 11:  //  DocumentFragment
				for (i = 0; i < element.childNodes.length; ++i) {
					result = result.concat(attributes(attr, element.childNodes[i]));
				}

				break;

			case 1:  //  DOMElement
				if (element.hasAttribute(attr)) {
					result.push(element);
				}
				/*falls through*/
			case 9:  //  DOMDocument (DOMElement if fallen through)
				list = element.querySelectorAll('[' + attr + ']');
				for (i = 0; i < list.length; ++i) {
					result.push(list[i]);
				}

				break;
		}

		return result;
	}

	attribute.find = function(name, element, callback) {
		attributes(name, element)
			.forEach(function(node) {
				callback(node, json.parse(node.getAttribute(name)));
			});
	};

	init();
}
