(function () {
	'use strict';

	var source = new window.EventSource('/stream');

	source.addEventListener('message', function (e) {
		console.log(e.data);
	}, false);
})();
