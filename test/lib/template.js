/*global Template: true, describe: true, it: true, expect: true*/
describe('Template', function() {
	'use strict';

	var template = new Template();

	it('loads templates in order', function(done) {
		var count = 0;

		template.load('/base/test/data/template.html', function() {
			expect(++count).toBe(1);
		});

		template.load('/base/test/data/template.html', function() {
			expect(++count).toBe(2);

			done();
		});
	});

	describe('loads internal templates', function() {
		var tpl = document.body.appendChild(document.createElement('div')),
			target = 'world',
			inner = '<strong>hello</strong> <em id="target">' + target + '</em>',
			config = [
				{selector: '#all'},
				{selector: '#target'},
				'#all',
				'#target'
			];

		tpl.innerHTML = '<div id="all">' + inner + '</div>';

		config.forEach(function(conf) {
			it(JSON.stringify(conf), function(done) {
				template.load(conf, function(error, fragment) {
					var sel = typeof conf === 'object' ? conf.selector : conf;

					expect(fragment.nodeType).toBe(11);
					expect(fragment.nodeName).toBe('#document-fragment');

					if (sel === '#all') {
						expect(fragment.firstChild.nodeName).toBe('STRONG');
						expect(fragment.lastChild.nodeName).toBe('EM');
					}
					else {
						expect(fragment.firstChild.nodeType).toBe(3);
						expect(fragment.firstChild.data).toBe(target);
					}

					done();
				});
			});
		});
	});

	describe('loads external templates', function() {
		var config = [
			{path: '/base/test/data/template.html', selector: '#inner-id'},
			{path: '/base/test/data/template.html'},
			'/base/test/data/template.html#inner-id',
			'/base/test/data/template.html'
		];

		config.forEach(function(conf) {
			it(JSON.stringify(conf), function(done) {
				template.load(conf, function(error, fragment) {
					expect(fragment.nodeType).toBe(11);
					expect(fragment.nodeName).toBe('#document-fragment');

					done();
				});
			});
		});
	});

	it('provides error if template not found', function(done) {
		template.load('/does/not/exist', function(error, fragment) {
			expect(error).toBe('NOT FOUND');
			expect(fragment).toBe(undefined);

			done();
		});
	});

	describe('does not trip over misconfigured options', function() {
		[{}, [], {nope: true}, {selector: null}, 0, '', false, null, undefined]
			.forEach(function(conf) {
				it(JSON.stringify(conf), function(done) {
					template.load(conf, function(error) {
						expect(error).toBe('No path and selector');

						done();
					});
				});
			})
	});
});
