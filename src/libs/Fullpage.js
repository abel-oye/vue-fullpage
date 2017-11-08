/**
 * vue2.x fullpage
 */
function broadcast(children, eventName, params) {
    let context;
    children && children.forEach(child => {
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
        this.vm = vnode.context
        this.curIndex = this.opts.start;

        this.startY = 0;
        this.opts.movingFlag = false;

        this.el = el;
        this.el.classList.add('fullpage-wp');

        this.parentEle = this.el.parentNode;
        this.parentEle.classList.add('fullpage-container');

        this.pageEles = this.el.children;
        this.total = this.pageEles.length;

        this.initScrollDirection();

        this.initEvent(el);

        window.setTimeout(() => {
            this.resize();
            //The first page triggers the animation directly
            if (this.curIndex === 0) {
                this.toogleAnimate(this.curIndex)
            } else {
                this.moveTo(this.curIndex, false);
            }

        }, 0)

    }
    resize() {
        this.width = this.opts.width || this.el.offsetWidth
        this.height = this.opts.height || this.el.offsetHeight

        let i = 0,
            length = this.pageEles.length,
            pageEle;
        for (; i < length; i++) {
            pageEle = this.pageEles[i]
            pageEle.setAttribute('data-id', i)
            pageEle.classList.add('page')
            //pageEle.style.width = this.width + 'px'
            pageEle.style.height = this.height + 'px'
        }
    }
    setOptions(options) {
        this.assignOpts(options, this.opts);
    }
    toogleAnimate(curIndex) {
        broadcast(this.vnode.children, 'toogle.animate', curIndex)
    }
    assignOpts(opts, o) {
        o = o || Fullpage.defaultOptions
        opts = opts || {};
        for (let key in opts) {
            if (opts.hasOwnProperty(key)) {
                o[key] = opts[key]
            }
        }
        this.opts = o;
    }
    initScrollDirection() {
        if (this.opts.dir !== 'v') {
            this.el.classList.add('fullpage-wp-h')
        }
    }
    initEvent(el) {
        this.prevIndex = this.curIndex

        if ("ontouchstart" in document) {
            document.addEventListener('touchmove', e => {
                e.preventDefault();
                return false;
            }, false);

            /// touch ///
            el.addEventListener('touchstart', e => {
                if (this.opts.movingFlag) {
                    return false;
                }
                this.startX = e.targetTouches[0].pageX;
                this.startY = e.targetTouches[0].pageY;
            }, false);

            el.addEventListener('touchend', e => {
                e.preventDefault();
                if (this.opts.movingFlag) {
                    return false;
                }

                var preIndex = this.curIndex;
                var dir = this.opts.dir;
                var sub = dir === 'v' ? (e.changedTouches[0].pageY - this.startY) / this.height : (e.changedTouches[0].pageX - this.startX) / this.width;
                var der = sub > this.opts.der ? -1 : sub < -this.opts.der ? 1 : 0;

                var curIndex = der + this.curIndex;

                this.moveTo(curIndex, true);
            }, false)
        } else {

            var isMousedown = false;
            addEventListener(el, 'mousedown', e => {
                if (this.opts.movingFlag) {
                    return false;
                }
                isMousedown = true;
                this.startX = e.pageX;
                this.startY = e.pageY;
            });

            addEventListener(el, 'mouseup', e => {
                isMousedown = false;
            });

            addEventListener(el, 'mousemove', e => {
                e.preventDefault();
                if (this.opts.movingFlag || !isMousedown) {
                    return false;
                }
                let dir = this.opts.dir;
                let sub = dir === 'v' ? (e.pageY - this.startY) / this.height : (e.pageX - this.startX) / this.width;
                let der = sub > this.opts.der ? -1 : sub < -this.opts.der ? 1 : 0;

                let curIndex = der + this.curIndex;

                this.moveTo(curIndex, true);
            });

            let debounceTimer,
                interval = 1200,
                debounce = true;

            // fixed firefox DOMMouseScroll closed #1.
            let mousewheelType = document.mozFullScreen !== undefined ? 'DOMMouseScroll' : 'mousewheel';

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

                // 兼容 DOMMouseScroll event.detail 
                if (!e.wheelDelta) {
                    e.deltaY = e.detail;
                    e.deltaX = e.detail;
                }

                let sub = dir === 'v' ? e.deltaY : e.deltaX;

                let der = sub > 0 ? 1 : sub < 0 ? -1 : 0;

                let curIndex = der + this.curIndex;

                this.moveTo(curIndex, true);
            });
        }

        addEventListener(el, 'webkitTransitionEnd', () => {
            this.toogleAnimate(this.curIndex)
            this.opts.afterChange.call(this, this.pageEles[this.curIndex], this.curIndex)
            this.opts.movingFlag = false;
        });

        addEventListener(window, 'resize', () => {
            if (el.offsetHeight != this.height) {
                this.resize();
            }
        })

    }
    move(dist) {
        let xPx = '0px',
            yPx = '0px';
        if (this.opts.dir === 'v') {
            yPx = dist + 'px';
        } else {
            xPx = dist + 'px'
        }
        this.el.style.cssText += (';-webkit-transform : translate3d(' + xPx + ', ' + yPx + ', 0px);' +
            'transform : translate3d(' + xPx + ', ' + yPx + ', 0px);');
    }
    moveTo(curIndex, anim) {
        if (Math.min(Math.max(curIndex, 0), this.total) == this.curIndex) {
            return
        }
        if (!(curIndex >= 0 && curIndex < this.total)) {
            if (!!this.opts.loop) {
                curIndex = this.curIndex = curIndex < 0 ? this.total - 1 : 0
            } else {
                this.curIndex = curIndex < 0 ? 0 : this.total - 1;
                return
            }
        }

        //beforeChange return false cancel slide
        let flag = this.opts.beforeChange.call(this, this.pageEles[this.curIndex], this.curIndex, curIndex);
        if (flag === false) {
            return false;
        }

        let dist = this.opts.dir === 'v' ? (curIndex) * (-this.height) : curIndex * (-this.width)
        this.curIndex = curIndex;

        this.opts.movingFlag = true;

        if (anim) {
            this.el.classList.add(this.opts.animateClass)
        } else {
            this.el.classList.remove(this.opts.animateClass)
        }

        this.move(dist);

        // const afterChange = () => {
        //     this.opts.afterChange.call(this, this.pageEles[this.curIndex], this.curIndex, curIndex)
        //     this.opts.movingFlag = false;
        // }

        // window.setTimeout(() => {
        //     this.toogleAnimate(curIndex)
        //     if (!anim) {
        //         afterChange();
        //     }
        // }, this.opts.duration)
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
    destroy() {

    }
}


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
    /**
     * beforeChange
     * @params
     *     element {Element} current element
     *     currenIndex {Number} current number
     *     next    {Number}  next number
     *         
     * @type {Boolean}
     */
    beforeChange: noop,
    /**
     * afterChange
     * @params
     *     element {Element} current element
     *     currenIndex {Number} current number
     *         
     * @type {Boolean}
     */
    afterChange: noop,
    animateClass: 'anim'
};

function noop() {

}

export default Fullpage;