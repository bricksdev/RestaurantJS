var settings = require('../settings'),
        mongoose = require('mongoose'),
        GridfsStore = mongoose.mongo.GridStore;

var mongooseDb = mongoose.createConnection('mongodb://'+settings.host+"/"+settings.db + "-files",{safe: true});
mongooseDb.on('error', console.error.bind(console, 'connection error:'));
mongooseDb.once('open', function (callback) {
  console.log("mongoose db is opening.");
});
mongooseDb.once('close', function (callback) {
  console.log("mongoose db is closed.");
});
var db = mongooseDb.db;
var newGridStore = function (file, filename, callback) {
//    db.open(function (err, db) {
//        if (err) {
//            throw err;
//        }
        GridfsStore.exist(db, filename, function (err, exists) {
            if (err) {
                throw err;
            }
            if (exists) {
//                db.close();
                return;
            }
            var gridStore = new GridfsStore(db, filename, "w", {
                metadata: {
                    author: "szldkj.net"
                },
                chunk_size: 1024 * 4
            });

            gridStore.open(function (err, gridStore) {//打开
//                console.log(err, gridStore);
                if (err) {

                    throw err;
                }
                gridStore.writeFile(file, function (err, gridStore) {
//                    console.log(file);
                    if (err) {

                        throw err;
                    }
                    gridStore.close(function (err, result) {
//                        db.close();
                        if (err) {
                            if (callback) {
                                callback(err);
                            }
                        }
//                        console.log("file upload!", result);
                        if (callback) {
                            callback(err, result);
                        }
                    });
                });
            });
        });



//    });

};

var readGridStore = function (filename, callback) {
//    db.open(function (err, db) {
//        if (err) {
//            throw err;
//        }
        GridfsStore.exist(db, filename, function (err, exists) {
            if (err) {
                
                throw err;
            }

            // 文件存在
            if (!exists) {
//                db.close();
                return;
            }
            GridfsStore.read(db, filename, function (err, fileData) {
//                db.close();
                callback(err, fileData);

            });

        });


//    });
};

var existsFile = function (filename, callback) {
//    db.open(function (err, db) {
//        if (err) {
//            throw err;
//        }
        GridfsStore.exist(db, filename, function (err, exists) {
//            db.close();
            if (err) {
                callback(err);
            }

            callback(exists, exists);
        });

//    });
};
module.exports = {
    writeFile: newGridStore,
    readFile: readGridStore,
    existsFile: existsFile
};
