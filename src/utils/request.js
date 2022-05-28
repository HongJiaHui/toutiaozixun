// 基于axios封装网络请求
// 每个程序员的想法都不一样，封装的地方和名字都不一样，但是思想相同
import theAxios from 'axios'
import { Notify } from 'vant'
import { getToken, removeToken } from '@/utils/token' //, setToken
// import { getNewTokenAPI } from '@/api'
import router from '@/router'
const axios = theAxios.create({
  baseURL: 'http://geek.itheima.net',
  timeout: 20000 // 20秒超时时间（请求20秒无响应直接判定超时）
})

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  // console.log(config)
  // 在发送请求之前做些什么
  // 目标：统一携带token
  // 判断本地有token再携带，判断具体api/index.js里如果没有携带authorization，再添加上去
  // ?. 叫做：可选链操作符，如果前面对象里没有length，整个表达式原地返回undefined
  // 如果getToken()在原地有值token字符串，才能调用length获取长度
  if (getToken()?.length > 0 && config.headers.Authorization === undefined) {
    config.headers.Authorization = `Bearer ${getToken()}`
  }
  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})

// 添加响应拦截器
// 本质：就是一个函数
axios.interceptors.response.use(function (response) {
  // http响应状态码为200-399就进入这里
  // 对响应数据做点什么
  return response
}, async function (error) {
  // http响应状态码为400-599就报错就进入这里
  // 对响应错误做点什么
  // console.dir(error)
  // console.log(this) undefined
  // 只有401才代表身份过期，才需要跳转登录
  if (error.response.status === 401) {
    // 不能使用this.$router（因为this不是vue组件对象无法调用$router）
    // 解决：直接上面引入@/router/index下router对象
    Notify({ type: 'warning', message: '身份已过期，请重新登录' })

    // 方式1：清除token，强制跳转到登录，用户有感知
    removeToken() // 先清除token,才能让路由守卫判断失败，放行我去登录页面
    // router.currentRoute 相当于 在vue文件内this.$route -> 当前路由对象信息
    // fullPath,路由对象里完整路由路径#后面的一切
    router.replace(`/login?path=${router.currentRoute.fullPath}`)

    // 方式2：使用refresh_token换回新的token再继续使用，JS代码实现，用户无感知（效果好）
    //   const res = await getNewTokenAPI()

  //   // 得到新的token之后，步骤如下：
  //   // 1.更新token在本地
  //   setToken(res.data.data.token)
  //   // 2.更新新的token在请求头里
  //   error.config.headers.Authorization = `Bearer ${res.data.data.token}`
  //   // 3.未完成的这次请求，再次发起
  //   // error.config就是上一次请求的配置对象
  //   // 结果我们要return回原本逻辑页面调用的地方-还是return回去一个promise对象
  //   return axios(error.config)
  //   // console.log(res)
  // } else if (error.response.status === 500 && error.config.url === '/v1_0/authorizations' && error.config.method === 'put') {
  //   localStorage.clear() // 清除localStorage里所有值
  //   Notify({ type: 'warning', message: '身份已过期，请重新登录' })
  //   router.replace('/login')
  }

  return Promise.reject(error)
})
// 操作：
// 1.手动修改localStorage里toutiao对应的token（模拟过期）
// 2.点击反馈/其他需要身份验证的接口（错误token携带给后台请求）
// 3.反馈不感兴趣，这次请求返回的状态码为401，进入错误响应拦截器

// 解决401问题：
// 方式1：清除token，强制跳转回登录页面，有感知重新登录，拿到新token替换到本地并存入
// 需要重新点击反馈按钮再次反馈，用户体验不好
// 方式2：刷新token，使用登录时保存的refresh_token，调用另外一个刷新接口，换回来
// 新的token值，替换到本地，再次完成本次未完成的请求，用户无感知体验好
// 步骤：
// 1.登录页面，localStarage.setItem('refresh_token',存入refresh_token)
// 2.401中，注释掉跳转login的代码，引入刷新token的api方法调用
// 3.替换保存到本地新的token
// 4.error错误对象里headers替换成新的token
// 5.axios再次发起这次未完成请求，返回promise对象到最开始发请求的逻辑页面
export default ({ url, method = 'GET', params = {}, data = {}, headers = {} }) => {
  return axios({
    url,
    method,
    params,
    data,
    headers
  })
}

/* return new Promise((resolve,reject)=>{
    //判断如果params有值，需要自己写js代码，把params对象里的key和value拼接到url上
    $.ajax({
        url,
        data,
        headers,
        type:method,
        success:(res)=>{
            resolve(res)
        },
        error:err=>{
            reject(err)
        }
    })
}) */

// export default axios
// 但是上面有局限性
// 导出的axios方法在使用时
// 我在逻辑页面调用时，传入的这个5个配置名字
// axios({
//     url:'请求地址',
//     method:"请求方式",
//     params:{},
//     data:{},
//     headers:{},
// })
