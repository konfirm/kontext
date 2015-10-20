/*global kontext*/
/**
 *  Manage css classes from data-kontext attributes
 *  @name     CSS
 *  @package  Kontext
 */
kontext.extension('css', function(element, model, config) {
	'use strict';

	//  we'll be using the keys multiple times, preserve the keys
	var keys = Object.keys(config);

	//  simple update method, keeping things DRY
	function update(attr, key) {
		var state = !!model[key];

		if ('classList' in element) {
			element.classList[state ? 'add' : 'remove'](attr);
		}
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
