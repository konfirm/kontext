/* global kontext: true, Text: true */
/**
 *  Text node provider
 *  @name     Text
 *  @package  Kontext
 */
(function(kontext) {

	//@buildinfo

	//  load dependencies
	//@include ../lib/text

	kontext.provider('text', function(settings, element, callback) {

		new Text(settings.pattern).placeholders(element, function(node, key, initial) {
			callback(node, {text: {target: key, initial: initial}});
		});

	}, {
		pattern: /(\{(\$?[a-z_]+[\.-]?(?:[a-z0-9_]+[\.-]?)*)(?::([^\}]+))?\})/i
	});

})(kontext);
