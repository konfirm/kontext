/*global kontext*/
/**
 *  Manage html from data-kontext attributes
 *  @name     HTML
 *  @package  Kontext
 *  @syntax   <span data-kontext="html: foo">replaced</span>
 *            <span data-kontext="html: foo">replaced<strong> stuff</strong></span>
 */
 kontext.extension('html', function(element, model, key) {
	'use strict';

	model.delegation(key).on('update', function(model) {
        element.innerHTML = model[key];
	});

	element.innerHTML = model[key];
});
