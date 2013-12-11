'use strict';

var PubSub = require('./PubSub');

/**
 * Konstruktor
 * @class EventStream
 * @param {Object} app     Reference na instanci Express serveru
 * @param {Object} options Konfiguracni nastaveni.
 */
function EventStream (app, options /* url, retryTimeout, responseDelay */) {
	options || (options = {});

	if (!app || !options.url) {
		throw new Error('You must specify app reference and stream URL.');
	}

	// reference na aplikaci kvuli naveseni obsluhy pozadavku
	this._app = app;
	
	// Publish-Subscriber komunikace
	this._pubSub = new PubSub();
	
	// po jak dlouhe dobe se ma klient pokouset obnovit spojeni
	this._retryTimeout = options.retryTimeout;

	// na jak dlouhou dobu se ma pozadavek pozdrzet
	this._responseDelay = options.responseDelay || Infinity;
	
	// URL, na ktere je mozne se prihlasit k odberu udalosti
	this._streamUrl = options.url;
	
	// pocitadlo odeslanych zprav, slouzi jako Last-Message-Id
	this._messagesCounter = 0;

	// nstavim spojeni ke klientovi
	this._initResponse();
}

/**
 * Navesi obsluhu requestu a zaregistruje posluchace, ktery zapisuje do streamu.
 * @private
 */
EventStream.prototype._initResponse = function () {
	var app = this._app,
		stream = this;

	// navesim obsluhu pozadavku
	app.get(this._streamUrl, function (req, res) {
		// nastavim timeout spojeni
		req.setTimeout(stream._responseDelay);

		var subscriptionId = stream._pubSub.subscribe('write', function (topic, event) {
			stream._writeEventData(res, {
				id: ++stream._messagesCounter,
				retry: stream._retryTimeout,
				event: event.type,
				data: event.data
			});
		});
		
		// odeslani hlavicek
		res.writeHead(200, {
			'Content-Type': 'text/event-stream;charset=utf-8',
			'Cache-Control': 'no-cache',
			// kvuli IE < 10
			'Access-Control-Allow-Origin': '*'
		});

		// IE < 10, 2KB padding
		res.write(':' + Array(2049).join(' ') + '\n');

		// pokud je nastaven retry timeout, tak ho musim zapsat okamzite
		stream._writeEventData(res, {
			retry: stream._retryTimeout
		});

		// pri zavreni okna browseru
		req.on('close', function() {
			stream._pubSub.unsubscribe(subscriptionId);
		});
	});
};

/**
 * Helper metoda, ktera naformatuje a zapise informaci o udalosti do objektu odpovedi.
 * @private
 * @param  {Object} res     Reference na instanci odpovedi.
 * @param  {Object} data 		Data pro zapis.
 */
EventStream.prototype._writeEventData = function (res, data /* event, data, id, retry */) {
	var buffer = [];

	data || (data = {});

	data.retry && buffer.push('retry: ' + data.retry);
	(typeof data.id !== 'undefined') && buffer.push('id: ' + data.id);
	data.event && buffer.push('event: ' + data.event);
	(typeof data.data !== 'undefined') && buffer.push('data: ' + JSON.stringify(data.data));

	// kazdy udaj musi byt zakoncem '\n'
	res.write(buffer.join('\n'));
	// data musi byt zakoncena sekvenci '\n\n'
	res.write(new Array(3).join('\n'));
};

EventStream.prototype.write = function (data, event) {
	this._pubSub.publish('write', {
		type: event,
		data: data
	});
};

// public API export
module.exports = EventStream;
