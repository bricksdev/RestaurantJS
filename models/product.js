var mongoose = require('../dborm/db.js');
var ProcuctSchema = mongoose.Schema(
        {user: String,
            name: String,
            details: String,
            picture: Array,
            discount: Number,
            stoptime: {type: Date, default: Date.now}
        });
var Product = mongoose.Mongoose.model('products', ProcuctSchema);

module.exports = Product;