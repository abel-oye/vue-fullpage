(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.fullpage = factory());
}(this, (function () { 'use strict';

var addEventListener = function addEventListener(el, eventName, callback, isUseCapture) {
    if (el.addEventListener) {
        el.addEventListener(eventName, callback, !!isUseCapture);
    } else {
        el.attachEvent("on" + eventName, callback);
    }
};

var removeEventListener = function removeEventListener(el, eventName, callback, isUseCapture) {
    if (el.removeEventListener) {
        el.removeEventListener(eventName, callback, !!isUseCapture);
    } else {
        el.detachEvent("on" + eventName, callback);
    }
};

var triggerEvent = function triggerEvent(eventName, value) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent(eventName, false, true);
    event.value = value;
    return event;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/**
 * vue2.x fullpage
 */
function getCurrentStyle(obj, prop) {
    if (obj.currentStyle) {
        return obj.currentStyle[prop];
    } else if (window.getComputedStyle) {
        var propprop = prop.replace(/([A-Z])/g, "-$1");
        propprop = prop.toLowerCase();
        return document.defaultView.getComputedStyle(obj, null)[prop];
    }
    return null;
}

var Fullpage = function () {
    function Fullpage(el, options, vnode) {
        var _this = this;

        classCallCheck(this, Fullpage);

        this.assignOpts(options);
        this.vnode = vnode;
        this.vm = vnode.context;

        this.startY = 0;
        this.opts.movingFlag = false;
        this.el = el;
        this.el.$fullpage = this;
        this.el.classList.add("fullpage-wp");
        this.parentEle = this.el.parentNode;
        this.parentEle.classList.add("fullpage-container");

        this.pageEles = this.el.children;
        this.total = this.pageEles.length;
        this.direction = -1;
        this.curIndex = this.opts.start;

        this.preIndex = -1;

        this.disabled = !!this.opts.disabled;

        this.initScrollDirection();
        this.initEvent(el);
        window.setTimeout(function () {
            _this.resize();
            //The first page triggers the animation directly
            _this.moveTo(_this.opts.start, false);
            _this.toogleAnimate(_this.opts.start);
            _this.curIndex = _this.opts.start;
        }, 0);

        addEventListener(window, "resize", function () {
            _this.resize();
            _this.correct();
        });
    }

    createClass(Fullpage, [{
        key: "resize",
        value: function resize() {
            this.width = this.opts.width || this.el.offsetWidth;
            this.height = this.opts.height || this.el.offsetHeight;
            var i = 0,
                length = this.pageEles.length,
                pageEle = void 0;
            for (; i < length; i++) {
                pageEle = this.pageEles[i];
                pageEle.classList.add("page");
                //pageEle.style.width = this.width + 'px'
                pageEle.style.height = this.height + "px";
            }
        }
    }, {
        key: "correct",
        value: function correct() {
            //Correct position after onresize
            if (this.current === 0) {
                return;
            }
            var dist = this.opts.dir === "v" ? this.curIndex * -this.height : this.curIndex * -this.width;

            this.move(dist);
        }
    }, {
        key: "setOptions",
        value: function setOptions(options) {
            this.assignOpts(options, this.opts);
        }
    }, {
        key: "toogleAnimate",
        value: function toogleAnimate(curIndex) {
            console.log(this.pageEles[curIndex]);
            Fullpage.broadcast([this.pageEles[curIndex]], "toogle.animate", true);
            Fullpage.broadcast([this.pageEles[this.preIndex]], "toogle.animate", false);
        }
    }, {
        key: "assignOpts",
        value: function assignOpts(opts, o) {
            for (var key in Fullpage.defaultOptions) {
                if (!opts.hasOwnProperty(key)) {
                    opts[key] = Fullpage.defaultOptions[key];
                }
            }
            this.opts = opts;
        }
    }, {
        key: "initScrollDirection",
        value: function initScrollDirection() {
            if (this.opts.dir !== "v") {
                this.el.classList.add("fullpage-wp-h");
            }
        }
    }, {
        key: "initEvent",
        value: function initEvent(el) {
            var _this2 = this;

            this.prevIndex = this.curIndex;
            if ("ontouchstart" in document) {
                /// touch ///
                addEventListener(el, "touchstart", function (e) {
                    if (_this2.opts.movingFlag) {
                        return false;
                    }
                    _this2.startX = e.targetTouches[0].pageX;
                    _this2.startY = e.targetTouches[0].pageY;
                });

                addEventListener(el, "touchend", function (e) {
                    //e.preventDefault();
                    if (_this2.opts.movingFlag) {
                        return false;
                    }
                    var preIndex = _this2.curIndex;
                    var dir = _this2.opts.dir;
                    var sub = _this2.direction = dir === "v" ? (e.changedTouches[0].pageY - _this2.startY) / _this2.height : (e.changedTouches[0].pageX - _this2.startX) / _this2.width;
                    var der = sub > _this2.opts.der ? -1 : sub < -_this2.opts.der ? 1 : 0;
                    var curIndex = der + _this2.curIndex;
                    _this2.moveTo(curIndex, true);
                });

                addEventListener(document.body, "touchmove", function (e) {
                    var overflow = _this2.opts.overflow;


                    var currentPage = _this2.pageEles[_this2.curIndex];
                    if (overflow === "hidden") {
                        //e.preventDefault();
                        return false;
                    } else {
                        var currentTarget = e.target;

                        while (currentTarget) {
                            if (overflow === "scroll" && currentTarget === currentPage || overflow !== "scroll" && currentTarget !== currentPage) {
                                if (!Fullpage.iSWhetherEnds(currentTarget, _this2.direction)) {
                                    return;
                                }
                            }

                            currentTarget = currentTarget.parentNode;
                        }
                        e.preventDefault();
                    }
                });
            }

            //else {
            var isMousedown = false;
            addEventListener(el, "mousedown", function (e) {
                if (_this2.opts.movingFlag) {
                    return false;
                }
                isMousedown = true;
                _this2.startX = e.pageX;
                _this2.startY = e.pageY;
            });

            addEventListener(el, "mouseup", function (e) {
                isMousedown = false;
            });

            addEventListener(el, "mousemove", function (e) {
                // @TODO The same direction requires the last slide to bubble
                //e.preventDefault();
                if (_this2.opts.movingFlag || !isMousedown) {
                    return false;
                }

                var dir = _this2.opts.dir;
                var sub = _this2.direction = dir === "v" ? (e.pageY - _this2.startY) / _this2.height : (e.pageX - _this2.startX) / _this2.width;

                var der = sub > _this2.opts.der ? -1 : sub < -_this2.opts.der ? 1 : 0;
                var curIndex = der + _this2.curIndex;
                _this2.moveTo(curIndex, true);
            });

            var debounceTimer = void 0,
                interval = 1200,
                debounce = true;
            // fixed firefox DOMMouseScroll closed #1.
            var mousewheelType = document.mozFullScreen !== undefined ? "DOMMouseScroll" : "mousewheel";

            addEventListener(el, mousewheelType, function (e) {
                if (_this2.opts.movingFlag) {
                    return false;
                }
                if (!debounce) {
                    return;
                }
                debounce = false;
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(function () {
                    debounce = true;
                }, interval);
                var dir = _this2.opts.dir;
                // Compatible DOMMouseScroll event.detail
                // see http://www.javascriptkit.com/javatutors/onmousewheel.shtml
                var detail = e.wheelDelta ? e.wheelDelta / 120 : e.detail * -1;
                //let detail = e.detail ? e.detail * -120 : e.wheelDelta;

                //Only support Y
                var der = _this2.direction = detail > 0 ? -1 : detail < 0 ? 1 : 0;
                var curIndex = der + _this2.curIndex;
                _this2.moveTo(curIndex, true);

                if (e.preventDefault) {
                    //disable default wheel action of scrolling page
                    e.preventDefault();
                } else {
                    return false;
                }
            });
            //}

            addEventListener(window, "resize", function () {
                if (el.offsetHeight != _this2.height) {
                    _this2.resize();
                }
            });
        }
    }, {
        key: "move",
        value: function move(dist) {
            var xPx = 0,
                yPx = 0;
            if (this.opts.dir === "v") {
                yPx = dist;
            } else {
                xPx = dist;
            }
            this.el.style.cssText += ";-webkit-transform : translate3d(" + xPx + "px, " + yPx + "px, 0px);" + "transform : translate3d(" + xPx + "px, " + yPx + "px, 0px);";
        }
    }, {
        key: "moveTo",
        value: function moveTo(curIndex, anim) {
            var _this3 = this;

            if (this.opts.overflow === "scroll" && !Fullpage.iSWhetherEnds(this.pageEles[this.curIndex], this.direction) || anim && this.disabled === true) {
                return;
            }

            // no change
            if (this.curIndex === curIndex) {
                return;
            }

            if (!(curIndex >= 0 && curIndex < this.total)) {
                if (!!this.opts.loop) {
                    curIndex = this.curIndex = curIndex < 0 ? this.total - 1 : 0;
                } else {
                    this.curIndex = curIndex < 0 ? 0 : this.total - 1;
                    return;
                }
            }
            //beforeChange return false cancel slide
            var flag = this.opts.beforeChange.call(this, this.pageEles[this.curIndex], this.curIndex, curIndex);

            if (flag === false) {
                return false;
            }
            var dist = this.opts.dir === "v" ? curIndex * -this.height : curIndex * -this.width;

            this.preIndex = this.curIndex;
            this.curIndex = curIndex;

            var fired = false;

            var wrappedCallback = function wrappedCallback() {
                removeEventListener(_this3.el, "webkitTransitionEnd", wrappedCallback);
                _this3.toogleAnimate(_this3.curIndex);
                _this3.opts.afterChange.call(_this3, _this3.pageEles[_this3.curIndex], _this3.curIndex);
                _this3.opts.movingFlag = false;
                fired = true;
            };

            if (anim) {
                this.el.classList.add(this.opts.animateClass);
                this.opts.movingFlag = true;

                var transition = getCurrentStyle(document.querySelector(".fullpage-wp"), "transition");

                var duration = this.opts.duration || parseFloat(transition.split(" ")[1]) || 0;

                addEventListener(this.el, "webkitTransitionEnd", wrappedCallback);

                setTimeout(function () {
                    if (fired) return;
                    wrappedCallback();
                }, duration * 1000 + 25);
            } else {
                this.el.classList.remove(this.opts.animateClass);
            }
            this.move(dist);
        }
    }, {
        key: "movePrev",
        value: function movePrev() {
            this.moveTo(this.curIndex - 1, true);
        }
    }, {
        key: "moveNext",
        value: function moveNext() {
            this.moveTo(this.curIndex + 1, true);
        }
    }, {
        key: "update",
        value: function update() {
            this.pageEles = this.el.children;
            this.total = this.pageEles.length;
            this.resize();
        }
    }, {
        key: "setDisabled",
        value: function setDisabled(disabled) {
            this.disabled = disabled;
        }
    }, {
        key: "destroy",
        value: function destroy() {}
    }]);
    return Fullpage;
}();

Fullpage.iSWhetherEnds = function (target, direction) {
    if (direction < 0) {
        return target.scrollTop <= 0;
    } else {
        var height = target.getBoundingClientRect().height;
        //@TODO wechat devtool v0.7.0 scrollTop 1px less than actual
        return target.scrollTop + height > target.scrollHeight - 1;
        // down
    }
};

Fullpage.broadcast = function (elements, eventName, isShow, ancestor) {

    if (elements) {
        elements = Array.prototype.slice.call(elements, 0);

        elements.forEach(function (ele) {
            if (ele) {
                // Non cross level broadcast
                if (ele.classList.contains('fullpage-container')) {
                    if (isShow) {
                        var $fullpage = ele.querySelector('.fullpage-wp').$fullpage;
                        console.log(2222);
                        if ($fullpage) {
                            $fullpage.toogleAnimate($fullpage.curIndex);
                        }
                    }
                } else {
                    console.log(ele);
                    ele.dispatchEvent(triggerEvent(eventName, isShow));
                    Fullpage.broadcast(ele.children, eventName, isShow);
                }
            }
        });
    }
};

Fullpage.defaultOptions = {
    start: 0,
    duration: 500,
    loop: false,
    /**
     * direction
     * h: horizontal
     * v: vertical
     */
    dir: "v",
    /**
     * der
     * The proportion of move
     * e.g.
     *   container height = 100
     *   moving distance >= 100 * der (default:0.1)
     */
    der: 0.1,
    /**
     * 
     * @property {boolean} defualt:false
     */
    movingFlag: false,
    /**
     * Callback before change
     * @params
     *     element {Element} current element
     *     currenIndex {Number} current number
     *     next    {Number}  next nummober
     *
     * @type {Boolean}
     */
    beforeChange: noop,
    /**
     * Callback after change
     *
     * @function 
     * @params
     *     element {Element} current element
     *     currenIndex {Number} current number
     *
     * @type {Boolean}
     */
    afterChange: noop,
    /**
     * Animate class
     * @property {string}
     */
    animateClass: "anim",
    /*
     *    There are scroll bars in the page,
     *    `auto` Detect any element in page 
     *    `scroll` Only detect current page
     *    `hidden` ignores the scroll bar in the page
     *   @default hidden 
     */
    overflow: "hidden",
    /**
     * disabled 
     * @property {boolean}  default: false
     */
    disabled: false
};

function noop() {}

var Animate = function () {
	function Animate(el, binding, vnode) {
		var _this = this;

		classCallCheck(this, Animate);

		var aminate = binding.value;

		addEventListener(el, "toogle.animate", function (_ref) {
			var value = _ref.value;

			if (value) {
				_this.addAnimated(el, aminate);
			} else {
				el.style.opacity = "0";
				_this.removeAnimated(el, aminate);
			}
		});
	}

	createClass(Animate, [{
		key: "addAnimated",
		value: function addAnimated(el, animate) {
			var delay = animate.delay || 0;
			el.classList.add("animated");
			window.setTimeout(function () {
				el.style.opacity = "1";
				el.classList.add(animate.value);
			}, delay);
		}
	}, {
		key: "removeAnimated",
		value: function removeAnimated(el, animate) {
			var cls = el.getAttribute("class");
			if (cls && cls.indexOf("animated") > -1) {
				el.classList.remove(animate.value);
			}
		}
	}]);
	return Animate;
}();

var fullpage = {
	install: function install(Vue, options) {
		Vue.directive('fullpage', {
			inserted: function inserted(el, binding, vnode) {
				var opts = binding.value || {};

				el.$fullpage = new Fullpage(el, opts, vnode);

				el.$fullpage.$update = function () {
					Vue.nextTick(function () {
						el.$fullpage.update();
					});
				};
			},
			componentUpdated: function componentUpdated(el, binding, vnode) {

				var opts = binding.value || {};
				var that = el.$fullpage;
				that.setOptions(opts);
			}
		});

		Vue.directive('animate', {
			inserted: function inserted(el, binding, vnode) {
				var opts = binding || {};
				el.$animate = new Animate(el, opts, vnode);
			}
		});
	}
};

if (window.Vue) {
	window.VueFullpage = fullpage;
	Vue.use(fullpage);
}

return fullpage;

})));
