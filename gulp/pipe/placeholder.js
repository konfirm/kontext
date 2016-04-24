'use strict';

var fs = require('fs'),
	rev = require('git-revision');

function version() {
	var json = JSON.parse(fs.readFileSync(process.cwd() + '/package.json'));

	return json && 'version' in json ? json.version : 'unknown';
}

function date() {
	var d = new Date();
	return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map(function(part, index) {
		return index > 0 ? ('00' + part).substr(-2) : part;
	}).join('-');
}

function contributors(match, prefix) {
	var credits = fs.readFileSync(process.cwd() + '/AUTHORS.md')
		.toString()
		.split('\n')
		.filter(function(line) {
			return !!line && !/@konfirm/.test(line);
		});

	if (credits.length) {
		credits.unshift('Contributors:');
	}

	return credits
		.map(function(line, index) {
			return prefix + (index ? '- ' : '') + line;
		})
		.join('\n')
	;
}

function year(match, preserve) {
	return preserve + (new Date().getFullYear());
}

module.exports = function(stream, devour) {
	return stream

		//  replace '$DATE$' with the current date
		.pipe(devour.plugin('replace', /\$DATE\$/g, date()))

		//  replace '$DEV$' with the version defined in package.json
		.pipe(devour.plugin('replace', /\$DEV\$/g, version()))

		//  replace '$COMMIT$' with the current git revision
		.pipe(devour.plugin('replace', /\$COMMIT\$/g, rev('short')))

		//  replace '$CONTRIBUTORS$' with the contents of the AUTHORS file, filtering anyone @konfirm
		.pipe(devour.plugin('replace', /([\t \*]+)\$CONTRIBUTORS\$/g, contributors))

		//  update the year in the copyright notice 'Copyright 2012-20xx'
		.pipe(devour.plugin('replace', /(Copyright 20[1-9][0-9]\-)([0-9]{4})/, year))
	;
};
