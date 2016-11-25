//  Karma configuration
//  Generated on Wed Oct 14 2015 12:04:36 GMT+0200 (CEST)

module.exports = function(config) {
	config.set({

		//  base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',


		//  frameworks to use
		//  available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: [
			'jasmine'
		],


		//  list of files / patterns to load in the browser
		files: [
			'build/kontext.js',
			'build/provider/**/!(*min|*map).js',
			'build/extension/**/!(*min|*map).js',
			'source/lib/**/*.js',

			//  test helper
			'test/helpers/setup.js',

			//  actual tests
			'test/lib/*.js',
			'test/kontext/provider/*.js',
			'test/kontext/extension/*.js',
			'test/kontext/*.js',

			//  files to be served from the internal webserver
			{
				pattern: 'test/data/*.html',
				included: false,
				served: true
			}
		],


		//  list of files to exclude
		exclude: [
		],


		//  preprocess matching files before serving them to the browser
		//  available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'build/kontext.js': ['coverage'],
			'build/provider/**/!(*min|*map).js': ['coverage'],
			'build/extension/**/!(*min|*map).js': ['coverage'],
			'source/lib/**/*.js': ['coverage']
		},


		//  test results reporter to use
		//  possible values: 'dots', 'progress'
		//  available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: [
			'spec',

			// 'progress',
			'coverage',
			'coveralls'
		],

		coverageReporter: {
			type: 'lcov',  //  lcov or lcovonly are required for generating lcov.info files
			dir: 'coverage/'
		},

		//  web server port
		port: 9876,


		//  enable / disable colors in the output (reporters and logs)
		colors: true,


		//  level of logging
		//  possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,


		//  enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,


		//  start these browsers
		//  available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: [
			'PhantomJS'
		],


		//  Continuous Integration mode
		//  if true, Karma captures browsers, runs the tests and exits
		singleRun: false
	});
};
