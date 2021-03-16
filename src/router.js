import Vue from 'vue'
import Router from 'vue-router'
// import Thome from "@/components/home.vue" // 引入主页

Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [{
            path: '/',
            redirect: '/compontents/process'//http://127.0.0.1:6969/#/compontents/process （初始界面-调整流程定义界面）
            // redirect: '/approval/setting' （使流程定义点击跳转进入）
        },
        {
            path: '/approval/setting',
            name: 'approval',
            component: (resolve) => {
                require([`@/views/approval/setting`], resolve)//流程设置 - 三模块页面
                //http://127.0.0.1:6969/#/approval/setting（初始界面-调整流程定义界面）
            }
        },
        {
            path:'/compontents/process',
            name:'process',
            component: (resolve) => {
                require([`@/components/process`], resolve)//流程定义页面
            }
        },
        {
            path:'/compontents/untreated',
            name:'untreated',
            component: (resolve) => {
                require([`@/components/untreated`], resolve)//待办任务
            }
        },
        {
            path:'/compontents/handled',
            name:'handled',
            component: (resolve) => {
                require([`@/components/handled`], resolve)//已办任务
            }
        },
        {
            path:'/compontents/track',
            name:'track',
            component: (resolve) => {
                require([`@/components/track`], resolve)//流程跟踪
            }
        },
        {
            path:'/compontents/myLaunch',
            name:'myLaunch',
            component: (resolve) => {
                require([`@/components/myLaunch`], resolve)//我发起的
            }
        },
        
    ]
})