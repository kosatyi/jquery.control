import { StorageProvider } from './storage'

export const StorageCache = {
    storageProvider: StorageProvider,
    set: function (key, data, ttl) {
        ttl = new Date().getTime() + ttl * 1000 * 60
        try {
            StorageProvider.setItem(['cache', key, 'ttl'].join(':'), ttl)
            StorageProvider.setItem(
                ['cache', key].join(':'),
                JSON.stringify(data)
            )
        } catch (e) {
            StorageProvider.clear()
        }
        return this
    },
    expire: function (key) {
        StorageProvider.removeItem(['cache', key, 'ttl'].join(':'))
        StorageProvider.removeItem(['cache', key].join(':'))
        return this
    },
    exist: function (key) {
        let ttl = Storage.getItem(['cache', key, 'ttl'].join(':'))
        return !!(ttl && ttl > new Date().getTime())
    },
    get: function (key) {
        return JSON.parse(Storage.getItem(['cache', key].join(':')))
    },
    list: function () {
        let key,
            list = []
        for (key in StorageProvider) {
            if (StorageProvider.hasOwnProperty(key)) {
                if (
                    key.indexOf('cache:') !== -1 &&
                    key.indexOf(':ttl') === -1
                ) {
                    list.push(key.slice(6))
                }
            }
        }
        return list
    },
    clear: function (force) {
        this.list().forEach(
            function (key) {
                ;(force === true || this.exist(key) === false) &&
                    this.expire(key)
            }.bind(this)
        )
    },
}
