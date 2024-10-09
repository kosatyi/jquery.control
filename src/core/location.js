import { deparam } from './deparam'

let silenceEvent = false

export const UrlLocation = {
    prefix: '#',
    type: 'hash',
    event: 'hashchange',
    callbacks: [],
    initialize: false,
    url: function (url, replace) {
        location[replace === true ? 'replace' : 'assign'](url)
        return this
    },
    getSilence() {
        return silenceEvent
    },
    setSilence(value) {
        silenceEvent = Boolean(value)
        return this
    },
    normalize(url) {
        let prefix = String(this.prefix)
        if (url.indexOf('http') === 0) prefix = ''
        else if (url.indexOf(prefix) === 0) prefix = ''
        return [prefix, url].join('')
    },
    assign(url, silence) {
        return this.setSilence(silence).url(this.normalize(url), false)
    },
    replace(url, silence) {
        return this.setSilence(silence).url(this.normalize(url), true)
    },
    route(route, silence) {
        const url = this.normalize(route)
        if (this.href() !== url) {
            return this.setSilence(silence).url(url, false)
        }
        return this.reload()
    },
    reload() {
        return this.setSilence(false).change()
    },
    origin() {
        return location.origin
    },
    host() {
        return location.host
    },
    href() {
        return location[this.type].slice(1)
    },
    indexOf(str, index) {
        return this.href().indexOf(str) === index
    },
    part(index) {
        return this.href().split('#')[0].split('?')[index] || ''
    },
    query(value, replace, silence) {
        if (arguments.length) {
            value = value
                ? [this.part(0), $.param(value)].join('?')
                : this.part(0)
            this[replace ? 'replace' : 'assign'](value, silence)
        } else {
            return deparam(this.part(1))
        }
    },
    path(value, replace, silence) {
        if (arguments.length) {
            value = this.part(1)
                ? [value, this.part(1)].join('?')
                : value || '/'
            this[replace ? 'replace' : 'assign'](value, silence)
        } else {
            return this.part(0)
        }
    },
    json(value, replace, silence) {
        let href = this.href()
        let chunk = href.split('#')[0].split('?')[1] || '{}'
        if (arguments.length) {
            value = value
                ? [this.part(0), JSON.stringify(value)].join('?')
                : this.part(0)
            this[replace ? 'replace' : 'assign'](value, silence)
        } else {
            try {
                chunk = decodeURIComponent(chunk)
                chunk = JSON.parse(chunk)
            } catch (e) {
                chunk = {}
            }
            return chunk
        }
    },
    bind(callback) {
        this.callbacks.push(callback)
        this.changeHandler = this.changeHandler || this.change.bind(this)
        if (this.initialize === false) {
            window.addEventListener(this.event, this.changeHandler)
            this.initialize = true
        }
    },
    unbind(callback) {
        this.callbacks.splice(this.callbacks.indexOf(callback), 1)
    },
    change() {
        if (this.getSilence()) return this.setSilence(false)
        if (this.callbacks.length) {
            for (const index in this.callbacks) {
                if (this.callbacks.hasOwnProperty(index)) {
                    this.callbacks[index].call(this)
                }
            }
        }
        return this
    },
}
