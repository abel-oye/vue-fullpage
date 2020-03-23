import {
    addEventListener
} from './event';

class Animate {
	constructor(el, binding, vnode) {
		const aminate = binding.value;

		addEventListener(el,"toogle.animate",({value})=>{
			if(value){
				this.addAnimated(el, aminate);
			}else{
				el.style.opacity = "0";
				this.removeAnimated(el, aminate);
			}
		})
	}
	addAnimated(el, animate) {
		const delay = animate.delay || 0;
		el.classList.add("animated");
		window.setTimeout(() => {
			el.style.opacity = "1";
			el.classList.add(animate.value);
		}, delay);
	}
	removeAnimated(el, animate) {
		const cls = el.getAttribute("class");
		if (cls && cls.indexOf("animated") > -1) {
			el.classList.remove(animate.value);
		}
	}
}

export default Animate;
