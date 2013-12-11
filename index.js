'use strict';

require('express-namespace');

var express = require('express'),
		app = express(),
		secret = 'qwertz',
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

// registrace routes
require('./controllers/MainController').addRoutes(app);
 
app.listen(PORT);
console.log('Express server listening on port %d', PORT);
