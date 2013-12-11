'use strict';

var id = -1,
	messages = [];

/**
 * Model zpravy.
 */
function Message (data) {
	data || (data = {});

	this.id = ++id;
	this.text = data.text;
}

Message.prototype.save = function (callback) {
	this.creationDate = +new Date();
	
	messages.push(this);

	if (typeof callback === 'function') {
		callback(this);
	}
};

Message.getAll = function () {
	return messages;
};

Message.generateTestMessages = function (count) {
	var prevCount = messages.length;
	prevCount++;

	for (var i = 0; i < count; i++) {
		var msg = new Message({
			text: 'Zprava cislo ' + prevCount + count
		});

		msg.save();
	}
};

module.exports = Message;
