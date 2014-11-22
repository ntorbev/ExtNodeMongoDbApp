//module.exports = function(app) {
//    /* GET home page. */
//    app.get('/', function (req, res) {
//        res.render('index', { title: 'nickApp' });
//    });
//};
exports.index = function(req, res){
    res.render('index', { title: 'DevJS - Ext JS4' });
};