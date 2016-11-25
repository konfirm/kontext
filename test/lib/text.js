/*global kontext:  true, Text: true, describe: true, afterEach: true, beforeEach: true, it: true, expect: true*/
describe('Text', function() {
	'use strict';

	/**
	 *  remove all .fixture elements
	 */
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

	/**
	 *  verify the keys in the list
	 */
	function verify(list, keys, initial) {
		list.forEach(function(item, index) {
			expect(item.text.nodeType).toBe(3);
			expect(item.text.data[0]).toBe('{');
			expect(item.text.data[item.text.data.length - 1]).toBe('}');
			expect(item.key).toBe(keys[index]);
			expect(item.initial).toBe(initial instanceof Array ? initial[index] : undefined);
		});
	}

	var defaults = kontext.defaults(),
		textSettings = defaults.provider.text.settings;

	describe('Finds all placeholders', function() {
		it('in DOMElement nodes', function() {
			var fixture = document.querySelector('.fixture'),
				nodeList = [];

			expect(typeof fixture).toBe('object');
			expect(fixture.nodeType).toBe(1);

			new Text(textSettings.pattern).placeholders(fixture, function(text, key, initial) {
				nodeList.push({text: text, key: key, initial: initial});
			});

			expect(nodeList.length).toBe(3);
			verify(nodeList, ['title', 'foo', 'bar']);
		});

		it('in DOMText nodes', function() {
			var textNode = document.createTextNode('A {foo} walks into a {bar}'),
				nodeList = [];

			new Text(textSettings.pattern).placeholders(textNode, function(text, key, initial) {
				nodeList.push({text: text, key: key, initial: initial});
			});

			expect(nodeList.length).toBe(2);
			verify(nodeList, ['foo', 'bar']);
		});

		it('not in SCRIPT or STYLE nodes', function() {
			var fixture = document.querySelector('.fixture'),
				nodeList = [
					document.createElement('style'),
					document.createElement('script')
				];

			fixture
				.appendChild(nodeList[0])
				.appendChild(document.createTextNode('.a{color:inherit}'));

			fixture
				.appendChild(nodeList[1])
				.appendChild(document.createTextNode('var a = {script:1}'));

			new Text(textSettings.pattern).placeholders(fixture, function(text) {
				expect(nodeList.indexOf(text.parentNode)).toBe(-1);
			});
		});
	});

	it('finds the provided element itself, if it is text', function() {
		var node = document.createTextNode('A {foo} walks into a {bar}'),
			nodeList = [];

		new Text(textSettings.pattern).placeholders(node, function(text, key, initial) {
			nodeList.push({text: text, key: key, initial: initial});
		});

		expect(nodeList.length).toBe(2);
		verify(nodeList, ['foo', 'bar']);
	});

	it('finds the initial value, if any', function() {
		var node = document.createTextNode('A {foo:fool} walks into a {bar}'),
			nodeList = [];

		new Text(textSettings.pattern).placeholders(node, function(text, key, initial) {
			nodeList.push({text: text, key: key, initial: initial});
		});

		expect(nodeList.length).toBe(2);
		verify(nodeList, ['foo', 'bar'], ['fool', undefined]);
	});

	it('allows custom matching patterns', function() {
		var node = document.createTextNode('A <%foo%> walks into a <%bar%>'),
			keys = ['foo', 'bar'],
			nodeList = [];

		new Text(/(<%(.*?)%>)/).placeholders(node, function(text, key, initial) {
			nodeList.push({text: text, key: key, initial: initial});
		});

		expect(nodeList.length).toBe(2);

		nodeList.forEach(function(item, index) {
			expect(item.text.nodeType).toBe(3);
			expect(item.key).toBe(keys[index]);
			expect(item.initial).toBe(undefined);
		});

		expect(nodeList[0].text.data).toBe('<%foo%>');
		expect(nodeList[1].text.data).toBe('<%bar%>');
	});
});
