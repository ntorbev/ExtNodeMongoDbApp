module.exports = {
    development: {
        db: 'mongodb://localhost/chat',
        port: process.env.PORT || 8080
    },
    production: {
        db: 'mongodb://admin:adminext@ds029454.mongolab.com:29454/extnodemongo',
        port: process.env.PORT || 8080
    }
};
// db = mongojs('mongodb://username:password@ds31341.mongolab.com:32132/mydb', ["mycollection"], {authMechanism: 'ScramSHA1'});
