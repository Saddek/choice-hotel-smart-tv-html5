/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * @author Mautilus s.r.o.
 * @ignore
 */

if (typeof jQuery !== 'undefined') {
	jQuery.fn.extend({
	/**
	 * $().belongsTo() Check if subset belong to a specified parent element
	 * 
	 * @ignore
	 * @param {Object} parent Parent element, HTMLElement or jQuery collection
	 * @returns {Boolean}
	 */
	belongsTo: function(parent) {
		var el = (parent && parent.nodeType ? parent : parent[0]),
			parents = this.parents();

		for (var i in parents) {
			if (parents.hasOwnProperty(i) && parents[i] === el) {
				return true;
			}
		}

		return false;
	}
	});
}

/*
 * Binding function for prevent scope or global variables.
 * 
 * @param {Function} func called function
 * @param {Object} scope which scope has to function use ?
 * @param {Array} addArg array of arguments which are passed to function
 * @returns {Function} returns new function
 */
function bind(func, scope, addArg) {
	return function () {
		if (addArg) {
			var args = Array.prototype.slice.call(arguments);
			return func.apply(scope, args.concat(addArg));
		}
		else return func.apply(scope, arguments);
	};
}

/**
 * Shortcut to the I18n.translate method
 * 
 * @returns {String};
 */
function __() {
	return I18n.translate.apply(I18n, arguments);
}

/**
 * Convert seconds to movie duration, e.g. 125 min
 * 
 * @param {Number} seconds
 * @returns {String};
 */
function secondsToDuration(seconds) {
	var hour = Math.round(seconds / 3600);
	var min = Math.round((seconds % 3600) / 60);
	if (hour > 0) {
		return hour + ' hour ' + min + ' min';
	} else {
		return min + ' min';
	}
}

/**
 * Convert seconds to hours, e.g. 0:05:23
 * 
 * @param {Number} seconds
 * @returns {String};
 */
function secondsToText(seconds) {
	seconds = Math.round(seconds);
	var hours = Math.floor(seconds / 3600);
	if (hours == 0) {
		return secondsToMinutes(seconds);
	}

	var	minutes = Math.floor((seconds - (hours * 3600)) / 60);
		seconds = Math.floor(seconds - (hours * 3600) - (minutes * 60));

	return ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
}

/**
 * Convert seconds to minutes, e.g. 05:23
 * 
 * @param {Number} seconds
 * @returns {String};
 */
function secondsToMinutes(seconds) {
	var minutes = Math.floor((seconds) / 60);
		seconds = Math.floor(seconds - (minutes * 60));

	return ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
}

/* Modify objects */

//checks if it isn't function implemented yet.
if (!String.prototype.trim) {
	/*
	 * This function removes all white spaces after / behind the string
	 * 
	 * @returns {String};
	 */
	String.prototype.trim = function () {
		return this.replace(/^\s+|\s+$/g, '');
	};
}

//checks if it isn't function implemented yet.
if (!String.prototype.replaceAll) {
	/*
	 * This function replace all occurrence of string inside the string.
	 * 
	 * @param {String} a string which the function is looking for
	 * @param {String} b string for replace
	 * @returns {String};
	 */
	String.prototype.replaceAll = function (a, b) {
		if (!a || !b) return this;
		return this.replace(new RegExp(a, 'gm'), b);
	};
}

//checks if it isn't function implemented yet.
if (!String.prototype.contains) {
	/*
	 * This function returns flag, if the string contains substring
	 * 
	 * @param {String} a substring
	 * @returns {Boolean};
	 */
	String.prototype.contains = function (a) {
		if (this.indexOf(a) >= 0) return true;
		else return false;
	};
}

// checks if it isn't function implemented yet.
if (!String.prototype.format) {
	/*
	 * Replaces each format item in a specified string with the text equivalent of a corresponding object's value. Works like String.Format in C#
	 * @returns {String}
	 */
	String.prototype.format = function () {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function (match, number) {
			return typeof args[number] != 'undefined'
				? args[number]
				: match
			;
		});
	};
}

//checks if it isn't function implemented yet.
if (!String.prototype.ucfirst) {
	/*
	 * Convert string to the string with first letter in uppercase. Example: first -> First
	 * @returns {String}
	 */
	if (!String.prototype.ucfirst) {
		String.prototype.ucfirst = function() {
			return this.charAt(0).toUpperCase() + this.slice(1);
		}
	}
}

/**
 * redirect with timeout call
 * @param location
 * @param timeout
 */
function redirect(location, timeout) {
	if (typeof(timeout) == und) {
		timeout = 0;
	}
	setTimeout(function() {
		window.location.href = location;
	}, timeout);
}
/**
 *
 * @param str
 * @returns {string}
 */
function urlDecode(str) {
	return decodeURIComponent((str+'').replace(/\+/g, '%20'));
}

/**
 *
 * @param text
 * @returns {{}}
 */
function transformToAssocArray( text ) {
	var params = {};
	var prmarr = text.split("&");
	for ( var i = 0; i < prmarr.length; i++) {
		var tmparr = prmarr[i].split("=");
		params[tmparr[0]] = urlDecode(tmparr[1]);
	}
	return params;
}

/**
 *
 * @param name
 * @returns {*}
 */
function getParameter(name) {
	var prmstr = window.location.search.substr(1);
	var parameters = prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
	if (parameters && typeof (parameters[name]) != und) {
		return parameters[name];
	} else {
		return null
	}
}

/**
 * Get element ClientRect  - position, widh, height of element in WINDOW
 * @param el
 * @returns {ClientRect}
 */
function elementPos(el) {
	//special bonus for those using jQuery        `
	if (typeof jQuery === "function" && el instanceof jQuery) {
		el = el[0];
	}
	return el.getBoundingClientRect();
}

function cd(variable) {
	return console.dir(variable);
}

function getNextFocus($container) {
	var $lastActive = $container.find('.focusable.' + activeClass);
	return $lastActive.length ? $lastActive : $container.find('.focusable:eq(0)');
}