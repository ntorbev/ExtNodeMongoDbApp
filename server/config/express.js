var express = require('express'),
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');
    var router = require('../router');

module.exports = function(app, config) {
    app.set('view engine', 'jade');

    app.set('views', path.join(__dirname, '../../views'));
    app.use(favicon());

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, '../../public')));

};