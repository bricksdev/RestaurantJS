var settings = require('../settings'),
        mongodb = require("mongodb"),
        Db = mongodb.Db,
        Server = mongodb.Server,
        Connection = mongodb.Connection,
        GridfsStore = mongodb.GridStore;
var db = new Db(settings.db + "-files", new Server(settings.host, Connection.DEFAULT_PORT, {}), {safe: true});
var newGridStore = function (file, filename, callback) {
    db.open(function (err, db) {
        if (err) {
            throw err;
        }
        GridfsStore.exist(db, filename, function (err, exists) {
            if (err) {
                throw err;
            }
            if (exists) {
                return;
            }
            var gridStore = new GridfsStore(db, filename, "w", {
                metadata: {
                    author: "szldkj.net"
                },
                chunk_size: 1024 * 4
            });

            gridStore.open(function (err, gridStore) {//打开
                console.log(err, gridStore);
                if (err) {

                    throw err;
                }
                gridStore.writeFile(file, function (err, gridStore) {
                    console.log(file);
                    if (err) {

                        throw err;
                    }
                    gridStore.close(function (err, result) {
                        db.close();
                        if (err) {
                            if (callback) {
                                callback(err);
                            }
                        }
                        console.log("file upload!", result);
                        if (callback) {
                            callback(err, result);
                        }
                    });
                });
            });
        });



    });

};

var readGridStore = function (filename, callback) {
    db.open(function (err, db) {
        if (err) {
            throw err;
        }
        GridfsStore.exist(db, filename, function (err, exists) {
            if (err) {

                throw err;
            }
            // 文件存在
            if (exists) {
//                var gridStore = new GridfsStore(db, filename, "r", {
//                    metadata: {
//                        author: "szldkj.net"
//                    },
//                    chunk_size: 1024 * 2
//                });
                GridfsStore.read(db, filename, function(err, fileData) {
//                gridStore.open(function (err, gridStore) {//打开
//
//                    if (err) {
//
//                        throw err;
//                    }
//                    gridStore.read(function (err, data) {
//
//                        if (err) {
//                            callback(err);
//                        }
//                    console.log(data);
                        callback(err, fileData);
                        db.close();
//                        gridStore.close(function (err, result) {
//                            
//                            db.close();
//                            
//                        });

                    });
//                });

            }
        });


    });
};

var existsFile = function (filename, callback) {
    console.log(filename, " exists check");

    GridfsStore.exist(db, filename, function (err, exists) {
        console.log(filename, err, exists);
        if (err) {
            callback(err);
        }

        callback(exists, exists);
    });


};
module.exports = {
    writeFile: newGridStore,
    readFile: readGridStore,
    existsFile: existsFile
};
