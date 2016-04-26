/*global kontext: true, Condition: true*/
/**
 *  Add conditional display of element based on MongoDB query syntax
 *  @name	  Conditional
 *  @package  Kontext
 */
(function(kontext) {
	'use strict';

	//@include ../lib/condition

	//  construct the Condiction module once, as it does not contain state, it can be re-used
	var condition = new Condition();

	/**
	 *  The actual extension which will be registered to Kontext
	 *  @name    extension
	 *  @access  internal
	 *  @param   DOMNode  element
	 *  @param   Object   model
	 *  @param   mixed    config
	 *  @note    the extension function will receive the condition instance as property
	 */
	function extension(element, model, config, options) {
		var anchor;

		/**
		 *  Update the element state based on the provided conditions
		 *  @name    update
		 *  @access  internal
		 *  @return  void
		 */
		function update() {
			if (condition.evaluate(config, model)) {
				if (!element.parentNode) {
					anchor.parentNode.insertBefore(element, anchor);
				}
			}
			else if (element.parentNode) {
				element.parentNode.removeChild(element);
			}
		}

		//  tell Kontext not to traverse into the children of our element
		options.stopDescend();

		if (element.parentNode) {
			//  create the anchor node, consisting of an empty text node
			anchor = element.parentNode.insertBefore(document.createTextNode(''), element);

			kontext.bind(model, element.childNodes);
		}

		model.on('update', update);
		update();
	}

	/**
	 *  Evaluate a condition
	 *  @name    evaluate
	 *  @access  public
	 *  @param   mixed   condition
	 *  @param   Object  object to apply the condition on
	 *  @return  bool    matches
	 */
	extension.evaluate = function(config, target) {
		return condition.evaluate(config, target);
	};

	//  register the extension als 'conditional'
	kontext.extension('conditional', extension);

})(kontext);
