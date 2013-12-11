'use strict';

var EventStream = require('../lib/EventStream'),
	Message = require('../models/Message'),
	Task = require('../models/TaskMock');

/**
 * Registruje jednotlive routy.
 * @param {Object} app Reference na instanci Express serveru.
 */
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

	// render stranky s progress barem
	app.get('/progress', function (req, res) {
		res.render('progressPage');
	});

	// stream, do ktereho budu zapisovat udalosti
	var stream = new EventStream(app, {
		url: '/stream'
	});

	// mock casove narocneho tasku
	var task = new Task();
	
	task.onUpdate(function (task) {
		stream.write(task.getStatus(), 'task-progress-changed');
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

		// spousti task
		app.get('/task-start', function (req, res) {
			if (!task.isRunning()) {
				task.compute();
			}

			res.end();
		});

		// zjistuje stav tasku
		app.get('/task-progress', function (req, res) {
			res.json(task.getStatus());
		});
	});
};
