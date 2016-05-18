'use strict';

/**
 *  String Tokenizer (pre-process strings based on special tokens)
 *  @name     Tokenizer
 *  @package  Kontext
 */
function Tokenizer(tokens) {
	var tokenizer = this,
		keys = Object.keys(tokens);

	/**
	 *  Attempt to match one of the tokens to the input string at the given index
	 *  @name    matcher
	 *  @access  internal
	 *  @param   string  text
	 *  @param   number  index
	 *  @return  Object  item  {type, token, index [end [, merge]]}  [null if not match was found]
	 */
	function matcher(text, index) {
		var candidate = keys.filter(function(key) {
				return text.substr(index, key.length) === key;
			}),
			result = null,
			token;

		if (candidate.length) {
			token = candidate[0];
			result = {
				type: tokens[token].type,
				token: token,
				index: index
			};

			['end', 'merge'].forEach(function(key) {
				if (key in tokens[token]) {
					result[key] = tokens[token][key];
				}
			});
		}

		return result;
	}

	/**
	 *  Return the amount of bytes to 'jump' behind given item
	 *  @name    shift
	 *  @access  internal
	 *  @param   Object  item
	 *  @return  int     jump
	 */
	function shift(item) {
		return item ? item.index + (item.data || item.token || '').length : 0;
	}

	/**
	 *  Determine if the given item is trimmable
	 *  (the tokens of both item and compare both carry 'trim: true')
	 *  @name    trimmable
	 *  @access  internal
	 *  @param   Object  item
	 *  @param   Object  compare
	 *  @param   bool    before
	 *  @return  bool    trimmable
	 */
	function trimmable(item, compare, before) {
		var token = item && 'token' in item && item.token in tokens ? tokens[item.token] : null;

		if (token && (token.trim || false)) {
			return before ? shift(item) === compare.index : item.index === shift(compare);
		}

		return false;
	}

	/**
	 *  Should the item be trimmed
	 *  @name    tokenFilter
	 *  @access  internal
	 *  @param   Object  item
	 *  @param   number  index
	 *  @param   Array   all items
	 *  @return  bool    trim
	 */
	function tokenFilter(item, index, all) {
		var verdict = true;

		switch (item.type) {
			case 'text':
				verdict = !/^\s+$/.test(item.data);
				break;

			case 'space':
				verdict = !(trimmable(all[index - 1], item, true) || trimmable(all[index + 1], item));
				break;
		}

		return verdict;
	}

	/**
	 *  Ensure the last item in the list is a 'text'-type item and return it
	 *  @name    lastText
	 *  @access  internal
	 *  @param   Array   items
	 *  @param   number  index
	 *  @return  Object  item
	 */
	function lastText(list, index) {
		if (!(list.length && list[list.length - 1].type === 'text')) {
			list.push({
				type: 'text',
				data: '',
				index: index
			});
		}

		return list[list.length - 1];
	}

	/**
	 *  Tokenize the given text from start until either the end or until given character is found
	 *  @name    tokenize
	 *  @access  internal
	 *  @param   string  text
	 *  @param   number  start
	 *  @param   string  until
	 *  @param   bool    greedy
	 *  @return  Array   tokens
	 */
	function tokenize(text, start, until, greedy) {
		var result = [],
			index = start || 0,
			match, end, ends;

		while (text && index < text.length) {
			match = matcher(text, index);
			ends  = until && (end = text.substr(index, until.length)) === until;

			//  if the current text matches the `until` value, we may have to skip
			//  the termination, for it may be escaped
			if (ends && !(index > 0 && text[index - 1] === '\\')) {
				result.push({
					type: match ? match.type : null,
					token: end,
					index: index
				});

				//  break the loop (no return, as we want to filter it before returning)
				break;
			}
			else if (!greedy && match) {
				index = processMatch(text, index, match, result);
			}
			else {
				match = lastText(result, index);
				match.data += text[index];
				++index;
			}
		}

		return result
			.filter(tokenFilter);
	}

	/**
	 *  Process a token match, resolving optional nesting and returning the index to jump to
	 *  @name    processMatch
	 *  @access  internal
	 *  @param   string  text
	 *  @param   number  index
	 *  @param   Object  match
	 *  @param   Array   list
	 *  @return  number  index
	 */
	function processMatch(text, index, match, result) {
		var nested, end;

		if ('end' in match && match.end !== true) {
			//  TODO: a multicharacter token cannot be used as (greedy) self-closing value
			//        this is fine as (to our knowledge) there are no such pattens required
			nested = tokenize(text, shift(match), match.end || text[index], match.merge || false);
			end = nested.pop();

			result.push({
				type: match.type,
				token: match.token,
				index: match.index,
				nest: nested,
				end: end
			});

			return shift(end);
		}

		result.push(match);

		return shift(match);
	}

	/**
	 *  Tokenize given input text
	 *  @name    tokenize
	 *  @access  public
	 *  @param   string
	 *  @return  Array  tokens
	 */
	tokenizer.tokenize = function(text) {
		return tokenize(text);
	};
}
