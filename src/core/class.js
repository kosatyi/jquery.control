const classes = {};

let init = false;

const fnTest = /xyz/.test(function () {
    return 'xyz';
}.toString()) ? /\b_super\b/ : /.*/;

const setPrototypeOf = function(o, p) {
    const setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind(null) : function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return setPrototypeOf(o, p);
}

const newConstructor = function(parent,params){
    const a = [null];
    a.push.apply(a,params);
    return Function.bind.apply(parent, a);
}

const newInstance = function(parent, params, extend){
    const Constructor = newConstructor(parent,params);
    const instance = new Constructor();
    if( extend ) setPrototypeOf(instance,extend.prototype)
    return instance;
}


const superMethod = function(parent,name,method){
    return function () {
        let temp = this._super, result;
        this._super = parent[name];
        result = method.apply(this,arguments);
        this._super = temp;
        return result;
    };
}

const assign = function(target,instance){
    let prop,proto,parent = target.prototype;
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
 * @type {function}
 * @name Class
 * @constructor
 */
const Class = function(){

};

Class.prototype._super = function(){

}

Class.prototype.instance = function(params){
    return newInstance(this.constructor,arguments)
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

function createClass(name, extend, proto) {
    if (classes[name]) {
        return classes[name];
    }
    classes[name] = (proto ? classes[extend] : Class).extend(proto ? proto : extend, name);
    return classes[name];
}

function getClass(name, data) {
    if (typeof(classes[name]) !== 'function') return null;
    return new classes[name](data);
}

export {
    Class,
    getClass,
    newInstance,
    createClass,
}