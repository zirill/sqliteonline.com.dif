/*!
* metismenujs - v1.0.3
* MetisMenu with Vanilla-JS
* https://github.com/onokumus/metismenujs#readme
*
* Made by Osman Nuri Okumus <onokumus@gmail.com> (https://github.com/onokumus)
* Under MIT License
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.MetisMenu = factory());
}(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    let __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (let s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (let p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    let Default = {
        parentTrigger: "li",
        subMenu: "ul",
        toggle: true,
        triggerElement: "a"
    };
    let ClassNames = {
        activeClass: "active",
        collapseClass: "collapse",
        collapseInClass: "in",
        collapsingClass: "collapsing"
    };

    let MetisMenu = /** @class */ (function () {
        /**
         * Creates an instance of OnoffCanvas.
         *
         * @constructor
         * @param {HTMLElement | string} element
         * @param {IMMOptions} [options]
         * @memberof MetisMenu
         */
        function MetisMenu(element, options) {
            this.element =
                typeof element === "string" ? document.querySelector(element) : element;
            this.cacheEl = this.element;
            this.config = __assign({}, Default, options);
            this.cacheConfig = this.config;
            this.disposed = false;
            this.ulArr = [];
            this.listenerOb = [];
            this.init();
        }
        MetisMenu.prototype.update = function () {
            this.disposed = false;
            this.element = this.cacheEl;
            this.config = this.cacheConfig;
            this.setTransitioning(false);
            this.init();
        };
        MetisMenu.prototype.dispose = function () {
            for (let _i = 0, _a = this.listenerOb; _i < _a.length; _i++) {
                let lo = _a[_i];
                for (let key in lo) {
                    if (lo.hasOwnProperty(key)) {
                        let el = lo[key];
                        el[1].removeEventListener(el[0], el[2]);
                    }
                }
            }
            this.ulArr = [];
            this.listenerOb = [];
            this.config = null;
            this.element = null;
            this.disposed = true;
        };
        MetisMenu.prototype.on = function (event, fn) {
            this.element.addEventListener(event, fn, false);
            return this;
        };
        MetisMenu.prototype.off = function (event, fn) {
            this.element.removeEventListener(event, fn);
            return this;
        };
        MetisMenu.prototype.emit = function (event, eventDetail, shouldBubble) {
            if (shouldBubble === void 0) { shouldBubble = false; }
            let evt;
            if (typeof CustomEvent === "function") {
                evt = new CustomEvent(event, {
                    bubbles: shouldBubble,
                    detail: eventDetail
                });
            }
            else {
                evt = document.createEvent("CustomEvent");
                evt.initCustomEvent(event, shouldBubble, false, eventDetail);
            }
            this.element.dispatchEvent(evt);
            return this;
        };
        MetisMenu.prototype.init = function () {
            this.ulArr = [].slice.call(this.element.querySelectorAll(this.config.subMenu));
            for (let _i = 0, _a = this.ulArr; _i < _a.length; _i++) {
                let ul = _a[_i];
                let li = ul.parentNode;
                ul.classList.add(ClassNames.collapseClass);
                if (li.classList.contains(ClassNames.activeClass)) {
                    this.show(ul);
                }
                else {
                    this.hide(ul);
                }
                let a = li.querySelector(this.config.triggerElement);
                if (a.getAttribute("aria-disabled") === "true") {
                    return;
                }
                a.setAttribute("aria-expanded", "false");
                let listenerOb = {
                    aClick: ["click", a, this.clickEvent.bind(this)]
                };
                for (let key in listenerOb) {
                    if (listenerOb.hasOwnProperty(key)) {
                        let listener = listenerOb[key];
                        listener[1].addEventListener(listener[0], listener[2]);
                    }
                }
                this.listenerOb.push(listenerOb);
            }
        };
        MetisMenu.prototype.clickEvent = function (ev) {
            if (!this.disposed) {
                if (ev.currentTarget.tagName === "A") {
                    ev.preventDefault();
                }
                let li = ev.currentTarget.parentNode;
                let ul = li.querySelector(this.config.subMenu);
                this.toggle(ul);
            }
        };
        MetisMenu.prototype.toggle = function (ul) {
            if (ul.parentNode.classList.contains(ClassNames.activeClass)) {
                this.hide(ul);
            }
            else {
                this.show(ul);
            }
        };
        MetisMenu.prototype.show = function (ul) {
            let _this = this;
            if (this.isTransitioning ||
                ul.classList.contains(ClassNames.collapseInClass)) {
                return;
            }
            let complete = function () {
                ul.classList.remove(ClassNames.collapsingClass);
                ul.style.height = "";
                ul.removeEventListener("transitionend", complete);
                _this.setTransitioning(false);
                _this.emit("shown.metisMenu", {
                    shownElement: ul
                });
            };
            let li = ul.parentNode;
            li.classList.add(ClassNames.activeClass);
            let a = li.querySelector(this.config.triggerElement);
            a.setAttribute("aria-expanded", "true");
            ul.style.height = "0px";
            ul.classList.remove(ClassNames.collapseClass);
            ul.classList.remove(ClassNames.collapseInClass);
            ul.classList.add(ClassNames.collapsingClass);
            let eleParentSiblins = [].slice
                .call(li.parentNode.children)
                .filter(function (c) { return c !== li; });
            if (this.config.toggle && eleParentSiblins.length > 0) {
                for (let _i = 0, eleParentSiblins_1 = eleParentSiblins; _i < eleParentSiblins_1.length; _i++) {
                    let sibli = eleParentSiblins_1[_i];
                    let sibUl = sibli.querySelector(this.config.subMenu);
                    if (sibUl !== null) {
                        this.hide(sibUl);
                    }
                }
            }
            ul.classList.add(ClassNames.collapseClass);
            ul.classList.add(ClassNames.collapseInClass);
            ul.style.height = ul.scrollHeight + "px";
            if (ul.style.height == "0px") {
                ul.classList.remove(ClassNames.collapsingClass);
                ul.style.height = "";
                _this.setTransitioning(false);
                _this.emit("shown.metisMenu", {
                    shownElement: ul
                });
            } else {
                this.setTransitioning(true);
                this.emit("show.metisMenu", {
                    showElement: ul
                });
                ul.addEventListener("transitionend", complete);
            }
        };
        MetisMenu.prototype.hide = function (ul) {
            let _this = this;
            if (this.isTransitioning ||
                !ul.classList.contains(ClassNames.collapseInClass)) {
                return;
            }
            this.emit("hide.metisMenu", {
                hideElement: ul
            });
            let li = ul.parentNode;
            li.classList.remove(ClassNames.activeClass);
            let complete = function () {
                ul.classList.remove(ClassNames.collapsingClass);
                ul.classList.add(ClassNames.collapseClass);
                ul.removeEventListener("transitionend", complete);
                _this.setTransitioning(false);
                _this.emit("hidden.metisMenu", {
                    hiddenElement: ul
                });
            };
            ul.style.height = ul.getBoundingClientRect().height + "px";
            ul.style.height = ul.offsetHeight + "px";
            ul.classList.add(ClassNames.collapsingClass);
            ul.classList.remove(ClassNames.collapseClass);
            ul.classList.remove(ClassNames.collapseInClass);
            if (ul.style.height == "0px") {
                ul.classList.remove(ClassNames.collapsingClass);
                ul.classList.add(ClassNames.collapseClass);
                _this.setTransitioning(false);
                _this.emit("hidden.metisMenu", {
                    hiddenElement: ul
                });
            } else {
                this.setTransitioning(true);
                ul.addEventListener("transitionend", complete);
                ul.style.height = "0px";
            }
            let a = li.querySelector(this.config.triggerElement);
            a.setAttribute("aria-expanded", "false");
        };
        MetisMenu.prototype.setTransitioning = function (isTransitioning) {
            this.isTransitioning = isTransitioning;
        };
        return MetisMenu;
    }());

    return MetisMenu;

})));
