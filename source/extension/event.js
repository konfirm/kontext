/*global kontext: true*/
/**
 *  Manage events from data-kontext attributes
 *  @name     Event
 *  @package  Kontext
 *  @syntax   <div data-kontext="event: {click: key|method}">...</div>
 *            <div data-kontext="event: {click: [key|method, key|method]}">...</div>
 *            <div data-kontext="event: {click: {key|method: value}}">...</div>
 */
kontext.extension('event', function(element, model, config) {
	'use strict';

	/**
	 *  Register the event handler
	 *  @name    register
	 *  @access  internal
	 *  @param   string  type
	 *  @param   string  key
	 *  @param   mixed   default values
	 *  @return  void
	 */
	function register(type, key, defaults) {
		element.addEventListener(type, function(event) {
			var delegate = model.delegation(key),
				value = delegate ? delegate() : false;

			if (delegate) {
				//  if the delegate is a function, apply it
				if (typeof value === 'function') {
					value.apply(null, [event, model, key, defaults]);
				}

				//  otherwise set the configured value
				else {
					delegate(defaults);
				}
			}
			else if (typeof window[key] === 'function') {
				window[key].apply(null, [event, model, key, defaults]);
			}
		}, false);
	}

	/**
	 *  Process the configuration for given event type
	 *  @name    configure
	 *  @access  internal
	 *  @param   string  type
	 *  @param   Object  settings
	 *  @return  void
	 */
	function configure(type, settings) {
		if (typeof settings === 'object') {
			//  process both objects and arrays
			(settings instanceof Array ? settings : Object.keys(settings))
				.forEach(function(key) {
					register(type, key, key in settings ? settings[key] : undefined);
				});
		}
		else {
			//  process simple strings
			register(type, settings);
		}
	}

	//  traverse the config and configure each setting
	Object.keys(config)
		.forEach(function(key) {
			configure(key, config[key]);
		});
});
