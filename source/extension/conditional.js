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

	//  Create the extension function which will be registered to Kontext
	//  (Separate function so the condition instance can be exposed so other extensions may use it)
	function extension(element, model, config) {
		var anchor;

		if (element.parentNode) {
			anchor = element.parentNode.insertBefore(document.createTextNode(''), element);
		}

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

		model.on('update', update);
		update();
	}

	//  expose Condition instance
	extension.condition = condition;

	//  register the extension als 'conditional'
	kontext.extension('conditional', extension);

})(kontext);
