var express = require('express');
var util = require('util');
var crypto = require('crypto');
var formidable = require("formidable");
var User = require('../models/user.js');
var Product = require("../models/product.js");
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
                for (var idx = 0; idx < files.length; idx++) {
                    var file = tfiles[idx];

                    var picturename = user + "_" + file.name;

                    Product.existsFile(picturename, function (err, exists) {
                        if (err) {
                            return res.send({success: false, message: err});
                        }
                        if (!exists) {
                            Product.saveFile(file.path, picturename);
                            pictures.push(picturename);
                        }
                    });
                }
            } else {
                var file = tfiles;

                var picturename = user + "_" + file.name;

                Product.existsFile(picturename, function (err, exists) {
                    if (err) {
                        return res.send({success: false, message: err});
                    }
                    if (!exists) {
                        Product.saveFile(file.path, picturename);
                        pictures.push(picturename);
                    }
                });
            }
            return pictures;
        };

        var product = new Product(currentUser.name,
                fields.name,
                fields.details,
                fields.discount,
                uploadNames(currentUser.name, files.files),
                fields.stoptime
                );
//        console.log(product);
        product.save(function (err, model) {

            if (err) {

                return res.send({success: false, message: util.inspect(err)});
            }

            return res.send({success: true, message: '发布产品成功'});
        });

    });

});
router.get("/products", function(req, res){
    Product.get(req.session.username, function(err, products){
        if(err){
            
        }
        return res.send(products);
    });
});
router.post('/images/:id', function (req, res) {
    var filename = req.body.id;
    Product.readFile(filename, function (err, data) {
        res.writeHead(200, {"Content-Type": "image/png"});
        if (err) {
            res.write("ERROR");
        } else {

            res.write(data, "binary");
        }
        res.end();
    });
});
module.exports = router;