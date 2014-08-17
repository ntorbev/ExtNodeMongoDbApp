var express = require('express');
var router = express.Router();
module.exports = function(app) {
    /* GET home page. */
    app.get('/', function (req, res) {
        res.render('index', { title: 'nickApp' });
    });


    /* GET Userlist page. */
//    app.get('/userlist', function (req, res) {
//        var db = req.db;
//        var collection = db.get('usercollection');
//        collection.find({}, {}, function (e, docs) {
//            res.render('userlist', {
//                "userlist": docs
//            });
//        });
//    });
}
//module.exports = router;
