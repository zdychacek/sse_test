;(function ($, EventStreamListener) {
	'use strict';
	
	// vytvoreni posluchace udalosti
	var stream = new EventStreamListener('/stream'),
		messagesList = document.getElementById('message-list');

	function addMessageToList (message) {
		var msgEl = document.createElement('li');
		msgEl.innerHTML = JSON.stringify(message);
		
		$(messagesList).prepend(msgEl);
	}

	function removeStreamListener () {
		stream.off(handlerDescriptor);
	}

	var handlerDescriptor = stream.on('new-message', function (message, event) {
		addMessageToList(message);
	});

	stream.onOpen(function (event) {
		console.log('Connection opened...');
	});

	stream.onError(function (event) {
		console.log('Connection error...');
	});

	// stahnu seznam zprav
	$.getJSON('/api/get-all-messages', function (messages) {
		$.each(messages, function (i, message) {
			addMessageToList(message);
		});
	});
})(jQuery, window.EventStreamListener);
