import $ from './jquery'
import {Class} from './class'
import {isArray, isPlainObject, forEach, sortObject, isFunction} from '../utils'
/**
 *
 * @type {{}}
 */
const classes = {};

/**
 * @name Model
 * @type {Class|*}
 */
const Model = Class.extend({
    init: function (data) {
        this.extend(data);
    },
    extend: function (data) {
        if (data) {
            this.$data = data;
        } else {
            this.$data = {};
        }
    },
    alt: function (prop, defaults) {
        prop = this.attr(prop);
        return typeof (prop) === 'undefined' ? defaults : prop;
    },
    ns: function (name) {
        let context = this;
        let chunk = name.split('.');
        let child = this.attr(chunk.slice(0, -1).join('.'));
        if (child instanceof Model) {
            context = child;
        }
        return [context, chunk.slice(-1).join('.')];
    },
    on: function (name, callback) {
        let ns = this.ns(name);
        $.event.add(ns[0], ns[1], callback);
        return this;
    },
    off: function (name, callback) {
        let ns = this.ns(name);
        $.event.remove(ns[0], ns[1], callback);
        return this;
    },
    trigger: function (name, data) {
        let ns = this.ns(name);
        $.event.trigger(ns[1], data, ns[0], true);
        return this;
    },
    $update: function () {

    },
    $change: function () {

    },
    defer: function () {
        return $.Deferred();
    },
    resolve: function () {
        return this.defer().resolve(this);
    },
    attr: function (key, value) {
        let i = 0, tmp,
            data = this.$data,
            name = (key || '').split('.'),
            prop = name.pop(),
            len = arguments.length;
        for (; i < name.length; i++) {
            if (data && data.hasOwnProperty(name[i])) {
                if (data[name[i]] && isFunction(data[name[i]]['attr'])) {
                    tmp = [key.split('.').slice(i + 1).join('.')];
                    len === 2 && tmp.push(value);
                    return data[name[i]].attr.apply(data[name[i]], tmp);
                } else {
                    data = data[name[i]];
                }
            } else {
                if (len === 2) {
                    data = (data[name[i]] = {});
                } else {
                    break;
                }
            }
        }
        if (len === 1) {
            return data ? data[prop] : undefined;
        }
        if (len === 2) {
            tmp = data[prop];
            data[prop] = value;
            this.$change(key, value, tmp);
        }
        return this;
    },
    eachItem: function (args) {
        let name = args[1] ? args[0] : null;
        let callback = args[1] ? args[1] : args[0];
        let value = name ? this.alt(name, []) : this.$data;
        return {
            value: sortObject(value),
            isArray: isArray(value),
            callback: callback
        }
    },
    each: function () {
        let each = this.eachItem(arguments);
        forEach(each.value, function (value, key) {
            each.callback(this.instance(value), value, key);
        }, this);
    },
    attrs: function (props) {
        this.$data = (function callback(data, parent, path) {
            let prop
            for (prop in data) {
                if (data.hasOwnProperty(prop)) {
                    if (parent[prop] && isFunction(parent[prop]['attrs'])) {
                        parent[prop].attrs(data[prop], prop);
                    } else {
                        if (isArray(data[prop]) || isPlainObject(data[prop])) {
                            if (isArray(data[prop])) parent[prop] = parent[prop] || [];
                            if (isPlainObject(data[prop])) parent[prop] = parent[prop] || {};
                            callback.call(this, data[prop], parent[prop], prop);
                        } else {
                            parent[prop] = data[prop];
                        }
                    }
                    this.$change(path ? path.concat('.', prop) : prop, data[prop], parent[prop]);
                }
            }
            return parent;
        }).call(this, props, this.$data);
        this.$update(props, this.$data);
        return this;
    },
    serialize: function () {
        return (function callback(result, data) {
            let prop;
            for (prop in data) {
                if (data.hasOwnProperty(prop)) {
                    if (data[prop] && isFunction(data[prop]['serialize'])) {
                        result[prop] = data[prop].serialize();
                    } else {
                        if (isArray(data[prop]) || isPlainObject(data[prop])) {
                            if (isArray(data[prop])) result[prop] = [];
                            if (isPlainObject(data[prop])) result[prop] = {};
                            callback.call(this, result[prop], data[prop]);
                        } else {
                            result[prop] = data[prop]
                        }
                    }
                }
            }
            return result;
        }).call(this, isArray(this.$data) ? [] : {}, this.$data);
    },
    stringify: function () {
        return JSON.stringify(this.serialize());
    }
});
/**
 *
 * @param name
 * @param extend
 * @param proto
 * @returns {*}
 */
function createModel(name, extend, proto) {
    if (classes[name]) {
        return classes[name];
    }
    classes[name] = (proto ? classes[extend] : Model).extend(proto ? proto : extend, name);
    return classes[name];
}
/**
 *
 * @param name
 * @param data
 * @returns {*}
 */
function getModel(name, data) {
    if (typeof (classes[name]) !== 'function') return;
    return new classes[name](data);
}

export {
    Model,
    getModel,
    createModel,
}
