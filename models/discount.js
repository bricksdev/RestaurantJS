var mongodb = require('../dborm/db.js');

function Discount(username, discount, name, details, picture, stoptime, time) {
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

module.exports = Discount;

Discount.prototype.save = function save(callback) {

    var Discount = {
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

        db.collection('discounts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

             collection.ensureIndex('user');
             collection.ensureIndex('discount');
            collection.insert(Discount, {safe: true}, function (err, discount) {
                mongodb.close();
                callback(err, discount);
            });
        });
    });
};
Discount.get = function get(username, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('discounts', function (err, collection) {
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

                var discounts = [];
                docs.forEach(function (doc, index) {
                    var discount = new Discount(doc.user, doc.discount, doc.time);
                    discounts.push(discount);
                });
                callback(null, discounts);
            });
        });
    });
};
