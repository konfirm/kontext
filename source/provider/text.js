/*global kontext: true, Text: true*/
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

		new Text(settings.pattern).placeholders(element, function(target, key, initial) {
			callback(target, {text: {target: key, initial: initial}});
		});

	});

})(kontext);
