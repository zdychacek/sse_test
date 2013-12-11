/**

 */
;(function (document) {
	'use strict';

	var EventSource = window.EventSource;

	/**
	 * Konstruktor EventStreamListener
	 * @class EventStreamListener
	 * @description Implementace wrapperu EventSource
	 * @see http://www.html5rocks.com/en/tutorials/eventsource/basics/
	 * @param {String} url URL adresa streamu udalosti.
	 */
	function EventStreamListener (url) {
		if (!url) {
			throw new Error('You must specify URL.');
		}

		this._eventSource = new EventSource(url);
	}

	/**
	 * Registruje posluchace nad urcitym typem udalosti pokud je specifikovana konkretni udalost, jinak nasloucha vsem udalosti
	 * @return {Array} Deskriptor posluchace - kombinace typu udalosti a reference na navesenou funkci
	 */
	EventStreamListener.prototype.on = function (/* event, callback */) {
		// posledni argument je callback
		var callback = arguments[arguments.length - 1],
			// typ udalosti je bud prvni parametr v pripade zadani vice parametru nebo 'message'
			eventType = arguments.length > 1? arguments[0] : 'message';

		if (typeof callback !== 'function') {
			throw new Error('You must specify callback function.');
		}

		var handler = function (event) {
			// zkontroluji puvod udalosti
			/*if (event.origin != document.location.origin) {
				throw new Error('Bad origin!');
			}*/

			var data = event.data;

			// zkusim zprasovat jako objekt
			try {
				data = JSON.parse(data);
			}
			catch (ex) {}

			callback(data, event);
		};

		this._eventSource.addEventListener(eventType, handler);

		// vratim handle obsluhy
		return [eventType, handler];
	};

	/**
	 * Rusi registraci posluchace.
	 * @see EventStreamListener#on
	 * @param  {Array} handlerDescriptor Deskriptor posluchace
	 */
	EventStreamListener.prototype.off = function (handlerDescriptor) {
		this._eventSource.removeEventListener.apply(this._eventSource, handlerDescriptor);
	};

	/**
	 * Ukoncuje spojeni.
	 */
	EventStreamListener.prototype.close = function () {
		this._eventSource.close();
	};

	/**
	 * Registrace posluchace udalosti pri otevreni spojeni.
	 * @param  {Function} callback Funkce, ktera se zavola pri navazani spojeni.
	 */
	EventStreamListener.prototype.onOpen = function (callback) {
		this._eventSource.addEventListener('open', callback);
	};

	/**
	 * Registrace posluchace udalosti pri chybe.
	 * @param  {Function} callback Funkce, ktera se zavola pri preruseni spojeni.
	 */
	EventStreamListener.prototype.onError = function (callback) {
		this._eventSource.addEventListener('error', function (event) {
			if (event.readyState == EventSource.CLOSED) {
				callback(event);
			}
		});
	};

	// API export
	window.EventStreamListener = EventStreamListener;

})(window.document);
