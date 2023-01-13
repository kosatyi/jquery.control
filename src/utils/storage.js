function BackupStorage() {}

BackupStorage.prototype = {
    getItem: function (key) {
        return this[key];
    },
    setItem: function (key, value) {
        this[key] = value;
    },
    removeItem: function (key) {
        delete this[key];
    },
    clear: function () {
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                delete this[key];
            }
        }
    }
};

const StorageProvider = ('localStorage' in global && global['localStorage']) ? global['localStorage'] : new BackupStorage;

module.exports = StorageProvider;