var settings = require('../settings'),
        mongodb = require("mongodb"),
        Db = mongodb.Db,
        Server = mongodb.Server,
        Connection = mongodb.Connection,
        GridfsStore = mongodb.GridStore;
var db = new Db(settings.db + "-files", new Server(settings.host, Connection.DEFAULT_PORT, {}), {safe: true});
var newGridStore = function (file, filename) {
    db.open(function (err, db) {
        var gridStore = new GridfsStore(db, filename, "w", {
            metadata: {
                author: "szldkj.net"
            },
            chunk_size: 1024 * 4
        });

        gridStore.open(function (err, gridStore) {//打开

            gridStore.write(file, function (err, gridStore) {
                gridStore.close(function (err, result) {
                    db.close();
                    if(err){
                        throw err;
                    }
                    console.log("file upload!", result);
                    
                });
            });
        });

    });

};

var readGridStore = function (filename, callback) {
    db.open(function (err, db) {
    var gridStore = new GridfsStore(db, filename, "r");
    gridStore.open(function (err, gridStore) {//打开
        if(err){
                callback(err);
            }
        console.log('contentType:' + gridStore.contentType);
        console.log('uploadDate:' + gridStore.uploadDate);
        console.log('chunkSize:' + gridStore.chunkSize);
        console.log('metadata:' + gridStore.metadata);
        gridStore.read(db, filename, function(err, data){
            db.close();
            if(err){
                callback(err);
            }
            callback(err,data);
        });
    });

    
});
};

var existsFile = function (filename,callback) {
    console.log(filename," exists check");
    
    GridfsStore.exist(db, filename, function (err, exists) {
        
        if (err){
            callback(err);
        }
        console.log(filename, err, exists);
        
        callback(exists,exists);
    });
    

};
module.exports = {
    writeFile: newGridStore,
    readFile: readGridStore,
    existsFile: existsFile
};
