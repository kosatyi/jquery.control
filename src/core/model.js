const $ = require('jquery');
const Class = require('./class');
/**
 *
 * @type {{}}
 */
const classes = {};
/**
 *
 * @param value
 * @returns {*}
 */
const isArray = function (value) {
    return $.isArray(value);
};
/**
 *
 * @param value
 * @returns {*}
 */
const isPlainObject = function (value) {
    return $.isPlainObject(value);
};
/**
 *
 * @param object
 * @param callback
 * @param thisArg
 */
const forEach = function (object, callback, thisArg) {
    var prop, context = thisArg || callback;
    for (prop in object) {
        if (object.hasOwnProperty(prop)) {
            callback.call(context, object[prop], prop)
        }
    }
};
/**
 *
 * @param obj
 * @returns {{}}
 */
const sortObject = function (obj) {
    return Object.keys(obj).sort().reduce(function (result, key) {
        result[key] = obj[key];
        return result;
    }, {});
};
/**
 * @name Model
 * @type {Class|*}
 */
var Model = Class.extend({
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
        var context = this;
        var chunk = name.split('.');
        var child = this.attr(chunk.slice(0, -1).join('.'));
        if (child instanceof Model) {
            context = child;
        }
        return [context, chunk.slice(-1).join('.')];
    },
    on: function (name, callback) {
        var ns = this.ns(name);
        $.event.add(ns[0], ns[1], callback);
        return this;
    },
    off: function (name, callback) {
        var ns = this.ns(name);
        $.event.remove(ns[0], ns[1], callback);
        return this;
    },
    trigger: function (name, data) {
        var ns = this.ns(name);
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
        var i = 0, tmp,
            data = this.$data,
            name = (key || '').split('.'),
            prop = name.pop(),
            len = arguments.length;
        for (; i < name.length; i++) {
            if (data && data.hasOwnProperty(name[i])) {
                if (data[name[i]] && typeof (data[name[i]]['attr']) === 'function') {
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
        var name = args[1] ? args[0] : null;
        var callback = args[1] ? args[1] : args[0];
        var value = name ? this.alt(name, []) : this.$data;
        return {
            value: sortObject(value),
            isArray: isArray(value),
            callback: callback
        }
    },
    each: function () {
        var each = this.eachItem(arguments);
        forEach(each.value, function (value, key) {
            each.callback(this.instance(value), value, key);
        }, this);
    },
    attrs: function (props) {
        this.$data = (function (data, parent, path) {
            var prop, callback = arguments.callee;
            for (prop in data) {
                if (data.hasOwnProperty(prop)) {
                    if (parent[prop] && typeof (parent[prop]['attrs']) === 'function') {
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
        return (function (result, data) {
            var prop, callback = arguments.callee;
            for (prop in data) {
                if (data.hasOwnProperty(prop)) {
                    if (data[prop] && typeof (data[prop]['serialize']) === 'function') {
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
        }).call(this, {}, this.$data);
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
Model.createModel = function (name, extend, proto) {
    if (classes[name]) {
        return classes[name];
    }
    classes[name] = (proto ? classes[extend] : Model).extend(proto ? proto : extend, name);
    return classes[name];
};
/**
 *
 * @param name
 * @param data
 * @returns {*}
 */
Model.getModel = function (name, data) {
    if (typeof (classes[name]) !== 'function') return;
    return new classes[name](data);
};

module.exports = Model;