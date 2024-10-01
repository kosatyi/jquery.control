import $ from './jquery';
import { getFormData, setFormData } from './form'
import { initControls } from './control'

$.fn.setFormData = setFormData
$.fn.getFormData = getFormData
$.fn.initControls = function () {
    this.each(function (index, element) {
        initControls(element);
    });
}

export default {}

