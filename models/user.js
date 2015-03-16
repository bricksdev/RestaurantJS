var mongoose = require('../dborm/db.js');

var UserSchema = mongoose.Schema(
        {
            name: String,
            password: String,
            nicky: String
        });
var User = mongoose.Mongoose.model('users', UserSchema);
module.exports = User;
