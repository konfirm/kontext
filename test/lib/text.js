/*global kontext, Text, describe, afterEach, beforeEach, it, expect*/
describe('Text', function() {
	'use strict';

	function clean(done) {
		var wrapper = document.querySelectorAll('.fixture'),
			i;

		for (i = 0; i < wrapper.length; ++i) {
			wrapper[i].parentNode.removeChild(wrapper[i]);
		}

		done();
	}

	beforeEach(function(done) {
		clean(function() {
			var content = '<h1>{title}</h1><p>A {foo} walks into a {bar}',
				wrapper = document.body.insertBefore(document.createElement('div'), document.body.firstChild);

			wrapper.className = 'fixture';
			wrapper.innerHTML = content;

			document.body.insertBefore(wrapper, document.body.firstChild);

			done();
		});
	});

	afterEach(function(done) {
		clean(done);
	});

	it('finds all placeholders', function() {
		var fixture = document.querySelector('.fixture'),
			nodeList = [];

		expect(typeof fixture).toBe('object');
		expect(fixture.nodeType).toBe(1);

		new Text(kontext.defaults().pattern).placeholders(fixture, function(text) {
			nodeList.push(text);
		});

		expect(nodeList.length).toBe(3);

		nodeList.forEach(function(text) {
			var data = text.data;

			expect(text.nodeType).toBe(3);
			expect(data[0]).toBe('{');
			expect(data[data.length - 1]).toBe('}');
		});
	});

	it('finds the provided element itself, if it is text', function() {
		var node = document.createTextNode('A {foo} walks into a {bar}'),
			result = [];

		new Text(kontext.defaults().pattern).placeholders(node, function(text) {
			result.push(text);
		});

		expect(result.length).toBe(2);

		expect(result[0].nodeType).toBe(3);
		expect(result[0].data).toBe('{foo}');

		expect(result[1].nodeType).toBe(3);
		expect(result[1].data).toBe('{bar}');
	});

	it('allows custom matching patterns', function() {
		var node = document.createTextNode('A <%foo%> walks into a <%bar%>'),
			result = [];

		new Text(/(<%(.*?)%>)/).placeholders(node, function(text) {
			result.push(text);
		});

		expect(result.length).toBe(2);

		expect(result[0].nodeType).toBe(3);
		expect(result[0].data).toBe('<%foo%>');

		expect(result[1].nodeType).toBe(3);
		expect(result[1].data).toBe('<%bar%>');
	});
});
