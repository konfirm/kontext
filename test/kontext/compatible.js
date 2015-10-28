/*global describe, it*/
describe('Kontext Compatible', function() {
	'use strict';

	it('requires document.addEventListener', function(done) {
		//  TODO: figure out if we can (and should) be able to test this by reconstructing Kontext (it comes constructed)
		//        as there is currently no way to inject a different approach (e.g. providing a document which does not
		//        have the addEventListener method)
		done();
	});
});
