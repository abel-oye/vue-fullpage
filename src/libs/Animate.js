class Animate {
	constructor(el, binding, vnode) {
		const vm = vnode.context,
			aminate = binding.value;

		el.style.opacity = "0";
		vm.$on("toogle.animate", curIndex => {
			const curPage = this.getClosestId(el.parentNode);
			if (curIndex === curPage) {
				this.addAnimated(el, aminate);
			} else {
				el.style.opacity = "0";
				this.removeAnimated(el, aminate);
			}
		});
	}
	getClosestId(elem) {
		let id;
		while (elem && elem.nodeType !== 9) {
			id = +elem.getAttribute("data-id");
			if (id) {
				break;
			}
			elem = elem.parentNode;
		}
		return id;
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
