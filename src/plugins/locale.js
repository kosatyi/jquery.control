var $ = require('jquery');
/**
 *
 * @type {{}}
 */
var cache = {};
/**
 *
 * @type {{defaults: string, current: string, path: string, file: string, data: {}}}
 */
var Locale = {
    defaults: 'en',
    current: 'en',
    path: 'locales/',
    file: '/translation.json',
    data: {}
};
/**
 *
 * @param lang
 * @returns {*}
 */
Locale.load = function (lang) {
    cache[lang] = cache[lang] || $.ajax({
        context: this,
        url: this.path.concat(lang).concat(this.file)
    });
    cache[lang].then(function (data) {
        this.data = data;
    });
    return cache[lang];
};

Locale.config = function(params){
    $.extend(true,locale,params);
    return locale;
};
/**
 *
 * @param lang
 * @returns {Locale}
 */
Locale.lang = function (lang) {
    this.current = lang;
    return this;
};

/**
 *
 * @param value
 * @returns {*}
 */
Locale.get = function (value) {
    return this.data[value] || value;
};

module.exports = Locale;