/*global global*/
'use strict';

/**
 *  Observer wrapper (choosing wisely between MutationObserver and MutationEvents)
 *  @name     Observer
 *  @package  Kontext
 */
function /*jshint unused: false*/Observer()/*jshint unused: true*/ {
	var observer = this,
		mutation;

	/**
	 */
	function init() {
		var mutationObserver = global.MutationObserver || global.webkitMutationObserver || false;

		//if-included istanbul ignore next
		if (mutationObserver) {
			mutation = {
				observer: mutationObserver,
				config: {
					characterData: true,
					characterDataOldValue: true
				}
			};
		}
	}

	/**
	 *  Cast a value into the same type as the origin, enabling coercion
	 *  @name    cast
	 *  @access  internal
	 *  @param   mixed  origin
	 *  @param   mixed  value
	 *  @return  mixed  casted value
	 */
	function cast(origin, value) {
		var type = typeof origin;

		switch (type) {
			case 'boolean':
				return !!value;

			case 'number':
				return +value;
		}

		return value;
	}

	/**
	 *  Persist a value to the model
	 *  @name    persist
	 *  @access  internal
	 *  @param   function  delegate
	 *  @param   mixed     value
	 *  @return  void
	 */
	function persist(delegation, value) {
		var current = delegation(),
			casted = cast(current, value);

		if (casted !== current) {
			delegation(casted);
		}
	}

	/**
	 *  Observe the DOMElement(s) bound to the model key and persist changes from outside Kontext
	 *  @name    monitor
	 *  @access  public
	 *  @param   DOMText   text
	 *  @param   function  delegate
	 *  @return  void
	 */
	observer.monitor = function(text, delegation) {
		//if-included istanbul ignore next
		if (mutation) {
			new mutation.observer(function(mutations) {
				mutations.forEach(function(mutated) {
					persist(delegation, mutated.target.nodeValue);
				});
			}).observe(text, mutation.config);
		}
		else if (text.addEventListener) {
			text.addEventListener('DOMCharacterDataModified', function(event) {
				persist(delegation, event.newValue);
			});
		}
	};

	init();
}
