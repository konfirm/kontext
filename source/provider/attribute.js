/*global kontext: true, Attribute: true*/
/**
 *  Attribute node provider
 *  @name     Attribute
 *  @package  Kontext
 */
(function(kontext) {

	//@buildinfo

	//  load dependencies
	//@include ../lib/attribute

	kontext.provider('attribute', function(settings, element, callback) {
		new Attribute().find(settings.attribute, element, callback);
	});

})(kontext);
