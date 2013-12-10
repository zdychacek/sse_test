'use strict';

var EventStream = require('../lib/EventStream'),
	Message = require('../models/Message');

module.exports.addRoutes = function (app) {
	Message.generateTestMessages(10);

	// view methods --------------------------------------------------
  app.get('/', function (req, res) {
		res.render('messagesList');
	});

	app.get('/new-message', function (req, res) {
		res.render('newMessage');
	});

	// ajax methods	--------------------------------------------------
	var stream = new EventStream(app, '/stream');

	app.get('/api/get-all-messages', function (req, res) {
		var messages = Message.getAll();

		res.json(messages);
	});

	app.post('/api/new-message', function (req, res) {
		var message = new Message(req.body);

		message.save(function (savedMessage) {
			// zapisu do streamu
			stream.write(savedMessage, 'new-message');

			res.json(savedMessage);
		});
	});
};
