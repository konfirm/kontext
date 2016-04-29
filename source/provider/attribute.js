/*global kontext: true*/
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

		console.log(settings, element, callback);

	});

})(kontext);
