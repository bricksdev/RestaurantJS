var express = require('express');
var util = require('util');
var crypto = require('crypto');
var formidable = require("formidable");
var User = require('../models/user.js');
var fs = require("fs");
var Product = require("../models/product.js");
var gridfsStore = require("../models/files.js");
var router = express.Router();
/* GET home page. */
router.post("/publish", function (req, res) {
    var currentUser = req.session.user;
    var form = new formidable.IncomingForm({multiples: true});

    form.parse(req, function (err, fields, files) {
        if (err) {
            throw err;
        }

        var uploadNames = function (user, tfiles) {
            var pictures = [];

            if (util.isArray(tfiles)) {
                for (var idx = 0; idx < tfiles.length; idx++) {
                    var file = tfiles[idx];

                    var picturename = user + "_" + file.name;

                    gridfsStore.saveFile(file.path, picturename);

                    pictures.push(picturename);
                }
            } else {
                var file = tfiles;

                var picturename = user + "_" + file.name;

                gridfsStore.saveFile(file.path, picturename);

                pictures.push(picturename);
            }

            return pictures;
        };
        var pro = {
            user: currentUser.name,
            name: fields.name,
            details: fields.details,
            picture: uploadNames(currentUser.name, files.files),
            discount: fields.discount,
            stoptime: fields.stoptime
        };
        var product = new Product(pro);
        product.save(function (err, model) {

            if (err) {

                return res.send({success: false, message: util.inspect(err)});
            }

            return res.send({success: true, message: '发布产品成功'});
        });

    });

});
router.get("/products", function (req, res) {
    Product.find({user:req.session.username}, function (err, products) {
        if (err) {
            return res.send({success: false, message: util.inspect(err)});
        }

        return res.send({success: true, datas: products});
    });
});
router.get('/images/:id', function (req, res) {
    
    var filename = req.params.id;
//    console.log(filename);
    if (filename) {
        gridfsStore.readFile(filename, function (err, data) {
//            console.log(err, data);
            res.writeHead(200, {"Content-Type": "image/png"});
//            res.encoding('binary');
            if (err) {
                res.write("ERROR");
            } else {

                res.write(data, "binary");
            }
            
            res.end();
        });
    }
});
module.exports = router;