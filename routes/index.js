var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var util = require('util');
var formidable = require("formidable");
var User = require('../models/user.js');
var Discount = require("../models/product.js");
/* GET home page. */

router.post('/', function (req, res) {
    Discount.get(null, function (err, discounts) {
        if (err) {
            discounts = [];
        }
        res.send({
            datas: discounts,
            user: req.session.user
        });
    });
});
router.get('/json', function (req, res) {
        var  jsonArray= [

            { "category": "animals", "type": "Pets",picture:"icon.png" },

            { "category": "animals", "type": "Farm Animals" ,picture:"icon.png"},

            { "category": "animals", "type": "Wild Animals",picture:"icon.png" },

            { "category": "colors", "type": "Blue" ,picture:"icon.png"},

            { "category": "colors", "type": "Green" ,picture:"icon.png"},

            { "category": "colors", "type": "Orange" ,picture:"icon.png"},

            { "category": "colors", "type": "Purple" ,picture:"icon.png"},

            { "category": "colors", "type": "Red" ,picture:"icon.png"},

            { "category": "colors", "type": "Yellow" ,picture:"icon.png"},

            { "category": "colors", "type": "Violet" ,picture:"icon.png"},

            { "category": "vehicles", "type": "Cars" ,picture:"icon.png"},

            { "category": "vehicles", "type": "Planes" ,picture:"icon.png"},

            { "category": "vehicles", "type": "Construction" ,picture:"icon.png"}

        ];
    res.send({
            datas: jsonArray,
            success:true
        });
});
router.post('/discount', function (req, res) {
    //throw new Error('An Error for test purpose.');
    Discount.get(null, function (err, discounts) {
        if (err) {
            discounts = [];
        }
        res.send({
            datas: discounts,
            user: req.session.user
        });
    });
    //res.render('index', { title: '首页' });
});



router.post("/logout", checkLogin);
router.post("/logout", function (req, res) {
    req.session.user = null;
    res.send({success: '退出成功'});
});

router.post("/login", checkNotLogin);
router.post("/login", function (req, res) {

    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    User.get(req.body.username, function (err, user) {
        if (!user) {
            return res.send({error: '用户不存在'});
        }

        if (user.password !== password) {
            return res.send({error: '用户名或密码错误'});
        }
        req.session.user = user;
//        req.flash('success', req.session.user.name + '登录成功');
        res.send({success: true, message: req.session.user.name + '登录成功'});
    });
});
router.post("/reg", checkNotLogin);
router.post("/reg", function (req, res) {

//    console.log('password:' + req.body['password']);
//    console.log('password-repeat:' + req.body['repassword']);
    if (req.body['repassword'] !== req.body['password']) {
        return res.send({error: '两次输入的密码不一致'});
    }
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    var newUser = new User({
        name: req.body.username,
        password: password,
        nicky: req.body.nicky
    });

    //检查用户名是否已经存在
    User.get(newUser.name, function (err, user) {

        if (user) {
            err = '用户已经存在.';
        }
        if (err) {
//            console.log('test:' + err);
//	req.flash('error', err);
            return res.send({error: err});
        }

        newUser.save(function (err) {
            if (err) {
//	  req.flash('error', err);
                return res.send({error: err});
            }
            req.session.user = newUser;
            res.send({success: true, message: req.session.user.name + '注册成功'});
        });
    });
});

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        return res.send({error: '用户已经登录'});
    }
    next();
}
function checkLogin(req, res, next) {

    if (!req.session.user) {
        return res.send({error: '用户尚未登录'});
    }
    next();
}

router.post("/postdiscount", checkLogin);
router.post("/postdiscount", function (req, res) {
    var currentUser = req.session.user;
    var form = new formidable.IncomingForm();
    
    form.parse(req, function (err, fields, files) {
        console.log('in if condition' + util.inspect({fields: fields, files: files}));
//        fs.writeFile("upload/" + files.upload.name, files.upload, 'utf8', function (err) {
//            if (err)
//                throw err;
//            console.log('It\'s saved!');
//            client.putFile("upload/" + files.upload.name, files.upload.name, function (err, res) {
//                if (err)
//                    throw err;
//                if (200 == res.statusCode) {
//                    console.log('saved to s3');
//
//                    httpres.writeHead(200, {'content-type': 'text/plain'});
//                    httpres.write('received 1upload:\n\n');
//                    httpres.end();
//                }
//            });
//        });
        res.send({success: true,message:'发布折扣成功'});
    });
//    var name = req.body.imagefile0;
//    console.log(name);
//    var discount = new Discount(currentUser.name, req.body.discount, req.body.name, req.body.details, name, req.body.stoptime, req.body.discount);
//    discount.save(function (err) {
//        if (err) {
//            return res.send({error: err});
//        }
//        res.send({success: '发布折扣成功'});
//    });
});

//router.get("/u/:user", function (req, res) {
//    User.get(req.params.user, function (err, user) {
//        if (!user) {
//            req.flash('error', '用户不存在');
//            return res.redirect('/blog');
//        }
//        Discount.get(user.name, function (err, posts) {
//            if (err) {
//                req.flash('error', err);
//                return res.redirect('/blog');
//            }
//            res.render('user', {
//                title: user.name,
//                posts: posts
//            });
//        });
//    });
//});

module.exports = router;
