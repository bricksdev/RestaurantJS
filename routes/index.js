var express = require('express');
var app = express();
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Discount = require("../models/discount.js");
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

router.post("/login",checkNotLogin);
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
router.post("/reg",checkNotLogin);
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
        nicky:req.body.nicky
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
        return res.send({error:'用户已经登录'});
    }
    next();
}
function checkLogin(req, res, next) {
    if (!req.session.user) {
        return res.send({error:'用户尚未登录'});
    }
    next();
}

router.post("/post", checkLogin);
router.post("/post", function (req, res) {
    var currentUser = req.session.user;
    var post = new Discount(currentUser.name, req.body.post);
    post.save(function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/blog');
        }
        req.flash('success', '发表成功');
        res.redirect('/u/' + currentUser.name);
    });
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
