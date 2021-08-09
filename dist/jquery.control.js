(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
var $        = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var Class    = require('./core/class');
var Location = require('./core/location');
var Control  = require('./core/control');
var Model    = require('./core/model');
var Locale   = require('./plugins/locale');
var Form     = require('./core/form');
var Router   = require('./core/router');
var View     = require('./core/view');
/**
 * @memberOf $
 * @property Class
 */
$.Class   = Class;
/**
 * @memberOf $
 * @property Model
 */
$.Model   = Model;
/**
 * @memberOf $
 * @property Control
 */
$.Control = Control;
/**
 * @memberOf $
 * @property Router
 */
$.Router  = Router;
/**
 * @memberOf $
 * @property createClass
 * @type {function(*=, *, *): (*)}
 */
$.createClass = Class.createClass;
/**
 * @memberOf $
 * @property getClass
 * @type {function(*, *=): (undefined|*)}
 */
$.getClass = Class.getClass;
/**
 * @memberOf $
 * @property createModel
 * @type {function(*=, *, *): (*)}
 */
$.createModel = Model.createModel;
/**
 * @memberOf $
 * @property getModel
 * @type {function(*, *=): (undefined|*)}
 */
$.getModel = Model.getModel;
/**
 *
 * @type {function(*=, *, *): *}
 */
$.createControl = Control.createControl;
/**
 * @memberOf $
 * @property initControl
 * @type {function(*, *=): (undefined|*)}
 */
$.initControl  = Control.initControl;
/**
 * @memberOf $
 * @property location
 * @type {Object}
 */
$.location     = Location;
/**
 * @memberOf $
 * @property locale
 * @type {Object}
 */
$.locale = Locale;
/**
 * @memberOf $
 * @property ejs
 * @deprecated
 */
$.ejs = View;
/**
 * @memberOf $
 * @property view
 */
$.view = View;
/**
 *
 */
$.fn.extend({
    setFormData: Form.setFormData,
    getFormData: Form.getFormData,
    initControls:function(){
        this.each(function(index,element){
            Control.initControls(element);
        });
    }
});
/**
 *
 * @type {jQuery}
 */
module.exports = $;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./core/class":2,"./core/control":3,"./core/form":4,"./core/location":5,"./core/model":6,"./core/router":7,"./core/view":8,"./plugins/locale":9}],2:[function(require,module,exports){
var classes = {};

var init = false;

var fnTest = /xyz/.test(function () {
    return 'xyz';
}.toString()) ? /\b_super\b/ : /.*/;

var superMethod = function(parent,name,method){
    return function () {
        var temp = this._super, result;
        this._super = parent[name];
        result = method.apply(this,arguments);
        this._super = temp;
        return result;
    };
}

var assign = function(target,instance){
    var prop,proto,parent = target.prototype;
    init = true;
    proto = new target();
    init = false;
    for (prop in instance) {
        if (instance.hasOwnProperty(prop)) {
            if (typeof (parent[prop]) == 'function' &&
                typeof (instance[prop]) == 'function' &&
                fnTest.test(instance[prop])
            ) {
                proto[prop] = superMethod(parent,prop,instance[prop]);
            } else {
                proto[prop] = instance[prop];
            }
        }
    }
    return proto;
}
/**
 * @name Class
 * @constructor
 */
var Class = function(){

};

Class.prototype._super = function(){

}

Class.prototype.instance = function(params){
    return new this.constructor(params);
}

Class.prototype.proxy = function(fn){
    fn = typeof (fn) == 'string' ? this[fn] : fn;
    return (function (cx, cb) {
        return function () {
            return cb.apply(cx, [this].concat([].slice.call(arguments)))
        };
    })(this, fn);
}

Class.extend = function extend(instance,name){
    /**
     *
     * @constructor
     * @property {Function} init
     */
    function Class(){
        if (!init && this.init) this.init.apply(this, arguments);
    }
    Class.prototype = assign(this,instance);
    Class.prototype.name = name;
    Class.prototype.constructor = Class;
    Class.extend = extend;
    return Class;
}

Class.createClass = function(name, extend, proto) {
    if (classes[name]) {
        return classes[name];
    }
    classes[name] = (proto ? classes[extend] : Class).extend(proto ? proto : extend, name);
    return classes[name];
}

Class.getClass = function(name, data) {
    if (typeof(classes[name]) !== 'function') return null;
    return new classes[name](data);
}

module.exports = Class;

},{}],3:[function(require,module,exports){
(function (global){(function (){
var $     = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var Class = require('./class');
var classes  = {};
var controls = [];
var ATTR = 'control';
var ATTR_SELECTOR = '['+ ATTR +']';
var arrayStringify = function(a){
    return JSON.stringify(a.slice().sort());
};
var compareArrays = function(a1,a2){
    return arrayStringify(a1) === arrayStringify(a2);
};
/**
 * @name Control
 * @property {jQuery} element
 * @property {jQuery} window
 * @property {jQuery} document
 * @type {Class|*}
 */
var Control = Class.extend({
    window: $(window),
    document: $(document),
    /**
     *
     * @param f
     * @param s
     * @param p
     * @returns {*}
     * @private
     */
    _addProxy_:function(f,s,p){
        if (p.length === f) p[f-1] = this.proxy(p[f-1]);
        if (p.length === s) p[s-1] = this.proxy(p[s-1]);
        return p;
    },
    /**
     *
     * @param type
     * @param params
     * @returns Control
     * @private
     */
    _event_:function(type,params){
        var args = this.toArray(params);
        args = this._addProxy_(2,3,args);
        this.element[type].apply(this.element, args);
        return this;
    },
    /**
     *
     * @param element
     */
    init: function (element) {
        this.pushInstance();
        this.initElement(element);
        this.create(element);
    },
    /**
     *
     */
    pushInstance: function () {
        controls.push(this);
    },
    /**
     *
     * @param element
     */
    initElement: function (element) {
        this.element = $(this._element_ = element);
        this.element.addClass(this.name.split('.').join('-'));
    },
    /**
     *
     * @param element
     */
    create: function (element) {

    },
    /**
     *
     * @param arr
     * @returns {*[]}
     */
    toArray: function (arr) {
        return Array.prototype.slice.call(arr);
    },
    /**
     *
     */
    initBindings: function () {
        if (!this._bindings_){
            this._bindings_ = [];
        }
    },
    /**
     *
     * @param args
     */
    addBinding: function (args) {
        this.initBindings();
        this._bindings_.push([].concat(args));
    },
    /**
     *
     * @param fn
     * @returns {*}
     */
    proxy: function (fn) {
        if (!this._proxy_cache_) this._proxy_cache_ = {};
        if (!this._proxy_cache_[fn]) {
            this._proxy_cache_[fn] = this._super(fn);
        }
        return this._proxy_cache_[fn];
    },
    /**
     * @returns {jQuery.prototype}
     */
    find: function () {
        return this.element.find.apply(this.element, arguments);
    },
    /**
     *
     * @param tag
     * @param className
     * @param attrs
     * @returns {jQuery.prototype}
     */
    el: function (tag, className, attrs) {
        tag = $(document.createElement(tag));
        if (className) tag.addClass(className);
        if (attrs) tag.attr(attrs);
        return tag;
    },
    clearProxyCache: function () {
        for (var prop in this._proxy_cache_) {
            if (this._proxy_cache_.hasOwnProperty(prop)) {
                delete this._proxy_cache_[prop];
            }
        }
    },
    bind: function () {
        var el, args = this.toArray(arguments);
        this.addBinding(args);
        args = this._addProxy_(3,4,args);
        el = this[args[0]] || $(args[0]);
        el.on.apply(el, args.slice(1));
        return this;
    },
    unbind: function () {
        var el, args = this.toArray(arguments);
        this._bindings_ = this._bindings_.filter(function(item){
            return compareArrays(item,args) === false;
        },this);
        args = this._addProxy_(3,4,args);
        el = this[args[0]] || $(args[0]);
        el.off.apply(el, args.slice(1));
        return this;
    },
    unbindAll: function () {
        this.initBindings();
        this._bindings_.forEach(function (value) {
            this.unbind.apply(this,value);
        },this);
        this._bindings_ = [];
        return this;
    },
    on: function () {
        this._event_('on',arguments);
        return this;
    },
    off: function () {
        this._event_('off',arguments);
        return this;
    },
    timeout: function (callback, time) {
        if (!this._idle_timeout_) this._idle_timeout_ = {};
        clearTimeout(this._idle_timeout_[callback]);
        delete this._idle_timeout_[callback];
        this._idle_timeout_[callback] = setTimeout(this.proxy(callback), time);
        return this;
    },
    destroy: function () {
        this.off();
        this.unbindAll();
        this.clearProxyCache();
        this.element.removeClass(this.name.split('.').join('-'));
        this.element.removeData();
    },
    canBeDestroyed: function () {
        return this._element_ ? document.body.contains(this._element_) === false : false;
    }
});

function sortControls(a, b) {
    var c = a.querySelectorAll(ATTR_SELECTOR).length,
        d = b.querySelectorAll(ATTR_SELECTOR).length;
    if ((c && !d) || (c > d)) return 1;
    if ((!c && d) || (c < d)) return -1;
    return 0;
}

function cleanControls(force) {
    controls = controls.filter(function (control) {
        if (control.canBeDestroyed() || force) {
            control.destroy();
            return false;
        }
        return true;
    });
}

/**
 *
 * @param name
 * @param extend
 * @param proto
 * @returns {Control}
 */
function createControl(name, extend, proto) {
    if (classes[name]) {
        console.info('control with name [%s] is already exist', name);
        return classes[name];
    }
    classes[name] = (proto ? classes[extend] : Control).extend(proto ? proto : extend, name);
    return classes[name];
}
/**
 *
 * @param name
 * @param params
 * @returns new {Control}
 */
function initControl(name, params) {
    if (typeof(classes[name]) !== 'function') return;
    return new classes[name](params);
}

function initControls(element){
    Control.cleanControls();
    Array.prototype.slice.call(element.querySelectorAll(ATTR_SELECTOR))
        .sort(Control.sortControls)
        .forEach(function (item) {
            item.getAttribute(ATTR).split(',').forEach(function (name) {
                Control.initControl(name, item);
            });
            item.removeAttribute(ATTR);
        });

}

Control.createControl = createControl;

Control.sortControls  = sortControls;

Control.cleanControls = cleanControls;

Control.initControl   = initControl;

Control.initControls  = initControls;

module.exports = Control;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./class":2}],4:[function(require,module,exports){
(function (global){(function (){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
/**
 *
 * @type {function(*, *=, *=): {}}
 */
var deparam = require('../utils/deparam');
/**
 *
 * @type {RegExp}
 */
var breaker = /[^\[\]]+|\[\]$/g;

/**
 *
 * @param data
 * @param attr
 * @returns {*|null}
 */
function attr(data, attr) {
    var i = 0,
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
function clean(obj) {
    var prop;
    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            if (obj[prop].length === 0) {
                if($.isArray(obj)) obj.splice(prop, 1);
                if($.isPlainObject(obj)) delete obj[prop];
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
function getFormData(filter,coerce){
    var form   = $.map(this.serializeArray(), function (field) {
        return [field.name, encodeURIComponent(field.value)].join('=');
    }).join('&');
    var params = deparam(form, coerce, false);
    return filter === true ? clean(params) : params;
}

/**
 *
 * @param data
 * @returns {setFormData}
 */
function setFormData( data ) {
    this.find('[name]').each(function(){
        var current = $(this);
        var parts = current.attr('name').match(breaker);
        var value = attr(data,parts.join('.'));
        if (value) {
            if (current.is(":radio")) {
                if (current.val() === value) {
                    current.attr("checked", true);
                }
            } else if (current.is(":checkbox")) {
                value = $.isArray(value) ? value : [value];
                if ($.inArray(current.val(), value) > -1) {
                    current.attr("checked", true);
                }
            } else {
                current.val(value);
            }
        }
    });
    return this;
}

module.exports = {
    setFormData: setFormData,
    getFormData: getFormData
};
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../utils/deparam":10}],5:[function(require,module,exports){
(function (global){(function (){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);

var deparam = require('../utils/deparam');

var skip  = false;

var instance = {
    prefix: '#',
    type: 'hash',
    event:'hashchange.location',
    callbacks: [],
    initialize: false,
    url: function (url, replace) {
        location[replace === true ? 'replace' : 'assign'](url);
        return this;
    },
    normalize: function (url) {
        var prefix = this.prefix;
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
    json: function(value,replace,silent){
        var href  = this.href();
        var chunk = href.split('#')[0].split('?')[1] || '{}';
        if (arguments.length) {
            value = value ? [this.part(0),JSON.stringify(value)].join('?') : this.part(0);
            this[replace ? 'replace' : 'assign'](value, silent);
        } else {
            try{
                chunk = decodeURIComponent(chunk);
                chunk = JSON.parse(chunk);
            } catch(e){
                chunk = {};
            }
            return chunk;
        }
    },
    proxy: function (callback) {
        return (function (cx) {
            return function () {
                return cx[callback].apply(cx, arguments);
            }
        })(this);
    },
    bind: function (callback) {
        this.callbacks.push(callback);
        if (this.initialize === false) {
            this.initialize = true;
            $(window).on(this.event,this.proxy('change'));
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
        var index;
        if (skip === true) {
            return skip = false;
        }
        if (this.callbacks.length) {
            for (index in this.callbacks) {
                if(this.callbacks.hasOwnProperty(index)){
                    this.callbacks[index].call(this);
                }
            }
        }
    }
};


module.exports = instance;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../utils/deparam":10}],6:[function(require,module,exports){
(function (global){(function (){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var Class = require('./class');
/**
 *
 * @type {{}}
 */
var classes = {};
/**
 *
 * @param value
 * @returns {*}
 */
var isArray = function (value) {
    return $.isArray(value);
};
/**
 *
 * @param value
 * @returns {*}
 */
var isPlainObject = function (value) {
    return $.isPlainObject(value);
};
/**
 *
 * @param object
 * @param callback
 * @param thisArg
 */
var forEach = function (object, callback, thisArg) {
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
var sortObject = function (obj) {
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
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./class":2}],7:[function(require,module,exports){
(function (global){(function (){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var Class = require('./class');
var Model = require('./model');
var View = require('./view');
var Control = require('./control');
var Location = require('./location');
/**
 *
 * @param path
 * @returns {RegExp}
 */
var pathToRegexp = function (path) {
    var result, keys = [], parse = function (_, slsh, format, key, capture, opt) {
        keys.push({name: key, optional: !!opt});
        slsh = slsh || '';
        return '' + (opt ? '' : slsh) + '(?:' + (opt ? slsh : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (opt || '');
    };
    path = path.concat('/?');
    path = path.replace(/\/\(/g, '(?:/')
        .replace(/\+/g, '__plus__')
        .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, parse)
        .replace(/([\/.])/g, '\\$1')
        .replace(/__plus__/g, '(.+)')
        .replace(/\*/g, '(.*)')
        .replace(/@num/g, '\\d+')
        .replace(/@word/g, '\\w+');
    result = new RegExp('^' + path + '$', '');
    result.keys = keys;
    return result;
};
/**
 *
 * @param regexp
 * @param path
 * @returns {{}|boolean}
 */
var pathMatch = function (regexp, path) {
    var key;
    var match = regexp.exec(path);
    var params = {};
    if (!match) return false;
    for (var i = 1, len = match.length; i < len; ++i)
        if ((key = regexp.keys[i - 1]))
            params[key.name] = (typeof (match[i]) === 'string') ? decodeURIComponent(match[i]) : match[i];
    return params;
};
/**
 *
 * @type {{hashchange: listener.hashchange}}
 */
var listener = {
    hashchange: function (run) {
        Location.bind(function () {
            run(this.path());
        });
        if (Location.part(0) === '') {
            Location.assign('/');
        } else {
            run(Location.path());
        }
    }
};
/**
 * @name RouterQueue
 */
Model.createModel('router.queue', {
    init: function(response){
        this.response = response;
        this.start();
    },
    start: function(){
        this.list     = {};
        this.defer    = $.Deferred();
        this.defer.progress(function(name,response){
            this.complete(name,response);
        });
    },
    empty: function(){
        return $.isEmptyObject(this.list);
    },
    complete: function(name,value){
        this.remove(name);
        this.response.attr(name,value);
        if( this.empty() ){
            this.defer.resolve();
            this.start();
        }
    },
    remove: function(name){
        delete this.list[name];
    },
    then: function(fn){
        if( this.empty() ) {
            fn();
        } else {
            this.defer.then(fn);
        }
        return this;
    },
    stop: function(){
        Object.keys(this.list).forEach(function(name){
            this.list[name].reject();
            this.remove(name);
        },this);
        this.list = {};
    },
    add: function(name,defer){
        var queue = this;
        queue.list[name] = defer.then(function(content){
            queue.defer.notifyWith(queue,[name,content]);
        },function(){
            queue.defer.notifyWith(queue,[name]);
        });
        return queue;
    }
});
/**
 * @name RouterResponse
 */
Model.createModel('router.response', {
    init: function(data){
        this.extend(data);
        this.__q = Model.getModel('router.queue',this);
    },
    queue: function(name,defer){
        this.__q.add(name,defer);
        return this;
    },
    then: function(callback){
        this.__q.then(callback);
        return this;
    },
    stop: function () {
        this.__q.stop();
        return this;
    },
    render: function (wrapper, template, data) {
        wrapper = document.querySelector(wrapper);
        template = View(template).render(data);
        wrapper.innerHTML = '';
        wrapper.appendChild(template);
        Control.initControls(wrapper);
        return wrapper;
    }
});
/**
 * @name RouterRequest
 */
Model.createModel('router.request', {
    query: function () {
        var query = Location.query();
        this.attr('query',query);
        return query;
    },
    match: function (exp) {
        return new RegExp(exp).test(this.attr('path'));
    },
    model: function () {
        var args = [].slice.call(arguments);
        var name = args.shift();
        var method = args.shift();
        var model = Model.getModel(name);
        if (method && typeof (model[method]) === 'function') {
            return model[method].apply(model, args);
        }
        return model;
    },
    getChildPath: function(){
        return '/'.concat(this.alt('params._path_',''));
    },
    path: function(value){
        this.attr('path',value);
    },
    params: function(data){
        data = $.extend({},this.alt('parent',{}),data);
        this.attr('params',data);
        this.attr('parent',data);
    }
});
/**
 * @name Route
 */
Class.createClass('route', {
    init: function (name) {
        this.params = {};
        this.callbacks = [];
        this.name  = name;
        this.regex = pathToRegexp(name);
    },
    then: function (fn) {
        this.callbacks.push(fn);
        return this;
    },
    match: function (path) {
        this.path = path;
        this.params = pathMatch(this.regex, this.path);
        return !!this.params;
    },
    getCallbacks: function () {
        return this.callbacks;
    }
});
/**
 * @name Router
 * @property _before_
 * @property _after_
 * @property _routes_
 * @property request
 * @property response
 */
var Router = Class.createClass('router', {
    init: function () {
        this._before_ = [];
        this._after_  = [];
        this._routes_ = {};
        this.request  = Model.getModel('router.request');
        this.response = Model.getModel('router.response');
    },
    prepare: function(){
        this.request.attr('path','');
        this.request.attr('params',{});
        this.request.attr('parent',{});
        this.response.attr('data',{});
        this.response.stop();
    },
    route: function (path) {
        var route = this._routes_[path] || Class.getClass('route', path);
        this._routes_[path] = route;
        return route;
    },
    use: function(path){
        return this.route(path.concat('/',':_path_(*)?'));
    },
    before: function (fn) {
        this._before_.push(fn);
        return this;
    },
    after: function (fn) {
        this._after_.push(fn);
        return this;
    },
    call: function (context, request, response, next) {
        this.request  = request;
        this.response = response;
        this.find(this.request.getChildPath(),next);
    },
    apply: function (context, params) {
        this.call(context,params[0],params[1],params[2]);
    },
    process: function (list, complete) {
        (function (cx,index) {
            var params = [];
            var next   = arguments.callee;
            var route  = list[index] || false;
            if (route === false) return complete && complete.call && complete.call(cx);
            params.push(cx.request);
            params.push(cx.response);
            params.push(function(){
                cx.response.then(function(){
                    next(cx,++index);
                });
            });
            list[index].apply(cx,params);
        })(this,0);
    },
    start: function (route,complete) {
        this.request.path(route.path);
        this.request.params(route.params);
        this.request.query();
        this.process(this._before_, function () {
            this.process(route.getCallbacks(), function () {
                this.process(this._after_, complete);
            });
        });
    },
    find: function (path,complete) {
        var route,result = Class.getClass('route', path);
        if( complete === true ){
            this.prepare();
        }
        for (route in this._routes_) {
            if (this._routes_.hasOwnProperty(route)) {
                route = this._routes_[route];
                if (route.match(path)) {
                    result = route;
                    break;
                }
            }
        }
        this.start(result,complete);
    },
    listen: function (callback) {
        if (typeof (callback) === 'string' && typeof (listener[callback]) === 'function')
            callback = listener[callback];
        callback((function (that) {
            return function (path) {
                that.find(path,true);
            };
        })(this));
        return this;
    }
});

module.exports = Router;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./class":2,"./control":3,"./location":5,"./model":6,"./view":8}],8:[function(require,module,exports){
(function (global){(function (){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);

var Class = require('./class');
var Control = require("./control");

var listPreload = {};
var listView = {};
var listAttr = {};
var listProp = {};
var listCache = {};

var settings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g,
    variable: false
};

var noMatch = /(.)^/;

var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
};

var escaper = /[\\'\r\n\t\u2028\u2029]/g;

var htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
};

var entityRe = new RegExp('[&<>"\']', 'g');
/**
 *
 * @param object
 * @param callback
 * @param thisArg
 */
var forEach = function (object, callback, thisArg) {
    var prop, context = thisArg || callback;
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
var stringFormat = function (value, params) {
    return (value || '').replace(/{(.+?)}/g, function (match, prop) {
        return typeof (params[prop]) != 'undefined' ? params[prop] : match;
    });
};

/**
 *
 * @return {string}
 */
var uid = function (ns) {
    var size = 1000000;
    var length = String(size).length - 1;
    var random = Math.abs(Math.random()) * size;
    var time = String(new Date().getTime()).match(/.{1,7}/g);
    var result = parseFloat(String(random)).toFixed(length).split('.');
    return [ns].concat(result).concat(time).join('-');
};
/**
 *
 * @param element
 */
var mountNodes = function (element) {
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
var mountProps = function (element) {
    forEach(listProp, function (item, attr) {
        var node = element.querySelector(item.selector);
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
var escapeExpr = function (string) {
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
var escapeString = function (string) {
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
var compile = function (text, name) {
    var render;
    var matcher = new RegExp([
        (settings.escape || noMatch).source,
        (settings.interpolate || noMatch).source,
        (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');
    var index = 0;
    var source = "__p+='";
    (text||'').replace(matcher, function (match, escape, interpolate, evaluate, offset) {
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
    var template = function (data) {
        var output = '';
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
var fragment = function(html) {
    var template = document.createElement('template');
    if ('content' in template) {
        template.innerHTML = html;
        return document.importNode(template.content, true);
    }
    var frag = document.createDocumentFragment();
    var div = document.createElement('div');
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
var template = Class.extend({
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
        var element = fragment(this.renderHTML(data));
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
var defaultExtList  = ['ejs', 'html', 'svg', 'css', 'js'];
/**
 *
 * @param list
 * @return {RegExp}
 */
var resolverExp = function(list){
    return new RegExp('^(.+)(\\.)('+list.join('|')+')$');
};
/**
 *
 *
 */
var resolver = {
    ext: defaultExtList,
    exp: resolverExp(defaultExtList),
    set: function(list){
        this.ext = list;
        this.exp = resolverExp(list);
    },
    name: function(name){
        return String(name).replace(this.exp, '$1');
    },
    get: function(name){
        var i = 0, c = false;
        var e = this.ext;
        var l = listView;
        var n = this.name(name);
        for (; i < e.length; i++) {
            c = l[[n,e[i]].join('.')];
            if (c) {
                break;
            }
        }
        return c;
    },
    source: function(name){
        return this.get(name) || name;
    }
}

var helpers = {
    /**
     * @memberOf window
     * @name $include
     * @param url
     * @param data
     * @returns  {*}
     */
    $include: function (url, data) {
        return view(stringFormat(url,this)).renderHTML(data);
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
        var id = uid('node');
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
        var id = uid('attr');
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
            Control.initControl(control, element);
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

module.exports = view;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./class":2,"./control":3}],9:[function(require,module,exports){
(function (global){(function (){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
/**
 *
 * @type {{}}
 */
var cache = {};
/**
 *
 * @type {{defaults: string, current: string, path: string, file: string, data: {}}}
 */
var Locale = {
    defaults: 'en',
    current: 'en',
    path: 'locales/',
    file: '/translation.json',
    data: {}
};
/**
 *
 * @param lang
 * @returns {*}
 */
Locale.load = function (lang) {
    cache[lang] = cache[lang] || $.ajax({
        context: this,
        url: this.path.concat(lang).concat(this.file)
    });
    cache[lang].then(function (data) {
        this.data = data;
    });
    return cache[lang];
};

Locale.config = function(params){
    $.extend(true,locale,params);
    return locale;
};
/**
 *
 * @param lang
 * @returns {Locale}
 */
Locale.lang = function (lang) {
    this.current = lang;
    return this;
};

/**
 *
 * @param value
 * @returns {*}
 */
Locale.get = function (value) {
    return this.data[value] || value;
};

module.exports = Locale;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){
function deparam(params, coerce, spaces) {
    var obj = {},
        coerce_types = {'true': !0, 'false': !1, 'null': null};
    if (spaces) params = params.replace(/\+/g, ' ');
    params.split('&').forEach(function (v) {
        var param = v.split('='),
            key = decodeURIComponent(param[0]),
            val,
            cur = obj,
            i = 0,
            keys = key.split(']['),
            keys_last = keys.length - 1;
        if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
            keys[keys_last] = keys[keys_last].replace(/\]$/, '');
            keys = keys.shift().split('[').concat(keys);
            keys_last = keys.length - 1;
        } else {
            keys_last = 0;
        }
        if (param.length === 2) {
            val = decodeURIComponent(param[1]);
            if (coerce) {
                val = val && !isNaN(val) && ((+val + '') === val) ? +val
                    : val === 'undefined' ? undefined
                        : coerce_types[val] !== undefined ? coerce_types[val]
                            : val;
            }
            if (keys_last) {
                for (; i <= keys_last; i++) {
                    key = keys[i] === '' ? cur.length : keys[i];
                    cur = cur[key] = i < keys_last
                        ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : [])
                        : val;
                }
            } else {
                if (Object.prototype.toString.call(obj[key]) === '[object Array]') {
                    obj[key].push(val);
                } else if ({}.hasOwnProperty.call(obj, key)) {
                    obj[key] = [obj[key], val];
                } else {
                    obj[key] = val;
                }
            }

        } else if (key) {
            obj[key] = coerce
                ? undefined
                : '';
        }
    });
    return obj;
}

module.exports = deparam;
},{}]},{},[1]);
