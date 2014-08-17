
module.exports = function(app, models)
{
//    var index = require('./controller');
    var user = require('./controller/user');

    /* set models */
    user.model = models.User;

//    /* set controllers */
//    app.get('/', index.index);

    //read
    app.get('/users', user.read);
    //create
    app.post('/users', user.add);
    //update
//    app.put('/users', user.update);
//    //remove
    app.delete('/users', user.destroy);
}