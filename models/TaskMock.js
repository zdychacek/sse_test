'use strict';

var PubSub = require('../lib/PubSub');

/**
 * Mock vypocetne narocne ukolu.
 */
function TaskMock () {
	this._progress = 0;
	this._stepTime = 1000;
	this._isRunning = false;
	this._pubSub = new PubSub();
}

/**
 * Spusti vypocet
 */
TaskMock.prototype.compute = function () {
	var task = this;

	task._progress = 0;
	task._isRunning = true;
	task._pubSub.publish('update', task);

	function _do () {
		task._progress += 10;

		var isComplete = (task._progress == 100);

		if (isComplete) {
			task._isRunning = false;
			task._pubSub.publish('update', task);
		}
		else {
			task._pubSub.publish('update', task);
			setTimeout(_do, task._stepTime);
		}
	}

	setTimeout(_do, task._stepTime);
};

/**
 * Registruje posluchace, ktery bude zavolan pri zmene progresu vypoctu.
 * @param  {Function} callback Funkce, ktera bude volana pri teto udalosti.
 */
TaskMock.prototype.onUpdate = function (callback) {
	this._pubSub.subscribe('update', callback);
};

/**
 * Vraci ciselny udaj o stavu vypoctu (%).
 * @return {Number} Stav vypoctu vyjadreny v procentech.
 */
TaskMock.prototype.getProgress = function () {
	return this._progress;
};

/**
 * Vraci souhrny popis stavu vypoctu.
 * @return {Object} Obsahuje informaci o tom, zda vypocet jeste bezi a procentualni stav
 */
TaskMock.prototype.getStatus = function () {
	return {
		isRunning: this.isRunning(),
		progress: this.getProgress()
	};
};

/**
 * Vraci priznak, zda vypocet stale bezi.
 * @return {Boolean}
 */
TaskMock.prototype.isRunning = function () {
	return this._isRunning;
};

// public API
module.exports = TaskMock;