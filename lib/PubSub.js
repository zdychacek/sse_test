'use strict';

function PubSub () {
	this._topics = {};
	this._subUid = -1;
}

PubSub.prototype.publish = function (topic, args) {
	var topics = this._topics;

	if (!topics[topic]) {
		return false;
	}

	setTimeout(function () {
		var subscribers = topics[topic],
			len = subscribers ? subscribers.length : 0;

		while (len--) {
			subscribers[len].func(topic, args);
		}
	}, 0);

	return true;	
};

PubSub.prototype.subscribe = function (topic, func) {
	var topics = this._topics;

	if (!topics[topic]) {
		topics[topic] = [];
	}

	var token = (++this._subUid).toString();

	topics[topic].push({
		token: token,
		func: func
	});

	return token;
};

PubSub.prototype.unsubscribe = function (token) {
	var topics = this._topics;

	for (var m in topics) {
		if (topics[m]) {
			for (var i = 0, j = topics[m].length; i < j; i++) {
				if (topics[m][i].token === token) {
					topics[m].splice(i, 1);
					return token;
				}
			}
		}
	}

	return false;
};

module.exports = PubSub;
