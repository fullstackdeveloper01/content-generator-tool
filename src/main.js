import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
import store from './store'
import PortalVue from 'portal-vue'
import PerfectScrollbar from 'vue2-perfect-scrollbar'
import 'vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css'
import Notifications from 'vue-notification'
import VueSimpleContextMenu from 'vue-simple-context-menu';
import 'vue-simple-context-menu/dist/vue-simple-context-menu.css';

Vue.use(Notifications)
Vue.use(VueSimpleContextMenu)
Vue.use(PerfectScrollbar)
Vue.use(Vuex)
Vue.use(PortalVue)

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
