'use strict';

//@buildinfo

//  load dependencies
//@include tokenizer

/**
 *  JSON Formatter
 *  @name     JSONFormatter
 *  @package  Kontext
 */
function JSONFormatter() {
	var json = this,
		noquote = /^(?:true|false|null|-?[0-9]+(?:\.[0-9]+)?)$/i,
		tokenizer = new Tokenizer({
			//  token markers using the same start/end token
			//  these are _also_ very greedy as any other token will be absorbed inside these tokens
			'"': {
				type: 'quote',
				end: null,
				merge: true
			},
			'\'': {
				type: 'quote',
				end: null,
				merge: true
			},

			//  token markers with different start/end tokens
			'/*': {
				type: 'comment',
				end: '*/',
				merge: true
			},
			'{': {
				type: 'object',
				trim: true,
				end: '}'
			},
			'[': {
				type: 'array',
				end: ']'
			},
			',': {
				type: 'separator',
				trim: true
			},
			':': {
				type: 'key'
			},
			' ': {
				type: 'space'
			},
			'\t': {
				type: 'space'
			},
			'\n': {
				type: 'space'
			},
			'\r': {
				type: 'space'
			}
		});

	/**
	 *  Determine whether or not quoted are required and apply them if nessecary
	 *  @name    quote
	 *  @access  internal
	 *  @param   string  data
	 *  @param   bool    force quotes
	 *  @return  string  quoted
	 */
	function quote(data, force) {
		var symbol = !force && noquote.test(data) ? '' : '"',
			quoted = data[0] === symbol && data[data.length - 1] === symbol;

		if (data && symbol && !quoted) {
			return [
				symbol,
				data.replace(new RegExp('([^\\\\])' + symbol, 'g'), '$1\\' + symbol),
				symbol
			];
		}

		return data;
	}

	/**
	 *  Reduce the nesting of the list to be a single string value
	 *  @name    flatten
	 *  @access  internal
	 *  @param   Array   tokens
	 *  @return  string  flat
	 */
	function flatten(list) {
		return list
			.map(function(item) {
				return item.data;
			})
			.join('');
	}

	/**
	 *  Compile JSON from the token list
	 *  @name    compile
	 *  @access  internal
	 *  @param   Array   tokens
	 *  @return  string  json
	 */
	function compile(list) {
		return list
			.reduce(function(result, item, index, all) {
				var next = index + 1 < all.length ? all[index + 1] : null,
					force = ('force' in item && item.force) || (next && next.type === 'key'),
					output = item.type === 'text' ? quote(item.data.trim(), force) : item.token;

				if (item.type === 'space') {
					output = '';
				}
				else if ('nest' in item) {
					output = output.concat(prepare(item.nest)).concat(item.end.token);
				}

				return result.concat(output);
			}, [])
			.join('');
	}

	/**
	 *  Prepare a list of tokens to have adjecent text/quote elements merged
	 *  @name    prepare
	 *  @access  internal
	 *  @param   Array   tokens
	 *  @return  Array   reduced
	 */
	function prepare(list) {
		var prepared = list
				.filter(function(item) {
					return item.type !== 'comment';
				})
				.map(function(item) {
					var data;

					if (item.type === 'quote') {
						data = [item.token, flatten(item.nest), item.end.data || item.end.token];

						item = {
							type: 'text',
							force: noquote.test(data[1]),
							data: data[0] === data[2] ? data[1] : data.join('')
						};
					}

					return item;
				})
				.reduce(function(result, item) {
					var prev = result.length ? result[result.length - 1] : null;

					if (prev && prev.type === 'text' && item.type === 'text') {
						prev.data += item.data;
					}
					else {
						result = result.concat(item);
					}

					return result;
				}, []);

		return compile(prepared);
	}

	/**
	 *  Apply Object or Array notation (string.replace helper for an expression resulting in ':' or ',')
	 *  @name    notation
	 *  @access  internal
	 *  @param   string  full match
	 *  @param   string  matching symbol
	 *  @return  string  wrapped
	 */
	function notation(match, symbol) {
		var character = symbol === ':' ? '{}' : '[]',
			position = match.indexOf(symbol),
			string = (match.match(/"/g) || []).length === 2 && match.indexOf('"') < position && match.lastIndexOf('"') > position;

		//  figure out if the notation should be added or may be skipped
		return !string && match[0] !== character[0] ? character[0] + match + character[1] : match;
	}

	/**
	 *  Prepare a string to become a JSON-representation
	 *  @name    prepare
	 *  @access  public
	 *  @param   string  input
	 *  @return  string  JSON-formatted
	 */
	json.prepare = function(input) {
		//if-included istanbul ignore next
		if (typeof input !== 'string') {
			return '';
		}

		//  tokenize the input and feed it to the compiler in one go
		return prepare(tokenizer.tokenize(input))
			.replace(/[,\s]+$/g, '')
			.replace(/^(?:[^\[\{].*?)([:,]).*$/, notation);
	};

	/**
	 *  Prepare a string and parse it using JSON.parse
	 *  @name    parse
	 *  @access  public
	 *  @param   string  input
	 *  @return  mixed   parsed
	 */
	json.parse = function(input) {
		var prepared = json.prepare(input);

		return prepared ? JSON.parse(prepared) : null;
	};
}
