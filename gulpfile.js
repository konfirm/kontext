'use strict';

var Wanted = require('wanted'),
	Devour = require('devour'),
	gutil = require('gulp-util'),
	fs = require('fs'),
	hjson = require('hjson');

(function(wanted) {
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
					push = process.cwd() + '/.push.json';

				if (fs.existsSync(push)) {
					config.push = require(push);
				}

				new Devour(config)

					//  add the kontext task, monitoring and building the public facing javascripts
					.task('kontext', [
						'!source/*/**/*.js',
						'source/kontext.js',
						'source/@(extension|provider)/**/*.js'
					], [
						'!source/@(extension|provider)/**/*.js',
						'source/**/*.js'
					])

					//  compile extensions whenever they change
					.task('kontext:extensions', [
						'./source/@(extension)/**/*.js'
					], [
						'source/**/*.js'
					])

					//  compile providers whenever they change
					.task('kontext:providers', [
						'./source/@(provider)/**/*.js'
					], [
						'source/**/*.js'
					])

					//  ... start devouring
					.start()
				;
			});
		})
		.check({scope: 'devDependencies'})
	;
})(new Wanted());
