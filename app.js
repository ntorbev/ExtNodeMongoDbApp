var express=require('express'),
	app = express(),
	mongoose = require('mongoose'),
	models = {
    	User: require('./server/model/user')(mongoose)
	},
	dbPath = 'mongodb://localhost/data';

mongoose.connect(dbPath, function onMongooseError(err) {
    if (err) throw err;
});

require('./server/config/express')(app,express);
require('./server/router')(app,models);

app.listen(3000);
console.log('Listening on port 3000');
