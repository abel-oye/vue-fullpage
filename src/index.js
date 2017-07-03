import FullPage from "./libs/Fullpage";

let fullpage =  {
	install: (Vue, options) => {
		Vue.directive('fullpage', {
			inserted: function(el, binding, vnode) {
				var opts = binding.value || {}
				var that = new FullPage();
				el.$fullpage = that;
				that.init(el, opts, vnode)
			},
			componentUpdated: function(el, binding, vnode) {
				var opts = binding.value || {};
				var that  = el.$fullpage;
				that.init(el, opts, vnode)
			}
		})

		Vue.directive('animate', {
			inserted: function(el, binding, vnode) {
				var that;
				if(!el.$fullpage){
				 that =  new FullPage();
				 el.$fullpage = that;
				}
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
