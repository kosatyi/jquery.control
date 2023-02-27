const $ = require('./jquery');
const Class = require('./class');
const {compareArrays, forEach} = require('../utils')
const classes  = {};
const controls = [];
const ATTR = 'control';
const ATTR_SELECTOR = '['+ ATTR +']';

/**
 * @name Control
 * @property {jQuery} element
 * @property {jQuery} window
 * @property {jQuery} document
 * @type {Class|*}
 */
const Control = Class.extend({
    addControlClassName: true,
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
        let args = this.toArray(params);
        args = this._addProxy_(2,3,args);
        this.element[type].apply(this.element, args);
        return this;
    },
    /**
     * @constructor
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
        this.element = $(element);
        if( this.addControlClassName === true ){
            this.element.addClass(this.name.split('.').join('-'));
        }
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
        forEach(this._proxy_cache_,function(value,prop){
            delete this._proxy_cache_[prop];
        },this)
    },
    bind: function () {
        let el, args = this.toArray(arguments);
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
        if( time === false ) return this;
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
        return this.document.contains(this.element) === false
    }
});

function sortControls(a, b) {
    let c = a.querySelectorAll(ATTR_SELECTOR).length,
        d = b.querySelectorAll(ATTR_SELECTOR).length;
    if ((c && !d) || (c > d)) return 1;
    if ((!c && d) || (c < d)) return -1;
    return 0;
}

function cleanControls(force) {
    controls.forEach(function (control,index) {
        if (control.canBeDestroyed() || force) {
            control.destroy();
            controls.splice(index,1)
        }
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
