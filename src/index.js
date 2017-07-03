import FullPage from "./libs/Fullpage";

let fullpage =  {
	install: (Vue, options) => {
		var that = new FullPage();
		Vue.directive('fullpage', {
			inserted: function(el, binding, vnode) {
				var opts = binding.value || {}

				that.init(el, opts, vnode)
			},
			componentUpdated: function(el, binding, vnode) {
				var opts = binding.value || {}
				that.init(el, opts, vnode)
			}
		})

		Vue.directive('animate', {
			inserted: function(el, binding, vnode) {
				if (binding.value) {
					that.initAnimate(el, binding, vnode)
				}
			}
		})
	}
}

if(window.Vue){
	window.VueFullpage = fullpage
	Vue.use(fullpage)
}

export default fullpage;
