import request from '@/utils/request'
import { getStorage } from '@/utils/storage'

// 用户 - 刷新token
export const getNewTokenAPI = () => request({
  url: '/v1_0/authorizations',
  method: 'PUT',
  headers: {
    // 请求拦截器统一携带的是token，而这次请求需要携带的是refresh_token
    // 所以axios请求拦截器里判断，就是为了这种情况准备的
    Authorization: 'Bearer ' + getStorage('refresh_token')
  }
})

// 用户 - 关注
export const userFollowedAPI = ({ userId }) => request({
  url: '/v1_0/user/followings',
  method: 'POST',
  data: {
    target: userId
  }
})

// 用户 - 取关
export const userUnFollowedAPI = ({ userId }) => request({
  url: `/v1_0/user/followings/${userId}`,
  method: 'DELETE'
})

// 用户 - 个人资料
export const userProfileAPI = () => request({
  url: '/v1_0/user/profile',
  method: 'GET'
})

// 用户 - 获取基本信息（我的页面显示数据）
export const getUserInfoAPI = () => request({
  url: '/v1_0/user',
  method: 'GET'
})

// 用户 - 更新头像
export const updateUserPhotoAPI = (fd) => request({
  url: '/v1_0/user/photo',
  method: 'PATCH',
  data: fd // fd外面一会儿传进来的new FormData() 表单对象
  // 如果请求体直接是FormData表单对象，你也不用自己添加
  // Content-Type,axios发现数据请求体是表单对象,它也不会转换成json字符串
  // 也不会带Content-Type:application/json,而是交给浏览器,浏览器发现请求体是formdata会自己携带Content-Type

  // Content-Type:application/json; axios携带的,前提:data请求体是对象->json字符串->发给后台
  // Content-Type:multipart/form-data;浏览器携带的，前提：data请求体必须FormData类型对象
})

// 用户 - 更新个人信息
export const updateUserProfileAPI = (dataObj) => {
  // 判断，有值才带参数名给后台，无值参数名不携带
  // 写法1：结构赋值，4个判断，往空对象添加有值的加上去
  // 写法2：外面想传几对key+value，就直接传入交给后台
  // 写法3：上面写法不够语义化，我看不出obj里有什么
  const obj = {
    name: '',
    gender: 0,
    birthday: '',
    intro: ''
  }

  for (const prop in obj) { // 遍历参数对象里每个key
    if (dataObj[prop] === undefined) { // 用key去外面传入的参数对象匹配，如果没有找到（证明外面没有传入这个值）
      delete obj[prop] // 从obj身上移除这对属性和值
    } else {
      obj[prop] = dataObj[prop] // 如果使用了，就从外面对象取出对应key值，保存到obj上
    }
  }

  return request({
    url: '/v1_0/user/profile',
    method: 'PATCH', // 局部更新 PUT：全部更新
    data: obj
    // { // data不会忽略值为null的键值对，而params则会忽略
    //   name, // 昵称
    //   gender, // 性别：0男1女
    //   birthday, // 生日（年-月-日）
    //   intro // 个人介绍
    // }
  })
}
