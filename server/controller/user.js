exports.read = function (req, res) {
    var params = req.body;

    exports.model.User.find({}, function (err, rec) {
        res.send({success: true, User: rec});
    });
};
exports.add = function (req, res) {
    var params = req.body,
        item;
    if(params.update){
        var params = req.body.rec, id = params._id;
        delete params._id;

        exports.model.User.update({"_id": id},{ $set : params}, {upsert:false}, function (err) {
            if(!err) {
                res.send({success: true});
            }
            else {
                res.send({success: false});
            }
        });
        return;
    }
    item = new exports.model.User(params);

    item.save(function(err) {
        if(!err) {
            res.send({success: true, users:{ userInfo:item,finishedTaskInfo:{comments:item._doc.comments,time:item._doc.time}}});
        }
        else {
            res.send({success: false, User: item});
        }
    });
};
exports.update = function (req, res) {
    var params = req.body, id = params._id;

    //remove id from values to update
    delete params._id;

    exports.model.User.update({"_id": id},{ $set : params}, {upsert:false}, function (err) {
        if(!err) {
            res.send({success: true});
        }
        else {
            res.send({success: false});
        }
    });
};
exports.destroy = function (req, res) {
    var params = req.body;

    exports.model.User.remove({"_id": params._id}, function (err) {
        if(!err) {
            res.send({success: true});
        }
        else {
            res.send({success: false});
        }
    });
};