import $ from './jquery'
import {createClass, getClass} from "./class";
import {createModel,getModel} from "./model";
import {view} from './view'
import {initControls} from "./control";
import {urlLocation} from "./location";

/**
 *
 * @param path
 * @returns {RegExp}
 */
const pathToRegexp = function (path) {
    let result, keys = [], parse = function (_, slsh, format, key, capture, opt) {
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
const pathMatch = function (regexp, path) {
    let key;
    let match = regexp.exec(path);
    let params = {};
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
const listener = {
    hashchange: function (run) {
        urlLocation.bind(function () {
            run(this.path());
        });
        if (urlLocation.part(0) === '') {
            urlLocation.assign('/');
        } else {
            run(urlLocation.path());
        }
    }
};
/**
 * @name RouterQueue
 */
createModel('router.queue', {
    init: function(response){
        this.response = response;
        this.start();
    },
    start: function(){
        this.list     = {};
        this.defer    = $.Deferred();
        this.defer.progress(function(name,response){
            if( this.has(name) ) {
                this.complete(name,response);
            }
        });
    },
    has(name){
        return this.list.hasOwnProperty(name)
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
        if( this.has(name) ) {
            delete this.list[name];
        }
        return this;
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
            this.remove(name);
        },this);
        this.list = {};
    },
    add: function(name,defer){
        let queue = this;
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
createModel('router.response', {
    init: function(data){
        this.extend(data);
        this.__q = getModel('router.queue',this);
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
        let query = urlLocation.query();
        this.attr('query',query);
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
createClass('route', {
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
const Router = createClass('router', {
    init: function () {
        this._before_ = [];
        this._after_  = [];
        this._routes_ = {};
        this.request  = getModel('router.request');
        this.response = getModel('router.response');
    },
    prepare: function(){
        this.request.attr('path','');
        this.request.attr('params',{});
        this.request.attr('parent',{});
        this.response.attr('data',{});
        this.response.stop();
    },
    route: function (path) {
        let route = this._routes_[path] || getClass('route', path);
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
        (function next(cx,index) {
            let params = [];
            let route  = list[index] || false;
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
        let route,result = getClass('route', path);
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

export {Router}