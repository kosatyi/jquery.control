import $ from './jquery'
import {Class} from './class'
import {initControl} from './control'

const listPreload = {};
const listView = {};
const listAttr = {};
const listProp = {};
const listCache = {};

const settings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g,
    variable: false
};

const noMatch = /(.)^/;

const escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
};

const escaper = /[\\'\r\n\t\u2028\u2029]/g;

const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
};

const entityRe = new RegExp('[&<>"\']', 'g');
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
 * @param value
 * @param params
 * @return {string}
 */
const stringFormat = function (value, params) {
    return (value || '').replace(/{(.+?)}/g, function (match, prop) {
        return typeof (params[prop]) != 'undefined' ? params[prop] : match;
    });
};

/**
 *
 * @return {string}
 */
const uid = function (ns) {
    let size = 1000000;
    let length = String(size).length - 1;
    let random = Math.abs(Math.random()) * size;
    let time = String(new Date().getTime()).match(/.{1,7}/g);
    let result = parseFloat(String(random)).toFixed(length).split('.');
    return [ns].concat(result).concat(time).join('-');
};
/**
 *
 * @param element
 */
const mountNodes = function (element) {
    forEach(listAttr, function (data, id, item, node) {
        if ((item = element.getElementById(id)) === null) return false;
        node = document.createElement(data.tag);
        item.parentNode && item.parentNode.replaceChild(node, item);
        if (typeof (data.callback) === 'function') {
            data.callback(node);
        }
        delete listAttr[id];
    })
};
/**
 *
 * @param element
 */
const mountProps = function (element) {
    forEach(listProp, function (item, attr) {
        let node = element.querySelector(item.selector);
        if (node === null) return;
        node.removeAttribute(attr);
        if (typeof (item.callback) === 'function') {
            item.callback(node);
        }
        delete listProp[attr];
    });
};
/**
 *
 * @param string
 * @return {string}
 */
const escapeExpr = function (string) {
    if (string == null) return '';
    return ('' + string).replace(entityRe, function (match) {
        return htmlEntities[match];
    });
};
/**
 *
 * @param string
 * @return {string}
 */
const escapeString = function (string) {
    if (string == null) return '';
    return ('' + string).replace(escaper, function (match) {
        return '\\' + escapes[match];
    });
};
/**
 *
 * @param text
 * @param name
 * @return {function(*=): string}
 */
const compile = function (text, name) {
    let render;
    let matcher = new RegExp([
        (settings.escape || noMatch).source,
        (settings.interpolate || noMatch).source,
        (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');
    let index = 0;
    let source = "__p+='";
    (text || '').replace(matcher, function (match, escape, interpolate, evaluate, offset) {
        source += escapeString(text.slice(index, offset));
        if (escape) source += "'\n+((__t=(" + escape + "))==null?'':escapeExpr(__t))+\n'";
        if (interpolate) source += "'\n+((__t=(" + interpolate + "))==null?'':__t)+\n'";
        if (evaluate) source += "';\n" + evaluate + ";\n__p+='";
        index = offset + match.length;
        return match;
    });
    source += "';";
    source = "with(obj||{}){\n" + source + "}";
    source = "var __t,__p='',__j=[].join,print=function(){__p+=__j.call(arguments,'');};"
        + source + "return __p;\n//# sourceURL=[" + name + "]";
    try {
        render = new Function('obj', 'escapeExpr', source);
    } catch (e) {
        console.error(e);
    }
    let template = function (data) {
        let output = '';
        try {
            output = render && render.call(this, data, escapeExpr);
        } catch (e) {
            console.error(e);
        }
        return output;
    };
    template.source = 'function(obj){' + source + '}';
    return template;
};

/**
 *
 * @param html
 * @return {DocumentFragment}
 */
const fragment = function (html) {
    let template = document.createElement('template');
    if ('content' in template) {
        template.innerHTML = html;
        return document.importNode(template.content, true);
    }
    let frag = document.createDocumentFragment();
    let div = document.createElement('div');
    div.innerHTML = html;
    while (div.firstChild) {
        frag.appendChild(div.firstChild);
    }
    return frag;
}


/**
 * @name Template
 * @type {Class|*}
 */
const template = Class.extend({
    init: function (source, name) {
        this.source = resolver.source(source);
        this.compile(this.source, name);
    },
    compile: function (source, name) {
        this.output = compile(source, name);
        return this;
    },
    renderHTML: function (data) {
        data = this.extend(data);
        return this.output.call(data, data);
    },
    render: function (data) {
        let element = fragment(this.renderHTML(data));
        mountNodes(element);
        mountProps(element);
        return element;
    },
    extend: function (data) {
        return $.extend({}, this, data || {}, helpers);
    }
});
/**
 *
 * @type {string[]}
 */
const defaultExtList = ['ejs', 'html', 'svg', 'css', 'js'];
/**
 *
 * @param list
 * @return {RegExp}
 */
const resolverExp = function (list) {
    return new RegExp('^(.+)(\\.)(' + list.join('|') + ')$');
};
/**
 *
 *
 */
const resolver = {
    ext: defaultExtList,
    exp: resolverExp(defaultExtList),
    set: function (list) {
        this.ext = list;
        this.exp = resolverExp(list);
    },
    name: function (name) {
        return String(name).replace(this.exp, '$1');
    },
    get: function (name) {
        let i = 0, c = false;
        let e = this.ext;
        let l = listView;
        let n = this.name(name);
        for (; i < e.length; i++) {
            c = l[[n, e[i]].join('.')];
            if (c) {
                break;
            }
        }
        return c;
    },
    source: function (name) {
        return this.get(name) || name;
    }
}

const helpers = {
    /**
     * @memberOf window
     * @name $include
     * @param url
     * @param data
     * @returns  {*}
     */
    $include: function (url, data) {
        return view(stringFormat(url, this)).renderHTML(data);
    },
    /**
     * @memberOf window
     * @name $each
     * @param object
     * @param callback
     * @param context
     * @returns {*}
     */
    $each: function (object, callback, context) {
        forEach(object, callback, context);
    },
    /**
     * @memberOf window
     * @name $view
     * @param tag
     * @param callback
     * @returns {*}
     */
    $view: function (tag, callback) {
        let id = uid('node');
        listAttr[id] = {tag: tag, callback: callback};
        return stringFormat('<view id="{0}"></view>', [id]);
    },
    /**
     * @memberOf window
     * @name $prop
     * @param callback
     * @returns {string}
     */
    $prop: function (callback) {
        let id = uid('attr');
        listProp[id] = {selector: ['[', id, ']'].join(''), callback: callback};
        return ['', id, ''].join(' ');
    },
    /**
     * @memberOf window
     * @name $control
     * @param tag
     * @param control
     * @param params
     * @returns {*}
     */
    $control: function (tag, control, params) {
        return this.$view(tag, function (element) {
            initControl(control, element);
        });
    }
};

/**
 *
 * @param name
 * @return {*}
 */
function view(name) {
    if (listCache[name]) return listCache[name];
    listCache[name] = new template(name);
    return listCache[name];
}

view.resolver = resolver;

/**
 *
 * @param url
 * @return {*}
 */
view.preload = function (url) {
    listPreload[url] = listPreload[url] || $.get(url).then(function (content) {
        $.extend(listView, content);
    });
    return listPreload[url];
};
/**
 *
 * @param name
 * @param func
 */
view.helper = function (name, func) {
    helpers[name] = func;
};

export {view}