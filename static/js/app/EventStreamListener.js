// http://www.html5rocks.com/en/tutorials/eventsource/basics/

(function (document) {
	'use strict';

	var EventSource = window.EventSource;

	function EventStreamListener (url) {
		if (!url) {
			throw new Error('You must specify URL.');
		}

		this._eventSource = new EventSource(url);
	}

	EventStreamListener.prototype.on = function (/* event, callback */) {
		// posledni argument je callback
		var callback = arguments[arguments.length - 1],
			// typ udalosti je bud prvni parametr v pripade zadani vice parametru nebo 'message'
			eventType = arguments.length > 1? arguments[0] : 'message';

		if (typeof callback !== 'function') {
			throw new Error('You must specify callback function.');
		}

		this._eventSource.addEventListener(eventType, function (event) {
			// zkontroluji puvod udalosti
			if (event.origin != document.location.origin) {
				throw new Error('Bad origin!');
			}

			var data = event.data;

			// zkusim zprasovat jako objekt
			try {
				data = JSON.parse(data);
			}
			catch (ex) {}

			callback(data, event);
		});
	};

	EventStreamListener.prototype.onOpen = function (callback) {
		this._eventSource.addEventListener('open', function (event) {
			callback(event);
		});
	};

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
