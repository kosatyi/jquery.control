/**
 * @external jQuery
 * @type function
 */
const jQuery = window['jQuery'];

function getType(o) {
  return {}.toString.call(o).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}
/**
 *
 * @param value
 * @return {*}
 */
function isArray(value) {
  return Array.isArray(value);
}
/**
 *
 * @param value
 * @return {boolean}
 */
function isFunction(value) {
  return typeof value === 'function';
}

/**
 *
 * @param o
 * @return {boolean}
 */
function isAnyObject(o) {
  return getType(o) === 'object';
}
/**
 *
 * @param value
 * @returns {*}
 */
function isPlainObject(value) {
  if (isAnyObject(value) === false) return false;
  return value.constructor === Object && Object.getPrototypeOf(value) === Object.prototype;
}
/**
 *
 * @param object
 * @param callback
 * @param thisArg
 */
function forEach$1(object, callback, thisArg) {
  let prop,
    context = thisArg || callback;
  for (prop in object) {
    if (object.hasOwnProperty(prop)) {
      callback.call(context, object[prop], prop);
    }
  }
}

/**
 *
 * @param obj
 * @returns {{}}
 */
function sortObject(obj) {
  return Object.keys(obj).sort().reduce(function (result, key) {
    result[key] = obj[key];
    return result;
  }, {});
}

/**
 *
 * @param a
 * @return {string}
 */
function arrayStringify(a) {
  return JSON.stringify(a.slice().sort());
}

/**
 *
 * @param a1
 * @param a2
 * @return {boolean}
 */
function compareArrays(a1, a2) {
  return arrayStringify(a1) === arrayStringify(a2);
}

/**
 *
 * @param path
 * @return {RegExp}
 */
function pathToRegexp(path) {
  let result,
    keys = [];
  function parse(_, slash, format, key, capture, opt) {
    keys.push({
      name: key,
      optional: !!opt
    });
    slash = slash || '';
    return '' + (opt ? '' : slash) + '(?:' + (opt ? slash : '') + (format || '') + (capture || format && '([^/.]+?)' || '([^/]+?)') + ')' + (opt || '');
  }
  path = path.concat('/?');
  path = path.replace(/\/\(/g, '(?:/').replace(/\+/g, '__plus__').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, parse).replace(/([\/.])/g, '\\$1').replace(/__plus__/g, '(.+)').replace(/\*/g, '(.*)').replace(/@num/g, '\\d+').replace(/@word/g, '\\w+');
  result = new RegExp('^' + path + '$', '');
  result.keys = keys;
  return result;
}
/**
 *
 * @param regexp
 * @param path
 * @returns {{}|boolean}
 */
function pathMatch(regexp, path) {
  let key;
  let match = regexp.exec(path);
  let params = {};
  if (!match) return false;
  for (let i = 1, len = match.length; i < len; ++i) if (key = regexp.keys[i - 1]) params[key.name] = typeof match[i] === 'string' ? decodeURIComponent(match[i]) : match[i];
  return params;
}

const classRegistry = {};
const initState = {
  value: false
};
const hasSuper = fn => {
  return !!~fn.toString().indexOf('this._super(');
};
const setPrototypeOf = function (o, p) {
  const setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind(null) : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return setPrototypeOf(o, p);
};
const newConstructor = function (parent, params) {
  const a = [null];
  a.push.apply(a, params);
  return Function.bind.apply(parent, a);
};
const newInstance = function (parent, params, extend) {
  const Constructor = newConstructor(parent, params);
  const instance = new Constructor();
  if (extend) setPrototypeOf(instance, extend.prototype);
  return instance;
};
const superMethod = function (parent, name, method) {
  return function () {
    let temp = this._super,
      result;
    this._super = parent[name];
    result = method.apply(this, arguments);
    this._super = temp;
    return result;
  };
};
const assign = function (target, instance) {
  let prop,
    proto,
    parent = target.prototype;
  initState.value = true;
  proto = new target();
  initState.value = false;
  for (prop in instance) {
    if (instance.hasOwnProperty(prop)) {
      if (isFunction(parent[prop]) && isFunction(instance[prop]) && hasSuper(instance[prop])) {
        proto[prop] = superMethod(parent, prop, instance[prop]);
      } else {
        proto[prop] = instance[prop];
      }
    }
  }
  return proto;
};
/**
 * @type {function}
 * @name Class
 * @constructor
 */
const Class = function () {};
Class.prototype = {
  _super() {},
  instance() {
    return newInstance(this.constructor, arguments);
  },
  proxy(fn) {
    fn = typeof fn == 'string' ? this[fn] : fn;
    return function (cx, cb) {
      return function () {
        return cb.apply(cx, [this].concat([].slice.call(arguments)));
      };
    }(this, fn);
  }
};
Class.extend = function extend(instance, name) {
  /**
   *
   * @constructor
   * @property {Function} init
   */
  function Class() {
    if (!initState.value && this.init) this.init.apply(this, arguments);
  }
  Class.prototype = assign(this, instance);
  Class.prototype.name = name;
  Class.prototype.constructor = Class;
  Class.extend = extend;
  return Class;
};

/**
 * @template {string} T
 * @param {T} name
 * @param extend
 * @param [proto]
 */
function createClass(name, extend, proto) {
  if (classRegistry[name]) {
    return classRegistry[name];
  }
  /**
   * @type {extend & proto}
   * @extends Class
   */
  classRegistry[name] = (proto ? classRegistry[extend] : Class).extend(proto ? proto : extend, name);
  return classRegistry[name];
}
function getClass(name, data) {
  if (typeof classRegistry[name] !== 'function') return null;
  return new classRegistry[name](data);
}

function deparam(params, coerce, spaces) {
  let obj = {},
    coerce_types = {
      'true': !0,
      'false': !1,
      'null': null
    };
  if (spaces) params = params.replace(/\+/g, ' ');
  params.split('&').forEach(function (v) {
    let param = v.split('='),
      key = decodeURIComponent(param[0]),
      val,
      cur = obj,
      i = 0,
      keys = key.split(']['),
      keys_last = keys.length - 1;
    if (/\[/.test(keys[0]) && /]$/.test(keys[keys_last])) {
      keys[keys_last] = keys[keys_last].replace(/]$/, '');
      keys = keys.shift().split('[').concat(keys);
      keys_last = keys.length - 1;
    } else {
      keys_last = 0;
    }
    if (param.length === 2) {
      val = decodeURIComponent(param[1]);
      if (coerce) {
        val = val && !isNaN(val) && +val + '' === val ? +val : val === 'undefined' ? undefined : coerce_types[val] !== undefined ? coerce_types[val] : val;
      }
      if (keys_last) {
        for (; i <= keys_last; i++) {
          key = keys[i] === '' ? cur.length : keys[i];
          cur = cur[key] = i < keys_last ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : []) : val;
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
      obj[key] = coerce ? undefined : '';
    }
  });
  return obj;
}

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
function clean(obj) {
  let prop;
  for (prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (obj[prop].length === 0) {
        if (isArray(obj)) obj.splice(prop, 1);
        if (isPlainObject(obj)) delete obj[prop];
      } else if (typeof obj[prop] == 'object') {
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
function getFormData(filter, coerce) {
  let form = this.serializeArray().map(function (field) {
    return [field.name, encodeURIComponent(field.value)].join('=');
  }).join('&');
  let params = deparam(form, coerce, false);
  return filter === true ? clean(params) : params;
}

/**
 *
 * @param data
 * @returns {setFormData}
 */
function setFormData(data) {
  this.find('[name]').each(function (index, element) {
    let current = $(element);
    let parts = current.attr('name').match(breaker);
    let value = attr(data, parts.join('.'));
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

let skip = false;
const UrlLocation = {
  prefix: '#',
  type: 'hash',
  event: 'hashchange',
  callbacks: [],
  initialize: false,
  url: function (url, replace) {
    location[replace === true ? 'replace' : 'assign'](url);
    return this;
  },
  normalize: function (url) {
    let prefix = this.prefix;
    if (url.indexOf('http') === 0) prefix = '';else if (url.indexOf('#') === 0) prefix = '';
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
  json: function (value, replace, silent) {
    let href = this.href();
    let chunk = href.split('#')[0].split('?')[1] || '{}';
    if (arguments.length) {
      value = value ? [this.part(0), JSON.stringify(value)].join('?') : this.part(0);
      this[replace ? 'replace' : 'assign'](value, silent);
    } else {
      try {
        chunk = decodeURIComponent(chunk);
        chunk = JSON.parse(chunk);
      } catch (e) {
        chunk = {};
      }
      return chunk;
    }
  },
  bind: function (callback) {
    this.callbacks.push(callback);
    this.changeHandler = this.changeHandler || this.change.bind(this);
    if (this.initialize === false) {
      window.addEventListener(this.event, this.changeHandler);
      this.initialize = true;
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
    let index;
    if (skip === true) {
      return skip = false;
    }
    if (this.callbacks.length) {
      for (index in this.callbacks) {
        if (this.callbacks.hasOwnProperty(index)) {
          this.callbacks[index].call(this);
        }
      }
    }
  }
};

/**
 * @template {string} T
 * @type {{T:Model}}
 */
const modelRegistry = {};
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
    return typeof prop === 'undefined' ? defaults : prop;
  },
  defer() {
    return jQuery.Deferred();
  },
  resolve() {
    return this.defer().resolve(this);
  },
  attr(key, value) {
    let setter = arguments.length > 1;
    let data = this.$data;
    let name = (key || '').split('.');
    let prop = name.pop();
    for (let i = 0; i < name.length; i++) {
      let chunk = name[i];
      if (data && data.hasOwnProperty(chunk)) {
        let item = data[chunk];
        if (isFunction(item.attr)) {
          let args = [key.split('.').slice(i + 1).join('.')];
          setter && args.push(value);
          return item.attr.apply(item, args);
        } else {
          data = data[chunk];
        }
      } else {
        if (setter) {
          data = data[chunk] = {};
        } else {
          break;
        }
      }
    }
    if (setter) {
      data[prop] = value;
    } else {
      return data ? data[prop] : undefined;
    }
    return this;
  },
  eachItem(args) {
    let name = args[1] ? args[0] : null;
    let callback = args[1] ? args[1] : args[0];
    let value = name ? this.alt(name, []) : this.$data;
    return {
      value: sortObject(value),
      isArray: isArray(value),
      callback: callback
    };
  },
  each() {
    let each = this.eachItem(arguments);
    forEach$1(each.value, function (value, key) {
      each.callback(this.instance(value), value, key);
    }, this);
  },
  serialize() {
    const context = this;
    return function callback(data) {
      const result = isArray(data) ? [] : {};
      for (let prop in data) {
        if (data.hasOwnProperty(prop)) {
          let value = data[prop];
          if (value === context) {
            continue;
          }
          if (value && isFunction(value.serialize)) {
            result[prop] = value.serialize();
          } else {
            if (isArray(value) || isPlainObject(value)) {
              result[prop] = callback(value);
            } else {
              result[prop] = value;
            }
          }
        }
      }
      return result;
    }(this.$data);
  },
  stringify: function () {
    return JSON.stringify(this.serialize());
  }
});
/**
 * @template {string} T
 * @param {T} name
 * @param extend
 * @param [proto]
 */
function createModel(name, extend, proto) {
  if (modelRegistry[name]) {
    return modelRegistry[name];
  }
  /**
   * @type {extend & proto}
   * @extends Model
   */
  modelRegistry[name] = (proto ? modelRegistry[extend] : Model).extend(proto ? proto : extend, name);
  return modelRegistry[name];
}

/**
 * @template {string} T
 * @param {T} name
 * @param {object} [data]
 */
function getModel(name, data) {
  if (typeof modelRegistry[name] !== 'function') return;
  return new modelRegistry[name](data);
}

/**
 *
 * @type {{string:Control}}
 */
const controlRegistry = {};
const controls = [];
const ATTR = 'control';
const ATTR_SELECTOR = '[' + ATTR + ']';

/**
 * @name Control
 * @property {jQuery} element
 * @property {jQuery} window
 * @property {jQuery} document
 * @type {Class|*}
 */
const Control = Class.extend({
  addControlClassName: true,
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
  _addProxy_: function (f, s, p) {
    if (p.length === f) p[f - 1] = this.proxy(p[f - 1]);
    if (p.length === s) p[s - 1] = this.proxy(p[s - 1]);
    return p;
  },
  /**
   *
   * @param type
   * @param params
   * @returns Control
   * @private
   */
  _event_: function (type, params) {
    let args = this.toArray(params);
    args = this._addProxy_(2, 3, args);
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
    this.element = jQuery(element);
    if (this.addControlClassName === true) {
      this.element.addClass(this.name.split('.').join('-'));
    }
  },
  /**
   *
   * @param element
   */
  create: function (element) {},
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
    if (!this._bindings_) {
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
    tag = jQuery(document.createElement(tag));
    if (className) tag.addClass(className);
    if (attrs) tag.attr(attrs);
    return tag;
  },
  clearProxyCache: function () {
    forEach$1(this._proxy_cache_, function (value, prop) {
      delete this._proxy_cache_[prop];
    }, this);
  },
  bind: function () {
    let el,
      args = this.toArray(arguments);
    this.addBinding(args);
    args = this._addProxy_(3, 4, args);
    el = this[args[0]] || jQuery(args[0]);
    el.on.apply(el, args.slice(1));
    return this;
  },
  unbind: function () {
    let el,
      args = this.toArray(arguments);
    this.initBindings();
    this._bindings_ = this._bindings_.filter(function (item) {
      return compareArrays(item, args) === false;
    }, this);
    args = this._addProxy_(3, 4, args);
    el = this[args[0]] || jQuery(args[0]);
    el.off.apply(el, args.slice(1));
    return this;
  },
  unbindAll: function () {
    this.initBindings();
    this._bindings_.forEach(function (value) {
      this.unbind.apply(this, value);
    }, this);
    this._bindings_ = [];
    return this;
  },
  on: function () {
    this._event_('on', arguments);
    return this;
  },
  off: function () {
    this._event_('off', arguments);
    return this;
  },
  timeout: function (callback, time) {
    if (!this._idle_timeout_) this._idle_timeout_ = {};
    clearTimeout(this._idle_timeout_[callback]);
    delete this._idle_timeout_[callback];
    if (time === false) return this;
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
    return jQuery.contains(document, this.element.get(0)) === false;
  }
});
function sortControls(a, b) {
  let c = a.querySelectorAll(ATTR_SELECTOR).length,
    d = b.querySelectorAll(ATTR_SELECTOR).length;
  if (c && !d || c > d) return 1;
  if (!c && d || c < d) return -1;
  return 0;
}
function cleanControls(force) {
  controls.forEach(function (control, index) {
    if (control.canBeDestroyed() || force) {
      control.destroy();
      controls.splice(index, 1);
    }
  });
}

/**
 * @template {string} T
 * @param {T} name
 * @param extend
 * @param [proto]
 */
function createControl(name, extend, proto) {
  if (controlRegistry[name]) {
    console.info('control with name [%s] is already exist', name);
    return controlRegistry[name];
  }
  /**
   * @type {extend & proto}
   * @extends Control
   */
  controlRegistry[name] = (proto ? controlRegistry[extend] : Control).extend(proto ? proto : extend, name);
  return controlRegistry[name];
}

/**
 * @template {string} T
 * @param {T} name
 * @returns {controlRegistry[T] & Control}
 */

function initControl(name) {
  const params = [].slice.call(arguments, 1);
  if (typeof controlRegistry[name] !== 'function') return;
  return newInstance(controlRegistry[name], params);
}
function initControls(element) {
  cleanControls();
  Array.prototype.slice.call(element.querySelectorAll(ATTR_SELECTOR)).sort(sortControls).forEach(function (item) {
    item.getAttribute(ATTR).split(',').forEach(function (name) {
      initControl(name, item);
    });
    item.removeAttribute(ATTR);
  });
}

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
  let prop,
    context = thisArg || callback;
  for (prop in object) {
    if (object.hasOwnProperty(prop)) {
      callback.call(context, object[prop], prop);
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
    return typeof params[prop] != 'undefined' ? params[prop] : match;
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
    if (typeof data.callback === 'function') {
      data.callback(node);
    }
    delete listAttr[id];
  });
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
    if (typeof item.callback === 'function') {
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
  let matcher = new RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g');
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
  source = "var __t,__p='',__j=[].join,print=function(){__p+=__j.call(arguments,'');};" + source + "return __p;\n//# sourceURL=[" + name + "]";
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
};

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
    return jQuery.extend({}, this, data || {}, helpers);
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
    let i = 0,
      c = false;
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
};
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
    listAttr[id] = {
      tag: tag,
      callback: callback
    };
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
    listProp[id] = {
      selector: ['[', id, ']'].join(''),
      callback: callback
    };
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
  listPreload[url] = listPreload[url] || jQuery.get(url).then(function (content) {
    jQuery.extend(listView, content);
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

/**
 *
 * @type {{hashchange: listener.hashchange}}
 */
const listener = {
  hashchange: function (run) {
    UrlLocation.bind(function () {
      run(UrlLocation.path());
    });
    if (UrlLocation.part(0) === '') {
      UrlLocation.assign('/');
    } else {
      run(UrlLocation.path());
    }
  }
};
/**
 * @name RouterQueue
 */
createModel('router.queue', {
  init(response) {
    this.callbacks = [];
    this.response = response;
    this.reset();
  },
  reset() {
    this.list = {};
    this.callbacks.length = 0;
  },
  has(name) {
    return this.list.hasOwnProperty(name);
  },
  empty() {
    return Object.keys(this.list).length === 0;
  },
  complete(name, value) {
    this.remove(name);
    this.response.attr(name, value);
    if (this.empty()) {
      this.callbacks.forEach(callback => {
        this.callbacks.splice(this.callbacks.indexOf(callback), 1);
        callback();
      });
    }
  },
  remove(name) {
    if (this.has(name)) {
      delete this.list[name];
    }
    return this;
  },
  then(fn) {
    if (this.empty()) {
      fn();
    } else {
      this.callbacks.push(fn);
    }
    return this;
  },
  stop() {
    Object.keys(this.list).forEach(name => {
      this.remove(name);
    });
    this.list = {};
    this.callbacks.length = 0;
  },
  notify(name, response) {
    if (this.has(name)) {
      this.complete(name, response);
    }
  },
  add(name, promise) {
    this.list[name] = promise.then(content => {
      this.notify(name, content);
    }, () => {
      this.notify(name);
    });
    return this;
  }
});
/**
 * @name RouterResponse
 */
createModel('router.response', {
  init: function (data) {
    this.extend(data);
    this.defer = getModel('router.queue', this);
  },
  queue: function (name, defer) {
    this.defer.add(name, defer);
    return this;
  },
  then: function (callback) {
    this.defer.then(callback);
    return this;
  },
  stop: function () {
    this.defer.stop();
    return this;
  },
  render: function (wrapper, template, data) {
    wrapper = document.querySelector(wrapper);
    template = view(template).render(data);
    wrapper.innerHTML = '';
    wrapper.appendChild(template);
    initControls(wrapper);
    return wrapper;
  }
});
/**
 * @name RouterRequest
 */
createModel('router.request', {
  query: function () {
    let query = UrlLocation.query();
    this.attr('query', query);
    return query;
  },
  match: function (exp) {
    return new RegExp(exp).test(this.attr('path'));
  },
  model: function () {
    let args = [].slice.call(arguments);
    let name = args.shift();
    let method = args.shift();
    let model = getModel(name);
    if (method && typeof model[method] === 'function') {
      return model[method].apply(model, args);
    }
    return model;
  },
  getChildPath: function () {
    return '/'.concat(this.alt('params._path_', ''));
  },
  path: function (value) {
    this.attr('path', value);
  },
  params: function (data) {
    data = Object.assign({}, this.alt('parent', {}), data || {});
    this.attr('params', data);
    this.attr('parent', data);
  }
});
/**
 * @name Route
 */
createClass('route', {
  init: function (name) {
    this.params = {};
    this.callbacks = [];
    this.name = name;
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
const Router = createClass('router', {
  init: function () {
    this._before_ = [];
    this._after_ = [];
    this._routes_ = {};
    this.request = getModel('router.request');
    this.response = getModel('router.response');
  },
  prepare: function () {
    this.request.attr('path', '');
    this.request.attr('params', {});
    this.request.attr('parent', {});
    this.response.attr('data', {});
    this.response.stop();
  },
  route: function (path) {
    let route = this._routes_[path] || getClass('route', path);
    this._routes_[path] = route;
    return route;
  },
  use: function (path) {
    return this.route(path.concat('/', ':_path_(*)?'));
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
    this.request = request;
    this.response = response;
    this.find(this.request.getChildPath(), next);
  },
  apply: function (context, params) {
    this.call(context, params[0], params[1], params[2]);
  },
  process: function (list, complete) {
    (function next(cx, index) {
      let params = [];
      let route = list[index] || false;
      if (route === false) return complete && complete.call && complete.call(cx);
      params.push(cx.request);
      params.push(cx.response);
      params.push(function () {
        cx.response.then(function () {
          next(cx, ++index);
        });
      });
      list[index].apply(cx, params);
    })(this, 0);
  },
  start: function (route, complete) {
    this.request.path(route.path);
    this.request.params(route.params);
    this.request.query();
    this.process(this._before_, function () {
      this.process(route.getCallbacks(), function () {
        this.process(this._after_, complete);
      });
    });
  },
  find: function (path, complete) {
    let route,
      result = getClass('route', path);
    if (complete === true) {
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
    this.start(result, complete);
  },
  listen: function (callback) {
    if (typeof callback === 'string' && typeof listener[callback] === 'function') callback = listener[callback];
    callback(function (that) {
      return function (path) {
        that.find(path, true);
      };
    }(this));
    return this;
  }
});

function BackupStorage() {}
BackupStorage.prototype = {
  getItem: function (key) {
    return this[key];
  },
  setItem: function (key, value) {
    this[key] = value;
  },
  removeItem: function (key) {
    delete this[key];
  },
  clear: function () {
    for (let key in this) {
      if (this.hasOwnProperty(key)) {
        delete this[key];
      }
    }
  }
};
const backupStorage = new BackupStorage();
const StorageProvider = 'localStorage' in window && window['localStorage'] ? window['localStorage'] : backupStorage;

const StorageCache = {
  storageProvider: StorageProvider,
  set: function (key, data, ttl) {
    ttl = new Date().getTime() + ttl * 1000 * 60;
    try {
      StorageProvider.setItem(['cache', key, 'ttl'].join(':'), ttl);
      StorageProvider.setItem(['cache', key].join(':'), JSON.stringify(data));
    } catch (e) {
      StorageProvider.clear();
    }
    return this;
  },
  expire: function (key) {
    StorageProvider.removeItem(['cache', key, 'ttl'].join(':'));
    StorageProvider.removeItem(['cache', key].join(':'));
    return this;
  },
  exist: function (key) {
    let ttl = Storage.getItem(['cache', key, 'ttl'].join(':'));
    return !!(ttl && ttl > new Date().getTime());
  },
  get: function (key) {
    return JSON.parse(Storage.getItem(['cache', key].join(':')));
  },
  list: function () {
    let key,
      list = [];
    for (key in StorageProvider) {
      if (StorageProvider.hasOwnProperty(key)) {
        if (key.indexOf('cache:') !== -1 && key.indexOf(':ttl') === -1) {
          list.push(key.slice(6));
        }
      }
    }
    return list;
  },
  clear: function (force) {
    this.list().forEach(function (key) {
      (force === true || this.exist(key) === false) && this.expire(key);
    }.bind(this));
  }
};

jQuery.fn.setFormData = setFormData;
jQuery.fn.getFormData = getFormData;
jQuery.fn.initControls = function () {
  this.each(function (index, element) {
    initControls(element);
  });
};

export { jQuery as $, Class, Control, Model, Router, StorageCache, UrlLocation, cleanControls, createClass, createControl, createModel, deparam, getClass, getModel, initControl, pathMatch, pathToRegexp, view };
