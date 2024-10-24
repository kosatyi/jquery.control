import { jQuery } from './jquery'
import { Class } from './class'
import {
    isArray,
    isPlainObject,
    forEach,
    sortObject,
    isFunction,
} from './utils'
/**
 * @template {string} T
 * @type {{T:Model}}
 */
const modelRegistry = {}
/**
 * @name Model
 * @type {Class|*}
 */
const Model = Class.extend({
    forEach,
    init(data) {
        this.extend(data)
    },
    extend(data) {
        if (data) {
            this.$data = data
        } else {
            this.$data = {}
        }
    },
    alt(prop, defaults) {
        prop = this.attr(prop)
        return prop === undefined || prop === null || prop === ''
            ? defaults
            : prop
    },
    defer() {
        return jQuery.Deferred()
    },
    resolve() {
        return this.defer().resolve(this)
    },
    attr(key, value) {
        const setter = arguments.length > 1
        const path = key.split('.')
        const prop = path.pop()
        const data = path.reduce((data, name) => {
            if (data && data[name] && data[name].$data) {
                return data[name].$data
            }
            if (setter) {
                if (data[name] === null || typeof data[name] !== 'object') {
                    data[name] = {}
                }
            }
            return data ? data[name] : undefined
        }, this.$data)
        if (setter) {
            data[prop] = value
        } else {
            return data ? data[prop] : undefined
        }
        return this
    },
    eachItem(args) {
        let name = args[1] ? args[0] : null
        let callback = args[1] ? args[1] : args[0]
        let value = name ? this.alt(name, []) : this.$data
        return {
            value: sortObject(value),
            isArray: isArray(value),
            callback: callback,
        }
    },
    each() {
        let each = this.eachItem(arguments)
        this.forEach(
            each.value,
            function (value, key) {
                each.callback(this.instance(value), value, key)
            },
            this
        )
    },
    serialize() {
        const context = this
        return (function callback(data) {
            const result = isArray(data) ? [] : {}
            for (let prop in data) {
                if (data.hasOwnProperty(prop)) {
                    let value = data[prop]
                    if (value === context) {
                        continue
                    }
                    if (value && isFunction(value.serialize)) {
                        result[prop] = value.serialize()
                    } else {
                        if (isArray(value) || isPlainObject(value)) {
                            result[prop] = callback(value)
                        } else {
                            result[prop] = value
                        }
                    }
                }
            }
            return result
        })(this.$data)
    },
    stringify: function () {
        return JSON.stringify(this.serialize())
    },
})
/**
 * @template {string} T
 * @param {T} name
 * @param extend
 * @param [proto]
 */
function createModel(name, extend, proto) {
    if (modelRegistry[name]) {
        return modelRegistry[name]
    }
    /**
     * @type {extend & proto}
     * @extends Model
     */
    modelRegistry[name] = (proto ? modelRegistry[extend] : Model).extend(
        proto ? proto : extend,
        name
    )
    return modelRegistry[name]
}

/**
 * @template {string} T
 * @param {T} name
 * @param {object} [data]
 */
function getModel(name, data) {
    if (typeof modelRegistry[name] !== 'function') return
    return new modelRegistry[name](data)
}

export { Model, getModel, createModel }
