/*global kontext*/
/**
 *  Manage css classes from data-kontext attributes
 *  @name     CSS
 *  @package  Kontext
 *  @syntax   <div data-kontext="css: {awesome: cool, ...}">...</div>
 */
kontext.extension('css', function(element, model, config) {
	'use strict';

	//  we'll be using the keys multiple times, preserve the keys
	var keys = Object.keys(config);

	//  simple update method, keeping things DRY
	function update(attr, key) {
		var state = !!model[key];

		//  use the classList interface to greatly improve performance and ease of use
		if ('classList' in element) {
			element.classList[state ? 'add' : 'remove'](attr);
		}

		//  provide a fallback for older browsers which are supported by Kontext but do not implement the classList
		else {
			element.className = element.className.replace(new RegExp('(?:^|\\s+)' + key + '(\\s+|$)'), function(match, after) {
				return after || '';
			}) + (state ? ' ' + attr : '');
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
