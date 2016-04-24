/*global kontext: true*/
/**
 *  Manage attributes/values with Kontext
 *  @name     Attribute
 *  @package  Kontext
 *  @syntax   <div data-kontext="attribute: {data-foo: foo, ...}">...</div>
 */
kontext.extension('attribute', function(element, model, config) {
	'use strict';

	/**
	 *  Update the attribute, removing it whenever the value is false-ish, adding/updating it otherwise
	 *  @name    update
	 *  @access  internal
	 *  @param   string  attribute
	 *  @param   mixed   value
	 *  @return  void
	 */
	function update(attribute, value) {
		element[(value ? 'set' : 'remove') + 'Attribute'](attribute, value);
	}

	//  traverse all configure attributes, resolve the variable scope within the model
	//  and start listening for updates
	Object.keys(config)
		.forEach(function(attribute) {
			var delegate = model.delegation(config[attribute]);

			if (delegate) {
				delegate.on('update', function() {
					update(attribute, delegate());
				})();
			}
		});
});
