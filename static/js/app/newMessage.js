(function ($) {
	'use strict';

	var form = document.querySelector('form'),
		textField = form.querySelector('#text'),
		submitButton = form.querySelector('input[type="submit"]');

	submitButton.addEventListener('click', function (event) {
		$.post('/api/new-message', {
			text: textField.value
		}, function (savedMessage) {
			console.log(savedMessage);
		});

		event.preventDefault();
	});
})(jQuery);
