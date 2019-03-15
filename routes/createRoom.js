var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
const fileUpload = require('express-fileupload');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('createRoom');
});

module.exports = router;
