'use strict';

var express = require('express'),
		routes  = require('./routes'),
		app = express(),
		secret = 'qwertz',
		PubSub = require('./lib/PubSub'),
		PORT = process.env.PORT;

app.configure(function (){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.cookieParser(secret));
	app.use(express.session({ secret: secret }));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use('/static', express.static(__dirname + '/static'));
});

app.configure('development', function(){
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	})); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});

app.get('/', function (req, res){
	res.render('index');
});

app.get('/stream', function (req, res) {
	var messageCount = 0;

	// timeout nastavim na nekonecno
	req.setTimeout(Infinity);
 
	var subscriptionId = PubSub.subscribe('updates', function (topics, message) {
		messageCount++;
 
		res.write('id: ' + messageCount + '\n');
		res.write('data: ' + message + '\n\n'); // Note the extra newline
	});
   
	// odeslani hlavicek
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});
	res.write('\n');
 
	// pri zavreni okna browseru
	req.on('close', function() {
		PubSub.unsubscribe(subscriptionId);
	});
});
 
app.get('/fire-event/:event_name', function (req, res) {
	PubSub.publish('updates', '"' + req.params.event_name + '" page visited');

	res.writeHead(200, {
		'Content-Type': 'text/html'
	});
	res.write('All clients have received "' + req.params.event_name + '"');
	res.end();
});
 
app.listen(PORT);
console.log('Express server listening on port %d', PORT);
