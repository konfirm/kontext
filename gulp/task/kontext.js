'use strict';

module.exports = function(stream, devour, name) {
	var list = [];

	return stream

		//  'compile' the full files and check for changes
		.pipe(devour.pipe('compile', list))

		//  write the raw file to the destination
		.pipe(devour.write())

		//  push the file to an upstream location (if configured)
		.pipe(devour.pipe('push'))

		//  uglify the sources
		.pipe(devour.pipe('minify', 'uglify'))

		//  handle all configured replacements
		.pipe(devour.pipe('replace', name))

		//  write the stream
		.pipe(devour.write())

		//  damage report
		.pipe(devour.pipe('size'))
	;
};
