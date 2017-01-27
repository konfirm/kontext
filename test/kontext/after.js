/* global kontext: true, describe: true, it: true, expect: true, afterEach: true, beforeEach: true */
describe('Kontext After', function() {
	'use strict';

	var main = document.createElement('main');

	/**
	 *  Remove the `after` configuration from the kontext default settings
	 *  @name    clean
	 *  @access  internal
	 *  @return  void
	 */
	function clean() {
		var def = kontext.defaults();
		if ('after' in def) {
			delete def.after;
		}
	}

	afterEach(function() {
		clean();
	});

	describe('Bind options', function() {
		describe('Classes (default)', function() {
			describe('Default aftermath, removes class "unbound-kontext"', function() {
				it('Leaves the binding context intact if the configuration does not match', function() {
					main.className = 'hello world';

					kontext.bind({hello: 'world'}, main);

					expect(main.className).toEqual('hello world');
				});

				it('Removes "unbound-kontext" by default', function() {
					main.className = 'unbound-kontext';

					kontext.bind({hello: 'world'}, main);

					expect(main.className).toEqual('');
				});

				it('Removes "unbound-kontext" cleanly from a list of classes', function() {
					main.className = 'hello unbound-kontext world';

					kontext.bind({hello: 'world'}, main);

					expect(main.className).toEqual('hello world');
				});
			});

			describe('Custom aftermath, class name', function() {
				describe('Removal', function() {
					it('Leaves the binding context class intact if the configuration does not match', function() {
						main.className = 'hello world';

						kontext.bind({hello: 'world'}, main, {after: {value: '-custom'}});

						expect(main.className).toEqual('hello world');
					});

					it('Only custom class', function() {
						main.className = 'custom';

						kontext.bind({hello: 'world'}, main, {after: {value: '-custom'}});

						expect(main.className).toEqual('');
					});

					it('Custom class cleanly from a list of classes', function() {
						main.className = 'custom hello world';

						kontext.bind({hello: 'world'}, main, {after: {value: '-custom'}});

						expect(main.className).toEqual('hello world');
					});
				});

				describe('Addition', function() {
					it('Adds custom class as single class', function() {
						main.className = '';

						kontext.bind({hello: 'world'}, main, {after: {value: '+custom'}});

						expect(main.className).toEqual('custom');
					});

					it('Adds custom class to a list of classes', function() {
						main.className = 'hello world';

						kontext.bind({hello: 'world'}, main, {after: {value: '+custom'}});

						expect(main.className).toEqual('hello world custom');
					});
				});

				describe('Replacement', function() {
					it('Sets custom class from nothing', function() {
						main.className = '';

						kontext.bind({hello: 'world'}, main, {after: {value: 'custom'}});

						expect(main.className).toEqual('custom');
					});

					it('Sets custom class instead of previous', function() {
						main.className = 'hello world';

						kontext.bind({hello: 'world'}, main, {after: {value: 'custom'}});

						expect(main.className).toEqual('custom');
					});
				});
			});
		});

		describe('Custom attributes', function() {
			describe('Custom aftermath, removes custom attribute value "unbound-kontext"', function() {
				it('Leaves the binding context intact if the configuration does not match', function() {
					main.setAttribute('data-fouc', 'hello world');

					kontext.bind({hello: 'world'}, main, {after: {attribute: 'data-fouc'}});

					expect(main.getAttribute('data-fouc')).toEqual('hello world');
				});

				it('Removes "unbound-kontext" by default, entire attribute if value becomes empty', function() {
					main.setAttribute('data-fouc', 'unbound-kontext');

					kontext.bind({hello: 'world'}, main, {after: {attribute: 'data-fouc'}});

					expect(main.hasAttribute('data-fouc')).toEqual(false);
					expect(main.getAttribute('data-fouc')).toEqual(null);
				});

				it('Removes "unbound-kontext" cleanly from an attribute list', function() {
					main.setAttribute('data-fouc', 'hello unbound-kontext world');

					kontext.bind({hello: 'world'}, main, {after: {attribute: 'data-fouc'}});

					expect(main.getAttribute('data-fouc')).toEqual('hello world');
				});
			});

			describe('Custom aftermath, attribute and class name', function() {
				describe('Removal', function() {
					it('Leaves the binding context class intact if the configuration does not match', function() {
						main.setAttribute('data-fouc', 'hello world');

						kontext.bind({hello: 'world'}, main, {after: {attribute: 'data-fouc', value: '-custom'}});

						expect(main.getAttribute('data-fouc')).toEqual('hello world');
					});

					it('Only custom attribute value', function() {
						main.setAttribute('data-fouc', 'custom');

						kontext.bind({hello: 'world'}, main, {after: {attribute: 'data-fouc', value: '-custom'}});

						expect(main.hasAttribute('data-fouc')).toEqual(false);
						expect(main.getAttribute('data-fouc')).toEqual(null);
					});

					it('Custom attribute value cleanly from the atrribute value', function() {
						main.setAttribute('data-fouc', 'custom hello world');

						kontext.bind({hello: 'world'}, main, {after: {attribute: 'data-fouc', value: '-custom'}});

						expect(main.getAttribute('data-fouc')).toEqual('hello world');
					});
				});

				describe('Addition', function() {
					it('Creates attribute with custom value', function() {
						main.removeAttribute('data-fouc');

						expect(main.hasAttribute('data-fouc')).toEqual(false);

						kontext.bind({hello: 'world'}, main, {after: {attribute: 'data-fouc', value: '+custom'}});

						expect(main.hasAttribute('data-fouc')).toEqual(true);
						expect(main.getAttribute('data-fouc')).toEqual('custom');
					});

					it('Adds custom value to custom attribute', function() {
						main.setAttribute('data-fouc', 'hello world');

						kontext.bind({hello: 'world'}, main, {after: {attribute: 'data-fouc', value: '+custom'}});

						expect(main.getAttribute('data-fouc')).toEqual('hello world custom');
					});
				});

				describe('Replacement', function() {
					it('Sets custom class from nothing', function() {
						main.setAttribute('data-fouc', 'custom');

						kontext.bind({hello: 'world'}, main, {after: {attribute: 'data-fouc', value: 'custom'}});

						expect(main.getAttribute('data-fouc')).toEqual('custom');
					});

					it('Sets custom class instead of previous', function() {
						main.setAttribute('data-fouc', 'custom');

						kontext.bind({hello: 'world'}, main, {after: {attribute: 'data-fouc', value: 'custom'}});

						expect(main.getAttribute('data-fouc')).toEqual('custom');
					});
				});
			});
		});

		it('calls a provided function', function() {
			document.documentElement.className = 'foo';

			kontext.bind({hello: 'world'}, main, {after: function() {
				document.documentElement.className = 'bar';
			}});

			expect(document.documentElement.className).toEqual('bar');
		});
	});

	describe('Defaults after', function() {
		describe('Classes (default)', function() {
			describe('Custom aftermath, class name', function() {
				describe('Removal', function() {
					beforeEach(function() {
						clean();
						kontext.defaults('after', {value: '-custom'});
					});

					it('Leaves the binding context class intact if the configuration does not match', function() {
						main.className = 'hello world';

						kontext.bind({hello: 'world'}, main);

						expect(main.className).toEqual('hello world');
					});

					it('Only custom class', function() {
						main.className = 'custom';

						kontext.bind({hello: 'world'}, main);

						expect(main.className).toEqual('');
					});

					it('Custom class cleanly from a list of classes', function() {
						main.className = 'custom hello world';

						kontext.bind({hello: 'world'}, main);

						expect(main.className).toEqual('hello world');
					});
				});

				describe('Addition', function() {
					beforeEach(function() {
						clean();
						kontext.defaults('after', {value: '+custom'});
					});

					it('Adds custom class as single class', function() {
						main.className = '';

						kontext.bind({hello: 'world'}, main);

						expect(main.className).toEqual('custom');
					});

					it('Adds custom class to a list of classes', function() {
						main.className = 'hello world';

						kontext.bind({hello: 'world'}, main);

						expect(main.className).toEqual('hello world custom');
					});
				});

				describe('Replacement', function() {
					beforeEach(function() {
						clean();
						kontext.defaults('after', {value: 'custom'});
					});

					it('Sets custom class from nothing', function() {
						main.className = '';

						kontext.bind({hello: 'world'}, main);

						expect(main.className).toEqual('custom');
					});

					it('Sets custom class instead of previous', function() {
						main.className = 'hello world';

						kontext.bind({hello: 'world'}, main);

						expect(main.className).toEqual('custom');
					});
				});
			});
		});

		describe('Custom attributes', function() {
			describe('Custom aftermath, removes custom attribute value "unbound-kontext"', function() {
				beforeEach(function() {
					clean();
					kontext.defaults('after', {attribute: 'data-fouc'});
				});

				it('Leaves the binding context intact if the configuration does not match', function() {
					main.setAttribute('data-fouc', 'hello world');

					kontext.bind({hello: 'world'}, main);

					expect(main.getAttribute('data-fouc')).toEqual('hello world');
				});

				it('Removes "unbound-kontext" by default, entire attribute if value becomes empty', function() {
					main.setAttribute('data-fouc', 'unbound-kontext');

					kontext.bind({hello: 'world'}, main);

					expect(main.hasAttribute('data-fouc')).toEqual(false);
					expect(main.getAttribute('data-fouc')).toEqual(null);
				});

				it('Removes "unbound-kontext" cleanly from an attribute list', function() {
					main.setAttribute('data-fouc', 'hello unbound-kontext world');

					kontext.bind({hello: 'world'}, main);

					expect(main.getAttribute('data-fouc')).toEqual('hello world');
				});
			});

			describe('Custom aftermath, attribute and class name', function() {
				describe('Removal', function() {
					beforeEach(function() {
						clean();
						kontext.defaults('after', {attribute: 'data-fouc', value: '-custom'});
					});

					it('Leaves the binding context class intact if the configuration does not match', function() {
						main.setAttribute('data-fouc', 'hello world');

						kontext.bind({hello: 'world'}, main);

						expect(main.getAttribute('data-fouc')).toEqual('hello world');
					});

					it('Only custom attribute value', function() {
						main.setAttribute('data-fouc', 'custom');

						kontext.bind({hello: 'world'}, main);

						expect(main.hasAttribute('data-fouc')).toEqual(false);
						expect(main.getAttribute('data-fouc')).toEqual(null);
					});

					it('Custom attribute value cleanly from the atrribute value', function() {
						main.setAttribute('data-fouc', 'custom hello world');

						kontext.bind({hello: 'world'}, main);

						expect(main.getAttribute('data-fouc')).toEqual('hello world');
					});
				});

				describe('Addition', function() {
					beforeEach(function() {
						clean();
						kontext.defaults('after', {attribute: 'data-fouc', value: '+custom'});
					});

					it('Creates attribute with custom value', function() {
						main.removeAttribute('data-fouc');

						expect(main.hasAttribute('data-fouc')).toEqual(false);

						kontext.bind({hello: 'world'}, main);

						expect(main.hasAttribute('data-fouc')).toEqual(true);
						expect(main.getAttribute('data-fouc')).toEqual('custom');
					});

					it('Adds custom value to custom attribute', function() {
						main.setAttribute('data-fouc', 'hello world');

						kontext.bind({hello: 'world'}, main);

						expect(main.getAttribute('data-fouc')).toEqual('hello world custom');
					});
				});

				describe('Replacement', function() {
					beforeEach(function() {
						clean();
						kontext.defaults('after', {attribute: 'data-fouc', value: 'custom'});
					});

					it('Sets custom class from nothing', function() {
						main.setAttribute('data-fouc', 'custom');

						kontext.bind({hello: 'world'}, main);

						expect(main.getAttribute('data-fouc')).toEqual('custom');
					});

					it('Sets custom class instead of previous', function() {
						main.setAttribute('data-fouc', 'custom');

						kontext.bind({hello: 'world'}, main);

						expect(main.getAttribute('data-fouc')).toEqual('custom');
					});
				});
			});
		});

		it('calls a provided function', function() {
			var invoke = false;

			kontext.defaults('after', function() {
				invoke = true;
				document.documentElement.className = 'bar';
			});
			document.documentElement.className = 'foo';

			kontext.bind({hello: 'world'}, main);

			expect(invoke).toEqual(true);
			expect(document.documentElement.className).toEqual('bar');
		});
	});
});
