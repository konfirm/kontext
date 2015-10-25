/*global kontext*/
/**
 *  Manage events from data-kontext attributes
 *  @name     Event
 *  @package  Kontext
 */
kontext.extension('event', function(element, model, config) {
	'use strict';

	function registerEvent(type, config) {
		Object.keys(config)
			.forEach(function(key) {
				element.addEventListener(type, function(event) {
					var delegate;

					//  if the found scope is a function, invoke it with the event, key and configured value
					//  (the function name)
					if (typeof model[key] === 'function') {
						model[key].apply(model, [event, model, key, config[key]]);
					}

					//  is the scope is an object, traverse it and if the key is a delegate, apply the configured value
					else {
						delegate = model.delegation(key);

						if (delegate) {
							delegate(config[key]);
						}
					}
				});
			});
	}

	Object.keys(config)
		.forEach(function(key) {
			registerEvent(key, config[key]);
		});
});
