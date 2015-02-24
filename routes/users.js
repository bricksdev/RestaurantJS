var express = require('express');
var crypto = require('crypto');
var csrf = require('../csrf');
var User = require('../models/user.js');
var router = express.Router();


router.get('/session', function (req, res) {
    // This checks the current users auth
    // It runs before Backbones router is started
    // we should return a csrf token for Backbone to use
    if (typeof req.session.username !== 'undefined') {
        res.send({auth: true, id: req.session.id, username: req.session.username, _csrf: req.session._csrf});
    } else {
        res.send({auth: false, _csrf: req.session._csrf});
    }
});

router.post('/login', function (req, res) {
    // Login
    // Here you would pull down your user credentials and match them up
    // to the request

    console.log(req.body);
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
        req.session.username = req.body.username;
//        req.flash('success', req.session.user.name + '登录成功');
//        res.send({success: true, message: req.session.user.name + '登录成功'});
        res.send({auth: true, id: req.session.id, username: req.session.username, message: req.session.user.name + '登录成功'});
    });

});

router.delete('/logout/:id', function (req, res, next) {
    // Logout by clearing the session
    req.session.regenerate(function (err) {
        // Generate a new csrf token so the user can login again
        // This is pretty hacky, connect.csrf isn't built for rest
        // I will probably release a restful csrf module
        csrf.generate(req, res, function () {
            res.send({auth: false, _csrf: req.session._csrf});
        });
    });
});

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
            req.session.username = req.body.username;
            res.send({auth: true, message: req.body.username + '注册成功'});
        });
    });
});
module.exports = router;
