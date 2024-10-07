import { jQuery } from './core/jquery'
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

jQuery.storageCache = Cache
jQuery.Class = Class
jQuery.Model = Model
jQuery.Control = Control
jQuery.Router = Router
jQuery.createClass = createClass
jQuery.getClass = getClass
jQuery.createModel = createModel
jQuery.getModel = getModel
jQuery.createControl = createControl
jQuery.initControl = initControl
jQuery.cleanControls = cleanControls
jQuery.location = UrlLocation
jQuery.deparam = deparam
jQuery.ejs = view

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
