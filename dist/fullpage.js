(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.fullpage = factory());
}(this, (function () { 'use strict';

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
var Fullpage = function () {
	function Fullpage() {
		classCallCheck(this, Fullpage);
	}

	createClass(Fullpage, [{
		key: 'init',
		value: function init(el, options, vnode) {
			var that = this;
			that.assignOpts(options);

			that.vm = vnode.context;
			that.curIndex = that.opts.start;

			that.startY = 0;
			that.opts.movingFlag = false;

			that.el = el;
			that.el.classList.add('fullpage-wp');

			that.parentEle = that.el.parentNode;
			that.parentEle.classList.add('fullpage-container');

			that.pageEles = that.el.children;
			that.total = that.pageEles.length;

			that.initScrollDirection();
			window.setTimeout(function () {
				that.width = that.opts.width || that.parentEle.offsetWidth;
				that.height = that.opts.height || that.parentEle.offsetHeight;

				for (var i = 0; i < that.pageEles.length; i++) {
					var pageEle = that.pageEles[i];
					pageEle.setAttribute('data-id', i);
					pageEle.classList.add('page');
					pageEle.style.width = that.width + 'px';
					pageEle.style.height = that.height + 'px';
				}
				that.moveTo(that.curIndex, false, true);
			}, 0);
			that.initEvent(that.el);
		}
	}, {
		key: 'initAnimate',
		value: function initAnimate(el, binding, vnode) {
			var that = this,
			    vm = vnode.context,
			    aminate = binding.value;
			el.style.opacity = '0';
			vm.$on('toogle_animate', function (curIndex) {
				var curPage = +el.parentNode.getAttribute('data-id');
				if (curIndex === curPage) {
					that.addAnimated(el, aminate);
				} else {
					el.style.opacity = '0';
					that.removeAnimated(el, aminate);
				}
			});
		}
	}, {
		key: 'addAnimated',
		value: function addAnimated(el, animate) {
			var delay = animate.delay || 0;
			el.classList.add('animated');
			window.setTimeout(function () {
				el.style.opacity = '1';
				el.classList.add(animate.value);
			}, delay);
		}
	}, {
		key: 'removeAnimated',
		value: function removeAnimated(el, animate) {
			if (el.getAttribute('class').indexOf('animated') > -1) {
				el.classList.remove(animate.value);
			}
		}
	}, {
		key: 'assignOpts',
		value: function assignOpts(opts) {
			var o = Fullpage.defaultOptions;
			opts = opts || {};
			for (var key in opts) {
				if (opts.hasOwnProperty(key)) {
					o[key] = opts[key];
				}
			}
			this.opts = o;
		}
	}, {
		key: 'initScrollDirection',
		value: function initScrollDirection() {
			if (this.opts.dir !== 'v') {
				this.el.classList.add('fullpage-wp-h');
			}
		}
	}, {
		key: 'initEvent',
		value: function initEvent(el) {
			console.log(this.opts);
			var that = this;
			that.prevIndex = that.curIndex;

			if ("ontouchstart" in document) {
				/// touch ///
				el.addEventListener('touchstart', function (e) {
					if (that.opts.movingFlag) {
						return false;
					}
					that.startX = e.targetTouches[0].pageX;
					that.startY = e.targetTouches[0].pageY;
				});
				el.addEventListener('touchend', function (e) {
					if (that.opts.movingFlag) {
						return false;
					}
					var preIndex = that.curIndex;
					var dir = that.opts.dir;
					var sub = dir === 'v' ? (e.changedTouches[0].pageY - that.startY) / that.height : (e.changedTouches[0].pageX - that.startX) / that.width;
					var der = sub > that.opts.der ? -1 : sub < -that.opts.der ? 1 : 0;

					var curIndex = der + that.curIndex;

					if (Math.min(Math.max(curIndex, 0), that.total) == that.curIndex) {
						return;
					}

					that.curIndex = curIndex;

					if (that.curIndex >= 0 && that.curIndex < that.total) {
						that.moveTo(that.curIndex, true);
					} else {
						if (!!that.opts.loop) {
							that.curIndex = that.curIndex < 0 ? that.total - 1 : 0;
							that.moveTo(that.curIndex, true);
						} else {
							that.curIndex = that.curIndex < 0 ? 0 : that.total - 1;
						}
					}
				});
			} else {

				var isMousedown = false;
				addEventListener(el, 'mousedown', function (e) {
					if (that.opts.movingFlag) {
						return false;
					}
					isMousedown = true;
					that.startX = e.pageX;
					that.startY = e.pageY;
				});
				addEventListener(el, 'mouseup', function (e) {
					isMousedown = false;
				});
				addEventListener(el, 'mousemove', function (e) {
					e.preventDefault();
					if (that.opts.movingFlag || !isMousedown) {
						return false;
					}
					var preIndex = that.curIndex;
					var dir = that.opts.dir;
					var sub = dir === 'v' ? (e.pageY - that.startY) / that.height : (e.pageX - that.startX) / that.width;
					var der = sub > that.opts.der ? -1 : sub < -that.opts.der ? 1 : 0;

					var curIndex = der + that.curIndex;

					if (Math.min(Math.max(curIndex, 0), that.total) == that.curIndex) {
						return;
					}

					that.curIndex = curIndex;
					if (that.curIndex >= 0 && that.curIndex < that.total) {
						that.moveTo(that.curIndex, true);
					} else {
						if (!!that.opts.loop) {
							that.curIndex = that.curIndex < 0 ? that.total - 1 : 0;
							that.moveTo(that.curIndex, true);
						} else {
							that.curIndex = that.curIndex < 0 ? 0 : that.total - 1;
						}
					}
				});
				addEventListener(el, 'mousewheel', function (e) {
					if (that.opts.movingFlag) {
						return false;
					}
					var preIndex = that.curIndex;
					var dir = that.opts.dir;
					var sub = dir === 'v' ? e.deltaY : e.deltaX;
					var der = sub > that.opts.der ? 1 : sub < -that.opts.der ? -1 : 0;

					var curIndex = der + that.curIndex;
					console.log(curIndex);
					if (Math.min(Math.max(curIndex, 0), that.total) == that.curIndex) {
						return;
					}

					that.curIndex = curIndex;

					if (that.curIndex >= 0 && that.curIndex < that.total) {
						that.moveTo(that.curIndex, true);
					} else {
						if (!!that.opts.loop) {
							that.curIndex = that.curIndex < 0 ? that.total - 1 : 0;
							that.moveTo(that.curIndex, true);
						} else {
							that.curIndex = that.curIndex < 0 ? 0 : that.total - 1;
						}
					}
				});
			}
		}
	}, {
		key: 'move',
		value: function move(dist) {
			var xPx = '0px',
			    yPx = '0px';
			if (this.opts.dir === 'v') {
				yPx = dist + 'px';
			} else {
				xPx = dist + 'px';
			}
			this.el.style.cssText += ';-webkit-transform : translate3d(' + xPx + ', ' + yPx + ', 0px);' + 'transform : translate3d(' + xPx + ', ' + yPx + ', 0px);';
		}
	}, {
		key: 'moveTo',
		value: function moveTo(curIndex, anim, isInit) {
			var that = this;
			var dist = that.opts.dir === 'v' ? curIndex * -that.height : curIndex * -that.width;
			that.nextIndex = curIndex;
			that.opts.movingFlag = true;
			var flag = that.opts.beforeChange(that.prevIndex, that.nextIndex);
			if (flag === false) {
				return false;
			}

			if (anim) {
				that.el.classList.add('anim');
			} else {
				that.el.classList.remove('anim');
			}

			that.move(dist);

			window.setTimeout(function () {

				that.prevIndex = curIndex;
				that.vm.$emit('toogle_animate', curIndex);
				if (isInit) {
					that.opts.movingFlag = false;
					that.opts.afterChange(that.prevIndex, that.nextIndex);
				}
				addEventListener(that.el, 'webkitTransitionEnd', function () {
					that.opts.movingFlag = false;
					that.opts.afterChange(that.prevIndex, that.nextIndex);
				});
			}, that.opts.duration);
		}
	}]);
	return Fullpage;
}();

function addEventListener(el, eventName, callback, isBubble) {
	if (el.addEventListener) {
		el.addEventListener(eventName, callback, !!isBubble);
	} else {
		el.attachEvent('on' + eventName, callback, !!isBubble);
	}
}

Fullpage.defaultOptions = {
	start: 0,
	duration: 500,
	loop: false,
	dir: 'v',
	der: 0.1,
	movingFlag: false,
	beforeChange: function beforeChange(data) {},
	afterChange: function afterChange(data) {}
};

var fullpage = {
	install: function install(Vue, options) {
		var that = new Fullpage();
		Vue.directive('fullpage', {
			inserted: function inserted(el, binding, vnode) {
				var opts = binding.value || {};

				that.init(el, opts, vnode);
			},
			componentUpdated: function componentUpdated(el, binding, vnode) {
				var opts = binding.value || {};
				that.init(el, opts, vnode);
			}
		});

		Vue.directive('animate', {
			inserted: function inserted(el, binding, vnode) {
				if (binding.value) {
					that.initAnimate(el, binding, vnode);
				}
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
