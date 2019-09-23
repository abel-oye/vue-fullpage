/**
 * vue2.x fullpage
 */
function broadcast(children, eventName, params, ancestor) {
    let context;
    let currentIndex;
    children &&
        children.forEach(child => {
            context = child.context;
            if (context) {
                context.$emit.apply(context, [eventName].concat(params));
            }
            broadcast(child.children, eventName, params);
        });
}
class Fullpage {
    constructor(el, options, vnode) {
        this.assignOpts(options);
        this.vnode = vnode;
        this.vm = vnode.context;

        this.startY = 0;
        this.opts.movingFlag = false;
        this.el = el;
        this.el.classList.add("fullpage-wp");
        this.parentEle = this.el.parentNode;
        this.parentEle.classList.add("fullpage-container");
        this.pageEles = this.el.children;
        this.total = this.pageEles.length;
        this.direction = -1;
        this.curIndex = this.opts.start;

        this.disabled = !!this.opts.disabled;

        this.initScrollDirection();
        this.initEvent(el);
        window.setTimeout(() => {
            this.resize();
            //The first page triggers the animation directly
            this.moveTo(this.opts.start, false);
            this.toogleAnimate(this.opts.start);
            this.curIndex = this.opts.start;
        }, 0);

        addEventListener(window, "resize", () => {
            this.resize();
            this.correct();
        });
    }
    resize() {
        this.width = this.opts.width || this.el.offsetWidth;
        this.height = this.opts.height || this.el.offsetHeight;
        let i = 0,
            length = this.pageEles.length,
            pageEle;
        for (; i < length; i++) {
            pageEle = this.pageEles[i];
            pageEle.setAttribute("data-id", i);
            pageEle.classList.add("page");
            //pageEle.style.width = this.width + 'px'
            pageEle.style.height = this.height + "px";
        }
    }
    correct() {
        //Correct position after onresize
        if (this.current === 0) {
            return;
        }
        let dist =
            this.opts.dir === "v" ?
            this.curIndex * -this.height :
            this.curIndex * -this.width;
        this.move(dist);
    }
    setOptions(options) {
        this.assignOpts(options, this.opts);
    }
    toogleAnimate(curIndex) {
        broadcast(this.vnode.children, "toogle.animate", curIndex);
    }
    assignOpts(opts, o) {
        o = o || Fullpage.defaultOptions;
        opts = opts || {};
        for (let key in opts) {
            if (opts.hasOwnProperty(key)) {
                o[key] = opts[key];
            }
        }
        this.opts = o;
    }
    initScrollDirection() {
        if (this.opts.dir !== "v") {
            this.el.classList.add("fullpage-wp-h");
        }
    }
    initEvent(el) {
        this.prevIndex = this.curIndex;
        if ("ontouchstart" in document) {
            /// touch ///
            addEventListener(el, "touchstart", e => {
                if (this.opts.movingFlag) {
                    return false;
                }
                this.startX = e.targetTouches[0].pageX;
                this.startY = e.targetTouches[0].pageY;
            });
            addEventListener(el, "touchend", e => {
                //e.preventDefault();
                if (this.opts.movingFlag) {
                    return false;
                }
                let preIndex = this.curIndex;
                let dir = this.opts.dir;
                let sub = (this.direction =
                    dir === "v" ?
                    (e.changedTouches[0].pageY - this.startY) /
                    this.height :
                    (e.changedTouches[0].pageX - this.startX) /
                    this.width);
                let der =
                    sub > this.opts.der ? -1 : sub < -this.opts.der ? 1 : 0;
                let curIndex = der + this.curIndex;
                this.moveTo(curIndex, true);
            });
            addEventListener(document.body, "touchmove", e => {
                let {
                    overflow
                } = this.opts;

                let currentPage = this.pageEles[this.curIndex];
                if (overflow === "hidden") {
                    //e.preventDefault();
                    return false;
                } else {
                    let currentTarget = e.target;

                    while (currentTarget) {
                        if (
                            (overflow === "scroll" &&
                                currentTarget === currentPage) ||
                            (overflow !== "scroll" &&
                                currentTarget !== currentPage)
                        ) {
                            if (!Fullpage.iSWhetherEnds(
                                    currentTarget,
                                    this.direction
                                )) {
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
        let isMousedown = false;
        addEventListener(el, "mousedown", e => {
            if (this.opts.movingFlag) {
                return false;
            }
            isMousedown = true;
            this.startX = e.pageX;
            this.startY = e.pageY;
        });
        addEventListener(el, "mouseup", e => {
            isMousedown = false;
        });
        addEventListener(el, "mousemove", e => {
            //e.preventDefault();
            if (this.opts.movingFlag || !isMousedown) {
                return false;
            }
            let dir = this.opts.dir;
            let sub = (this.direction =
                dir === "v" ?
                (e.pageY - this.startY) / this.height :
                (e.pageX - this.startX) / this.width);
            let der = sub > this.opts.der ? -1 : sub < -this.opts.der ? 1 : 0;
            let curIndex = der + this.curIndex;
            this.moveTo(curIndex, true);
        });

        let debounceTimer,
            interval = 1200,
            debounce = true;
        // fixed firefox DOMMouseScroll closed #1.
        let mousewheelType =
            document.mozFullScreen !== undefined ?
            "DOMMouseScroll" :
            "mousewheel";

        addEventListener(el, mousewheelType, e => {
            if (this.opts.movingFlag) {
                return false;
            }
            if (!debounce) {
                return;
            }
            debounce = false;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                debounce = true;
            }, interval);
            let dir = this.opts.dir;
            // Compatible DOMMouseScroll event.detail
            // see http://www.javascriptkit.com/javatutors/onmousewheel.shtml
            let detail = e.wheelDelta ? e.wheelDelta / 120 : e.detail
                //let detail = e.detail ? e.detail * -120 : e.wheelDelta;
            console.log(e.wheelDelta);
            //Only support Y
            let der = this.direction = detail > 0 ? -1 : detail < 0 ? 1 : 0;
            let curIndex = der + this.curIndex;
            this.moveTo(curIndex, true);

            if (e.preventDefault) {
                //disable default wheel action of scrolling page
                e.preventDefault();
            } else {
                return false;
            }
        });
        //}

        addEventListener(window, "resize", () => {
            if (el.offsetHeight != this.height) {
                this.resize();
            }
        });
    }
    move(dist) {
        let xPx = 0,
            yPx = 0;
        if (this.opts.dir === "v") {
            yPx = dist;
        } else {
            xPx = dist;
        }
        this.el.style.cssText +=
            ";-webkit-transform : translate3d(" +
            xPx +
            "px, " +
            yPx +
            "px, 0px);" +
            "transform : translate3d(" +
            xPx +
            "px, " +
            yPx +
            "px, 0px);";
    }
    moveTo(curIndex, anim) {
        if (
            this.opts.overflow === "scroll" &&
            !Fullpage.iSWhetherEnds(
                this.pageEles[this.curIndex],
                this.direction
            ) ||
            (anim && this.disabled === true)
        ) {
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
        let flag = this.opts.beforeChange.call(
            this,
            this.pageEles[this.curIndex],
            this.curIndex,
            curIndex
        );
        if (flag === false) {
            return false;
        }
        let dist =
            this.opts.dir === "v" ?
            curIndex * -this.height :
            curIndex * -this.width;

        this.curIndex = curIndex;

        let fired = false;

        let wrappedCallback = () => {
            removeEventListener(
                this.el,
                "webkitTransitionEnd",
                wrappedCallback
            );
            this.toogleAnimate(this.curIndex);
            this.opts.afterChange.call(
                this,
                this.pageEles[this.curIndex],
                this.curIndex
            );
            this.opts.movingFlag = false;
            fired = true;
        };

        if (anim) {
            this.el.classList.add(this.opts.animateClass);
            this.opts.movingFlag = true;

            let transition = getCurrentStyle(
                document.querySelector(".fullpage-wp"),
                "transition"
            );

            let duration =
                this.opts.duration || parseFloat(transition.split(" ")[1]) || 0;

            addEventListener(this.el, "webkitTransitionEnd", wrappedCallback);

            setTimeout(() => {
                if (fired) return;
                wrappedCallback();
            }, duration * 1000 + 25);
        } else {
            this.el.classList.remove(this.opts.animateClass);
        }
        this.move(dist);
    }
    movePrev() {
        this.moveTo(this.curIndex - 1, true);
    }
    moveNext() {
        this.moveTo(this.curIndex + 1, true);
    }
    update() {
        this.pageEles = this.el.children;
        this.total = this.pageEles.length;
        this.resize();
    }
    setDisabled(disabled) {
        this.disabled = disabled
    }
    destroy() {}
}

function addEventListener(el, eventName, callback, isUseCapture) {
    if (el.addEventListener) {
        el.addEventListener(eventName, callback, !!isUseCapture);
    } else {
        el.attachEvent("on" + eventName, callback);
    }
}

function removeEventListener(el, eventName, callback, isUseCapture) {
    if (el.removeEventListener) {
        el.removeEventListener(eventName, callback, !!isUseCapture);
    } else {
        el.detachEvent("on" + eventName, callback);
    }
}

function getCurrentStyle(obj, prop) {
    if (obj.currentStyle) {
        return obj.currentStyle[prop];
    } else if (window.getComputedStyle) {
        let propprop = prop.replace(/([A-Z])/g, "-$1");
        propprop = prop.toLowerCase();
        return document.defaultView.getComputedStyle(obj, null)[prop];
    }
    return null;
}

Fullpage.iSWhetherEnds = (target, direction) => {
    if (direction < 0) {
        return target.scrollTop <= 0;
    } else {
        let height = target.getBoundingClientRect().height;
        //@TODO wechat devtool v0.7.0 scrollTop 1px less than actual
        return target.scrollTop + height > target.scrollHeight - 1;
        // down
    }
};

Fullpage.defaultOptions = {
    start: 0,
    duration: 500,
    loop: false,
    /**
     * direction
     *
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
export default Fullpage;