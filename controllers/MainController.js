'use strict';

var EventStream = require('../lib/EventStream'),
	Message = require('../models/Message');

module.exports.addRoutes = function (app) {
	// vytvori testovaci data
	Message.generateTestMessages(10);

	// render stranky se seznamem zprav	
  app.get('/', function (req, res) {
		res.render('messagesList');
	});

  // render stranky s formularem pro vytvoreni nove zpravy
	app.get('/new-message', function (req, res) {
		res.render('newMessage');
	});

	// vytvoreni event streamu
	var stream = new EventStream(app, {
		url: '/stream'
	});

	app.namespace('/api', function () {
		// vraci seznam vsech zprav
		app.get('/get-all-messages', function (req, res) {
			var messages = Message.getAll();

			res.json(messages);
		});

		// vytvori novou zpravu
		app.post('/new-message', function (req, res) {
			var message = new Message(req.body);

			message.save(function (savedMessage) {
				// zapisu do streamu informaci o tom, ze byla vytvorena nova zprava
				stream.write(savedMessage, 'new-message');

				res.json(savedMessage);
			});
		});
	});
};
