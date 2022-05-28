import '@/utils/console' // 去掉打印语句
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'highlight.js/styles/default.css' // 代码高亮的样式
import 'amfe-flexible' // 引入flexible.js -> 设置根标签字体大小（移动端适配）
import directiveObj from './utils/directive'
import './VueComponent' // van组件注册，单独的分离成一个js文件，让main.js更清晰

Vue.config.productionTip = false

// 执行目标对象里install方法并传入Vue类
Vue.use(directiveObj)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

// 目标1：有2处在检查我的代码
// vscode+eslint插件+工作区根目录下.eslinrc.js配置,在保存时检查代码
// 如果在写代码过程中用插件解决了问题，webpack里就不会报错了
// webpack开发服务器（在下面终端中）+eslint插件，在保存时，检查代码

// 如果不好使排查问题
// 1.ESLint插件右下角设置中 -> 扩展设置
// 2.打开配套md笔记，大纲左边的最下面，有一些常见的错误

// 目标2：组件使用套路
// 1.明确目标，找到类似组件
// 2.引入注册然后复制过来
// 3.读和删没有用的
// 4.修改，改成我们想要的效果
// 样式修改：
// （1）：找到类名：自己写css覆盖掉它
// （2）：看文档，是否支持自定义样式

// 首页滚动位置保存
// 问题：首页滚动一些，点击我的再切回来，为什么滚动条回到了顶部？
// 疑惑：组件缓存keep-alive保存组件标签+样式+js变量，不会保存滚动位置
// 原因：切换到我的页面，页面高度不够高，没有滚动条（此滚动条是整个网页的）
// 滚动位置会回到顶部，所以切换回首页，只是内容改变了，滚动条还在顶部
// 解决：滚动时实时保存，在它的路由对象meta中保存滚动位置
