import $ from './core/jquery'
import { pathToRegexp, pathMatch } from './core/utils'
import { Class, createClass, getClass } from './core/class'
import { getFormData, setFormData } from './core/form'
import { UrlLocation } from './core/location'
import { createModel, getModel, Model } from './core/model'
import { deparam } from './core/deparam'
import { Router } from './core/router'
import { view } from './core/view'
import { StorageCache } from './utils/cache'
import {
    cleanControls,
    Control,
    createControl,
    initControl,
    initControls,
} from './core/control'

$.fn.setFormData = setFormData
$.fn.getFormData = getFormData
$.fn.initControls = function () {
    this.each(function (index, element) {
        initControls(element)
    })
}

export {
    $,
    deparam,
    view,
    Class,
    UrlLocation,
    Model,
    Control,
    Router,
    StorageCache,
    pathToRegexp,
    pathMatch,
    createClass,
    getModel,
    getClass,
    cleanControls,
    createControl,
    createModel,
    initControl,
}
