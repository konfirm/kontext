'use strict';

var Wanted = require('wanted'),
	Devour = require('devour'),
	gutil = require('gulp-util'),
	fs = require('fs'),
	hjson = require('hjson');

function remainder(watch) {
	var list = [];

	Object.keys(watch).forEach(function(key) {
		list = list.concat(watch[key]);
	});

	return list
		//  invert the ! (! is removed and added if not present)
		.map(function(pattern) {
			return pattern[0] === '!' ? pattern.substr(1) : '!' + pattern;
		})
		//  put the ! below anything else
		.sort(function(a, b) {
			var mA = +(a[0] === '!'),
				mB = +(b[0] === '!');

			return mA < mB ? -1 : +(mA > mB);
		})
	;
}

(function(wanted){
	wanted
		.on('install', function(module) {
			//  accept all module installs/updates
			module.accept();

			gutil.log(
				'Wanted:',
				gutil.colors.magenta(module.name),
				gutil.colors.cyan(module.state),
				gutil.colors.yellow(module.version)
			);
		})
		.on('ready', function() {
			fs.readFile(__dirname + '/gulp/config/project.json', function(error, data) {
				var config = hjson.parse(String(data)),
					devour = new Devour(config);

				devour
					//  add the script task, monitoring and building the public facing javascripts
					.task('kontext',
						[
							//  do not build anything other than kontext.js
							'!./source/*/**/*.js',
							'./source/kontext.js',
						],
						//  the watch pattern (we watch more than we build, thanks to the include plugin)
						[
							//  watch kontext
							'./source/kontext.js',
							//  watch extension (and children)
							'./source/extension/**/*.js'
						]
					)

					//  ... start devouring
					.start()
				;
			});
		})
		.check({scope:'devDependencies'})
	;
})(new Wanted());
