import Vue from 'vue'
import Router from 'vue-router'

const path = require("path");

Vue.use(Router);

let routes = [
];

const modulesFiles = require.context('./modules', false, /\.js$/)
modulesFiles.keys().forEach(modulePath => {
    const value = modulesFiles(modulePath);
    if (Array.isArray(value.default)) {
        routes = value.default.concat(routes)
    } else {
        routes.unshift(value.default)
    }
});


export function createRouter () {
    return new Router({
        mode: 'history',
        fallback: false,
        base: '/',
        scrollBehavior: () => ({y: 0}),
        routes: routes
    })
}



