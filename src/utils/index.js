import $ from '../core/jquery'
/**
 *
 * @param value
 * @return {*}
 */
const isArray = function (value) {
    return $.isArray(value);
};
const isFunction = function(value){
    return typeof value === 'function'
}
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
    let prop, context = thisArg || callback;
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

const arrayStringify = function(a){
    return JSON.stringify(a.slice().sort());
};

const compareArrays = function(a1,a2){
    return arrayStringify(a1) === arrayStringify(a2);
};

export {
    sortObject as arrayStringify,
    sortObject,
    compareArrays,
    isPlainObject,
    isFunction,
    isArray,
    forEach
}

// exports.arrayStringify = sortObject
// exports.compareArrays = compareArrays
//
// exports.sortObject = sortObject
// exports.isPlainObject = isPlainObject
// exports.isArray = isArray
// exports.forEach = forEach