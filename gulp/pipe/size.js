/*jshint node:true*/
'use strict';

var through = require('through2'),
	gutil = require('gulp-util');

function unit(value, step, units, dec) {
	var list = units.slice(),
		result = +value;

	while (result > step && list.length > 1) {
		list.shift();
		result /= step;
	}

	return result.toFixed(dec || 2) + list.shift();
}

module.exports = function(stream) {
	return stream
		.pipe(through.obj(function(chunk, enc, done) {

			if (chunk.contents) {
				gutil.log(
					'File',
					gutil.colors.cyan(chunk.path.split(/\//).pop()) + ':',
					gutil.colors.green(unit(chunk.contents.length, 1024, ['bytes', 'KB', 'MB', 'GB'], 1))
				);
			}

			this.push(chunk);
			done();
		}))
	;
};
