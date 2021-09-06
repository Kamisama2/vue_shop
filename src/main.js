import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import axios from 'axios'
import treeTable from 'vue-table-with-tree-grid'
import Moment from 'moment'

// 将axios挂载到Vue原型对象上
// 设置根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求之前预处理，携带token
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // console.log(config);
  // 最后要返回这个 config
  return config;
})
Vue.prototype.$http = axios

// 引入字体图表样式
import './assets/fonts/iconfont.css'

// 引入全局样式
import './assets/css/global.css'

// 引入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 引入富文本编辑器的样式文件
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 注册富文本编辑器
Vue.use(VueQuillEditor)

Vue.component('tree-table', treeTable)

// 定义处理时间的过滤器
Vue.filter('formate', function (value) {
  return Moment(value).format('YYYY-MM-DD HH:mm:SS')
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
