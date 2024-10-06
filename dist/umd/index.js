(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.jqctrl = {}));
})(this, (function (exports) { 'use strict';

    /**
     * @external jQuery
     * @type {jQuery}
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
    function forEach(object, callback, thisArg) {
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
     * @param b
     * @return {boolean}
     */
    function arrayEqual(a, b) {
      if (a === b) return true;
      if (a == null || b == null) return false;
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
      }
      return true;
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
      Class.prototype.$className = name;
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
      let form = this.serializeArray().map(field => [field.name, encodeURIComponent(field.value)].join('=')).join('&');
      let params = deparam(form, coerce, false);
      return filter === true ? clean(params) : params;
    }

    /**
     *
     * @param data
     * @returns {setFormData}
     */
    function setFormData(data) {
      this.find('[name]').each((index, element) => {
        let current = this.find(element);
        let parts = current.attr('name').match(breaker);
        let value = attr(data, parts.join('.'));
        if (value) {
          if (current.is(':radio')) {
            if (current.val() === value) {
              current.attr('checked', true);
            }
          } else if (current.is(':checkbox')) {
            value = isArray(value) ? value : [value];
            if (value.indexOf(current.val()) > -1) {
              current.attr('checked', true);
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
      forEach,
      init(data) {
        this.extend(data);
      },
      extend(data) {
        if (data) {
          this.$data = data;
        } else {
          this.$data = {};
        }
      },
      alt(prop, defaults) {
        prop = this.attr(prop);
        return prop === undefined || prop === null || prop === '' ? defaults : prop;
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
        this.forEach(each.value, function (value, key) {
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
     * @type {{hashchange: function(run: function)}}
     */
    const listener = {
      hashchange(run) {
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
      init(data) {
        this.extend(data);
        this.defer = getModel('router.queue', this);
      },
      queue(name, defer) {
        this.defer.add(name, defer);
        return this;
      },
      then(callback) {
        this.defer.then(callback);
        return this;
      },
      stop() {
        this.defer.stop();
        return this;
      },
      render(wrapper, template, data) {
        console.info('render function call', wrapper, template, data);
      }
    });
    /**
     * @name RouterRequest
     */
    createModel('router.request', {
      query() {
        let query = UrlLocation.query();
        this.attr('query', query);
        return query;
      },
      match(exp) {
        return new RegExp(exp).test(this.attr('path'));
      },
      model() {
        let args = [].slice.call(arguments);
        let name = args.shift();
        let method = args.shift();
        let model = getModel(name);
        if (method && typeof model[method] === 'function') {
          return model[method].apply(model, args);
        }
        return model;
      },
      getChildPath() {
        return '/'.concat(this.alt('params._path_', ''));
      },
      path(value) {
        this.attr('path', value);
      },
      params(data) {
        data = Object.assign({}, this.alt('parent', {}), data || {});
        this.attr('params', data);
        this.attr('parent', data);
      }
    });
    /**
     * @name Route
     */
    createClass('route', {
      init(name) {
        this.params = {};
        this.callbacks = [];
        this.name = name;
        this.regex = pathToRegexp(name);
      },
      then(fn) {
        this.callbacks.push(fn);
        return this;
      },
      match(path) {
        this.path = path;
        this.params = pathMatch(this.regex, this.path);
        return !!this.params;
      },
      getCallbacks() {
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
      init() {
        this._before_ = [];
        this._after_ = [];
        this._routes_ = {};
        this.request = getModel('router.request');
        this.response = getModel('router.response');
      },
      prepare() {
        this.request.attr('path', '');
        this.request.attr('params', {});
        this.request.attr('parent', {});
        this.response.attr('data', {});
        this.response.stop();
      },
      route(path) {
        let route = this._routes_[path] || getClass('route', path);
        this._routes_[path] = route;
        return route;
      },
      use(path) {
        return this.route(path.concat('/', ':_path_(*)?'));
      },
      before(fn) {
        this._before_.push(fn);
        return this;
      },
      after(fn) {
        this._after_.push(fn);
        return this;
      },
      call(context, request, response, next) {
        this.request = request;
        this.response = response;
        this.find(this.request.getChildPath(), next);
      },
      apply(context, params) {
        this.call(context, params[0], params[1], params[2]);
      },
      process(list, complete) {
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
      start(route, complete) {
        this.request.path(route.path);
        this.request.params(route.params);
        this.request.query();
        this.process(this._before_, function () {
          this.process(route.getCallbacks(), function () {
            this.process(this._after_, complete);
          });
        });
      },
      find(path, complete) {
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
      listen(callback) {
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
      _event_(type, params) {
        let args = this.toArray(params);
        args = this._addProxy_(2, 3, args);
        this.element[type].apply(this.element, args);
        return this;
      },
      /**
       * @constructor
       * @param element
       */
      init(element) {
        this.pushInstance();
        this.initElement(element);
        this.create(element);
      },
      /**
       *
       */
      pushInstance() {
        controls.push(this);
      },
      /**
       *
       * @param element
       */
      initElement(element) {
        this.element = jQuery(element);
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
        return Array.prototype.slice.call(arr);
      },
      /**
       *
       */
      initBindings() {
        if (!this._bindings_) {
          this._bindings_ = [];
        }
      },
      /**
       *
       * @param args
       */
      addBinding(args) {
        this.initBindings();
        this._bindings_.push([].concat(args));
      },
      /**
       *
       * @param fn
       * @returns {*}
       */
      proxy(fn) {
        if (!this._proxy_cache_) this._proxy_cache_ = {};
        if (!this._proxy_cache_[fn]) {
          this._proxy_cache_[fn] = this._super(fn);
        }
        return this._proxy_cache_[fn];
      },
      /**
       * @returns {jQuery}
       */
      find() {
        return this.element.find.apply(this.element, arguments);
      },
      /**
       *
       * @param {string} tag
       * @param {string} [className]
       * @param {Object<string,string>} [attrs]
       * @returns {jQuery}
       */
      el(tag, className, attrs) {
        const el = jQuery(document.createElement(tag));
        if (className) el.addClass(className);
        if (attrs) el.attr(attrs);
        return el;
      },
      clearProxyCache() {
        forEach(this._proxy_cache_, function (value, prop) {
          delete this._proxy_cache_[prop];
        }, this);
      },
      bind() {
        let args = this.toArray(arguments);
        this.addBinding(args);
        args = this._addProxy_(3, 4, args);
        let el = this[args[0]] || jQuery(args[0]);
        el.on.apply(el, args.slice(1));
        return this;
      },
      unbind() {
        let args = this.toArray(arguments);
        this.initBindings();
        this._bindings_ = this._bindings_.filter(item => arrayEqual(item, args) === false);
        args = this._addProxy_(3, 4, args);
        let el = this[args[0]] || jQuery(args[0]);
        el.off.apply(el, args.slice(1));
        return this;
      },
      unbindAll() {
        this.initBindings();
        this._bindings_.forEach(function (value) {
          this.unbind.apply(this, value);
        }, this);
        this._bindings_ = [];
        return this;
      },
      on() {
        this._event_('on', arguments);
        return this;
      },
      off() {
        this._event_('off', arguments);
        return this;
      },
      delay(callback, time) {
        callback = this.proxy(callback, true);
        const params = [callback, time].concat(Array.from(arguments).slice(2));
        if (!this._delay_map_) this._delay_map_ = new WeakMap();
        if (!this._delay_set_) this._delay_set_ = new Set();
        if (this._delay_map_.has(callback)) {
          clearTimeout(this._delay_map_.get(callback));
        }
        const delay = setTimeout.apply(null, params);
        this._delay_set_.add(delay);
        this._delay_map_.set(callback, delay);
        return this;
      },
      clearDelayList() {
        if (!this._delay_set_) return true;
        this._delay_set_.forEach(delay => {
          clearTimeout(delay);
        });
        this._delay_set_ = null;
        this._delay_map_ = null;
      },
      destroy() {
        this.off();
        this.unbindAll();
        this.clearProxyCache();
        this.clearDelayList();
        this.element.removeData();
      },
      canBeDestroyed() {
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

    jQuery.fn.setFormData = setFormData;
    jQuery.fn.getFormData = getFormData;
    jQuery.fn.initControls = function () {
      this.each(function (index, element) {
        initControls(element);
      });
    };

    exports.$ = jQuery;
    exports.Class = Class;
    exports.Control = Control;
    exports.Model = Model;
    exports.Router = Router;
    exports.StorageCache = StorageCache;
    exports.UrlLocation = UrlLocation;
    exports.cleanControls = cleanControls;
    exports.createClass = createClass;
    exports.createControl = createControl;
    exports.createModel = createModel;
    exports.deparam = deparam;
    exports.getClass = getClass;
    exports.getModel = getModel;
    exports.initControl = initControl;
    exports.pathMatch = pathMatch;
    exports.pathToRegexp = pathToRegexp;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
