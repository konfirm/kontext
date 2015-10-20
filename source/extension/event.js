/*global kontext*/
/**
 *  Manage events from data-kontext attributes
 *  @name     Event
 *  @package  Kontext
 */
kontext.extension('event', function(element, model, config) {
	'use strict';

	Object.keys(config)
		.forEach(function(key) {
			var part = typeof config[key] === 'string' ? config[key].split('.') : [],
				scope = model;

			//  look up the proper scope
			while (scope && part.length) {
				scope = part[0] in scope ? scope[part.shift()] : false;
			}

			//  if a scope was found
			if (scope) {
				//  attach the event listener
				element.addEventListener(key, function(event) {
					//  if the found scope is a function, invoke it with the event, key and configured value (the function name)
					if (typeof scope === 'function') {
						scope.apply(model, [event, key, config[key]]);
					}

					//  is the scope is an object, traverse it and if the key is a delegate, apply the configured value
					else if (typeof scope === 'object') {
						Object.keys(config[key])
							.forEach(function(k) {
								var delegate = model.delegation(k);

								if (delegate) {
									delegate(config[key][k]);
								}
							});
					}
				});
			}
		});
});
