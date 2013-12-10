'use strict';

var PubSub = require('./PubSub');

function EventStream (app, streamUrl, retryTimeout) {
	if (!app || !streamUrl) {
		throw new Error('You must specify app reference and stream URL.');
	}

	this._pubSub = new PubSub();
	this._retryTimeout = retryTimeout;
	this._app = app;
	this._streamUrl = streamUrl;
	this._messagesCounter = 0;

	// nstavim spojeni ke klientovi
	this._initResponse();
}

EventStream.prototype._initResponse = function () {
	var app = this._app,
		stream = this;

	app.get(this._streamUrl, function (req, res) {
		// timeout nastavim na nekonecno
		req.setTimeout(Infinity);

		var subscriptionId = stream._pubSub.subscribe('write', function (topic, event) {
			var eventType = event.type,
				data = event.data;

			// odeslani dat
			res.write('id: ' + (++stream._messagesCounter) + '\n');
			
			if (eventType) {
				res.write('event: ' + eventType + '\n');
			}

			if (stream._retryTimeout) {
				res.write('retry: ' + stream._retryTimeout + '\n');
			}

			res.write('data: ' + JSON.stringify(data) + '\n\n');
		});
		
		// odeslani hlavicek
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		});
		res.write('\n');

		// pri zavreni okna browseru
		req.on('close', function() {
			stream._pubSub.unsubscribe(subscriptionId);
		});
	});
};

EventStream.prototype.write = function (data, event) {
	this._pubSub.publish('write', {
		type: event,
		data: data
	});
};

module.exports = EventStream;
