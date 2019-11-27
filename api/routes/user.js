'use strict'

var express = require('express')
var UserController = require('../controllers/user')

var api = express.Router();

api.get('/', UserController.home);
api.get('/pruebas', UserController.pruebas);

module.exports = api;

