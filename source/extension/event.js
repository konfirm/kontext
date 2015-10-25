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
					var delegate = model.delegation(key);

					if (delegate) {
						//  if the delegate is a function, apply it
						if (typeof delegate() === 'function') {
							delegate().call(event, model, key, config[key]);
						}

						//  otherwise set the configured value
						else {
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
