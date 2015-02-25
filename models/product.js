var mongodb = require('../dborm/db.js');
var gridfsStore = require('../dborm/gridfs.js');

function Product(username, discount, name, details, picture, stoptime, time) {
    this.user = username;
    this.discount = discount;
    this.name = name;
    this.details = details;
    this.picture = picture;
    this.stoptime = stoptime;

    if (stoptime) {
        this.stoptime = stoptime;
    } else {
        this.stoptime = new Date();
    }
    if (time) {
        this.time = time;
    } else {
        this.time = new Date();
    }
}
;

module.exports = Product;
// 添加clone方法
Product.clone = function(cloneobj){
  var product = new Product();
  for(var key in cloneobj){
      product[key] = cloneobj[key];
  }
    return product;
};

Product.prototype.save = function save(callback) {

    var Product = {
        user: this.user,
        name: this.name,
        details: this.details,
        picture: this.picture,
        discount: this.discount,
        stoptime: this.stoptime,
        time: this.time
    };
    mongodb.open(function (err, db) {
        
        if (err) {
            return callback(err);
        }
        
        db.collection('products', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
//            console.log(collection);
//             collection.ensureIndex({'user':1});
//             collection.ensureIndex({'discount':2});
            collection.insert(Product, {safe: true}, function (err, discount) {
                mongodb.close();
                callback(err, discount);
            });
        });
    });
};
Product.get = function get(username, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('products', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (username) {
                query.user = username;
            }
            collection.find(query).sort({time: -1}).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    callback(err, null);
                }

                var products = [];
                docs.forEach(function (doc, index) {
                    var product = Product.clone(doc);
                    products.push(product);
                });
                callback(null, products);
            });
        });
    });
};

Product.saveFile = function(file, filename){
  gridfsStore.writeFile(file, filename);
  
};

Product.readFile=function(filename, callback){
    gridfsStore.readFile(filename,callback);
};

Product.existsFile=function(filename, callback){
    gridfsStore.existsFile(filename,callback);
};