const classes = {};

let init = false;

const fnTest = /xyz/.test(function () {
    return 'xyz';
}.toString()) ? /\b_super\b/ : /.*/;

const superMethod = function(parent,name,method){
    return function () {
        var temp = this._super, result;
        this._super = parent[name];
        result = method.apply(this,arguments);
        this._super = temp;
        return result;
    };
}

const assign = function(target,instance){
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
const Class = function(){

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
