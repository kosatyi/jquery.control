import { jQuery } from './jquery'
import { Class, newInstance } from './class'
import { arrayEqual, forEach } from './utils'

/**
 *
 * @type {{string:Control}}
 */
const controlRegistry = {}
const controls = []
const ATTR = 'control'
const ATTR_SELECTOR = '[' + ATTR + ']'

/**
 * @name Control
 * @property {jQuery} element
 * @property {jQuery} window
 * @property {jQuery} document
 * @type {Class|*}
 */
const Control = Class.extend({
    window: jQuery(window),
    document: jQuery(document),
    /**
     *
     * @param f
     * @param s
     * @param p
     * @returns {*}
     * @private
     */
    _addProxy_(f, s, p) {
        if (p.length === f) p[f - 1] = this.proxy(p[f - 1])
        if (p.length === s) p[s - 1] = this.proxy(p[s - 1])
        return p
    },
    /**
     *
     * @param type
     * @param params
     * @returns Control
     * @private
     */
    _event_(type, params) {
        let args = this.toArray(params)
        args = this._addProxy_(2, 3, args)
        this.element[type].apply(this.element, args)
        return this
    },
    /**
     * @constructor
     * @param element
     */
    init(element) {
        this.pushInstance()
        this.initElement(element)
        this.create(element)
    },
    /**
     *
     */
    pushInstance() {
        controls.push(this)
    },
    /**
     *
     * @param element
     */
    initElement(element) {
        this.element = jQuery(element)
    },
    /**
     *
     * @param element
     */
    create(element) {},
    /**
     *
     * @param arr
     * @returns {*[]}
     */
    toArray(arr) {
        return Array.prototype.slice.call(arr)
    },
    /**
     *
     */
    initBindings() {
        if (!this._bindings_) {
            this._bindings_ = []
        }
    },
    /**
     *
     * @param args
     */
    addBinding(args) {
        this.initBindings()
        this._bindings_.push([].concat(args))
    },
    /**
     *
     * @param fn
     * @returns {*}
     */
    proxy(fn) {
        if (!this._proxy_cache_) this._proxy_cache_ = {}
        if (!this._proxy_cache_[fn]) {
            this._proxy_cache_[fn] = this._super(fn)
        }
        return this._proxy_cache_[fn]
    },
    /**
     * @returns {jQuery}
     */
    find() {
        return this.element.find.apply(this.element, arguments)
    },
    /**
     *
     * @param {string} tag
     * @param {string} [className]
     * @param {Object<string,string>} [attrs]
     * @returns {jQuery}
     */
    el(tag, className, attrs) {
        const el = jQuery(document.createElement(tag))
        if (className) el.addClass(className)
        if (attrs) el.attr(attrs)
        return el
    },
    clearProxyCache() {
        forEach(
            this._proxy_cache_,
            function (value, prop) {
                delete this._proxy_cache_[prop]
            },
            this
        )
    },
    bind() {
        let args = this.toArray(arguments)
        this.addBinding(args)
        args = this._addProxy_(3, 4, args)
        let el = this[args[0]] || jQuery(args[0])
        el.on.apply(el, args.slice(1))
        return this
    },
    unbind() {
        let args = this.toArray(arguments)
        this.initBindings()
        this._bindings_ = this._bindings_.filter(
            (item) => arrayEqual(item, args) === false
        )
        args = this._addProxy_(3, 4, args)
        let el = this[args[0]] || jQuery(args[0])
        el.off.apply(el, args.slice(1))
        return this
    },
    unbindAll() {
        this.initBindings()
        this._bindings_.forEach(function (value) {
            this.unbind.apply(this, value)
        }, this)
        this._bindings_ = []
        return this
    },
    on() {
        this._event_('on', arguments)
        return this
    },
    off() {
        this._event_('off', arguments)
        return this
    },
    trigger(name) {
        const params = this.toArray(arguments).slice(1)
        const event = jQuery.Event(name)
        this.element.trigger.apply(this.element, [event].concat(params))
        return event
    },
    delay(callback, time) {
        callback = this.proxy(callback, true)
        const params = [callback, time].concat(Array.from(arguments).slice(2))
        if (!this._delay_map_) this._delay_map_ = new WeakMap()
        if (!this._delay_set_) this._delay_set_ = new Set()
        if (this._delay_map_.has(callback)) {
            clearTimeout(this._delay_map_.get(callback))
        }
        const delay = setTimeout.apply(null, params)
        this._delay_set_.add(delay)
        this._delay_map_.set(callback, delay)
        return this
    },
    clearDelayList() {
        if (!this._delay_set_) return true
        this._delay_set_.forEach((delay) => {
            clearTimeout(delay)
        })
        this._delay_set_ = null
        this._delay_map_ = null
    },
    destroy() {
        this.off()
        this.unbindAll()
        this.clearProxyCache()
        this.clearDelayList()
        this.element.removeData()
    },
    canBeDestroyed() {
        return jQuery.contains(document, this.element.get(0)) === false
    },
})

function sortControls(a, b) {
    let c = a.querySelectorAll(ATTR_SELECTOR).length,
        d = b.querySelectorAll(ATTR_SELECTOR).length
    if ((c && !d) || c > d) return 1
    if ((!c && d) || c < d) return -1
    return 0
}

function cleanControls(force) {
    controls.forEach(function (control, index) {
        if (control.canBeDestroyed() || force) {
            control.destroy()
            controls.splice(index, 1)
        }
    })
}

/**
 * @template {string} T
 * @param {T} name
 * @param extend
 * @param [proto]
 */
function createControl(name, extend, proto) {
    if (controlRegistry[name]) {
        console.info('control with name [%s] is already exist', name)
        return controlRegistry[name]
    }
    /**
     * @type {extend & proto}
     * @extends Control
     */
    controlRegistry[name] = (proto ? controlRegistry[extend] : Control).extend(
        proto ? proto : extend,
        name
    )
    return controlRegistry[name]
}

/**
 * @template {string} T
 * @param {T} name
 * @returns {controlRegistry[T] & Control}
 */

function initControl(name) {
    const params = [].slice.call(arguments, 1)
    if (typeof controlRegistry[name] !== 'function') return
    return newInstance(controlRegistry[name], params)
}

function initControls(element) {
    cleanControls()
    Array.prototype.slice
        .call(element.querySelectorAll(ATTR_SELECTOR))
        .sort(sortControls)
        .forEach(function (item) {
            item.getAttribute(ATTR)
                .split(',')
                .forEach(function (name) {
                    initControl(name, item)
                })
            item.removeAttribute(ATTR)
        })
}

export {
    createControl,
    sortControls,
    cleanControls,
    initControl,
    initControls,
    Control,
}
