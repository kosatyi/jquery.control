import { jQuery } from './core/jquery'
import { pathToRegexp, pathMatch } from './core/utils'
import { Class, createClass, getClass } from './core/class'
import { getFormData, setFormData } from './core/form'
import { UrlLocation } from './core/location'
import { createModel, getModel, Model } from './core/model'
import { deparam } from './core/deparam'
import { Router } from './core/router'
import { StorageCache } from './utils/cache'
import {
    cleanControls,
    Control,
    createControl,
    initControl,
    initControls,
} from './core/control'

jQuery.fn.setFormData = setFormData
jQuery.fn.getFormData = getFormData
jQuery.fn.initControls = function () {
    this.each(function (index, element) {
        initControls(element)
    })
}

const config = (function () {})({})

export { jQuery as $ }

export {
    deparam,
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
