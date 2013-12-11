;(function ($, EventStreamListener) {
	'use strict';

	var $progressBar = $('#progress-bar'),
		$progressBarValue = $('.value', $progressBar),
		$btnStart = $('#start-task'),
		$statusLabel = $('#status');

	var stream = new EventStreamListener('/stream');

	stream.on('task-progress-changed', function (progress, event) {
		updateView(progress);
	});

	function showTaskRunningView () {
		$btnStart.hide();
		$progressBar.show();
	}

	function showTaskNotRunningView () {
		$btnStart.show();
		$progressBar.hide();
	}

	function setProgressBarValue (value) {
		$progressBarValue.css('width', value + '%');
	}

	function getProgress () {
		$.getJSON('/api/task-progress', updateView);
	}

	function updateView (task) {
		if (task.isRunning) {
			showTaskRunningView();
		}
		else {
			showTaskNotRunningView();
		}

		setProgressBarValue(task.progress);
		$statusLabel.html(JSON.stringify(task));
	}

	$btnStart.on('click', function () {
		$.get('/api/task-start');
	});

	getProgress();
})(jQuery, window.EventStreamListener);