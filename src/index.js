import $ from './core/jquery';
import {Class, createClass, getClass} from './core/class'
import {urlLocation} from './core/location'
import {cleanControls, Control, createControl, initControl, initControls} from './core/control'
import {createModel, getModel, Model} from './core/model'
import {setFormData, getFormData, deparam} from './core/form'
import {Router} from './core/router'
import {view} from './core/view'
import {Cache} from './utils/cache'

/**
 * @memberOf $
 * @property storageCache
 */
$.storageCache = Cache
/**
 * @memberOf $
 * @property Class
 */
$.Class = Class;
/**
 * @memberOf $
 * @property Model
 */
$.Model = Model;
/**
 * @memberOf $
 * @property Control
 */
$.Control = Control;
/**
 * @memberOf $
 * @property Router
 */
$.Router = Router;
/**
 * @memberOf $
 * @property createClass
 * @type {function(*=, *, *): (*)}
 */
$.createClass = createClass;
/**
 * @memberOf $
 * @property getClass
 * @type {function(*, *=): (undefined|*)}
 */
$.getClass = getClass;
/**
 * @memberOf $
 * @property createModel
 * @type {function(*=, *, *): (*)}
 */
$.createModel = createModel;
/**
 * @memberOf $
 * @property getModel
 * @type {function(*, *=): (undefined|*)}
 */
$.getModel = getModel;
/**
 *
 * @type {function(*=, *, *): *}
 */
$.createControl = createControl;
/**
 * @memberOf $
 * @property initControl
 * @type {function(*, *=): (undefined|*)}
 */
$.initControl = initControl;
/**
 * @memberOf $
 * @property initControl
 * @type {function(*, *=): (undefined|*)}
 */
$.cleanControls = cleanControls;
/**
 * @memberOf $
 * @property location
 * @type {Object}
 */
$.location = urlLocation;
/**
 * @memberOf $
 */
$.deparam = deparam
/**
 * @memberOf $
 * @property ejs
 * @deprecated
 */
$.ejs = view;

$.fn.extend({
    setFormData: setFormData,
    getFormData: getFormData,
    initControls: function () {
        this.each(function (index, element) {
            initControls(element);
        });
    }
});

export {
    $,
    deparam,
    Class,
    urlLocation,
    Model,
    Control,
    Cache,
    createClass,
    getModel,
    getClass,
    cleanControls,
    createControl,
    createModel,
    initControl
}

