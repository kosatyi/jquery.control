const $        = jQuery;
const Class    = require('./core/class');
const Location = require('./core/location');
const Control  = require('./core/control');
const Model    = require('./core/model');
const Locale   = require('./plugins/locale');
const Form     = require('./core/form');
const Router   = require('./core/router');
const View     = require('./core/view');
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
 */
$.deparam = Form.deparam
/**
 * @memberOf $
 * @property ejs
 * @deprecated
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

