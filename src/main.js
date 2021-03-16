import 'babel-polyfill'
import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import './assets/css/override-element-ui.css'//引入vue文件新增样式
import func from './plugins/preload.js'
import ydc from './plugins/common.js'
import nodeWrap from '@/components/nodeWrap'
Vue.use(nodeWrap)
Vue.component('nodeWrap', nodeWrap); //初始化组件
import addNode from '@/components/addNode'
Vue.use(addNode)
Vue.component('addNode', addNode); //初始化组件
import process from '@/components/process'
Vue.use(process)
Vue.component('process', process); //新增process流程定义页面
import navMenu from '@/components/navMenu'
Vue.use(navMenu)
Vue.component('navMenu', navMenu);//导航菜单navMenu

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

import moment from 'moment'//导入文件 
Vue.prototype.$moment = moment;//赋值使用
// content.createDate|moment


Vue.prototype.$func = func;
Vue.prototype.$ydc = ydc;
Vue.config.productionTip = false;
Vue.directive('enterNumber', {
    bind: function(el, { value = 2 }) {
        el = el.nodeName == "INPUT" ? el : el.children[0]
        var RegStr = value == 0 ? `^[\\+\\-]?\\d+\\d{0,0}` : `^[\\+\\-]?\\d+\\.?\\d{0,${value}}`;
        el.addEventListener('keyup', function() {
            el.value = el.value.match(new RegExp(RegStr, 'g'));
            el.dispatchEvent(new Event('input'))
        })
    }
});

Vue.directive('focus', {
    // 当被绑定的元素插入到 DOM 中时……
    inserted: function(el) {
        el.focus()
    }
});
new Vue({
    router,
    store,
    components: {
        nodeWrap,
        addNode,
        process,//流程定义页面
        navMenu,//导航菜单
    },
    render: h => h(App)
}).$mount('#app')