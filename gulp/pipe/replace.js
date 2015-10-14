'use strict';

var through = require('through2');

function replace(data, replacement) {

	Object.keys(replacement).forEach(function(pattern) {
		data = data.replace(new RegExp(pattern, 'g'), replacement[pattern]);
	});

	return data;
}

module.exports = function(stream, devour, type) {
	var replacement = devour.config('replace');

	return stream
		.pipe(through.obj(function(file, enc, done) {
			var data = String(file.contents);

			if (replacement) {
				[type, 'generic'].forEach(function(buffer) {
					if (buffer in replacement) {
						data = replace(data, replacement[buffer]);
					}
				});
			}

			file.contents = new Buffer(data);
			this.push(file);

			done();
		}))
	;
};
