var settings = require('../settings'),
    mongoose = require('mongoose');
    
var mongooseDb = mongoose.createConnection('mongodb://'+settings.host+"/"+settings.db,{safe: true});
//var db = mongooseDb.db;
mongooseDb.on('error', console.error.bind(console, 'connection error:'));
mongooseDb.once('open', function (callback) {
  console.log("mongoose db is opening.");
});
mongooseDb.once('close', function (callback) {
  console.log("mongoose db is closed.");
});
module.exports = {Mongoose:mongooseDb,
    Schema:mongoose.Schema};
