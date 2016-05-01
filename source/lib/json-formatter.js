'use strict';

/**
 *  Format a string containing (valid) js variables into proper JSON so it can be handled by JSON.parse
 *  @name       JSONFormatter
 *  @package    Kontext
 */
function JSONFormatter() {  //  eslint-disable-line no-unused-vars
	//  Implement a Singleton pattern and allow JSONFormatter to be invoked without the `new` keyword
	//if-included istanbul ignore next
	if (typeof JSONFormatter.prototype.__instance !== 'undefined' || !(this instanceof JSONFormatter)) {
		return JSONFormatter.prototype.__instance || new JSONFormatter();
	}

	//  Maintain a reference to the first instance (which - if exists - is returned in the flow above)
	JSONFormatter.prototype.__instance = this;

	var formatter = this,
		special = '\'":,{}[] ',
		quotation = '"',
		pattern = {
			escape: /["\\\/\b\f\n\r\t]/,
			noquote: /^(?:true|false|null|-?[0-9]+(?:\.[0-9]+)?)$/i,
			trailer: /[,]+$/
		},
		escaped = {
			'\b': '\\b',
			'\f': '\\f',
			'\n': '\\n',
			'\r': '\\r',
			'\t': '\\t',
			'\v': '\\v'
		};

	/**
	 *  Determine is a token is a special character
	 *  @name    isSpecial
	 *  @access  internal
	 *  @param   string  token
	 *  @return  bool  special
	 */
	function isSpecial(token) {
		return special.indexOf(token) >= 0;
	}

	/**
	 *  Add quotes if required
	 *  @name    addQuotation
	 *  @access  internal
	 *  @param   string  token
	 *  @param   bool    force
	 *  @return  string  JSON-token
	 */
	function addQuotation(token, force) {
		var quote = quotation;

		//  if quotation is not enforced, we must skip application of quotes for certain tokens
		if (!force && (isSpecial(token) || pattern.noquote.test(token))) {
			quote = '';
		}

		return quote + token + quote;
	}

	/**
	 *  Remove trailing commas from the result stack
	 *  @name    removeTrailing
	 *  @access  internal
	 *  @param   Array  result
	 *  @return  Array  result
	 */
	function removeTrailing(result) {
		return pattern.trailer.test(result) ? removeTrailing(result.substr(0, result.length - 1)) : result;
	}

	//if-included istanbul ignore next
	/**
	 *  Handle a quoted string, ensuring proper escaping for double quoted strings
	 *  @name    escapeQuotedInput
	 *  @access  internal
	 *  @param   string  token
	 *  @array   Array   list
	 *  @return  Array   result
	 */
	function escapeQuotedInput(token, list) {
		var result = [],
			character;

		//  token is the initial (opening) quotation character, we are not (yet) interested in this,
		//  as we need to process the stuff in list, right until we find a matching token
		while (list.length) {
			character = list.shift();

			//  reduce provided escaping
			if (character[character.length - 1] === '\\') {
				if (!pattern.escape.test(list[0])) {
					//  remove the escape character
					character = character.substr(0, character.length - 1);
				}

				//  add the result
				result.push(character);

				//  while we are at it, we may aswel move the (at least previously) escaped
				//  character to the result
				result.push(list.shift());
				continue;
			}
			else if (character === token) {
				//  with the escaping taken care of, we now know the string has ended
				break;
			}

			result.push(character);
		}

		return addQuotation(result.join(''));
	}

	/**
	 *  Nibble the next token from the list and handle it
	 *  @name    nibble
	 *  @access  internal
	 *  @param   string  result
	 *  @param   array   tokens
	 *  @return  string  result
	 *  @TODO    There is an issue with quotation symbols inside strings
	 *           e.g. 'hello"world' becomes '"hello""world"' while it should become '"hello\"world"'
	 */
	function nibble(result, list) {
		var token = list.shift();

		switch (token) {

			//  skip whitespace not part of string values
			case ' ':
				break;

			//  remove any trailing commas and whitespace
			case '}':
			case ']':
				result = removeTrailing(result) + token;
				break;

			//  add/remove escaping
			case '"':
			case '\'':
				result += escapeQuotedInput(token, list);
				break;

			//  determine if the value needs to be quoted (always true if the next item in the list is a separator)
			default:
				result += addQuotation(token, list[0] === ':');
				break;
		}

		return result;
	}

	/**
	 *  Compile the JSON-formatted string from a list of 'tokenized' data
	 *  @name    compiler
	 *  @access  internal
	 *  @param   Array   list
	 *  @return  string  JSON-formatted
	 */
	function compiler(list) {
		var result = '';

		while (list.length) {
			result = nibble(result, list);
		}

		return result;
	}

	/**
	 *  Tokenize the input, adding each special character to be its own item in the resulting array
	 *  @name    tokenize
	 *  @access  internal
	 *  @param   string  input
	 *  @result  Array   tokens
	 */
	function tokenize(input) {
		var result = [],
			i;

		//  check each character in the string
		for (i = 0; i < input.length; ++i) {
			//  if there is not result or the current or previous input is special, we create a new result item
			if (result.length === 0 || isSpecial(input[i]) || isSpecial(result[result.length - 1])) {
				result.push(input[i]);

				while (i + 1 < input.length && /\s/.test(input[i + 1])) {
					++i;
				}
			}

			//  extend the previous item
			else {
				result[result.length - 1] += escaped[input[i]] || input[i];
			}
		}

		return result;
	}

	//if-included istanbul ignore next
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
		return !string && match[0] !== character[0] ? character[0] + removeTrailing(match) + character[1] : match;
	}

	/**
	 *  Prepare a string to become a JSON-representation
	 *  @name    prepare
	 *  @access  public
	 *  @param   string  input
	 *  @return  string  JSON-formatted
	 */
	formatter.prepare = function(input) {
		//if-included istanbul ignore next
		if (typeof input !== 'string') {
			return '';
		}

		//  tokenize the input and feed it to the compiler in one go
		return compiler(tokenize(input))
			.replace(/^.*?([:,]).*$/, notation)
		;
	};

	/**
	 *  Prepare a string and parse it using JSON.parse
	 *  @name    parse
	 *  @access  public
	 *  @param   string  input
	 *  @return  mixed   parsed
	 */
	formatter.parse = function(input) {
		var prepared = formatter.prepare(input);

		return prepared ? JSON.parse(prepared) : null;
	};
}
