/*jshint node:true*/
'use strict';

function unit(value, step, units, dec) {
	var list = units.slice(),
		result = +value;

	while (result > step && list.length > 1) {
		list.shift();
		result /= step;
	}

	return result.toFixed(dec || 2) + list.shift();
}

function name(file, done) {
	var git = require('git-state'),
		path = process.cwd();

	git.isGit(path, function(exists) {
		if (exists) {
			git.check(path, function(error, result) {
				if (error) {
					return done(error);
				}

				done(null, file.path.replace(/^.*\/([^\.]+)(\.(?:[a-z\.]+)*js)$/i, function(match, name, ext) {
					var part = [name];

					if ('branch' in result && result.branch) {
						part.push(result.branch);
					}

					if ('tag' in result && result.tag) {
						part.push(result.tag);
					}

					if ('dirty' in result && result.dirty > 0) {
						part.push('work');
					}

					return part.join('-') + ext;
				}));

			});
		}
	});
}

function publish(file, config) {
	name(file, function(error, filename) {
		if (error) {
			throw new Error(error);
		}

		var request = require('request'),
			fs = require('fs'),
			gutil = require('gulp-util'),
			options = {
				url: [
					config.schema || 'https',
					'://',
					config.host,
					config.port ? ':' + config.port : '',
					config.path || '',
					filename
				].join(''),
				headers: {
					'content-type': 'text/javascript'
				}
			};

		if ('auth' in config) {
			Object.keys(config.auth)
				.forEach(function(key) {
					options.headers.client = key;
					options.headers.secret = config.auth[key];
				});
		}

		fs.createReadStream(file.path)
			.pipe(request.put(options))
			.on('response', function(response) {
				var status = [
						null,               //  0 (0-99)    - undefined
						gutil.colors.cyan,  //  1 (100-199) - continue
						gutil.colors.green, //  2 (200-299) - OK
						gutil.colors.cyan,  //  3 (300-399) - redirects
						gutil.colors.red,   //  4 (400-499) - client error
						gutil.colors.red    //  5 (500-599) - server error
					],
					color = status[Math.floor(response.statusCode / 100)],
					url = options.url;

				if (!('schema' in config)) {
					url = url.replace(/^https?:/i, '');
				}

				gutil.log(
					'Push',
					'[' + color(response.statusCode) + ']',
					gutil.colors.yellow(file.path.split(/\//).pop()),
					'=> ' + color(url),
					' (' + gutil.colors.yellow(unit(file.size, 1024, ['bytes', 'KB', 'MB', 'GB'], 1)) + ')'
				);
			});
	});
}

module.exports = function(stream, devour) {
	var through = require('through2'),
		config = devour.config('push');

	if (!config) {
		return stream;
	}

	return stream
		.pipe(through.obj(function(file, enc, done) {

			publish({
				path: file.path,
				size: file.contents.length
			}, config);

			this.push(file);
			done();
		}));
};
