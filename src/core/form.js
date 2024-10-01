import {deparam} from "./deparam";
import {isPlainObject,isArray,isFunction} from './utils'
/**
 *
 * @type {function(*, *=, *=): {}}
 */

/**
 *
 * @type {RegExp}
 */
const breaker = /[^\[\]]+|\[\]$/g;

/**
 *
 * @param data
 * @param attr
 * @returns {*|null}
 */
function attr(data, attr) {
    let i = 0,
        name = (attr || '').split('.'),
        prop = name.pop();
    for (; i < name.length; i++) {
        if (data && data.hasOwnProperty(name[i])) {
            data = data[name[i]];
        } else {
            break;
        }
    }
    return data ? data[prop] : null;
}

/**
 *
 * @param obj
 * @returns {*}
 */
export function clean(obj) {
    let prop;
    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            if (obj[prop].length === 0) {
                if(isArray(obj)) obj.splice(prop, 1);
                if(isPlainObject(obj)) delete obj[prop];
            } else if (typeof (obj[prop]) == 'object') {
                clean(obj[prop]);
            }
        }
    }
    return obj;
}

/**
 *
 * @param filter
 * @param coerce
 * @returns {*}
 */
export function getFormData(filter,coerce){
    let form   = this.serializeArray().map(function(field){
        return [field.name, encodeURIComponent(field.value)].join('=')
    }).join('&');
    let params = deparam(form, coerce, false);
    return filter === true ? clean(params) : params;
}

/**
 *
 * @param data
 * @returns {setFormData}
 */
export function setFormData( data ) {
    this.find('[name]').each(function(index,element){
        let current = $(element);
        let parts = current.attr('name').match(breaker);
        let value = attr(data,parts.join('.'));
        if (value) {
            if (current.is(":radio")) {
                if (current.val() === value) {
                    current.attr("checked", true);
                }
            } else if (current.is(":checkbox")) {
                value = isArray(value) ? value : [value];
                if (value.indexOf(current.val()) > -1) {
                    current.attr("checked", true);
                }
            } else {
                current.val(value);
            }
        }
    });
    return this;
}

