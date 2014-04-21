/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var storage = require(path.join(__dirname, 'lib/storage.js'));

var app = express();

app.configure(function() {
	//    app.set('port', process.env.PORT || 3000);
	app.set('port', process.env.VCAP_APP_PORT || 3000);

	app.set('views', path.join(__dirname, '/views'));
	app.set('view engine', 'ejs');
	app.use(express.favicon(__dirname + '/public/favicon.ico'));
	app.use(express.logger('dev'));
	//app.use(express.bodyParser());
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(express.cookieParser('SECRET KEY!'));
	app.use(express.cookieSession());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});
var index = 'public/index.min.html';
app.configure('development', function() {
	app.use(express.errorHandler());
	index = 'public/index.html';
});

app.get('/', function(req, res) {
	res.sendfile(path.join(__dirname, index));
});

//download image from canvas
app.post('/download', function(req, res) {
	var image = req.body.image;
	var base64Data = image.replace(/^data:image\/png;base64,/, "");
	var binaryData = new Buffer(base64Data, 'base64').toString('binary');
	res.header({
		'Content_type' : 'image/png',
		'Content-Disposition' : 'attachment; filename=\"download.png\"'
	});
	res.end(binaryData, 'binary');
});
//share
app.post('/share/save', function(req, res) {
	var pattern = req.body.pattern;
	pattern = JSON.parse(pattern);
	res.header({
		'Content-Type' : 'application/json'
	});
	storage.writePattern(pattern, function(e, id) {
		if (!e) {
			res.json(200, {
				patternId : id
			});
		} else {
			console.error(e);
			res.json(200, {
				error : e.message
			});

		}
	});
});
//share load pattern
app.get('/share/load/:patternId', function(req, res) {
	var patternId = req.params.patternId;
	storage.loadPattern(patternId, function(id, content) {
		if (id) {
			res.json(200, content);
		} else {
			res.json(200, {
				error : 'Can not load pattern.'
			});

		}
	});
});

http.createServer(app).listen(app.get('port'), function() {
	console.log("--==START==--");
	console.log("Express server listening on port " + app.get('port'));
	console.log("Storage lib version:" + storage.version);
});
