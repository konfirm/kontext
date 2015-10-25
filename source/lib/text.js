'use strict';

/**
 *  Text node wrapper
 *  @name     Text
 *  @package  Kontext
 */
function Text() {
	var text = this;

	/**
	 *  Obtain all textNodes residing within given element
	 *  @name    textNodes
	 *  @access  internal
	 *  @param   DOMElement
	 *  @return  Array  textNodes
	 */
	function textNodes(element) {
		var result = [],
			walker, node;

		if (element.nodeType === 3) {
			result.push(element);
		}
		else {
			walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
			while ((node = walker.nextNode())) {
				result.push(node);
			}
		}

		return result;
	}

	/**
	 *  Split a DOMText node into placeholder and non-placeholder parts, returning an array of all DOMText nodes
	 *  containing a placeholder
	 *  @name   splitter
	 *  @access internal
	 *  @param  DOMText node
	 *  @return array   DOMText nodes
	 */
	function splitter(node) {
		var match = node.nodeValue.match(/(\{\$?[a-z0-9_-]+(?::[^\}]+)?\})/i),
			content = match ? (match.index === 0 ? node : node.splitText(match.index)) : null,
			remainder = match ? content.splitText(match[1].length) : null,
			result = [];

		if (content) {
			result.push(content);
			content.original = content.nodeValue;
		}

		if (remainder) {
			result = result.concat(splitter(remainder));
		}

		return result;
	}

	/**
	 *  Obtain all placeholder DOMText nodes within given element
	 *  @name    placeholders
	 *  @access  public
	 *  @param   DOMNode element
	 *  @return  array   DOMText nodes
	 */
	function placeholders(element) {
		var result = [];

		//  traverse all textnodes and split them in order to obtain only the placeholder nodes
		textNodes(element).forEach(function(node) {
			result = result.concat(splitter(node));
		});

		return result;
	}

	/**
	 *  Obtain all placeholder DOMText nodes withing given element and apply the callback to it
	 *  @name    placeholders
	 *  @access  public
	 *  @param   DOMNode   element
	 *  @param   function  callback
	 *  @return  void
	 */
	text.placeholders = function(element, callback) {
		placeholders(element).forEach(callback);
	};
}
