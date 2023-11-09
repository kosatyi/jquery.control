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
        for (let key in this) {
            if (this.hasOwnProperty(key)) {
                delete this[key];
            }
        }
    }
};

const backupStorage = new BackupStorage()

const StorageProvider = ('localStorage' in window && window['localStorage']) ? window['localStorage'] : backupStorage;

export {
    StorageProvider
}