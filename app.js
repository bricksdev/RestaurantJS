var fs = require('fs');
var accessLogfile = fs.createWriteStream('access.log', {flags: 'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags: 'a'});
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');
var flash = require('connect-flash');
var csrf = require('./csrf');
var routes = require('./routes/index');
var users = require('./routes/users');
var productRoutes = require('./routes/product');
var util = require('util');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//设置跨域访问
var allowCrossDomain = function (req, res, next) {
    // Added other domains you want the server to give access to
    // WARNING - Be careful with what origins you give access to
    // 此处为了验证允许访问的IP及跨域的ip与域名，做好安全控制,localhost ip (10.9.68.45)
    var allowedHost = [
        'http://life.szldkj.net',
        'http://192.168.0.102',
        'http://192.168.0.102:8099',
        "file://"
    ];
    //console.log(req.headers);
    if (req.headers.origin) {
        if (allowedHost.indexOf(req.headers.origin) !== -1) {
            res.header('Access-Control-Allow-Credentials', true);
            res.header('Access-Control-Allow-Origin', req.headers.origin);
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
            next();
        } else {
            res.send({auth: false});
        }
    } else if (req.headers.host) {
        if (req.originalUrl.indexOf("/images") !== -1) {
            // 图片请求不设定其他响应头
            next();
        } else if (allowedHost.indexOf("http://" + req.headers.host) !== -1) {
            // 此处修改只是限定手机APP才能运行进一步访问，否则只反馈欢迎信息，便于验证服务器是否正常运行
            if (req.headers["x-requested-with"]) {
                res.header('Access-Control-Allow-Credentials', true);
                //res.header('Access-Control-Allow-Origin', req.headers.host);
                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
                next();
            } else {
                res.send("<html><body><h1>凌動創智歡迎您!</h1></body></html>");
            }
        } else {
            res.send({auth: false});
        }
    } else {
        res.send("<html><body><h1>凌動創智歡迎您!</h1></body></html>");

    }


};

app.use(favicon());
app.use(logger('dev'));
app.use(logger({stream: accessLogfile}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());


//cookie解析的中间件
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

//提供session支持
app.use(session({
    secret: settings.cookieSecret,
    // 此处将session保存到mongodb中
    store: new MongoStore({
        db: settings.db
    }),
//    maxAge: new Date(Date.now() + 3600000),
    cookie: {path: "/", httpOnly: true}
}));
app.use(allowCrossDomain);
app.use(csrf.check);

app.use(function (req, res, next) {

    next();
});


app.use('/', routes);
if (!module.parent) {
    app.listen(8099);
    //console.log("Express服务器启动, 开始监听 %d 端口, 以 %s 模式运行.", app.address().port, app.settings.env);
}

app.use('/users', users);
app.use('/product', productRoutes);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        var meta = '[' + new Date() + ']' + req.url + '\n';
        errorLogfile.write(meta + err.stack + '\n');
        next();
        res.status(err.status || 500);
        res.send({success: false,
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    var meta = '[' + new Date() + ']' + req.url + '\n';
    errorLogfile.write(meta + err.stack + '\n');
    next();
    res.status(err.status || 500);
    res.send({success: false,
        message: err.message,
        error: err
    });
});


module.exports = app;
