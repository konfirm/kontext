/*global kontext: true*/
/**
 *  Text node provider
 *  @name     Text
 *  @package  Kontext
 *  @syntax   <div data-kontext="attribute: {data-foo: foo, ...}">...</div>
 */
(function(kontext) {

	//@buildinfo

	//  load dependencies
	//@include ../lib/text

	kontext.provider('text', function(settings, element, callback) {

		console.log(settings, element, callback);

	});

})(kontext);
