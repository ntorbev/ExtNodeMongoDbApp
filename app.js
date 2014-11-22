var express = require('express');
var mongoose = require('mongoose');
var models = {
    User: require('./server/model/user')(mongoose)
};

var app = express();
var dbPath = 'mongodb://localhost/data';
mongoose.connect(dbPath, function onMongooseError(err) {
    if (err) throw err;
});

require('./server/config/express')(app,express);
//require('./server/index')(app);
require('./server/router')(app,models);

app.listen(3000);
console.log('Listening on port 3000');
