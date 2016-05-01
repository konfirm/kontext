/**
 *  Template handling module
 *  @name     Template
 *  @package  Kontext
 */
function Template() {  //  eslint-disable-line no-unused-vars
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

		//  register the load handler to take care of the DOM creation of the loaded data
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
	 *  Obtain the entry for given source from the cache,
	 *  creating a default entry if it does not yet exist
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

	/**
	 *  Trigger a list of callbacks in sequence, relaxing it by triggering one at a time
	 *  @name    trigger
	 *  @access  internal
	 *  @param   Array  list
	 *  @return  void
	 */
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
	 *  Resolve the configured input from cache, creating it when needed
	 *  @name    resolve
	 *  @access  internal
	 *  @param   Object    config  {path: <string>, selector: <string>}
	 *  @param   function  callback
	 *  @return  void
	 */
	function resolve(input, done) {
		var buffer = entry(input.path);

		//  if there is no data in the buffer, the template is external and not yet loaded
		if (!buffer.data) {
			//  add a callback to the internal queue
			buffer.callback.push(function() {
				resolve(input, done);
			});

			//  if there is only one (actually one or less, which means one)
			//  the template will be loaded
			if (buffer.callback.length <= 1) {
				load(input.path, function(error, dom) {
					//  add the data property
					buffer.data = {
						error: error,
						content: dom
					};

					//  trigger all queued callbacks
					trigger(buffer.callback);
				});
			}

			return;
		}

		//  if the given selector is not yet known in the internal selectors for the template path
		//  it will be created from the available data.content (or be empty otherwise)
		if (!(input.selector in buffer.selector)) {
			buffer.selector[input.selector] = buffer.data.content ? clone(buffer.data.content, input.selector) : [];
		}

		//  if an error was encountered, it will always be provided to the callback
		if (buffer.data.error) {
			return done(buffer.data.error);
		}

		//  invoke the callback with a fresh clone of the prepared template
		done(null, buffer.selector[input.selector].cloneNode(true));
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

		//  if the input is a string, we parse it to obtain the path and/or selector
		if (typeof input === 'string') {
			parse = input.match(/^([^#]+)?(#.*)?$/);

			//  there is (should) be no need to test for the parse result as the pattern
			//  is very greedy and will always match
			result.path     = parse[1] || result.path;
			result.selector = parse[2] || result.selector;
		}
		else if (input && typeof input === 'object') {
			//  overwrite the default settings - if provided
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
