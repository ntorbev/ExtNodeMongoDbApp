var express=require('express'),
    app = express(),
    mongoose = require('mongoose'),
    models = {
        User: require('./server/model/user')(mongoose)
    },
    env = process.env.NODE_ENV || 'development',
    config = require('./server/config/config')[env];

mongoose.connect(config.db, function onMongooseError(err) {
    if (err) throw err;
});

require('./server/config/express')(app,express);
require('./server/router')(app,models);

app.listen(config.port);

console.log('Listening on port 8080');
