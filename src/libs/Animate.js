import {
    on
} from './event';

class Animate {
    constructor(el, binding, vnode) {
        const aminate = binding.value;

        el.style.opacity = "0";
        this.removeAnimated(el, aminate);

        on(el, "toogle.animate", ({
            value
        }) => {
            if (value) {
                this.addAnimated(el, aminate);
            } else {
                setTimeout(()=>{
                	this.removeAnimated(el, aminate);
                })
            }
        })
    }
    addAnimated(el, animate) {
        const delay = animate.delay || 0
        el.classList.add("animated");
        window.setTimeout(() => {
        	// el.style.animationDelay = delay +'s'
            el.style.opacity = "1";
            el.classList.add(animate.value);
        }, delay);

        
    }
    removeAnimated(el, animate) {
    	el.style.opacity = "0";
        if (el.classList.contains("animated")) {
            el.classList.remove(animate.value);
        }
    }
}

export default Animate;