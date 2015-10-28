'use strict';

var priority;

function match(a, b, find) {
	var mA = +(a.indexOf(find) >= 0),
		mB = +(b.indexOf(find) >= 0);

	return mA > mB ? -1 : +(mA < mB);
}

function order(a, b) {
	var verdict;

	priority.forEach(function(find) {
		if (!verdict) {
			verdict = match(a.path, b.path, find);
		}
	});

	return verdict || 0;
}

module.exports = function(stream, devour) {
	priority = devour.config('priority', ['var', 'base']);

	return stream

		//  put the files in the proper order
		.pipe(devour.plugin('sort', order))
	;
};
