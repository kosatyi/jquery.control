export function getType(o) {
    return {}.toString
        .call(o)
        .match(/\s([a-zA-Z]+)/)[1]
        .toLowerCase()
}
/**
 *
 * @param value
 * @return {*}
 */
export function isArray(value) {
    return Array.isArray(value)
}
/**
 *
 * @param value
 * @return {boolean}
 */
export function isFunction(value) {
    return typeof value === 'function'
}

/**
 *
 * @param o
 * @return {boolean}
 */
export function isAnyObject(o) {
    return getType(o) === 'object'
}
/**
 *
 * @param value
 * @returns {*}
 */
export function isPlainObject(value) {
    if (isAnyObject(value) === false) return false
    return (
        value.constructor === Object &&
        Object.getPrototypeOf(value) === Object.prototype
    )
}
/**
 *
 * @param object
 * @param callback
 * @param thisArg
 */
export function forEach(object, callback, thisArg) {
    let prop,
        context = thisArg || callback
    for (prop in object) {
        if (object.hasOwnProperty(prop)) {
            callback.call(context, object[prop], prop)
        }
    }
}

/**
 *
 * @param obj
 * @returns {{}}
 */
export function sortObject(obj) {
    return Object.keys(obj)
        .sort()
        .reduce(function (result, key) {
            result[key] = obj[key]
            return result
        }, {})
}

/**
 *
 * @param a
 * @return {string}
 */
export function arrayStringify(a) {
    return JSON.stringify(a.slice().sort())
}

/**
 *
 * @param a1
 * @param a2
 * @return {boolean}
 */
export function compareArrays(a1, a2) {
    return arrayStringify(a1) === arrayStringify(a2)
}

/**
 *
 * @param path
 * @return {RegExp}
 */
export function pathToRegexp(path) {
    let result,
        keys = []
    function parse(_, slash, format, key, capture, opt) {
        keys.push({ name: key, optional: !!opt })
        slash = slash || ''
        return (
            '' +
            (opt ? '' : slash) +
            '(?:' +
            (opt ? slash : '') +
            (format || '') +
            (capture || (format && '([^/.]+?)') || '([^/]+?)') +
            ')' +
            (opt || '')
        )
    }
    path = path.concat('/?')
    path = path
        .replace(/\/\(/g, '(?:/')
        .replace(/\+/g, '__plus__')
        .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, parse)
        .replace(/([\/.])/g, '\\$1')
        .replace(/__plus__/g, '(.+)')
        .replace(/\*/g, '(.*)')
        .replace(/@num/g, '\\d+')
        .replace(/@word/g, '\\w+')
    result = new RegExp('^' + path + '$', '')
    result.keys = keys
    return result
}
/**
 *
 * @param regexp
 * @param path
 * @returns {{}|boolean}
 */
export function pathMatch(regexp, path) {
    let key
    let match = regexp.exec(path)
    let params = {}
    if (!match) return false
    for (let i = 1, len = match.length; i < len; ++i)
        if ((key = regexp.keys[i - 1]))
            params[key.name] =
                typeof match[i] === 'string'
                    ? decodeURIComponent(match[i])
                    : match[i]
    return params
}
