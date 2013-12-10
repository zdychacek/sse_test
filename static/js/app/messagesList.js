(function ($, EventStreamListener) {
	'use strict';

	function addMessageToList (message) {
		var msgEl = document.createElement('li');
		msgEl.innerHTML = JSON.stringify(message);
		
		$(messagesList).prepend(msgEl);
	}

	var stream = new EventStreamListener('/stream'),
		messagesList = document.getElementById('message-list');

	stream.on('new-message', function (message, event) {
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
		messages.forEach(addMessageToList);
	});
})(jQuery, window.EventStreamListener);
