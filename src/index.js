import $ from './core/jquery';
import {Class, createClass, getClass} from './core/class'
import {urlLocation} from './core/location'
import {cleanControls, Control, createControl, initControl, initControls} from './core/control'
import {createModel, getModel, Model} from './core/model'
import {setFormData, getFormData, deparam} from './core/form'
import {Router} from './core/router'
import {view} from './core/view'
import {Cache} from './utils/cache'

$.storageCache = Cache
$.Class = Class;
$.Model = Model;
$.Control = Control;
$.Router = Router;
$.createClass = createClass;
$.getClass = getClass;
$.createModel = createModel;
$.getModel = getModel;
$.createControl = createControl;
$.initControl = initControl;
$.cleanControls = cleanControls;
$.location = urlLocation;
$.deparam = deparam
$.ejs = view;
$.fn.setFormData = setFormData
$.fn.getFormData = getFormData
$.fn.initControls = function () {
    this.each(function (index, element) {
        initControls(element);
    });
}

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

