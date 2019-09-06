import Vue from 'vue'
import App from './App.vue'
import { createStore } from './store'
import { createRouter } from './router'
import { sync } from 'vuex-router-sync'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI);

if (process.env.VUE_ENV === "client") {
    window.Vue = Vue;
}

export function createApp() {
    const store = createStore()
    const router = createRouter()

    sync(store, router)
    const app = new Vue({
        router,
        store,
        render: h => h(App)
    })

    return { app, router, store }
}
