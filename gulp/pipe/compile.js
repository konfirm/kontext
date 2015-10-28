/*jshint node:true*/
'use strict';

module.exports = function(stream, devour, list) {
	return stream

		//  resolve inclusion
		.pipe(devour.pipe('embed', list))

		//  replace the placeholders
		.pipe(devour.pipe('placeholder'))

		//  report the new filesize
		.pipe(devour.pipe('size'))
	;
};
