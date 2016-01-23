'use strict';

module.exports = function(stream, devour) {
	return stream

		//  put the files in the proper order before concatenation
		.pipe(devour.pipe('order'))

		//  combine the file into a single file containing all (included) sources
		.pipe(devour.plugin('concat', 'kontext.js'))

		//  write the plain combined file
		.pipe(devour.write())
	;
};
