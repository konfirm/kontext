/*global kontext*/
/**
 *  Manage attributes/values with Kontext
 *  @name     Attribute
 *  @package  Kontext
 */
kontext.extension('attribute', function(element, model, config) {
	'use strict';

	//  we'll be using the keys multiple times, preserve the keys
	var keys = Object.keys(config);

	//  simple update method, keeping things DRY
	function update(attr, key) {
		if (model[key]) {
			element.setAttribute(attr, model[key]);
		}
		else if (element.hasAttribute(attr)) {
			element.removeAttribute(attr);
		}
	}

	//  register for updates on the model
	model.on('update', function(model, key) {
		//  traverse the keys looking for a matching attribute
		keys.forEach(function(attr) {
			if (config[attr] === key) {
				//  update the attribute
				update(attr, key);
			}
		});
	});

	//  traverse all keys so attributes are properly bootstrapped
	keys.forEach(function(attr) {
		//  update the attribute
		update(attr, config[attr]);
	});
});
