/*global kontext*/
/**
 *  Manage events from data-kontext attributes
 *  @name     Event
 *  @package  Kontext
 *  @syntax   <div data-kontext="event: {click: {key|method: value}}">...</div>
 */
kontext.extension('event', function(element, model, config) {
	'use strict';

	function registerEvent(type, settings) {
		Object.keys(settings)
			.forEach(function(key) {
				element.addEventListener(type, function(event) {
					var delegate = model.delegation(key),
						value = delegate ? delegate() : false;

					if (delegate) {
						//  if the delegate is a function, apply it
						if (typeof value === 'function') {
							value.apply(null, [event, model, key, settings[key]]);
						}

						//  otherwise set the settingsured value
						else {
							delegate(settings[key]);
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
