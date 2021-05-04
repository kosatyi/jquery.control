var $ = require('jquery');

var Storage = require('./storage');

var Cache = {
    set: function (key, data, ttl) {
        ttl = new Date().getTime() + (ttl * 1000 * 60);
        try {
            Storage.setItem(['cache',key,'ttl'].join(':'), ttl);
            Storage.setItem(['cache',key].join(':'), JSON.stringify(data));
        } catch (e) {
            Storage.clear();
        }
        return this;
    },
    expire: function (key) {
        Storage.removeItem(['cache', key, 'ttl'].join(':'));
        Storage.removeItem(['cache', key].join(':'));
        return this;
    },
    exist: function (key) {
        var ttl = Storage.getItem(['cache', key, 'ttl'].join(':'));
        return !!(ttl && ttl > new Date().getTime());
    },
    get: function (key) {
        return JSON.parse(Storage.getItem(['cache', key].join(':')));
    },
    list: function () {
        var key,list = [];
        for (key in Storage) {
            if (Storage.hasOwnProperty(key)) {
                if (key.indexOf('cache:') !== -1 && key.indexOf(':ttl') === -1) {
                    list.push(key.slice(6));
                }
            }
        }
        return list;
    },
    clear: function (force) {
        this.list().forEach(function (key) {
            (force === true || this.exist(key) === false) && this.expire(key);
        }.bind(this));
    }
};

module.exports = Cache;