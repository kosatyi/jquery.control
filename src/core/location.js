import $ from './jquery'
import {deparam} from "../utils/deparam";

let skip = false;

const urlLocation = {
    prefix: '#',
    type: 'hash',
    event: 'hashchange',
    callbacks: [],
    initialize: false,
    url: function (url, replace) {
        location[replace === true ? 'replace' : 'assign'](url);
        return this;
    },
    normalize: function (url) {
        let prefix = this.prefix;
        if (url.indexOf('http') === 0) prefix = '';
        else if (url.indexOf('#') === 0) prefix = '';
        return [prefix, url].join('');
    },
    assign: function (url, silent) {
        skip = silent;
        return this.url(this.normalize(url));
    },
    replace: function (url, silent) {
        skip = silent;
        return this.url(this.normalize(url), true);
    },
    href: function () {
        return location[this.type].slice(1);
    },
    part: function (index) {
        return this.href().split('#')[0].split('?')[index] || '';
    },
    query: function (value, replace, silent) {
        if (arguments.length) {
            value = value ? [this.part(0), $.param(value)].join('?') : this.part(0);
            this[replace ? 'replace' : 'assign'](value, silent);
        } else {
            return deparam(this.part(1));
        }
    },
    path: function (value, replace, silent) {
        if (arguments.length) {
            value = this.part(1) ? [value, this.part(1)].join('?') : value || '/';
            this[replace ? 'replace' : 'assign'](value, silent);
        } else {
            return this.part(0);
        }
    },
    json: function (value, replace, silent) {
        let href = this.href();
        let chunk = href.split('#')[0].split('?')[1] || '{}';
        if (arguments.length) {
            value = value ? [this.part(0), JSON.stringify(value)].join('?') : this.part(0);
            this[replace ? 'replace' : 'assign'](value, silent);
        } else {
            try {
                chunk = decodeURIComponent(chunk);
                chunk = JSON.parse(chunk);
            } catch (e) {
                chunk = {};
            }
            return chunk;
        }
    },
    bind: function (callback) {
        this.callbacks.push(callback);
        this.changeHandler = this.changeHandler || this.change.bind(this)
        if (this.initialize === false) {
            window.addEventListener(this.event,this.changeHandler)
            this.initialize = true;
        }
    },
    unbind: function (callback) {
        this.callbacks.splice(this.callbacks.indexOf(callback), 1);
    },
    host: function () {
        return location.host;
    },
    indexOf: function (str, index) {
        return this.href().indexOf(str) === index;
    },
    change: function () {
        let index;
        if (skip === true) {
            return skip = false;
        }
        if (this.callbacks.length) {
            for (index in this.callbacks) {
                if (this.callbacks.hasOwnProperty(index)) {
                    this.callbacks[index].call(this);
                }
            }
        }
    }
};

export {urlLocation}