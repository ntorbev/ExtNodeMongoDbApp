var express = require('express');
var mongoose = require('mongoose');
var models = {
    User: require('./server/model/user')(mongoose)
};
//var db = monk('localhost:27017/nodeExtTest');
var app = express();
require('./server/config/express')(app);
require('./server/index')(app);
var dbPath = 'mongodb://localhost/data';
mongoose.connect(dbPath, function onMongooseError(err) {
    if (err) throw err;
});

//app.use(function(req,res,next){
//    req.db = dbPath;
//    next();
//});
/// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//    var err = new Error('Not Found');
//    err.status = 404;
//    next(err);
//});
/// error handlers
// development error handler
// will print stacktrace
//if (app.get('env') === 'development') {
//    app.use(function(err, req, res, next) {
//        console.log(55555);
//        res.status(err.status || 500);
//        res.render('error', {
//            message: err.message,
//            error: err
//        });
//    });
//}
// production error handler
// no stacktraces leaked to user
//app.use(function(err, req, res, next) {
//    res.status(err.status || 500);
//    res.render('error', {
//        message: err.message,
//        error: {}
//    });
//});
require('./server/router')(app,models);
//module.exports = app;
app.listen(3000);
console.log('Listening on port 3000');
