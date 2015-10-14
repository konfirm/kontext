/*global Emission*/
;(function(global) {
	'use strict';

	//  load dependencies
	//@include lib/emission

	function Kontext() {
		var kontext = this,
			emission = new Emission(),
			buffer;

		/**
		 *  Register an event handler
		 *  @name    on
		 *  @access  public
		 *  @param   string    type
		 *  @param   function  handle
		 *  @return  function  handle
		 */
		kontext.on = function(type, handle) {
			return emission.add(type, handle);
		};

		/**
		 *  Remove an event handler
		 *  @name    off
		 *  @access  public
		 *  @param   string    type
		 *  @param   function  handle
		 *  @return  Array     removed handles
		 */
		kontext.off = function(type, handle) {
			return emission.remove(type, handle);
		};
	}

	//  create a new Kontext instance in the global scope
	global.kontext = global.kontext || new Kontext();

})(window);
