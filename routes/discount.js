var express = require('express');
var app = express();
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Discount = require("../models/discount.js");
/* GET home page. */
