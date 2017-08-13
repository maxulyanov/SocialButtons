/*
 * SocialButtons: Кнопки для добавления контента в социальные сети
 * 2.3.6
 *
 * By Max Ulyanov
 * Src: https://github.com/M-Ulyanov/SocialButtons
 * Example https://m-ulyanov.github.io/SocialButtons/
 */


;
(function (context) {

    'use strict';

    /**
     *
     * @param options
     * @constructor
     */
    context.SocialButtons = function (options) {
        this.options = utils.extend({}, [defaultOptions, options]);
        this._shareOptions = this._createShareOptions();
        this._storageButtons = {};
        this._lastShareUrl = '';
        this._renderComponents = this._createRenderComponents();
        this._containerDOM = document.createElement('div');
        this._containerDOM.className = 'container-social-buttons';

        if (this.options.services && this.options.services.length > 0) {
            this._begin();
        }
    };


    /**
     *
     * @private
     */
    SocialButtons.prototype._begin = function () {
        var self = this;
        var length = this.options.services.length;
        var quantity = 0;
        var id = this.options.id;

        if (id in initIds) {
            return;
        }
        initIds[id] = true;

        this.options.services.forEach(function (service) {
            if (service in services) {
                self._createHTML(services[service]).then(function (button) {
                    self._storageButtons[service] = button;
                    quantity++;
                    if (quantity === length) {
                        self._renderHTML();
                    }
                });
            }
        });
    };


    /**
     *
     * @param service
     * @returns {*}
     * @private
     */
    SocialButtons.prototype._createHTML = function (service) {
        var self = this;
        var currentHelpers = self.options.helpers[service.name];
        var customClass = currentHelpers.customClass || '';

        var button = utils.createElement('div', 'b-social-button b-social-button--' + service.name +
            ' b-social-button--' + self.options.theme + ' ' + customClass, {
            title: currentHelpers.title
        });

        var size = self._getButtonsSize(this.options.buttonSize);
        if(size) {
            button.style.fontSize = size + 'px';
        }

        var components= utils.createElement('div', 'social-button__components');
        button.appendChild(components);

        if (self._renderComponents.icon === true) {
            var icon = utils.createElement('div', 'social-button__icon');
            components.appendChild(icon);
        }

        if (self._renderComponents.text === true) {
            var text = utils.createElement('div', 'social-button__text');
            text.innerHTML = currentHelpers.text;
            components.appendChild(text);
        }

        button.addEventListener('click', function () {
            self._openPopup(service);
            self._countIncrement(button, {name: service.name, url: self._lastShareUrl});
        });

        if (((self.options.counter && service.getCountUrl != null) || currentHelpers.counter != null) && self._renderComponents.count) {
            var countElement = utils.createElement('div', 'social-button__count');
            return self._getCounter(service, currentHelpers.counter).then(function (count) {
                countElement.setAttribute('data-count', count);
                /** @namespace self.options.showZeros */
                count = counterRules(count, self.options.showZeros, self.options.outputCountCallback);
                if (count === '') {
                    countElement.className += ' social-button__count--empty';
                }
                countElement.innerHTML = count;
                components.appendChild(countElement);
                return button;
            });
        }
        return Promise.resolve(button);
    };


    /**
     *
     * @private
     */
    SocialButtons.prototype._renderHTML = function () {
        var self = this;
        var whereToInsert = document.querySelector('#' + this.options.id);
        if (whereToInsert) {
            this.options.services.forEach(function (service) {
                if (service in self._storageButtons) {
                    var button = self._storageButtons[service];
                    self._containerDOM.appendChild(button);
                }
            });
            whereToInsert.appendChild(this._containerDOM);

            var callbackCreate = self.options.callbacks.create;
            if (typeof callbackCreate === 'function') {
                callbackCreate({
                    self: whereToInsert,
                    options: self.options
                });
            }
        }
        else {
            console.error('#' + this.options.id, 'not found!');
        }
    };


    /**
     *
     * @param size
     * @returns {Number}
     * @private
     */
    SocialButtons.prototype._getButtonsSize = function(size) {
        switch (size) {
            case 'small':
                size = 22;
                break;
            case 'middle':
                size = 28;
                break;
            case 'large':
                size = 34;
                break;
            default :
                var parseSize = parseFloat(size);
                if(!isNaN(parseSize)) {
                    size = parseSize;
                }
        }
        return size;
    };


    /**
     *
     * @param service
     * @param userFunctionCounter
     * @returns {*}
     * @private
     */
    SocialButtons.prototype._getCounter = function (service, userFunctionCounter) {
        var url = this.options.url;
        var cacheValue = counterControl.caching[url];

        if (cacheValue != null) {
            return Promise.resolve(cacheValue)
        }

        if(userFunctionCounter != null && typeof userFunctionCounter === 'function') {
            return Promise.resolve(userFunctionCounter())
        }

        return counterControl.get(service, url).then(function (count) {
            counterControl.caching[url] = count;
            return count;
        });
    };


    /**
     *
     * @param template
     * @param objectCallback
     * @returns {XML|string|void|*}
     * @private
     */
    SocialButtons.prototype._parseTemplate = function (template, objectCallback) {
        if (!template) {
            return '';
        }

        var pattern = /{{[^{{]+}}/gi;

        return template.replace(pattern, function (foundString) {
            // remove {{ }} and spaces
            foundString = foundString.replace(/\s+/g, '');
            var property = foundString.split('').filter(function (current, index, array) {
                if (index > 1 && array.length - 2 > index) {
                    return true;
                }
            }).join('');
            if (property in objectCallback) {
                return encodeURIComponent(objectCallback[property]);
            }
            else {
                return '';
            }
        });
    };


    /**
     *
     * @param service
     * @private
     */
    SocialButtons.prototype._openPopup = function (service) {
        var url = this._parseTemplate(service.shareUrl, this._shareOptions);
        this._lastShareUrl = url;
        window.open(url, 'share', 'toolbar=0,status=0,scrollbars=0,width=600,height=450');
    };


    /**
     *
     * @param button
     * @param service
     * @private
     */
    SocialButtons.prototype._countIncrement = function (button, service) {
        var countElement = button.querySelector('.social-button__count');
        var count;
        if (countElement != null) {
            count = countElement.getAttribute('data-count');
            count++;
            if (!isNaN(count)) {
                countElement.setAttribute('data-count', count);
                var outCountCallback = this.options.outputCountCallback;
                if(typeof outCountCallback === 'function') {
                    count = outCountCallback(count);
                }
                countElement.innerHTML = count;
                var callbackShare = this.options.callbacks.share;
                if (typeof callbackShare === 'function') {
                    callbackShare({
                        self: button,
                        service: service
                    });
                }
            }
        }
    };


    /**
     *
     * @returns {{icon: boolean, text: boolean, count: boolean}}
     * @private
     */
    SocialButtons.prototype._createRenderComponents = function () {
        var components = {
            icon: false,
            text: false,
            count: false
        };

        for (var component in components) {
            if (components.hasOwnProperty(component)) {
                if (this.options.components.indexOf(component) >= 0) {
                    components[component] = true;
                }
            }
        }

        return components;
    };


    /**
     *
     * @returns {{url: (*|string|string|string), title: (*|string|string|string|string|string), description: (*|string), image: (*|string|string)}}
     * @private
     */
    SocialButtons.prototype._createShareOptions = function () {
        var OG = {
            url: document.querySelector('[property="og:url"]'),
            title: document.querySelector('[property="og:title"]'),
            description: document.querySelector('[property="og:description"]'),
            image: document.querySelector('[property="og:image"]')
        };

        for (var meta in OG) {
            if (OG.hasOwnProperty(meta)) {
                if (OG[meta]) {
                    OG[meta] = OG[meta].getAttribute('content');
                }
            }
        }

        return {
            url: this.options.url || OG.url || window.location.href,
            title: this.options.title || OG.title || document.title,
            description: this.options.description || OG.description || '',
            image: this.options.image || OG.image || ''
        };
    };


    /**
     *
     * @type {{
     * components: string[], theme: string,
     * callbacks: {create: null, share: null},
     * helpers: {
     * vkontakte: {text: string, title: string, customClass: string},
     * facebook: {text: string, title: string, customClass: string},
     * googleplus: {text: string, title: string, customClass: string},
     * odnoklassniki: {text: string, title: string, customClass: string},
     * moimir: {text: string, title: string, customClass: string},
     * twitter: {text: string, title: string, customClass: string}
     * }
    * }}
     */
    var defaultOptions = {
        components: ['icon', 'text', 'count'],
        theme: 'default',
        callbacks: {
            create: null,
            share: null
        },
        outputCountCallback: null,
        helpers: {
            vkontakte: {
                text: 'Рассказать',
                title: 'Рассказать в Вконтакте',
                customClass: '',
                counter: null
            },
            facebook: {
                text: 'Поделиться',
                title: 'Поделиться в Facebook',
                customClass: '',
                counter: null
            },
            googleplus: {
                text: 'Это интересно',
                title: 'Это интересно Google Plus',
                customClass: '',
                counter: null
            },
            odnoklassniki: {
                text: 'Написать',
                title: 'Написать в Одноклассниках',
                customClass: '',
                counter: null
            },
            moimir: {
                text: 'Поделиться',
                title: 'Поделиться ссылкой в Мой Мир',
                customClass: '',
                counter: null
            },
            twitter: {
                text: 'Ретвит',
                title: 'Написать в Twitter',
                customClass: '',
                counter: null
            },
            lj: {
                text: 'Написать',
                title: 'Разместить запись в LiveJournal',
                customClass: '',
                counter: null
            },
            linkedin: {
                text: 'Поделиться',
                title: 'Поделиться в Linkedin',
                customClass: '',
                counter: null
            }
        }

    };


    /**
     *
     * @type {string}
     */
    var protocol =  location.protocol === 'https:' ? 'https' : 'http';


    /**
     *
     * @type {{
    * vkontakte: {name: string, promises: Array, shareUrl: string, getCountUrl: string, counter: Function},
    * facebook: {name: string, shareUrl: string, getCountUrl: string, counter: Function},
    * googleplus: {name: string, shareUrl: string, getCountUrl: string, counter: Function},
    * odnoklassniki: {name: string, promises: Array, shareUrl: string, getCountUrl: string, counter: Function},
    * twitter: {name: string, shareUrl: string, getCountUrl: null, counter: Function}
    * }}
     */
    var services = {
        vkontakte: {
            name: 'vkontakte',
            promises: [],
            shareUrl: protocol + '://vk.com/share.php?url={{ url }}&title={{ title }}&description={{ description }}&image={{ image }}',
            getCountUrl: protocol + '://vk.com/share.php?act=count&url=',
            counter: function (url, promise) {
                var request = new RequestManager();
                var index = this.promises.length;
                request.create(this.getCountUrl + url + '&index=' + index);
                this.promises.push(promise);
                if (!context.VK) {
                    context.VK = {};
                }
                window.VK.Share = {
                    count: function (index, count) {
                        services.vkontakte.promises[index].resolve(count);
                    }
                };
            }
        },
        facebook: {
            name: 'facebook',
            shareUrl: protocol + '://www.facebook.com/sharer/sharer.php?u={{ url }}&title={{ title }}&description={{ description }}&image={{ image }}',
            getCountUrl: protocol + '://graph.facebook.com/?id=',
            counter: function (url, promise) {
                var request = new RequestManager();
                request.create(this.getCountUrl + url).then(function (data) {
                    /** @namespace data.share.share_count */
                    var count = 0;
                    if (data.share != null && data.share.share_count != null) {
                        count = data.share.share_count;
                    }
                    promise.resolve(count);
                })
            }
        },
        googleplus: {
            name: 'googleplus',
            shareUrl: protocol + '://plus.google.com/share?url={{ url }}',
            getCountUrl: protocol + '://share.yandex.ru/gpp.xml?url=',
            counter: function (url, promise) {
                var request = new RequestManager();
                request.create(this.getCountUrl + url).then(function (count) {
                    if (count == null) {
                        count = 0;
                    }
                    promise.resolve(count);
                })
            }
        },
        odnoklassniki: {
            name: 'odnoklassniki',
            promises: [],
            shareUrl: protocol + '://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1&st._surl={{ url }}&st.comments={{ title }}',
            getCountUrl: protocol + '://connect.ok.ru/dk?st.cmd=extLike&ref=',
            counter: function (url, promise) {
                var request = new RequestManager();
                var index = this.promises.length;
                request.create(this.getCountUrl + url + '&uid=' + index);
                this.promises.push(promise);
                if (!context.ODKL) {
                    context.ODKL = {};
                }
                context.ODKL.updateCount = function (index, count) {
                    services.odnoklassniki.promises[index].resolve(count);
                };
            }
        },
        moimir: {
            name: 'moimir',
            shareUrl: protocol + '://connect.mail.ru/share?url={{ url }}&title={{ title }}&description={{ description  }}',
            getCountUrl: protocol + '://appsmail.ru/share/count/',
            counter: function (url, promise) {
                var position = url.indexOf('//');
                url = url.slice(position + 2);
                var request = new RequestManager();
                request.create(this.getCountUrl + url).then(function (data) {
                    /** @namespace data.share_mm */
                    var count = data.share_mm;
                    if (count == null) {
                        count = 0;
                    }
                    promise.resolve(count);
                })
            }
        },
        twitter: {
            name: 'twitter',
            shareUrl: protocol + '://twitter.com/share?={{ url }}&text={{ description }}',
            getCountUrl: null,
            counter: function (url, promise) {
                promise.resolve(0);
            }
        },
        lj: {
            name: 'lj',
            shareUrl: protocol + '://www.livejournal.com/update.bml?subject={{ title }}&event={{ description }}',
            getCountUrl: null,
            counter: function (url, promise) {
                promise.resolve(0);
            }
        },
        linkedin: {
            name: 'linkedin',
            shareUrl: protocol + '://www.linkedin.com/shareArticle?mini=true&url={{ url }}&title={{ title }}&summary={{ description }}',
            getCountUrl: null,
            counter: function (url, promise) {
                promise.resolve(0);
            }
        }
    };


    /**
     *
     * @type {{}}
     */
    var initIds = {};


    /**
     *
     * @type {{caching: {}, get: Function}}
     */
    var counterControl = {
        caching: {},
        get: function (service, url) {
            var defer = utils.deferred();
            service.counter(url, defer);
            return defer.promise;
        }
    };


    /**
     *
     * @param count
     * @param showZeros
     * @param outputCountCallback
     * @returns {*}
     */
    function counterRules(count, showZeros, outputCountCallback) {
        if (!count && !showZeros) {
            count = '';
        }
        if(typeof outputCountCallback === 'function') {
            var parseCount = !isNaN(parseInt(count)) ? parseInt(count) : 0;
            count = outputCountCallback(parseCount);
        }
        return count;
    }


    /**
     *
     * @constructor
     */
    function RequestManager() {
        this.uniqueName = null;
        this.script = null;
        this.data = null;
    }

    /**
     *
     * @param src
     * @returns {Promise|*}
     */
    RequestManager.prototype.create = function (src) {
        var self = this;
        var defer = utils.deferred();
        var separator = (src.indexOf('?') > 0) ? '&' : '?';

        this.uniqueName = 'f_' + String(Math.random()).slice(2);
        this.script = document.createElement('script');
        this.script.src = src + separator + 'callback=' + this.uniqueName;
        document.head.appendChild(this.script);

        context[this.uniqueName] = function (data) {
            self.data = data;
        };
        self.script.onload = function () {
            self.remove();
            defer.resolve(self.data);
        };
        self.script.onerror = function () {
          self.remove();
          defer.resolve(null);
        };
        return defer.promise;
    };

    //
    RequestManager.prototype.remove = function () {
        delete context[this.uniqueName];
        this.script.parentNode.removeChild(this.script);
    };


    /**
     *
     * @type {{
     * deferred: Function,
     * extend: Function,
     * createElement: Function, getConstructor: Function
   * }}
     */
    var utils = {
        /**
         *
         * @returns {{}}
         */
        deferred: function () {
            var result = {};
            result.promise = new Promise(function (resolve, reject) {
                result.resolve = resolve;
                result.reject = reject;
            });
            return result;
        },


        /**
         *
         * @param target
         * @param objects
         * @returns {*}
         */
        extend: function (target, objects) {

            for (var object in objects) {
                if (objects.hasOwnProperty(object)) {
                    recursiveMerge(target, objects[object]);
                }
            }

            function recursiveMerge(target, object) {
                for (var property in object) {
                    if (object.hasOwnProperty(property)) {
                        var current = object[property];
                        if (utils.getConstructor(current) === 'Object') {
                            if (!target[property]) {
                                target[property] = {};
                            }
                            recursiveMerge(target[property], current);
                        }
                        else {
                            target[property] = current;
                        }
                    }
                }
            }

            return target;
        },


        /**
         *
         * @param element
         * @param className
         * @param attrs
         * @returns {Element}
         */
        createElement: function (element, className, attrs) {
            var newElement = document.createElement(element);
            if (className) {
                newElement.className = className;
            }
            if (attrs) {
                for (var attr in attrs) {
                    if (attrs.hasOwnProperty(attr)) {
                        var value = attrs[attr];
                        newElement.setAttribute(attr, value);
                    }
                }
            }
            return newElement;
        },


        /**
         *
         * @param object
         * @returns {string}
         */
        getConstructor: function (object) {
            return Object.prototype.toString.call(object).slice(8, -1);
        }

    }


})(window); // window (required condition)


