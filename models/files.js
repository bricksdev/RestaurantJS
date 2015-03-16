var gridfsStore = require('../dborm/gridfs.js');
module.exports = {
    saveFile: function (file, filename) {
        gridfsStore.writeFile(file, filename);
    },
    readFile: function (filename, callback) {
        gridfsStore.readFile(filename, callback);
    },
    existsFile: function (filename, callback) {
        gridfsStore.existsFile(filename, callback);
    }
};