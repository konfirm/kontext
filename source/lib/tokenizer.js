'use strict';

/**
 *  String Tokenizer (pre-process strings based on special tokens)
 *  @name     Tokenizer
 *  @package  Kontext
 */
function Tokenizer(tokens) {
	var tokenizer = this,
		matcher;

	/**
	 *  Initialize the Tokenizer, preparing the tokens in a crafter matcher function
	 *  @name    init
	 *  @access  internal
	 *  @return  void
	 */
	function init() {
		var collect = {},
			key;

		//  create fast lookups for every key, by using the keys' first character as object index
		for (key in tokens) {
			if (!(key[0] in collect)) {
				collect[key[0]] = [];
			}

			collect[key[0]].push(key);
		}

		//  prioritize the keys by length
		for (key in collect) {
			collect[key] = collect[key].sort(function(a, b) {
				return a.length === b.length ? a < b ? -1 : +(a > b) : a.length > b.length ? -1 : +(a.length < b.length);
			});
		}

		//  prepare the matcher function based on the prepared collect object
		matcher = function(text, index) {
			var result = null,
				candidate;

			if (text[index] in collect) {
				candidate = collect[text[index]]
					.filter(function(key) {
						return text.substr(index, key.length) === key;
					});

				if (candidate.length) {
					result = {
						type: tokens[candidate[0]].type,
						token: candidate[0],
						index: index
					};

					if ('end' in tokens[candidate[0]]) {
						result.end = tokens[candidate[0]].end;
					}

					if ('merge' in tokens[candidate[0]]) {
						result.merge = tokens[candidate[0]].merge;
					}
				}
			}

			return result;
		};
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
	 *  @name    trimToken
	 *  @access  internal
	 *  @param   Object  item
	 *  @param   number  index
	 *  @param   Array   all items
	 *  @return  bool    trim
	 */
	function trimToken(item, index, all) {
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
			match, sub, end, ends;

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
				break;
			}
			else if (!greedy && match) {
				if ('end' in match && match.end !== true) {
					//  TODO: a multicharacter token cannot be used as (greedy) self-closing value
					//        this is fine as (to our knowledge) there are no such pattens required
					sub = tokenize(text, shift(match), match.end || text[index], match.merge || false);
					end = sub.pop();

					result.push({
						type: match.type,
						token: match.token,
						index: match.index,
						nest: sub,
						end: end
					});

					index = shift(end);
				}
				else {
					result.push(match);

					index = shift(match);
				}
			}
			else {
				if (!(result.length && result[result.length - 1].type === 'text')) {
					result.push({
						type: 'text',
						data: '',
						index: index
					});
				}

				result[result.length - 1].data += text[index];
				++index;
			}
		}

		return result
			.filter(trimToken);
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

	init();
}
