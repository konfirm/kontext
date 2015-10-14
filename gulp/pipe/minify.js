'use strict';

function minified(file) {
	return /\bmin\b/.test(file.path);
}

module.exports = function(stream, devour, minifier) {
	return stream
		//  initialize the sourcemap
		.pipe(devour.plugin('sourcemaps').init())

		//  minify the file (if not done already, for this we trust .min to be in the filename)
		.pipe(devour.plugin('if', minified, devour.pipe('noop'), devour.plugin(minifier)))

		//  add the '.min.css' as extension
		.pipe(devour.plugin('rename', devour.min))

		//  create a production file which does not include the source map
		.pipe(devour.write())

		//  push the file to an upstream location (if configured)
		.pipe(devour.pipe('push'))

		.pipe(devour.plugin('rename', function(file) {
			file.extname = '.map' + file.extname;
		}))

		//  write the sourcemap
		.pipe(devour.plugin('sourcemaps').write('./', {sourceRoot: './'}))
	;
};
