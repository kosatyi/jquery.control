var $        = require('jquery');
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
 */
$.ejs = View;
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