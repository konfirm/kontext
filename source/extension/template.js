/*global kontext*/
(function(kontext) {
	'use strict';

	/**
	 *  Template handling module
	 *  @name     Template
	 *  @package  Kontext
	 *  @note     The Template module uses the singleton pattern to ensure the caching is per page
	 */
	function Template() {
		if (!(typeof Template.prototype.__instance === 'undefined' && this instanceof Template)) {
			return Template.prototype.__instance || new Template();
		}

		Template.prototype.__instance = this;

		var template = this,
			cache = {};

		/**
		 *  Load a template file from given path and execute the callback
		 *  @name    load
		 *  @access  internal
		 *  @param   string    path
		 *  @param   function  callback
		 *  @return  void
		 */
		function load(path, done) {
			var xhr = new XMLHttpRequest();

			xhr.addEventListener('load', function() {
				var data = this.responseText,
					dom;

				if (this.status >= 400) {
					return done(data);
				}

				dom = document.createElement('div');
				dom.innerHTML = data;

				done(null, dom);
			});

			xhr.open('GET', path);
			xhr.send();
		}

		/**
		 *  Resolve the configured input from cache, creating it when needed
		 *  @name    resolve
		 *  @access  internal
		 *  @param   Object    config  {path: <string>, selector: <string>}
		 *  @param   function  callback
		 *  @return  void
		 */
		function resolve(input, done) {
			var buffer = entry(input.path);

			if (!buffer.data) {
				buffer.callback.push(function() {
					resolve(input, done);
				});

				if (buffer.callback.length <= 1) {
					load(input.path, function(error, dom) {
						buffer.data = {
							error: error,
							content: dom
						};

						trigger(buffer.callback);
					});
				}

				return;
			}

			if (!(input.selector in buffer.selector)) {
				buffer.selector[input.selector] = buffer.data.content ? clone(buffer.data.content, input.selector) : [];
			}

			if (buffer.data.error) {
				return done(buffer.data.error);
			}

			done(null, buffer.selector[input.selector].cloneNode(true));
		}

		/**
		 *  Obtain the entry for given source from the cache, creating a default entry if it does not yet exist
		 *  @name    entry
		 *  @access  internal
		 *  @param   string  source
		 *  @return  Object  entry  {data: <Object>, callback: <Array>, selector: <Object>}
		 */
		function entry(source) {
			if (!(source in cache)) {
				cache[source] = {
					data: source ? null : {content: document, error: null},
					callback: [],
					selector: {}
				};
			}

			return cache[source];
		}

		/**
		 *  Create a new DocumentFragment containing the nodes from list
		 *  @name    fragment
		 *  @access  internal
		 *  @param   Array  nodes
		 *  @return  DocumentFragment
		 *  @note    The nodes from the list are cloned deep
		 */
		function clone(dom, selector) {
			var node = selector ? dom.querySelector(selector) : dom,
				fragment = document.createDocumentFragment(),
				i;

			for (i = 0; i < node.childNodes.length; ++i) {
				fragment.appendChild(node.childNodes[i].cloneNode(true));
			}

			return fragment;
		}

		function trigger(list) {
			var callback;

			if (list.length) {
				callback = list.shift();

				setTimeout(function() {
					callback();
					trigger(list);
				}, 0);
			}
		}

		/**
		 *  Process the input into the provider object we want to work with
		 *  @name    provider
		 *  @access  internal
		 *  @param   mixed  input [one of: string (path)(#id), object {[path:..] [,selector:..]}]
		 *  @return  Object  {path:.., selector:..}
		 */
		function provider(input) {
			var result = {
					path: '',
					selector: ''
				},
				parse;

			if (typeof input === 'string') {
				parse = input.match(/^([^#]+)?(#.*)?$/);
				if (parse) {
					result.path     = parse[1] || result.path;
					result.selector = parse[2] || result.selector;
				}
			}
			else if (input && typeof input === 'object') {
				Object.keys(result)
					.forEach(function(key) {
						if (key in input) {
							result[key] = input[key] || result[key];
						}
					});
			}

			return result;
		}

		/**
		 *  Load the desired template using the settings
		 *  @name    load
		 *  @access  public
		 *  @param   mixed     input  [one of: string (path)(#id), object {[path:..] [,selector:..]}]
		 *  @param   function  callback
		 *  @return  void
		 */
		template.load = function(input, done) {
			var config = provider(input);

			if (!(config.path || config.selector)) {
				return done('No path and selector');
			}

			resolve(config, function(error, dom) {
				if (error) {
					return done(error);
				}

				done(null, dom);
			});
		};
	}

	/**
	 *  Replace the contents of an element with a template
	 *  @name     Template
	 *  @package  Kontext
	 *  @syntax   <span data-kontext="template: foo">replaced</span>
	 *            <span data-kontext="template: foo#bar">replaced</span>
	 *            <span data-kontext="template: #bar">replaced</span>
	 *            <span data-kontext="template: {path: /path/to/template}">replaced</span>
	 *            <span data-kontext="template: {path: /path/to/template, selector: #bar}">replaced</span>
	 *            <span data-kontext="template: {selector: #bar}">replaced</span>
	 *            <span data-kontext="template: {value: myTemplate}">replaced</span>
	 */
	kontext.extension('template', function(element, model, key) {
		var template = Template(),
			config = key;

		element.style.display = 'none';

		function update(value) {
			template.load(value, function(error, fragment) {
				if (error) {
					return element.setAttribute('data-kontext-error', error);
				}

				//  truncate the element (only done if no errors occured)
				while (element.lastChild) {
					element.removeChild(element.lastChild);
				}

				//  append the document fragment to the element
				element.appendChild(fragment);

				//  bind the model to the elements children
				kontext.bind(model, element.childNodes);

				element.style.display = '';
			});
		}

		if (typeof key === 'object' && 'value' in key) {
			model.on('update', function(model, property) {
				if (property === key.value) {
					update(model[key.value]);
				}
			});

			config = model[config.value];
		}

		update(config);
	});

})(kontext);
