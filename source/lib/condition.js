/**
 *  Condition handler
 *  @name     Condition
 *  @package  kontext
 *  @note     Implements a large portion of the MongoDB query syntax (detection only, not filtering is done)
 *            https://docs.mongodb.org/manual/reference/operator/query/
 */
function Condition() {  //  eslint-disable-line no-unused-vars
	'use strict';

	var condition = this,

		//  types (only the ones used by the Condition module itself are defined, hence 'missing' types
		//  like T_BOOLEAN and T_FUNCTION)
		T_ARRAY    = 'array',
		T_NUMBER   = 'number',
		T_OBJECT   = 'object',
		T_STRING   = 'string',

		//  patterns
		exprStart  = /^\$(?:or|and|not|nor)$/i,
		exprRegEx  = /^(.)(.+)\1([gimuy]+)?$/,

		//  operators
		operator = {};

	/**
	 *  Determine whether the given key matches a $-keyword (e.g. $and, $or, $not, $nor)
	 *  @name    starter
	 *  @access  internal
	 *  @param   string  key
	 *  @return  bool    is starter
	 */
	function starter(key) {
		return exprStart.test(key);
	}

	/**
	 *  Apply the function to every item in the array-ish list until (bool) false is returned or
	 *  the end of the list is reached
	 *  @name    each
	 *  @access  internal
	 *  @param   Array(-ish)  list
	 *  @param   function     handle
	 *  @return  void
	 */
	function each(list, fn) {
		for (var i = 0, l = list.length; i < l; ++i) {
			if (fn(list[i], i, list) === false) {
				break;
			}
		}
	}

	/**
	 *  Determine the type of the provided value and matches it against the given type (comparing the same length)
	 *  @name    isType
	 *  @access  internal
	 *  @param   mixed   value
	 *  @param   string  type
	 *  @return  bool    is type
	 *  @note    Differentiates between objects and arrays (an array is _never_ determined to be an object)
	 *  @note    lowercase input is assumed
	 */
	function isType(value, type) {
		var detected = typeof value;

		if (detected === T_OBJECT && value instanceof Array) {
			detected = T_ARRAY;
		}

		return detected.substr(0, type.length) === type;
	}

	/**
	 *  Expand all accepted shorthand notations into the appropriate longhand syntax
	 *  @name    shorthand
	 *  @access  public
	 *  @param   mixed   config
	 *  @return  Object  config
	 */
	function shorthand(config) {
		var normalized = {};

		if (isType(config, T_STRING)) {
			normalized[config] = {$exists: true};
		}
		else if (isType(config, T_ARRAY) && config.length) {
			normalized.$and = config;
		}
		else if (isType(config, T_OBJECT)) {
			each(Object.keys(config), function(key) {
				normalized[key] = isType(config[key], T_OBJECT) || starter(key) ? config[key] : {$eq: config[key]};
			});
		}

		return normalized;
	}

	/**
	 *  Obtain the true value of the (potentially) scoped key
	 *  @name    scope
	 *  @access  internal
	 *  @param   Object  model
	 *  @param   mixed   key
	 *  @return  mixed   value
	 *  @note    A scoped key has the pattern 'path.to.nested.key'
	 */
	function scope(model, key) {
		var part = isType(key, T_STRING) ? key.split('.') : [],
			end = part.length ? part.pop() : null,
			result = end ? undefined : key;

		if (part.length) {
			each(part, function(prop) {
				model = prop in model ? model[prop] : false;

				return model;
			});
		}

		return model && end in model ? model[end] : result;
	}

	/**
	 *  Resolve the value from the model if its type does not match the given
	 *  @name    resolve
	 *  @access  internal
	 *  @param   Object  model
	 *  @param   mixed   value
	 *  @param   string  type
	 *  @return  mixed   value
	 */
	function resolve(model, value, type) {
		var scoped;

		if (type && !isType(value, type) && ((scoped = scope(model, value)) !== undefined) && isType(scoped, type)) {
			return scoped;
		}

		return value;
	}

	/**
	 *  Compose a function which automatically resolves the model, key, value into a
	 *  more convenient (mixed) a, (mixed) b signature before calling the verdict function
	 *  @name    compose
	 *  @access  internal
	 *  @param   string    type
	 *  @param   function  verdict
	 *  @return  function  composed
	 *  @note    the composed function has the following signature: function(mixed a, mixed b),
	 *           where `a` is obtained from the key and `b` from the value
	 */
	function compose(type, verdict) {
		return function(object, key, value) {
			var a = scope(object, key),
				b = resolve(object, value, type || typeof a);

			return a !== undefined && b !== undefined && verdict(a, b);
		};
	}

	/**
	 *  Invoke an operation function, if it exists
	 *  @name    operation
	 *  @access  internal
	 *  @param   string  name
	 *  @param   Object  scope  [model]
	 *  @param   mixed   key
	 *  @param   mixed   value
	 *  @return  bool    verdict
	 */
	function operation(name, object, key, value) {
		if (name in operator) {
			return operator[name](object, key, value);
		}

		throw new Error('Operator "' + name + '" not implemented');
	}

	/**
	 *  Match each property config against the model
	 *  @name    matches
	 *  @access  internal
	 *  @param   string  property
	 *  @param   Object  config
	 *  @param   Object  model
	 *  @return  bool    matches
	 */
	function matches(property, config, model) {
		var verdict = null;

		each(Object.keys(config), function(key) {
			verdict = operation(key, model, property, config[key]);

			return verdict;
		});

		return verdict;
	}

	/**
	 *  Evaluate the configuration against the model
	 *  @name    evaluate
	 *  @access  internal
	 *  @param   mixed   config
	 *  @param   Object  model
	 *  @return  bool    matches
	 */
	function evaluate(config, model) {
		var normalized = shorthand(config),
			verdict = false;

		each(Object.keys(normalized), function(key) {
			if (starter(key)) {
				verdict = operation(key, model, normalized[key]);
			}
			else {
				verdict = matches(key, normalized[key], model);
			}

			return verdict;
		});

		return verdict;
	}

	//  Register operators
	operator = {
		//  Comparison

		//  equal to (uses the === operator, only exact matches)
		//  usage:  {field: {$eq: mixed}}
		//  short:  {field: value}
		$eq: compose(null, function(a, b) {
			return a === b;
		}),

		//  greater than
		//  usage:  {field: {$gt: number}}
		$gt: compose(T_NUMBER, function(a, b) {
			return a > b;
		}),

		//  greater than or equal to
		//  usage:  {field: {$gte: number}}
		$gte: compose(T_NUMBER, function(a, b) {
			return a >= b;
		}),

		//  less than
		//  usage:  {field: {$lt: number}}
		$lt: compose(T_NUMBER, function(a, b) {
			return a < b;
		}),

		//  less than or equal to
		//  usage:  {field: {$lte: number}}
		$lte: compose(T_NUMBER, function(a, b) {
			return a <= b;
		}),

		//  not equal to (uses the !== operator, only exact matches)
		//  usage:  {field: {$ne: mixed}}
		$ne: compose(null, function(a, b) {
			return a !== b;
		}),

		//  in (contains)
		//  usage:  {field: {$in: array}}
		$in: compose(T_ARRAY, function(a, b) {
			return b.indexOf(a) >= 0;
		}),

		//  not in (does not contain)
		//  usage:  {field: {$nin: array}}
		$nin: compose(T_ARRAY, function(a, b) {
			return b.indexOf(a) < 0;
		}),

		//  Logical

		//  or, does any condition match
		//  usage:  {$or: [<condition>, ...]}
		//  note:   {$or: <condition>} is allowed (though the syntax is more elaborate than necessary)
		$or: function(object, list) {
			var verdict;

			each([].concat(list), function(config) {
				verdict = evaluate(config, object);

				return !verdict;
			});

			return verdict;
		},

		//  and, do all conditions match
		//  usage:  {$and: [<condition>, ...]}
		//  short:  [<condition>, ...]
		//  note:   {$and: <condition>} is allowed (though the syntax is more elaborate than necessary)
		$and: function(object, list) {
			var verdict;

			each([].concat(list), function(config) {
				verdict = evaluate(config, object);

				return verdict;
			});

			return verdict;
		},

		//  not, do none of the conditions match
		//  usage:  {$not: [<condition>, ...]}
		//  note:   {$not: <condition>} is allowed
		$not: function(object, list) {
			return !operation('$and', object, list);
		},

		//  nor, do neither of the conditions match
		//  usage:  {$nor: [<condition>, ...]}
		//  note:   {$nor: <condition>} is allowed (though the syntax is more elaborate than necessary)
		$nor: function(object, list) {
			return !operation('$or', object, list);
		},

		//  Element

		//  exists, test the existance of the field
		//  usage:  {field: {$exists: bool}}
		//  short:  field
		$exists: function(object, key, value) {
			return (scope(object, key) !== undefined) === resolve(object, value);
		},

		//  type, does the field match the given type
		//  usage:  {field: {$type: string type}}
		//  note:   Valid types are: array, boolean, function, number, object, string.
		//          These may be abbreviated (e.g. boolean > bool, b)
		$type: function(object, key, value) {
			return isType(scope(object, key), value.toLowerCase());
		},

		//  Evaluation

		//  modulo
		//  usage:  {field: {$mod: [int divisor, int remainder]}}
		//  short:  {field: {$mod: int divisor}}, {field: {$mod: [int divisor]}}
		//  note:   if the remainder is omitted, it is set to 0 (no remainder)
		$mod: compose(T_ARRAY, function(a, b) {
			var mod = [].concat(b).concat(0);

			return a % mod[0] === mod[1];
		}),

		//  regex, match the field value against a regular expression
		//  usage:  {field: {$regex: string pattern}}
		//  note:   enclosing characters are optional for simple patterns, though required if any flag is used
		$regex: function(object, key, value) {
			var a = scope(object, key),
				b = scope(object, value) || value,
				match = ('' + b).match(exprRegEx),
				regex = new RegExp(match ? match[2] : value, match ? match[3] : '');

			return regex.test(a);
		},

		//  NOT IMPLEMENTED
		//$text: function(a, b) {},
		//$where: function(a, b) {},

		//  Geospatial

		//  NOT IMPLEMENTED
		//$geoWithin: function() {},
		//$geoIntersects: function() {},
		//$near: function() {},
		//$nearSphere: function() {},

		//  Array

		//  all, does the field match all conditions
		//  usage:  {field: {$all: [<condition>, ...]}}
		//  TODO:  verify if {field: {<condition>, ...}} works the same as $all
		$all: function(object, key, value) {
			var a = scope(object, key).map(function(v) {
					return scope(object, v);
				}),

				verdict;

			each(resolve(object, value, T_ARRAY), function(find) {
				verdict = operation('$in', object, find, a);

				return verdict;
			});

			return verdict;
		},

		//  elemMatch, does the field contain any value matching all conditions
		//  usage:  {field: {$elemMatch: {<condition>, ...}}}
		//  NOTE:  this does not limit the array in any way
		$elemMatch: function(object, key, value) {
			var a = scope(object, key),
				verdict;

			each(a, function(val) {
				verdict = matches(val, value, object);

				return !verdict;
			});

			return verdict;
		},

		//  size, is the field an array of specified size
		//  usage:  {field: {$size: number}}
		$size: compose(T_ARRAY, function(a, b) {
			return isType(a, T_ARRAY) && a.length === b;
		})

		//  Bitwise

		//  NOT IMPLEMENTED
		//$bitsAllSet: function() {},
		//$bitsAnySet: function() {},
		//$bitsAllClear: function() {},
		//$bitsAnyClear: function() {}
	};

	/**
	 *  Evaluate the configuration against the model
	 *  @name    evaluate
	 *  @access  public
	 *  @param   mixed   config
	 *  @param   Object  model
	 *  @return  bool    meets condition(s)
	 */
	condition.evaluate = function(config, model) {
		return config && isType(model, T_OBJECT) ? evaluate(config, model) : false;
	};
}
